import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthError } from "@/lib/auth-guard";

/**
 * GET /api/admin/notifications - Liste paginée des logs de notifications avec filtres
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin();
  if (isAuthError(authResult)) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || "";
  const channel = searchParams.get("channel") || "ALL";
  const status = searchParams.get("status") || "ALL";
  const type = searchParams.get("type") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));

  // Construction du filtre WHERE
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  // Filtre recherche (destinataire ou sujet)
  if (search) {
    where.OR = [
      { recipient: { contains: search, mode: "insensitive" } },
      { subject: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  // Filtre canal
  if (channel !== "ALL" && ["EMAIL", "SMS", "INAPP"].includes(channel)) {
    where.channel = channel;
  }

  // Filtre statut
  if (status !== "ALL" && ["PENDING", "SENT", "FAILED", "BOUNCED"].includes(status)) {
    where.status = status;
  }

  // Filtre type
  if (type) {
    where.type = type;
  }

  // Filtre date
  if (dateFrom || dateTo) {
    where.sentAt = {};
    if (dateFrom) {
      where.sentAt.gte = new Date(dateFrom);
    }
    if (dateTo) {
      // Ajouter 1 jour pour inclure toute la journée
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      where.sentAt.lt = endDate;
    }
  }

  // Comptages pour les filtres (sans pagination)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseWhere: any = {};
  if (dateFrom || dateTo) {
    baseWhere.sentAt = where.sentAt;
  }

  const [total, totalFiltered, sent, failed, pending, bounced] = await Promise.all([
    prisma.notificationLog.count({ where: baseWhere }),
    prisma.notificationLog.count({ where }),
    prisma.notificationLog.count({ where: { ...baseWhere, status: "SENT" } }),
    prisma.notificationLog.count({ where: { ...baseWhere, status: "FAILED" } }),
    prisma.notificationLog.count({ where: { ...baseWhere, status: "PENDING" } }),
    prisma.notificationLog.count({ where: { ...baseWhere, status: "BOUNCED" } }),
  ]);

  // Stats par canal
  const byChannelRaw = await prisma.notificationLog.groupBy({
    by: ["channel"],
    where: baseWhere,
    _count: { channel: true },
  });
  const byChannel = byChannelRaw.reduce(
    (acc, s) => ({ ...acc, [s.channel]: s._count.channel }),
    {} as Record<string, number>
  );

  // Stats par type (top 10)
  const byTypeRaw = await prisma.notificationLog.groupBy({
    by: ["type"],
    where: baseWhere,
    _count: { type: true },
    orderBy: { _count: { type: "desc" } },
    take: 10,
  });
  const byType = byTypeRaw.map((t) => ({ type: t.type, count: t._count.type }));

  // Récupération paginée
  const logs = await prisma.notificationLog.findMany({
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
    orderBy: { sentAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
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
      sent,
      failed,
      pending,
      bounced,
      byChannel,
      byType,
    },
  });
}
