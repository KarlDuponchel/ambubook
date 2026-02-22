import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthError } from "@/lib/auth-guard";

/**
 * GET /api/admin/users - Liste paginée des utilisateurs avec filtres
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin();
  if (isAuthError(authResult)) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "ALL";
  const status = searchParams.get("status") || "ALL";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));

  // Construction du filtre WHERE
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  // Filtre recherche
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { company: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  // Filtre rôle
  if (role !== "ALL") {
    where.role = role;
  }

  // Filtre statut
  if (status === "ACTIVE") {
    where.isActive = true;
  } else if (status === "PENDING") {
    where.isActive = false;
  }

  // Comptages pour les filtres (sans pagination, avec recherche)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseWhere: any = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { company: { name: { contains: search, mode: "insensitive" } } },
        ],
      }
    : {};

  const [total, totalFiltered, admins, ambulanciers, customers, pending] = await Promise.all([
    prisma.user.count({ where: baseWhere }),
    prisma.user.count({ where }),
    prisma.user.count({ where: { ...baseWhere, role: "ADMIN" } }),
    prisma.user.count({ where: { ...baseWhere, role: "AMBULANCIER" } }),
    prisma.user.count({ where: { ...baseWhere, role: "CUSTOMER" } }),
    prisma.user.count({ where: { ...baseWhere, isActive: false } }),
  ]);

  // Récupération paginée
  const users = await prisma.user.findMany({
    where,
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          ownerId: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  // Ajouter le champ isCompanyOwner pour chaque utilisateur
  const usersWithOwnerFlag = users.map((user) => ({
    ...user,
    isCompanyOwner: user.company?.ownerId === user.id,
  }));

  return NextResponse.json({
    users: usersWithOwnerFlag,
    pagination: {
      page,
      limit,
      total: totalFiltered,
      totalPages: Math.ceil(totalFiltered / limit),
    },
    counts: {
      total,
      admins,
      ambulanciers,
      customers,
      pending,
    },
  });
}
