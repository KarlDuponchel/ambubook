import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getSignedDownloadUrl, isS3Configured } from "@/lib/s3";
import { Prisma, RequestStatus, HistoryEventType } from "@/generated/prisma/client";
import { notifyTransportCustomerResponse } from "@/lib/notifications";

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

    const transport = await prisma.transportRequest.findFirst({
      where: {
        trackingId,
        userId: session.user.id,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            phone: true,
            email: true,
            address: true,
            city: true,
            postalCode: true,
          },
        },
        history: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            eventType: true,
            previousStatus: true,
            newStatus: true,
            proposedDate: true,
            proposedTime: true,
            comment: true,
            createdAt: true,
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

    if (!transport) {
      return NextResponse.json(
        { error: "Transport non trouvé" },
        { status: 404 }
      );
    }

    // Générer des URLs signées pour les fichiers S3
    const attachmentsWithSignedUrls = await Promise.all(
      transport.attachments.map(async (attachment) => {
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
      ...transport,
      attachments: attachmentsWithSignedUrls,
    });
  } catch (error) {
    console.error("Erreur API GET /api/customer/transports/[trackingId]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH - Répondre à une contre-proposition
export async function PATCH(
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

    // Vérifier que la demande appartient au client
    const existingTransport = await prisma.transportRequest.findFirst({
      where: {
        trackingId,
        userId: session.user.id,
      },
      include: {
        company: {
          select: {
            name: true,
            users: {
              where: { role: "AMBULANCIER", isActive: true },
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
              take: 5,
            },
          },
        },
      },
    });

    if (!existingTransport) {
      return NextResponse.json({ error: "Transport non trouvé" }, { status: 404 });
    }

    // Vérifier que le statut permet une réponse client
    if (existingTransport.status !== RequestStatus.COUNTER_PROPOSAL) {
      return NextResponse.json(
        { error: "Cette demande n'attend pas de réponse client" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action, responseNote, proposedDate, proposedTime } = body;

    let updateData: Prisma.TransportRequestUpdateInput;
    let historyData: Prisma.RequestHistoryCreateInput;
    const previousStatus = existingTransport.status;

    switch (action) {
      case "accept":
        // Le client accepte la contre-proposition de l'ambulancier
        // Vérifier que la contre-proposition existe
        if (!existingTransport.proposedDate || !existingTransport.proposedTime) {
          return NextResponse.json(
            { error: "Aucune contre-proposition à accepter" },
            { status: 400 }
          );
        }
        updateData = {
          status: RequestStatus.ACCEPTED,
          // Mettre à jour la date demandée avec la date proposée acceptée
          requestedDate: existingTransport.proposedDate,
          requestedTime: existingTransport.proposedTime,
          responseNote: responseNote || null,
          respondedAt: new Date(),
        };
        historyData = {
          eventType: HistoryEventType.CUSTOMER_RESPONSE,
          previousStatus,
          newStatus: RequestStatus.ACCEPTED,
          comment: responseNote || "Le client a accepté la contre-proposition",
          request: { connect: { id: existingTransport.id } },
          user: { connect: { id: session.user.id } },
        };
        break;

      case "counter_proposal":
        // Le client propose une nouvelle date/heure
        if (!proposedDate || !proposedTime) {
          return NextResponse.json(
            { error: "Date et heure requises pour une contre-proposition" },
            { status: 400 }
          );
        }
        updateData = {
          status: RequestStatus.PENDING,
          // Mettre à jour la date demandée avec la nouvelle proposition du client
          requestedDate: new Date(proposedDate),
          requestedTime: proposedTime,
          // Effacer la proposition précédente de l'ambulancier
          proposedDate: null,
          proposedTime: null,
          responseNote: responseNote || null,
          respondedAt: new Date(),
        };
        historyData = {
          eventType: HistoryEventType.CUSTOMER_RESPONSE,
          previousStatus,
          newStatus: RequestStatus.PENDING,
          proposedDate: new Date(proposedDate),
          proposedTime,
          comment: responseNote || "Le client a proposé une nouvelle date",
          request: { connect: { id: existingTransport.id } },
          user: { connect: { id: session.user.id } },
        };
        break;

      case "cancel":
        // Le client annule la demande
        updateData = {
          status: RequestStatus.CANCELLED,
          responseNote: responseNote || null,
          respondedAt: new Date(),
        };
        historyData = {
          eventType: HistoryEventType.CUSTOMER_RESPONSE,
          previousStatus,
          newStatus: RequestStatus.CANCELLED,
          comment: responseNote || "Le client a annulé la demande",
          request: { connect: { id: existingTransport.id } },
          user: { connect: { id: session.user.id } },
        };
        break;

      default:
        return NextResponse.json({ error: "Action invalide" }, { status: 400 });
    }

    // Transaction pour mettre à jour la demande et créer l'historique
    const [updatedTransport] = await prisma.$transaction([
      prisma.transportRequest.update({
        where: { id: existingTransport.id },
        data: updateData,
      }),
      prisma.requestHistory.create({
        data: historyData,
      }),
    ]);

    // Notifier les ambulanciers de la réponse du client
    const patientName = `${existingTransport.patientFirstName} ${existingTransport.patientLastName}`;
    const responseType: "accepted" | "refused" | "new_proposal" =
      action === "accept" ? "accepted" : action === "cancel" ? "refused" : "new_proposal";

    for (const ambulancier of existingTransport.company.users) {
      notifyTransportCustomerResponse({
        ambulancierEmail: ambulancier.email,
        ambulancierPhone: ambulancier.phone || undefined,
        ambulancierName: ambulancier.name,
        patientName,
        companyName: existingTransport.company.name,
        response: responseType,
        userId: ambulancier.id,
      }).catch((err) => {
        console.error("Erreur notification réponse client:", err);
      });
    }

    return NextResponse.json(updatedTransport);
  } catch (error) {
    console.error("Erreur API PATCH /api/customer/transports/[trackingId]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
