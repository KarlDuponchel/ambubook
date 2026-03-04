import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthError } from "@/lib/auth-guard";

/**
 * GET /api/admin/dashboard/stats - Statistiques globales du dashboard
 */
export async function GET() {
  const authResult = await requireAdmin();
  if (isAuthError(authResult)) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  // Date de référence pour les calculs
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const last7Days = new Date(today);
  last7Days.setDate(last7Days.getDate() - 7);
  const last30Days = new Date(today);
  last30Days.setDate(last30Days.getDate() - 30);
  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  // Récupération parallèle de toutes les statistiques
  const [
    // Utilisateurs
    totalUsers,
    activeUsers,
    adminUsers,
    ambulancierUsers,
    customerUsers,
    pendingAmbulanciers,
    newUsersThisMonth,
    newUsersLastMonth,

    // Entreprises
    totalCompanies,
    activeCompanies,
    newCompaniesThisMonth,
    newCompaniesLastMonth,

    // Transports
    totalTransports,
    pendingTransports,
    acceptedTransports,
    refusedTransports,
    completedTransports,
    cancelledTransports,
    transportsThisMonth,
    transportsLastMonth,

    // Notifications
    totalNotifications,
    sentNotifications,
    failedNotifications,

    // Feedbacks
    totalFeedbacks,
    newFeedbacks,
    inProgressFeedbacks,
    criticalFeedbacks,

    // Graphique évolution 7 jours
    transportsLast7Days,

    // Top entreprises
    topCompanies,
  ] = await Promise.all([
    // Utilisateurs
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true, deletedAt: null } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: "AMBULANCIER" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { role: "AMBULANCIER", isActive: false } }),
    prisma.user.count({ where: { createdAt: { gte: new Date(today.getFullYear(), today.getMonth(), 1) } } }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
          lt: new Date(today.getFullYear(), today.getMonth(), 1),
        },
      },
    }),

    // Entreprises
    prisma.company.count(),
    prisma.company.count({ where: { isActive: true } }),
    prisma.company.count({ where: { createdAt: { gte: new Date(today.getFullYear(), today.getMonth(), 1) } } }),
    prisma.company.count({
      where: {
        createdAt: {
          gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
          lt: new Date(today.getFullYear(), today.getMonth(), 1),
        },
      },
    }),

    // Transports
    prisma.transportRequest.count(),
    prisma.transportRequest.count({ where: { status: "PENDING" } }),
    prisma.transportRequest.count({ where: { status: "ACCEPTED" } }),
    prisma.transportRequest.count({ where: { status: "REFUSED" } }),
    prisma.transportRequest.count({ where: { status: "COMPLETED" } }),
    prisma.transportRequest.count({ where: { status: "CANCELLED" } }),
    prisma.transportRequest.count({ where: { createdAt: { gte: new Date(today.getFullYear(), today.getMonth(), 1) } } }),
    prisma.transportRequest.count({
      where: {
        createdAt: {
          gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
          lt: new Date(today.getFullYear(), today.getMonth(), 1),
        },
      },
    }),

    // Notifications
    prisma.notificationLog.count(),
    prisma.notificationLog.count({ where: { status: "SENT" } }),
    prisma.notificationLog.count({ where: { status: "FAILED" } }),

    // Feedbacks
    prisma.feedback.count(),
    prisma.feedback.count({ where: { status: "NEW" } }),
    prisma.feedback.count({ where: { status: "IN_PROGRESS" } }),
    prisma.feedback.count({ where: { priority: "CRITICAL", status: { in: ["NEW", "IN_PROGRESS"] } } }),

    // Évolution transports 7 jours
    prisma.transportRequest.findMany({
      where: { createdAt: { gte: last7Days } },
      select: { createdAt: true },
    }),

    // Top 5 entreprises par nombre de transports
    prisma.company.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { transportRequests: true },
        },
      },
      orderBy: {
        transportRequests: { _count: "desc" },
      },
      take: 5,
    }),
  ]);

  // Calculer les variations en pourcentage
  const userGrowth = newUsersLastMonth > 0
    ? Math.round(((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100)
    : newUsersThisMonth > 0 ? 100 : 0;

  const companyGrowth = newCompaniesLastMonth > 0
    ? Math.round(((newCompaniesThisMonth - newCompaniesLastMonth) / newCompaniesLastMonth) * 100)
    : newCompaniesThisMonth > 0 ? 100 : 0;

  const transportGrowth = transportsLastMonth > 0
    ? Math.round(((transportsThisMonth - transportsLastMonth) / transportsLastMonth) * 100)
    : transportsThisMonth > 0 ? 100 : 0;

  // Taux d'acceptation
  const totalProcessed = acceptedTransports + refusedTransports;
  const acceptanceRate = totalProcessed > 0
    ? Math.round((acceptedTransports / totalProcessed) * 100)
    : 0;

  // Grouper les transports par jour
  const transportsByDay = new Map<string, number>();
  for (const transport of transportsLast7Days) {
    const dateStr = new Date(transport.createdAt).toISOString().split("T")[0];
    transportsByDay.set(dateStr, (transportsByDay.get(dateStr) || 0) + 1);
  }

  // Formater les données du graphique (remplir les jours manquants)
  const chartData: Array<{ date: string; label: string; count: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const label = dayNames[date.getDay()];

    chartData.push({
      date: dateStr,
      label,
      count: transportsByDay.get(dateStr) || 0,
    });
  }

  return NextResponse.json({
    users: {
      total: totalUsers,
      active: activeUsers,
      admins: adminUsers,
      ambulanciers: ambulancierUsers,
      customers: customerUsers,
      pendingAmbulanciers,
      newThisMonth: newUsersThisMonth,
      growth: userGrowth,
    },
    companies: {
      total: totalCompanies,
      active: activeCompanies,
      newThisMonth: newCompaniesThisMonth,
      growth: companyGrowth,
    },
    transports: {
      total: totalTransports,
      pending: pendingTransports,
      accepted: acceptedTransports,
      refused: refusedTransports,
      completed: completedTransports,
      cancelled: cancelledTransports,
      thisMonth: transportsThisMonth,
      growth: transportGrowth,
      acceptanceRate,
    },
    notifications: {
      total: totalNotifications,
      sent: sentNotifications,
      failed: failedNotifications,
      successRate: totalNotifications > 0
        ? Math.round((sentNotifications / totalNotifications) * 100)
        : 0,
    },
    feedbacks: {
      total: totalFeedbacks,
      new: newFeedbacks,
      inProgress: inProgressFeedbacks,
      critical: criticalFeedbacks,
    },
    chart: {
      data: chartData,
      maxValue: Math.max(...chartData.map((d) => d.count), 1),
    },
    topCompanies: topCompanies.map((c) => ({
      id: c.id,
      name: c.name,
      transportsCount: c._count.transportRequests,
    })),
    // Alertes importantes
    alerts: {
      pendingTransports,
      pendingAmbulanciers,
      newFeedbacks,
      criticalFeedbacks,
      failedNotifications,
    },
  });
}
