import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthError } from "@/lib/auth-guard";

/**
 * GET /api/admin/companies - Liste paginée des entreprises avec filtres
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin();
  if (isAuthError(authResult)) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "ALL";
  const service = searchParams.get("service") || "ALL";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));

  // Construction du filtre WHERE
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  // Filtre recherche (nom, ville, SIRET)
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
      { siret: { contains: search, mode: "insensitive" } },
    ];
  }

  // Filtre statut
  if (status === "ACTIVE") {
    where.isActive = true;
  } else if (status === "INACTIVE") {
    where.isActive = false;
  }

  // Filtre service
  if (service === "AMBULANCE") {
    where.hasAmbulance = true;
  } else if (service === "VSL") {
    where.hasVSL = true;
  }

  // Comptages pour les filtres (sans pagination, avec recherche)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseWhere: any = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { city: { contains: search, mode: "insensitive" } },
          { siret: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [total, totalFiltered, active, inactive, withAmbulance, withVSL] = await Promise.all([
    prisma.company.count({ where: baseWhere }),
    prisma.company.count({ where }),
    prisma.company.count({ where: { ...baseWhere, isActive: true } }),
    prisma.company.count({ where: { ...baseWhere, isActive: false } }),
    prisma.company.count({ where: { ...baseWhere, hasAmbulance: true } }),
    prisma.company.count({ where: { ...baseWhere, hasVSL: true } }),
  ]);

  // Récupération paginée
  const companies = await prisma.company.findMany({
    where,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          users: true,
          transportRequests: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  return NextResponse.json({
    companies,
    pagination: {
      page,
      limit,
      total: totalFiltered,
      totalPages: Math.ceil(totalFiltered / limit),
    },
    counts: {
      total,
      active,
      inactive,
      withAmbulance,
      withVSL,
    },
  });
}
