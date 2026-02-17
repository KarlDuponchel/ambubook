import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthError } from "@/lib/auth-guard";

/**
 * GET /api/admin/notifications - Liste les logs de notifications
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin();
  if (isAuthError(authResult)) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const channel = searchParams.get("channel"); // EMAIL, SMS
  const status = searchParams.get("status"); // PENDING, SENT, FAILED, BOUNCED
  const type = searchParams.get("type"); // Type de notification
  const search = searchParams.get("search"); // Recherche par recipient

  // Construire le filtre
  const where: {
    channel?: "EMAIL" | "SMS";
    status?: "PENDING" | "SENT" | "FAILED" | "BOUNCED";
    type?: string;
    recipient?: { contains: string; mode: "insensitive" };
  } = {};

  if (channel && (channel === "EMAIL" || channel === "SMS")) {
    where.channel = channel;
  }

  if (status && ["PENDING", "SENT", "FAILED", "BOUNCED"].includes(status)) {
    where.status = status as "PENDING" | "SENT" | "FAILED" | "BOUNCED";
  }

  if (type) {
    where.type = type;
  }

  if (search) {
    where.recipient = { contains: search, mode: "insensitive" };
  }

  // Compter le total
  const total = await prisma.notificationLog.count({ where });

  // Récupérer les logs avec pagination
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

  // Statistiques globales
  const stats = await prisma.notificationLog.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  const statsByChannel = await prisma.notificationLog.groupBy({
    by: ["channel"],
    _count: { channel: true },
  });

  return NextResponse.json({
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    stats: {
      byStatus: stats.reduce(
        (acc, s) => ({ ...acc, [s.status]: s._count.status }),
        {} as Record<string, number>
      ),
      byChannel: statsByChannel.reduce(
        (acc, s) => ({ ...acc, [s.channel]: s._count.channel }),
        {} as Record<string, number>
      ),
    },
  });
}
