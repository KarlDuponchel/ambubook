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

// GET - Liste des pièces jointes d'une demande
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, companyId: true },
    });

    if (!user || user.role !== "AMBULANCIER" || !user.companyId) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    // Vérifier que la demande appartient à la compagnie
    const demande = await prisma.transportRequest.findFirst({
      where: {
        id,
        companyId: user.companyId,
      },
    });

    if (!demande) {
      return NextResponse.json({ error: "Demande non trouvée" }, { status: 404 });
    }

    const attachments = await prisma.requestAttachment.findMany({
      where: { requestId: id },
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
    console.error("Erreur API GET /api/ambulancier/demandes/[id]/attachments:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Ajouter une pièce jointe
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, companyId: true },
    });

    if (!user || user.role !== "AMBULANCIER" || !user.companyId) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    // Vérifier que la demande appartient à la compagnie
    const demande = await prisma.transportRequest.findFirst({
      where: {
        id,
        companyId: user.companyId,
      },
    });

    if (!demande) {
      return NextResponse.json({ error: "Demande non trouvée" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const fileType = formData.get("fileType") as AttachmentType | null;

    if (!file) {
      return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
    }

    if (!fileType || !Object.values(AttachmentType).includes(fileType)) {
      return NextResponse.json({ error: "Type de fichier invalide" }, { status: 400 });
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
      fileKey = generateFileKey(id, file.name);
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
          request: { connect: { id } },
          uploadedBy: { connect: { id: user.id } },
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
          comment: `Pièce jointe ajoutée : ${file.name}`,
          request: { connect: { id } },
          user: { connect: { id: user.id } },
        },
      }),
    ]);

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error("Erreur API POST /api/ambulancier/demandes/[id]/attachments:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Supprimer une pièce jointe
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params;
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, companyId: true },
    });

    if (!user || user.role !== "AMBULANCIER" || !user.companyId) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    // Vérifier que la pièce jointe existe et appartient à la demande de la compagnie
    const attachment = await prisma.requestAttachment.findFirst({
      where: {
        id: attachmentId,
        requestId,
        request: {
          companyId: user.companyId,
        },
      },
    });

    if (!attachment) {
      return NextResponse.json({ error: "Pièce jointe non trouvée" }, { status: 404 });
    }

    // Supprimer de S3 si le fichier a une clé
    if (attachment.fileKey && isS3Configured()) {
      try {
        await deleteFromS3(attachment.fileKey);
      } catch (error) {
        console.error("Erreur suppression S3:", error);
        // Continuer même si la suppression S3 échoue
      }
    }

    await prisma.requestAttachment.delete({
      where: { id: attachmentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur API DELETE /api/ambulancier/demandes/[id]/attachments:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
