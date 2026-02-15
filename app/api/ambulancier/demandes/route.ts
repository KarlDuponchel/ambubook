import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Prisma, RequestStatus } from "@/generated/prisma/client";

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
