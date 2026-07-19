import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Prisma, RequestStatus, HistoryEventType } from "@/generated/prisma/client";
import { notifyTransportCustomerResponse } from "@/lib/notifications";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { z } from "zod";

// Schéma de validation pour la réponse publique à une contre-proposition
const patchTransportSchema = z.object({
  action: z.enum(["accept", "counter_proposal", "cancel"]),
  responseNote: z.string().optional().nullable(),
  proposedDate: z.string().optional().nullable(),
  proposedTime: z.string().optional().nullable(),
});

/**
 * Normalise un nom pour comparaison (minuscules, sans accents, sans espaces
 * superflus). Sert de 2e facteur d'accès au suivi public (le nom du patient),
 * en complément du trackingId (CUID non devinable).
 */
function normalizeName(value: string | null | undefined): string {
  return (value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

// GET - Récupérer les détails d'un transport (public via trackingId)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackingId: string }> }
) {
  try {
    const { trackingId } = await params;

    // Validation basique du trackingId (format CUID)
    if (!trackingId || trackingId.length < 20) {
      return NextResponse.json(
        { error: "Identifiant de suivi invalide" },
        { status: 400 }
      );
    }

    // Rate limiting : limite les tentatives (brute-force du nom de vérification)
    const rateLimitResult = await rateLimit({
      identifier: `public-transport-view-${trackingId}`,
      window: 3600,
      max: 15,
    });
    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
      return rateLimitResponse(retryAfter);
    }

    // 2e facteur d'accès : le nom du patient (passé en query ?nom=)
    const verification = normalizeName(
      new URL(request.url).searchParams.get("nom")
    );

    const transport = await prisma.transportRequest.findUnique({
      where: { trackingId },
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
      },
    });

    if (!transport) {
      return NextResponse.json(
        { error: "Demande de transport non trouvée" },
        { status: 404 }
      );
    }

    // Vérification du 2e facteur : le nom du patient doit correspondre
    if (!verification || verification !== normalizeName(transport.patientLastName)) {
      return NextResponse.json(
        { error: "Vérification requise", requiresVerification: true },
        { status: 401 }
      );
    }

    // Ne pas exposer les données sensibles ni les documents médicaux :
    // les documents (ordonnance, carte vitale...) ne sont accessibles que
    // via l'espace client connecté (/mes-transports), pas par ce lien public.
    const { patientSocialSecurityNumber, ...safeTransport } = transport;

    return NextResponse.json(safeTransport);
  } catch (error) {
    console.error("Erreur API GET /api/public/transport/[trackingId]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH - Répondre à une contre-proposition (public via trackingId)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ trackingId: string }> }
) {
  // Rate limiting : max 10 actions par heure par trackingId
  const { trackingId } = await params;

  const rateLimitResult = await rateLimit({
    identifier: `public-transport-action-${trackingId}`,
    window: 3600,
    max: 10,
  });

  if (!rateLimitResult.success) {
    const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
    return rateLimitResponse(retryAfter);
  }

  try {
    // Validation basique du trackingId
    if (!trackingId || trackingId.length < 20) {
      return NextResponse.json(
        { error: "Identifiant de suivi invalide" },
        { status: 400 }
      );
    }

    // Récupérer la demande
    const existingTransport = await prisma.transportRequest.findUnique({
      where: { trackingId },
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
      return NextResponse.json(
        { error: "Demande de transport non trouvée" },
        { status: 404 }
      );
    }

    // Vérification du 2e facteur : le nom du patient (query ?nom=)
    const verification = normalizeName(
      new URL(request.url).searchParams.get("nom")
    );
    if (
      !verification ||
      verification !== normalizeName(existingTransport.patientLastName)
    ) {
      return NextResponse.json(
        { error: "Vérification requise" },
        { status: 401 }
      );
    }

    // Vérifier que le statut permet une réponse client
    if (existingTransport.status !== RequestStatus.COUNTER_PROPOSAL) {
      return NextResponse.json(
        { error: "Cette demande n'attend pas de réponse" },
        { status: 400 }
      );
    }

    const parsed = patchTransportSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { action, responseNote, proposedDate, proposedTime } = parsed.data;

    let updateData: Prisma.TransportRequestUpdateInput;
    let historyComment: string;
    let newStatus: RequestStatus;
    const previousStatus = existingTransport.status;

    switch (action) {
      case "accept":
        // Le client accepte la contre-proposition
        if (!existingTransport.proposedDate || !existingTransport.proposedTime) {
          return NextResponse.json(
            { error: "Aucune contre-proposition à accepter" },
            { status: 400 }
          );
        }
        newStatus = RequestStatus.ACCEPTED;
        updateData = {
          status: newStatus,
          requestedDate: existingTransport.proposedDate,
          requestedTime: existingTransport.proposedTime,
          responseNote: responseNote || null,
          respondedAt: new Date(),
        };
        historyComment = responseNote || "Le client a accepté la contre-proposition";
        break;

      case "counter_proposal":
        // Le client propose une nouvelle date/heure
        if (!proposedDate || !proposedTime) {
          return NextResponse.json(
            { error: "Date et heure requises pour une contre-proposition" },
            { status: 400 }
          );
        }
        newStatus = RequestStatus.PENDING;
        updateData = {
          status: newStatus,
          requestedDate: new Date(proposedDate),
          requestedTime: proposedTime,
          proposedDate: null,
          proposedTime: null,
          responseNote: responseNote || null,
          respondedAt: new Date(),
        };
        historyComment = responseNote || "Le client a proposé une nouvelle date";
        break;

      case "cancel":
        // Le client annule la demande
        newStatus = RequestStatus.CANCELLED;
        updateData = {
          status: newStatus,
          responseNote: responseNote || null,
          respondedAt: new Date(),
        };
        historyComment = responseNote || "Le client a annulé la demande";
        break;

      default:
        return NextResponse.json({ error: "Action invalide" }, { status: 400 });
    }

    // Préparer les données d'historique (sans user car pas connecté)
    const historyData: Prisma.RequestHistoryCreateInput = {
      eventType: HistoryEventType.CUSTOMER_RESPONSE,
      previousStatus,
      newStatus,
      comment: historyComment,
      request: { connect: { id: existingTransport.id } },
      // Pas de user car action publique
    };

    if (action === "counter_proposal" && proposedDate && proposedTime) {
      historyData.proposedDate = new Date(proposedDate);
      historyData.proposedTime = proposedTime;
    }

    // Transaction
    const [updatedTransport] = await prisma.$transaction([
      prisma.transportRequest.update({
        where: { id: existingTransport.id },
        data: updateData,
      }),
      prisma.requestHistory.create({
        data: historyData,
      }),
    ]);

    // Notifier les ambulanciers
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

    return NextResponse.json({
      success: true,
      status: updatedTransport.status,
      message: action === "accept"
        ? "Contre-proposition acceptée"
        : action === "cancel"
        ? "Demande annulée"
        : "Nouvelle proposition envoyée",
    });
  } catch (error) {
    console.error("Erreur API PATCH /api/public/transport/[trackingId]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
