import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Prisma, RequestStatus, HistoryEventType } from "@/generated/prisma/client";
import { transportRequestSchema } from "@/lib/validations/transport-request";
import { ZodError } from "zod";
import {
  notifyTransportRequestCreated,
  notifyNewTransportRequest,
} from "@/lib/notifications";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { AuditHelpers } from "@/lib/audit-log";

// POST - Créer une nouvelle demande de transport
export async function POST(request: NextRequest) {
  // Rate limiting : max 5 demandes par heure par IP
  const rateLimitResult = await rateLimit({
    identifier: "create-transport",
    window: 3600, // 1 heure
    max: 5,
  });

  if (!rateLimitResult.success) {
    const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
    return rateLimitResponse(retryAfter);
  }

  try {
    const body = await request.json();

    // Validation avec Zod
    const validatedData = transportRequestSchema.parse(body);

    // Vérifier que la company existe et est active
    const company = await prisma.company.findUnique({
      where: { id: validatedData.companyId },
      select: { id: true, isActive: true },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Ambulancier non trouvé" },
        { status: 404 }
      );
    }

    if (!company.isActive) {
      return NextResponse.json(
        { error: "Cet ambulancier n'accepte pas de nouvelles demandes" },
        { status: 400 }
      );
    }

    // Vérifier que l'ambulancier n'est pas en congés à la date demandée
    const requestedDate = new Date(validatedData.requestedDate);
    const timeOffForRequestedDate = await prisma.companyTimeOff.findFirst({
      where: {
        companyId: validatedData.companyId,
        startDate: { lte: requestedDate },
        endDate: { gte: requestedDate },
      },
    });

    if (timeOffForRequestedDate) {
      const startStr = new Date(timeOffForRequestedDate.startDate).toLocaleDateString("fr-FR");
      const endStr = new Date(timeOffForRequestedDate.endDate).toLocaleDateString("fr-FR");
      return NextResponse.json(
        { error: `L'ambulancier est en congés du ${startStr} au ${endStr} (${timeOffForRequestedDate.title}). Veuillez choisir une autre date.` },
        { status: 400 }
      );
    }

    // Vérifier également la date de retour si aller-retour
    if (validatedData.returnDate) {
      const returnDate = new Date(validatedData.returnDate);
      const timeOffForReturnDate = await prisma.companyTimeOff.findFirst({
        where: {
          companyId: validatedData.companyId,
          startDate: { lte: returnDate },
          endDate: { gte: returnDate },
        },
      });

      if (timeOffForReturnDate) {
        const startStr = new Date(timeOffForReturnDate.startDate).toLocaleDateString("fr-FR");
        const endStr = new Date(timeOffForReturnDate.endDate).toLocaleDateString("fr-FR");
        return NextResponse.json(
          { error: `L'ambulancier est en congés du ${startStr} au ${endStr} (${timeOffForReturnDate.title}). Veuillez choisir une autre date de retour.` },
          { status: 400 }
        );
      }
    }

    // Récupérer la session (optionnelle - la demande peut être anonyme)
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id || null;

    // Créer la demande de transport avec historique
    const transportRequest = await prisma.$transaction(async (tx) => {
      const request = await tx.transportRequest.create({
        data: {
          companyId: validatedData.companyId,
          userId,

          // Patient
          patientFirstName: validatedData.patientFirstName,
          patientLastName: validatedData.patientLastName,
          patientPhone: validatedData.patientPhone,
          patientEmail: validatedData.patientEmail || null,
          patientSocialSecurityNumber:
            validatedData.patientSocialSecurityNumber || null,

          // Transport
          transportType: validatedData.transportType,
          tripType: validatedData.tripType,
          mobilityType: validatedData.mobilityType,
          needsAccompanist: validatedData.needsAccompanist,
          accompanistName: validatedData.accompanistName || null,

          // Adresses
          pickupAddress: validatedData.pickupAddress,
          pickupCity: validatedData.pickupCity,
          pickupPostalCode: validatedData.pickupPostalCode,
          pickupDetails: validatedData.pickupDetails || null,

          destinationAddress: validatedData.destinationAddress,
          destinationCity: validatedData.destinationCity,
          destinationPostalCode: validatedData.destinationPostalCode,
          destinationDetails: validatedData.destinationDetails || null,

          // Planning
          requestedDate: new Date(validatedData.requestedDate),
          requestedTime: validatedData.requestedTime,
          returnDate: validatedData.returnDate
            ? new Date(validatedData.returnDate)
            : null,
          returnTime: validatedData.returnTime || null,
          hasTransportVoucher: validatedData.hasTransportVoucher,
          reason: validatedData.reason || null,
          notes: validatedData.notes || null,

          // Status
          status: "PENDING",
        },
        select: {
          id: true,
          trackingId: true,
        },
      });

      // Créer l'entrée d'historique
      await tx.requestHistory.create({
        data: {
          eventType: HistoryEventType.CREATED,
          newStatus: RequestStatus.PENDING,
          comment: userId ? "Demande créée par le client" : "Demande créée (visiteur)",
          request: { connect: { id: request.id } },
          ...(userId && { user: { connect: { id: userId } } }),
        },
      });

      return request;
    });

    // Logger la création de la demande
    AuditHelpers.transportCreated(userId, transportRequest.id);

    // Récupérer les infos de la company pour les notifications
    const companyInfo = await prisma.company.findUnique({
      where: { id: validatedData.companyId },
      select: {
        name: true,
        phone: true,
        users: {
          where: { role: "AMBULANCIER", isActive: true },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
          take: 5, // Limiter aux 5 premiers ambulanciers actifs
        },
      },
    });

    if (companyInfo) {
      const patientName = `${validatedData.patientFirstName} ${validatedData.patientLastName}`;
      const formattedDate = new Date(validatedData.requestedDate).toLocaleDateString("fr-FR");

      // Notifier le client
      notifyTransportRequestCreated({
        patientName,
        patientEmail: validatedData.patientEmail || undefined,
        patientPhone: validatedData.patientPhone,
        companyName: companyInfo.name,
        date: formattedDate,
        time: validatedData.requestedTime,
        trackingId: transportRequest.trackingId,
        userId: userId || undefined,
      }).catch((err) => {
        console.error("Erreur notification client création demande:", err);
      });

      // Notifier les ambulanciers de la société
      for (const ambulancier of companyInfo.users) {
        notifyNewTransportRequest({
          ambulancierEmail: ambulancier.email,
          ambulancierPhone: ambulancier.phone || undefined,
          ambulancierName: ambulancier.name,
          patientName,
          companyName: companyInfo.name,
          date: formattedDate,
          time: validatedData.requestedTime,
          pickupCity: validatedData.pickupCity,
          destinationCity: validatedData.destinationCity,
          userId: ambulancier.id,
        }).catch((err) => {
          console.error("Erreur notification ambulancier nouvelle demande:", err);
        });
      }
    }

    return NextResponse.json({
      success: true,
      trackingId: transportRequest.trackingId,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0];
      return NextResponse.json(
        { error: firstIssue.message },
        { status: 400 }
      );
    }

    console.error("Erreur lors de la création de la demande:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de la demande" },
      { status: 500 }
    );
  }
}

// GET - Liste des transports du client connecté
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer les paramètres de filtre
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    // Construire la requête - filtrer par userId
    const where: Prisma.TransportRequestWhereInput = {
      userId: session.user.id,
    };

    if (status && status !== "ALL") {
      where.status = status as RequestStatus;
    }

    const transports = await prisma.transportRequest.findMany({
      where,
      orderBy: {
        requestedDate: "desc",
      },
      select: {
        id: true,
        trackingId: true,
        status: true,
        transportType: true,
        tripType: true,
        mobilityType: true,
        requestedDate: true,
        requestedTime: true,
        proposedDate: true,
        proposedTime: true,
        pickupAddress: true,
        pickupCity: true,
        pickupPostalCode: true,
        destinationAddress: true,
        destinationCity: true,
        destinationPostalCode: true,
        createdAt: true,
        company: {
          select: {
            name: true,
            slug: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json(transports);
  } catch (error) {
    console.error("Erreur API /api/customer/transports:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
