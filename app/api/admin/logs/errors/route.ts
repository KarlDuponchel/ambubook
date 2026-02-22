import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthError } from "@/lib/auth-guard";
import { ErrorSeverity } from "@/generated/prisma/client";

/**
 * GET /api/admin/logs/errors - Liste paginée des logs d'erreurs
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
  const severity = searchParams.get("severity") || "ALL";
  const resolved = searchParams.get("resolved"); // "true", "false", or null for all
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

  // Construction du filtre WHERE
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  // Filtre recherche (dans message ou path)
  if (search) {
    where.OR = [
      { message: { contains: search, mode: "insensitive" } },
      { path: { contains: search, mode: "insensitive" } },
    ];
  }

  // Filtre sévérité
  if (severity !== "ALL") {
    where.severity = severity as ErrorSeverity;
  }

  // Filtre résolu
  if (resolved === "true") {
    where.resolved = true;
  } else if (resolved === "false") {
    where.resolved = false;
  }

  // Filtre date
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      where.createdAt.gte = new Date(dateFrom);
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      where.createdAt.lt = endDate;
    }
  }

  // Comptages
  const [total, unresolved, totalFiltered] = await Promise.all([
    prisma.errorLog.count(),
    prisma.errorLog.count({ where: { resolved: false } }),
    prisma.errorLog.count({ where }),
  ]);

  // Récupération paginée
  const errors = await prisma.errorLog.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  // Grouper par sévérité pour les stats
  const severityCounts = await prisma.errorLog.groupBy({
    by: ["severity"],
    _count: true,
    where: { resolved: false },
  });

  return NextResponse.json({
    errors,
    pagination: {
      page,
      limit,
      total: totalFiltered,
      totalPages: Math.ceil(totalFiltered / limit),
    },
    stats: {
      total,
      unresolved,
      severityCounts: severityCounts.map((s) => ({
        severity: s.severity,
        count: s._count,
      })),
    },
  });
}

/**
 * PATCH /api/admin/logs/errors - Marquer des erreurs comme résolues
 */
export async function PATCH(request: NextRequest) {
  const authResult = await requireAdmin();
  if (isAuthError(authResult)) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const body = await request.json();
  const { ids, resolved } = body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json(
      { error: "IDs requis" },
      { status: 400 }
    );
  }

  await prisma.errorLog.updateMany({
    where: { id: { in: ids } },
    data: { resolved: resolved ?? true },
  });

  return NextResponse.json({
    success: true,
    message: `${ids.length} erreur(s) marquée(s) comme ${resolved ? "résolue(s)" : "non résolue(s)"}`,
  });
}
