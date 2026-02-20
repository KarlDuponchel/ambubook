import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { uploadToS3, isS3Configured } from "@/lib/s3";
import { sendEmail } from "@/lib/email";

// Schema de validation
const feedbackSchema = z.object({
  type: z.enum(["BUG", "IMPROVEMENT", "QUESTION", "OTHER"]),
  subject: z.string().min(3, "Le sujet doit contenir au moins 3 caractères").max(200),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères").max(5000),
  screenshot: z.string().optional(), // Base64
  pageUrl: z.string().url("URL invalide"),
});

// POST - Soumettre un feedback
export async function POST(request: NextRequest) {
  // Rate limiting : max 5 feedbacks par heure par IP
  const rateLimitResult = await rateLimit({
    identifier: "submit-feedback",
    window: 3600, // 1 heure
    max: 5,
  });

  if (!rateLimitResult.success) {
    const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
    return rateLimitResponse(retryAfter);
  }

  try {
    const body = await request.json();

    // Validation
    const validatedData = feedbackSchema.parse(body);

    // Récupérer la session (obligatoire)
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour envoyer un feedback" },
        { status: 401 }
      );
    }

    // Récupérer le User-Agent
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || null;

    // Upload screenshot si fourni
    let screenshotUrl: string | null = null;
    if (validatedData.screenshot && isS3Configured()) {
      try {
        // Décoder le base64
        const matches = validatedData.screenshot.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
        if (matches) {
          const mimeType = `image/${matches[1]}`;
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, "base64");

          // Limiter la taille (max 5MB)
          if (buffer.length > 5 * 1024 * 1024) {
            return NextResponse.json(
              { error: "La capture d'écran est trop volumineuse (max 5 Mo)" },
              { status: 400 }
            );
          }

          // Générer une clé unique
          const timestamp = Date.now();
          const randomSuffix = Math.random().toString(36).substring(2, 8);
          const extension = matches[1] === "jpeg" ? "jpg" : matches[1];
          const fileKey = `feedbacks/${timestamp}-${randomSuffix}.${extension}`;

          // Upload
          await uploadToS3(fileKey, buffer, mimeType);

          // URL publique (ou signée selon config)
          screenshotUrl = `${process.env.S3_PUBLIC_URL || `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.scw.cloud`}/${fileKey}`;
        }
      } catch (error) {
        console.error("Erreur upload screenshot:", error);
        // On continue sans screenshot en cas d'erreur
      }
    }

    // Créer le feedback en base
    const feedback = await prisma.feedback.create({
      data: {
        type: validatedData.type,
        subject: validatedData.subject,
        message: validatedData.message,
        screenshot: screenshotUrl,
        pageUrl: validatedData.pageUrl,
        userAgent,
        userId: session.user.id,
      },
      select: {
        id: true,
        type: true,
        subject: true,
        createdAt: true,
      },
    });

    // Notifier l'admin par email
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const typeLabels: Record<string, string> = {
        BUG: "Bug",
        IMPROVEMENT: "Amélioration",
        QUESTION: "Question",
        OTHER: "Autre",
      };

      const userName = session.user.name;
      const userEmail = session.user.email;

      void sendEmail({
        to: adminEmail,
        subject: `[Feedback] ${typeLabels[validatedData.type]} : ${validatedData.subject}`,
        html: `
          <h2>Nouveau feedback reçu</h2>
          <p><strong>Type :</strong> ${typeLabels[validatedData.type]}</p>
          <p><strong>Sujet :</strong> ${validatedData.subject}</p>
          <p><strong>De :</strong> ${userName} (${userEmail})</p>
          <p><strong>Page :</strong> <a href="${validatedData.pageUrl}">${validatedData.pageUrl}</a></p>
          <hr>
          <h3>Message :</h3>
          <p style="white-space: pre-wrap;">${validatedData.message}</p>
          ${screenshotUrl ? `<p><strong>Capture d'écran :</strong> <a href="${screenshotUrl}">Voir l'image</a></p>` : ""}
          <hr>
          <p style="color:#666;font-size:12px;">User-Agent: ${userAgent || "Non disponible"}</p>
          <p><a href="${process.env.BETTER_AUTH_URL}/admin/feedback/${feedback.id}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">Voir dans l'admin</a></p>
        `,
        text: `Nouveau feedback (${typeLabels[validatedData.type]})\n\nSujet: ${validatedData.subject}\nDe: ${userName} (${userEmail})\nPage: ${validatedData.pageUrl}\n\nMessage:\n${validatedData.message}\n\n${screenshotUrl ? `Capture: ${screenshotUrl}` : ""}`,
      });
    }

    // TODO: Notification in-app pour les admins (quand le dashboard admin sera implémenté)

    return NextResponse.json({
      success: true,
      feedbackId: feedback.id,
      message: "Merci pour votre retour ! Nous l'examinerons rapidement.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0];
      return NextResponse.json(
        { error: firstIssue.message },
        { status: 400 }
      );
    }

    console.error("Erreur création feedback:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'envoi du feedback" },
      { status: 500 }
    );
  }
}
