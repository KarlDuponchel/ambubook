import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthError } from "@/lib/auth-guard";

/**
 * GET /api/admin/transports - Liste paginée des transports avec filtres
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin();
  if (isAuthError(authResult)) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "ALL";
  const transportType = searchParams.get("transportType") || "ALL";
  const tripType = searchParams.get("tripType") || "ALL";
  const companyId = searchParams.get("companyId") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));

  // Construction du filtre WHERE
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  // Filtre recherche (trackingId, patient nom/prénom/email/téléphone)
  if (search) {
    where.OR = [
      { trackingId: { contains: search, mode: "insensitive" } },
      { patientFirstName: { contains: search, mode: "insensitive" } },
      { patientLastName: { contains: search, mode: "insensitive" } },
      { patientEmail: { contains: search, mode: "insensitive" } },
      { patientPhone: { contains: search, mode: "insensitive" } },
    ];
  }

  // Filtre statut
  if (status !== "ALL") {
    where.status = status;
  }

  // Filtre type de transport
  if (transportType !== "ALL") {
    where.transportType = transportType;
  }

  // Filtre type de trajet
  if (tripType !== "ALL") {
    where.tripType = tripType;
  }

  // Filtre entreprise
  if (companyId) {
    where.companyId = companyId;
  }

  // Filtre date de début
  if (dateFrom) {
    where.requestedDate = {
      ...where.requestedDate,
      gte: new Date(dateFrom),
    };
  }

  // Filtre date de fin
  if (dateTo) {
    where.requestedDate = {
      ...where.requestedDate,
      lte: new Date(dateTo + "T23:59:59.999Z"),
    };
  }

  // Comptages pour les filtres (sans pagination, avec recherche)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseWhere: any = search
    ? {
        OR: [
          { trackingId: { contains: search, mode: "insensitive" } },
          { patientFirstName: { contains: search, mode: "insensitive" } },
          { patientLastName: { contains: search, mode: "insensitive" } },
          { patientEmail: { contains: search, mode: "insensitive" } },
          { patientPhone: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [
    total,
    totalFiltered,
    pending,
    accepted,
    refused,
    completed,
    cancelled,
    ambulance,
    vsl,
  ] = await Promise.all([
    prisma.transportRequest.count({ where: baseWhere }),
    prisma.transportRequest.count({ where }),
    prisma.transportRequest.count({ where: { ...baseWhere, status: "PENDING" } }),
    prisma.transportRequest.count({ where: { ...baseWhere, status: "ACCEPTED" } }),
    prisma.transportRequest.count({ where: { ...baseWhere, status: "REFUSED" } }),
    prisma.transportRequest.count({ where: { ...baseWhere, status: "COMPLETED" } }),
    prisma.transportRequest.count({ where: { ...baseWhere, status: "CANCELLED" } }),
    prisma.transportRequest.count({ where: { ...baseWhere, transportType: "AMBULANCE" } }),
    prisma.transportRequest.count({ where: { ...baseWhere, transportType: "VSL" } }),
  ]);

  // Récupération paginée
  const transports = await prisma.transportRequest.findMany({
    where,
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          history: true,
          attachments: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  return NextResponse.json({
    transports,
    pagination: {
      page,
      limit,
      total: totalFiltered,
      totalPages: Math.ceil(totalFiltered / limit),
    },
    counts: {
      total,
      pending,
      accepted,
      refused,
      completed,
      cancelled,
      ambulance,
      vsl,
    },
  });
}
