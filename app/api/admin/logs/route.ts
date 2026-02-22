import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthError } from "@/lib/auth-guard";
import { AuditAction } from "@/generated/prisma/client";

/**
 * GET /api/admin/logs - Liste paginée des logs d'audit
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin();
  if (isAuthError(authResult)) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || "";
  const action = searchParams.get("action") || "ALL";
  const targetType = searchParams.get("targetType") || "ALL";
  const userId = searchParams.get("userId") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

  // Construction du filtre WHERE
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  // Filtre recherche (dans details)
  if (search) {
    where.details = { contains: search, mode: "insensitive" };
  }

  // Filtre action
  if (action !== "ALL") {
    where.action = action as AuditAction;
  }

  // Filtre type de cible
  if (targetType !== "ALL") {
    where.targetType = targetType;
  }

  // Filtre utilisateur
  if (userId) {
    where.userId = userId;
  }

  // Filtre date
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      where.createdAt.gte = new Date(dateFrom);
    }
    if (dateTo) {
      // Ajouter 1 jour pour inclure toute la journée
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      where.createdAt.lt = endDate;
    }
  }

  // Comptages
  const [total, totalFiltered] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.count({ where }),
  ]);

  // Récupération paginée
  const logs = await prisma.auditLog.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  // Grouper par action pour les stats
  const actionCounts = await prisma.auditLog.groupBy({
    by: ["action"],
    _count: true,
    orderBy: { _count: { action: "desc" } },
    take: 10,
  });

  return NextResponse.json({
    logs,
    pagination: {
      page,
      limit,
      total: totalFiltered,
      totalPages: Math.ceil(totalFiltered / limit),
    },
    stats: {
      total,
      actionCounts: actionCounts.map((a) => ({
        action: a.action,
        count: a._count,
      })),
    },
  });
}
