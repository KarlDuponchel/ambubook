import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AttachmentType, HistoryEventType } from "@/generated/prisma/client";
import { uploadToS3, deleteFromS3, generateFileKey, getSignedDownloadUrl, isS3Configured } from "@/lib/s3";

// Configuration des types de fichiers autorisés
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE_KB = 10240; // 10 Mo

// Types de documents autorisés pour les clients
const CUSTOMER_ALLOWED_TYPES: AttachmentType[] = [
  "ID_DOCUMENT",
  "MUTUELLE",
  "SOCIAL_SECURITY",
  "PRESCRIPTION",
  "TRANSPORT_VOUCHER",
  "OTHER",
];

// Vérifier que le client a accès à cette demande via trackingId
async function verifyCustomerAccess(trackingId: string, userId: string) {
  const demande = await prisma.transportRequest.findFirst({
    where: {
      trackingId,
      userId,
    },
  });
  return demande;
}

// GET - Liste des pièces jointes d'une demande (pour le client)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackingId: string }> }
) {
  try {
    const { trackingId } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier que le client a accès à cette demande
    const demande = await verifyCustomerAccess(trackingId, session.user.id);
    if (!demande) {
      return NextResponse.json({ error: "Demande non trouvée" }, { status: 404 });
    }

    const attachments = await prisma.requestAttachment.findMany({
      where: { requestId: demande.id },
      orderBy: { createdAt: "desc" },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Générer des URLs signées pour les fichiers S3
    const attachmentsWithSignedUrls = await Promise.all(
      attachments.map(async (attachment) => {
        if (attachment.fileKey && isS3Configured()) {
          try {
            const signedUrl = await getSignedDownloadUrl(attachment.fileKey);
            return { ...attachment, fileUrl: signedUrl };
          } catch {
            return attachment;
          }
        }
        return attachment;
      })
    );

    return NextResponse.json(attachmentsWithSignedUrls);
  } catch (error) {
    console.error("Erreur API GET /api/customer/transports/[trackingId]/attachments:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Ajouter une pièce jointe (pour le client)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ trackingId: string }> }
) {
  try {
    const { trackingId } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier que le client a accès à cette demande
    const demande = await verifyCustomerAccess(trackingId, session.user.id);
    if (!demande) {
      return NextResponse.json({ error: "Demande non trouvée" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const fileType = formData.get("fileType") as AttachmentType | null;

    if (!file) {
      return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
    }

    if (!fileType || !CUSTOMER_ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json({ error: "Type de fichier non autorisé pour les clients" }, { status: 400 });
    }

    // Vérifier le type MIME
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Type de fichier non autorisé. Formats acceptés : PDF, JPEG, PNG, WebP" },
        { status: 400 }
      );
    }

    // Vérifier la taille
    const fileSizeKb = Math.ceil(file.size / 1024);
    if (fileSizeKb > MAX_FILE_SIZE_KB) {
      return NextResponse.json(
        { error: `Fichier trop volumineux. Taille max : ${MAX_FILE_SIZE_KB / 1024} Mo` },
        { status: 400 }
      );
    }

    // Lire le contenu du fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let fileUrl: string;
    let fileKey: string | null = null;

    // Upload vers S3 si configuré, sinon fallback base64
    if (isS3Configured()) {
      fileKey = generateFileKey(demande.id, file.name);
      await uploadToS3(fileKey, buffer, file.type);
      // URL sera générée à la volée via getSignedDownloadUrl
      fileUrl = "";
    } else {
      // Fallback base64 pour le développement local
      const base64 = buffer.toString("base64");
      fileUrl = `data:${file.type};base64,${base64}`;
    }

    // Créer la pièce jointe et l'entrée d'historique en transaction
    const [attachment] = await prisma.$transaction([
      prisma.requestAttachment.create({
        data: {
          fileName: file.name,
          fileType,
          fileUrl,
          fileKey,
          fileSizeKb,
          mimeType: file.type,
          request: { connect: { id: demande.id } },
          uploadedBy: { connect: { id: session.user.id } },
        },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.requestHistory.create({
        data: {
          eventType: HistoryEventType.ATTACHMENT_ADDED,
          comment: `Document ajouté par le client : ${file.name}`,
          request: { connect: { id: demande.id } },
          user: { connect: { id: session.user.id } },
        },
      }),
    ]);

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error("Erreur API POST /api/customer/transports/[trackingId]/attachments:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Supprimer une pièce jointe (uniquement ses propres pièces jointes)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ trackingId: string }> }
) {
  try {
    const { trackingId } = await params;
    const { searchParams } = new URL(request.url);
    const attachmentId = searchParams.get("attachmentId");

    if (!attachmentId) {
      return NextResponse.json({ error: "ID de pièce jointe requis" }, { status: 400 });
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier que le client a accès à cette demande
    const demande = await verifyCustomerAccess(trackingId, session.user.id);
    if (!demande) {
      return NextResponse.json({ error: "Demande non trouvée" }, { status: 404 });
    }

    // Vérifier que la pièce jointe existe et a été uploadée par ce client
    const attachment = await prisma.requestAttachment.findFirst({
      where: {
        id: attachmentId,
        requestId: demande.id,
        uploadedById: session.user.id, // Le client ne peut supprimer que ses propres fichiers
      },
    });

    if (!attachment) {
      return NextResponse.json({ error: "Pièce jointe non trouvée ou non autorisée" }, { status: 404 });
    }

    // Supprimer de S3 si le fichier a une clé
    if (attachment.fileKey && isS3Configured()) {
      try {
        await deleteFromS3(attachment.fileKey);
      } catch (error) {
        console.error("Erreur suppression S3:", error);
      }
    }

    await prisma.requestAttachment.delete({
      where: { id: attachmentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur API DELETE /api/customer/transports/[trackingId]/attachments:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
