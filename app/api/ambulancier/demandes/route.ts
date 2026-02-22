import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Prisma, RequestStatus, HistoryEventType } from "@/generated/prisma/client";
import { ambulancierTransportRequestSchema } from "@/lib/validations/transport-request";
import { ZodError } from "zod";
import { notifyTransportRequestCreated } from "@/lib/notifications";
import { AuditHelpers } from "@/lib/audit-log";

export async function GET(request: NextRequest) {
  try {
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

    // Récupérer les paramètres de filtre
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Construire la requête
    const where: Prisma.TransportRequestWhereInput = {
      companyId: user.companyId,
    };

    if (status && status !== "ALL") {
      where.status = status as RequestStatus;
    }

    if (search) {
      where.OR = [
        { patientFirstName: { contains: search, mode: "insensitive" } },
        { patientLastName: { contains: search, mode: "insensitive" } },
        { pickupCity: { contains: search, mode: "insensitive" } },
        { destinationCity: { contains: search, mode: "insensitive" } },
      ];
    }

    if (dateFrom || dateTo) {
      where.requestedDate = {};
      if (dateFrom) {
        (where.requestedDate as Prisma.DateTimeFilter).gte = new Date(dateFrom);
      }
      if (dateTo) {
        (where.requestedDate as Prisma.DateTimeFilter).lte = new Date(dateTo);
      }
    }

    const demandes = await prisma.transportRequest.findMany({
      where,
      orderBy: [
        { status: "asc" }, // PENDING en premier
        { requestedDate: "asc" },
        { requestedTime: "asc" },
      ],
      select: {
        id: true,
        trackingId: true,
        status: true,
        patientFirstName: true,
        patientLastName: true,
        patientPhone: true,
        transportType: true,
        tripType: true,
        mobilityType: true,
        requestedDate: true,
        requestedTime: true,
        pickupAddress: true,
        pickupCity: true,
        pickupPostalCode: true,
        destinationAddress: true,
        destinationCity: true,
        destinationPostalCode: true,
        hasTransportVoucher: true,
        createdAt: true,
      },
    });

    return NextResponse.json(demandes);
  } catch (error) {
    console.error("Erreur API /api/ambulancier/demandes:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Créer une nouvelle demande de transport (par l'ambulancier)
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est ambulancier avec une company
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        role: true,
        companyId: true,
        company: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
    });

    if (!user || user.role !== "AMBULANCIER" || !user.companyId || !user.company) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    if (!user.company.isActive) {
      return NextResponse.json(
        { error: "Votre entreprise n'est pas active" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validation avec Zod (sans companyId)
    const validatedData = ambulancierTransportRequestSchema.parse(body);

    // Rechercher si un utilisateur client existe avec cet email
    let linkedUserId: string | null = null;
    if (validatedData.patientEmail) {
      const existingCustomer = await prisma.user.findFirst({
        where: {
          email: validatedData.patientEmail,
          role: "CUSTOMER",
        },
        select: { id: true },
      });
      if (existingCustomer) {
        linkedUserId = existingCustomer.id;
      }
    }

    // Créer la demande de transport avec historique
    const transportRequest = await prisma.$transaction(async (tx) => {
      const newRequest = await tx.transportRequest.create({
        data: {
          companyId: user.companyId!, // Auto-inféré depuis la session

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

          // Lier au client existant si trouvé, sinon null
          userId: linkedUserId,

          // Status
          status: "PENDING",
        },
        select: {
          id: true,
          trackingId: true,
        },
      });

      // Créer l'entrée d'historique
      const historyComment = linkedUserId
        ? `Demande créée par l'ambulancier ${user.name} (liée au compte client)`
        : `Demande créée par l'ambulancier ${user.name}`;

      await tx.requestHistory.create({
        data: {
          eventType: HistoryEventType.CREATED,
          newStatus: RequestStatus.PENDING,
          comment: historyComment,
          request: { connect: { id: newRequest.id } },
          user: { connect: { id: user.id } },
        },
      });

      return newRequest;
    });

    // Logger la création de la demande
    AuditHelpers.transportCreated(user.id, transportRequest.id);

    // Notifier le patient si email ou phone fourni
    if (validatedData.patientEmail || validatedData.patientPhone) {
      const patientName = `${validatedData.patientFirstName} ${validatedData.patientLastName}`;
      const formattedDate = new Date(validatedData.requestedDate).toLocaleDateString("fr-FR");

      notifyTransportRequestCreated({
        patientName,
        patientEmail: validatedData.patientEmail || undefined,
        patientPhone: validatedData.patientPhone,
        companyName: user.company.name,
        date: formattedDate,
        time: validatedData.requestedTime,
        trackingId: transportRequest.trackingId,
        userId: linkedUserId || undefined, // Pour notification in-app si client existant
      }).catch((err) => {
        console.error("Erreur notification patient création demande:", err);
      });
    }

    return NextResponse.json({
      success: true,
      id: transportRequest.id,
      trackingId: transportRequest.trackingId,
      linkedToCustomer: !!linkedUserId,
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
