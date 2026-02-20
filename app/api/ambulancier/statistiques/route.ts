import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type Period = "7j" | "30j" | "3m" | "1an";

const STATUS_LABELS_FR: Record<string, string> = {
  PENDING: "En attente",
  ACCEPTED: "Acceptées",
  REFUSED: "Refusées",
  COUNTER_PROPOSAL: "Contre-prop.",
  CANCELLED: "Annulées",
  COMPLETED: "Terminées",
};

// ─── Calcul des plages de dates ───────────────────────────────────────────────

function getPeriodDates(period: Period) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const start = new Date();

  switch (period) {
    case "7j":
      start.setDate(start.getDate() - 6);
      break;
    case "30j":
      start.setDate(start.getDate() - 29);
      break;
    case "3m":
      start.setMonth(start.getMonth() - 3);
      start.setDate(start.getDate() + 1);
      break;
    case "1an":
      start.setFullYear(start.getFullYear() - 1);
      start.setDate(start.getDate() + 1);
      break;
  }
  start.setHours(0, 0, 0, 0);

  const durationMs = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - durationMs);

  return { start, end, prevStart, prevEnd };
}

// ─── Helpers de calcul ────────────────────────────────────────────────────────

function calcChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

function calcRevenue(items: { transportType: string; status: string }[]): number {
  return items
    .filter((i) => i.status === "ACCEPTED" || i.status === "COMPLETED")
    .reduce((sum, i) => sum + (i.transportType === "AMBULANCE" ? 130 : 40), 0);
}

function calcAcceptRate(items: { status: string }[]): number {
  const decided = items.filter(
    (i) => i.status !== "PENDING" && i.status !== "CANCELLED"
  );
  if (decided.length === 0) return 0;
  const accepted = decided.filter(
    (i) => i.status === "ACCEPTED" || i.status === "COMPLETED"
  ).length;
  return Math.round((accepted / decided.length) * 100);
}

function calcResponseTime(
  items: { respondedAt: Date | null; createdAt: Date }[]
): number {
  const times: number[] = [];
  for (const item of items) {
    if (item.respondedAt) {
      const diffMin =
        (item.respondedAt.getTime() - item.createdAt.getTime()) / (1000 * 60);
      if (diffMin >= 0 && diffMin <= 24 * 60) {
        times.push(diffMin);
      }
    }
  }
  if (times.length === 0) return 0;
  return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
}

// ─── Graphique d'activité ─────────────────────────────────────────────────────

function buildChart(
  items: { requestedDate: Date; transportType: string }[],
  period: Period,
  start: Date,
  end: Date
) {
  const MONTH_LABELS = [
    "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
    "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
  ];
  const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  if (period === "7j") {
    const buckets = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return { label: DAY_LABELS[d.getDay()], ambulance: 0, vsl: 0, d: new Date(d) };
    });

    for (const item of items) {
      const dayDiff = Math.floor(
        (item.requestedDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (dayDiff >= 0 && dayDiff < 7) {
        if (item.transportType === "AMBULANCE") buckets[dayDiff].ambulance++;
        else buckets[dayDiff].vsl++;
      }
    }

    return buckets.map(({ label, ambulance, vsl }) => ({ label, ambulance, vsl }));
  }

  if (period === "30j") {
    const buckets = Array.from({ length: 4 }, (_, i) => ({
      label: `S${i + 1}`,
      ambulance: 0,
      vsl: 0,
      weekStart: new Date(start.getTime() + i * 7 * 86400000),
      weekEnd: new Date(start.getTime() + (i + 1) * 7 * 86400000 - 1),
    }));
    // Le dernier bucket se termine à `end`
    buckets[3].weekEnd = end;

    for (const item of items) {
      const t = item.requestedDate.getTime();
      const idx = buckets.findIndex(
        (b) => t >= b.weekStart.getTime() && t <= b.weekEnd.getTime()
      );
      if (idx >= 0) {
        if (item.transportType === "AMBULANCE") buckets[idx].ambulance++;
        else buckets[idx].vsl++;
      }
    }

    return buckets.map(({ label, ambulance, vsl }) => ({ label, ambulance, vsl }));
  }

  // Pour 3m et 1an : groupement par mois
  const numMonths = period === "3m" ? 3 : 12;
  const now = new Date();
  const buckets = Array.from({ length: numMonths }, (_, i) => {
    const monthOffset = numMonths - 1 - i;
    const d = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    return { label: MONTH_LABELS[d.getMonth()], year: d.getFullYear(), month: d.getMonth(), ambulance: 0, vsl: 0 };
  });

  for (const item of items) {
    const itemMonth = item.requestedDate.getMonth();
    const itemYear = item.requestedDate.getFullYear();
    const idx = buckets.findIndex(
      (b) => b.month === itemMonth && b.year === itemYear
    );
    if (idx >= 0) {
      if (item.transportType === "AMBULANCE") buckets[idx].ambulance++;
      else buckets[idx].vsl++;
    }
  }

  return buckets.map(({ label, ambulance, vsl }) => ({ label, ambulance, vsl }));
}

// ─── Autres agrégations ───────────────────────────────────────────────────────

function buildByStatus(items: { status: string }[]) {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item.status, (counts.get(item.status) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .filter(([, v]) => v > 0)
    .map(([status, value]) => ({
      status,
      label: STATUS_LABELS_FR[status] ?? status,
      value,
    }));
}

function buildByType(items: { transportType: string }[]) {
  const counts = { AMBULANCE: 0, VSL: 0 };
  for (const item of items) {
    if (item.transportType === "AMBULANCE") counts.AMBULANCE++;
    else if (item.transportType === "VSL") counts.VSL++;
  }
  const total = counts.AMBULANCE + counts.VSL;
  return [
    {
      type: "AMBULANCE",
      label: "Ambulance",
      value: counts.AMBULANCE,
      pct: total > 0 ? Math.round((counts.AMBULANCE / total) * 100) : 0,
    },
    {
      type: "VSL",
      label: "VSL",
      value: counts.VSL,
      pct: total > 0 ? Math.round((counts.VSL / total) * 100) : 0,
    },
  ];
}

function buildByDay(items: { requestedDate: Date }[]) {
  // 0=Dim, 1=Lun, ..., 6=Sam
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const item of items) {
    counts[item.requestedDate.getDay()]++;
  }
  // Réordonner : Lun…Dim
  const LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  return LABELS.map((label, i) => ({
    label,
    value: counts[(i + 1) % 7],
  }));
}

function buildTopCities(items: { destinationCity: string }[]) {
  const counts = new Map<string, number>();
  for (const item of items) {
    if (item.destinationCity) {
      counts.set(item.destinationCity, (counts.get(item.destinationCity) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([city, count]) => ({ city, count }));
}

// ─── Route ────────────────────────────────────────────────────────────────────

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

    const rawPeriod = request.nextUrl.searchParams.get("period") ?? "30j";
    const period: Period = (["7j", "30j", "3m", "1an"] as Period[]).includes(
      rawPeriod as Period
    )
      ? (rawPeriod as Period)
      : "30j";

    const { start, end, prevStart, prevEnd } = getPeriodDates(period);
    const companyId = user.companyId;

    // ─── Requêtes parallèles ──────────────────────────────────────────────────
    const [current, previous, recent] = await Promise.all([
      // Période courante
      prisma.transportRequest.findMany({
        where: { companyId, requestedDate: { gte: start, lte: end } },
        select: {
          status: true,
          transportType: true,
          requestedDate: true,
          respondedAt: true,
          createdAt: true,
          destinationCity: true,
          patientFirstName: true,
          patientLastName: true,
          pickupCity: true,
          requestedTime: true,
        },
      }),
      // Période précédente (pour les deltas)
      prisma.transportRequest.findMany({
        where: { companyId, requestedDate: { gte: prevStart, lte: prevEnd } },
        select: {
          status: true,
          transportType: true,
          respondedAt: true,
          createdAt: true,
        },
      }),
      // 5 dernières activités
      prisma.transportRequest.findMany({
        where: { companyId },
        orderBy: { requestedDate: "desc" },
        take: 5,
        select: {
          requestedDate: true,
          requestedTime: true,
          patientFirstName: true,
          patientLastName: true,
          transportType: true,
          status: true,
          pickupCity: true,
          destinationCity: true,
        },
      }),
    ]);

    // ─── KPIs ─────────────────────────────────────────────────────────────────
    const total = current.length;
    const totalPrev = previous.length;
    const totalChange = calcChange(total, totalPrev);

    const revenue = calcRevenue(current);
    const revenuePrev = calcRevenue(previous);
    const revenueChange = calcChange(revenue, revenuePrev);

    const acceptRate = calcAcceptRate(current);
    const acceptRatePrev = calcAcceptRate(previous);
    const acceptChange = acceptRate - acceptRatePrev;

    const responseTime = calcResponseTime(current);
    const responseTimePrev = calcResponseTime(previous);
    const responseChange = responseTime - responseTimePrev;

    // ─── Réponse ──────────────────────────────────────────────────────────────
    return NextResponse.json({
      kpis: {
        total,
        totalChange,
        revenue,
        revenueChange,
        acceptRate,
        acceptChange,
        responseTime,
        responseChange,
      },
      chart: buildChart(current, period, start, end),
      byStatus: buildByStatus(current),
      byType: buildByType(current),
      byDay: buildByDay(current),
      topCities: buildTopCities(current),
      recentActivity: recent.map((item) => ({
        requestedDate: item.requestedDate.toISOString(),
        requestedTime: item.requestedTime,
        patient: `${item.patientFirstName} ${item.patientLastName}`,
        type: item.transportType,
        status: item.status,
        from: item.pickupCity,
        to: item.destinationCity,
      })),
    });
  } catch (error) {
    console.error("Erreur API /api/ambulancier/statistiques:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
