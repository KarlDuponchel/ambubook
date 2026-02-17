import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Prisma, RequestStatus, HistoryEventType } from "@/generated/prisma/client";
import { getSignedDownloadUrl, isS3Configured } from "@/lib/s3";
import {
  notifyTransportAccepted,
  notifyTransportRefused,
  notifyTransportCounterProposal,
} from "@/lib/notifications";

// GET - Récupérer les détails d'une demande
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
      select: {
        role: true,
        companyId: true,
        company: {
          select: {
            address: true,
            city: true,
            postalCode: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    if (!user || user.role !== "AMBULANCIER" || !user.companyId) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const demande = await prisma.transportRequest.findFirst({
      where: {
        id,
        companyId: user.companyId,
      },
      include: {
        history: {
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
        attachments: {
          orderBy: { createdAt: "desc" },
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!demande) {
      return NextResponse.json({ error: "Demande non trouvée" }, { status: 404 });
    }

    // Générer des URLs signées pour les fichiers S3
    const attachmentsWithSignedUrls = await Promise.all(
      demande.attachments.map(async (attachment) => {
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

    return NextResponse.json({
      demande: {
        ...demande,
        attachments: attachmentsWithSignedUrls,
      },
      company: user.company,
    });
  } catch (error) {
    console.error("Erreur API GET /api/ambulancier/demandes/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH - Mettre à jour le statut d'une demande
export async function PATCH(
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
    const existingDemande = await prisma.transportRequest.findFirst({
      where: {
        id,
        companyId: user.companyId,
      },
      include: {
        company: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!existingDemande) {
      return NextResponse.json({ error: "Demande non trouvée" }, { status: 404 });
    }

    const body = await request.json();
    const { action, responseNote, proposedDate, proposedTime } = body;

    let updateData: Prisma.TransportRequestUpdateInput;
    let historyData: Prisma.RequestHistoryCreateInput;
    const previousStatus = existingDemande.status;

    switch (action) {
      case "accept":
        updateData = {
          status: RequestStatus.ACCEPTED,
          responseNote: responseNote || null,
          respondedAt: new Date(),
        };
        historyData = {
          eventType: HistoryEventType.STATUS_CHANGED,
          previousStatus,
          newStatus: RequestStatus.ACCEPTED,
          comment: responseNote || null,
          request: { connect: { id } },
          user: { connect: { id: user.id } },
        };
        break;

      case "refuse":
        updateData = {
          status: RequestStatus.REFUSED,
          responseNote: responseNote || null,
          respondedAt: new Date(),
        };
        historyData = {
          eventType: HistoryEventType.STATUS_CHANGED,
          previousStatus,
          newStatus: RequestStatus.REFUSED,
          comment: responseNote || null,
          request: { connect: { id } },
          user: { connect: { id: user.id } },
        };
        break;

      case "counter_proposal":
        if (!proposedDate || !proposedTime) {
          return NextResponse.json(
            { error: "Date et heure de contre-proposition requises" },
            { status: 400 }
          );
        }
        updateData = {
          status: RequestStatus.COUNTER_PROPOSAL,
          proposedDate: new Date(proposedDate),
          proposedTime,
          responseNote: responseNote || null,
          respondedAt: new Date(),
        };
        historyData = {
          eventType: HistoryEventType.COUNTER_PROPOSAL,
          previousStatus,
          newStatus: RequestStatus.COUNTER_PROPOSAL,
          proposedDate: new Date(proposedDate),
          proposedTime,
          comment: responseNote || null,
          request: { connect: { id } },
          user: { connect: { id: user.id } },
        };
        break;

      case "complete":
        updateData = {
          status: RequestStatus.COMPLETED,
          respondedAt: new Date(),
        };
        historyData = {
          eventType: HistoryEventType.STATUS_CHANGED,
          previousStatus,
          newStatus: RequestStatus.COMPLETED,
          comment: responseNote || null,
          request: { connect: { id } },
          user: { connect: { id: user.id } },
        };
        break;

      default:
        return NextResponse.json({ error: "Action invalide" }, { status: 400 });
    }

    // Transaction pour mettre à jour la demande et créer l'historique
    const [updatedDemande] = await prisma.$transaction([
      prisma.transportRequest.update({
        where: { id },
        data: updateData,
      }),
      prisma.requestHistory.create({
        data: historyData,
      }),
    ]);

    // Envoyer les notifications au client
    const patientName = `${existingDemande.patientFirstName} ${existingDemande.patientLastName}`;
    const formattedDate = existingDemande.requestedDate.toLocaleDateString("fr-FR");

    if (action === "accept") {
      notifyTransportAccepted({
        patientName,
        patientEmail: existingDemande.patientEmail || undefined,
        patientPhone: existingDemande.patientPhone,
        companyName: existingDemande.company.name,
        companyPhone: existingDemande.company.phone || undefined,
        date: formattedDate,
        time: existingDemande.requestedTime,
        userId: existingDemande.userId || undefined,
      }).catch((err) => {
        console.error("Erreur notification transport accepté:", err);
      });
    } else if (action === "refuse") {
      notifyTransportRefused({
        patientName,
        patientEmail: existingDemande.patientEmail || undefined,
        patientPhone: existingDemande.patientPhone,
        companyName: existingDemande.company.name,
        reason: responseNote || undefined,
        userId: existingDemande.userId || undefined,
      }).catch((err) => {
        console.error("Erreur notification transport refusé:", err);
      });
    } else if (action === "counter_proposal") {
      notifyTransportCounterProposal({
        patientName,
        patientEmail: existingDemande.patientEmail || undefined,
        patientPhone: existingDemande.patientPhone,
        companyName: existingDemande.company.name,
        originalDate: formattedDate,
        originalTime: existingDemande.requestedTime,
        proposedDate: new Date(proposedDate).toLocaleDateString("fr-FR"),
        proposedTime,
        trackingId: existingDemande.trackingId,
        userId: existingDemande.userId || undefined,
      }).catch((err) => {
        console.error("Erreur notification contre-proposition:", err);
      });
    }

    return NextResponse.json(updatedDemande);
  } catch (error) {
    console.error("Erreur API PATCH /api/ambulancier/demandes/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
