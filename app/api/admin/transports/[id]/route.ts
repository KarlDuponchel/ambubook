import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthError } from "@/lib/auth-guard";
import { getSignedDownloadUrl, isS3Configured } from "@/lib/s3";

/**
 * Génère une URL signée pour une pièce jointe
 */
async function getAttachmentUrl(fileUrl: string): Promise<string> {
  // Si c'est déjà une URL complète (anciens fichiers), la retourner telle quelle
  if (fileUrl.startsWith("http")) {
    return fileUrl;
  }

  // Sinon c'est une clé S3, générer une URL signée (1h)
  if (isS3Configured()) {
    try {
      return await getSignedDownloadUrl(fileUrl, 3600);
    } catch {
      return fileUrl;
    }
  }

  return fileUrl;
}

/**
 * GET /api/admin/transports/[id] - Détail complet d'un transport
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if (isAuthError(authResult)) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { id } = await params;

  const transport = await prisma.transportRequest.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      history: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      attachments: {
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!transport) {
    return NextResponse.json({ error: "Transport non trouvé" }, { status: 404 });
  }

  // Générer les URLs signées pour les pièces jointes
  const attachmentsWithUrls = await Promise.all(
    transport.attachments.map(async (attachment) => ({
      ...attachment,
      fileUrl: await getAttachmentUrl(attachment.fileUrl),
    }))
  );

  return NextResponse.json({
    ...transport,
    attachments: attachmentsWithUrls,
  });
}

/**
 * PATCH /api/admin/transports/[id] - Modifier le statut d'un transport (admin override)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if (isAuthError(authResult)) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { id } = await params;
  const body = await request.json();
  const { status, adminNote } = body;

  // Vérifier que le transport existe
  const existingTransport = await prisma.transportRequest.findUnique({
    where: { id },
    select: { id: true, status: true },
  });

  if (!existingTransport) {
    return NextResponse.json({ error: "Transport non trouvé" }, { status: 404 });
  }

  // Mettre à jour le statut
  const updatedTransport = await prisma.transportRequest.update({
    where: { id },
    data: {
      status,
      updatedAt: new Date(),
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  // Ajouter une entrée dans l'historique
  await prisma.requestHistory.create({
    data: {
      requestId: id,
      eventType: "STATUS_CHANGED",
      previousStatus: existingTransport.status,
      newStatus: status,
      comment: adminNote ? `[Admin] ${adminNote}` : "[Admin] Modification administrative du statut",
      userId: authResult.user.id,
    },
  });

  return NextResponse.json(updatedTransport);
}
