import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthError } from "@/lib/auth-guard";
import { getSignedDownloadUrl, isS3Configured } from "@/lib/s3";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Génère une URL signée pour un screenshot de feedback
 */
async function getScreenshotUrl(screenshot: string | null): Promise<string | null> {
  if (!screenshot) return null;

  // Si c'est déjà une URL complète (anciens feedbacks), la retourner telle quelle
  if (screenshot.startsWith("http")) {
    return screenshot;
  }

  // Sinon c'est une clé S3, générer une URL signée (1h)
  if (isS3Configured()) {
    try {
      return await getSignedDownloadUrl(screenshot, 3600);
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * GET /api/admin/feedback/[id] - Détail d'un feedback
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const authResult = await requireAdmin();
  if (isAuthError(authResult)) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { id } = await params;

  const feedback = await prisma.feedback.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!feedback) {
    return NextResponse.json(
      { error: "Feedback non trouvé" },
      { status: 404 }
    );
  }

  // Générer l'URL signée pour le screenshot
  const screenshotUrl = await getScreenshotUrl(feedback.screenshot);

  return NextResponse.json({
    ...feedback,
    screenshot: screenshotUrl,
  });
}

/**
 * PATCH /api/admin/feedback/[id] - Modifier un feedback (status, priority, adminNotes)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authResult = await requireAdmin();
  if (isAuthError(authResult)) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { id } = await params;

  // Vérifier que le feedback existe
  const existingFeedback = await prisma.feedback.findUnique({
    where: { id },
    select: { id: true, status: true },
  });

  if (!existingFeedback) {
    return NextResponse.json(
      { error: "Feedback non trouvé" },
      { status: 404 }
    );
  }

  const body = await request.json();
  const { status, priority, adminNotes } = body;

  // Préparer les données à mettre à jour
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {};

  if (status !== undefined) {
    // Valider le statut
    const validStatuses = ["NEW", "IN_PROGRESS", "RESOLVED", "WONT_FIX"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Statut invalide" },
        { status: 400 }
      );
    }
    updateData.status = status;

    // Si on passe à RESOLVED, enregistrer la date de résolution
    if (status === "RESOLVED" && existingFeedback.status !== "RESOLVED") {
      updateData.resolvedAt = new Date();
    }
    // Si on quitte RESOLVED, remettre resolvedAt à null
    if (status !== "RESOLVED" && existingFeedback.status === "RESOLVED") {
      updateData.resolvedAt = null;
    }
  }

  if (priority !== undefined) {
    // Valider la priorité
    const validPriorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: "Priorité invalide" },
        { status: 400 }
      );
    }
    updateData.priority = priority;
  }

  if (adminNotes !== undefined) {
    updateData.adminNotes = adminNotes || null;
  }

  // Mettre à jour
  const updatedFeedback = await prisma.feedback.update({
    where: { id },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  // Générer l'URL signée pour le screenshot
  const screenshotUrl = await getScreenshotUrl(updatedFeedback.screenshot);

  return NextResponse.json({
    ...updatedFeedback,
    screenshot: screenshotUrl,
  });
}
