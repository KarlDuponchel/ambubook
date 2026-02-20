"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  FileText,
  Clock,
  CheckCircle,
  Ambulance,
  Car,
  MapPin,
  Euro,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { PageHeader, Card, CardContent, LoadingSpinner } from "@/components/ui";

// ─── Types ───────────────────────────────────────────────────────────────────

type Period = "7j" | "30j" | "3m" | "1an";

interface StatsData {
  kpis: {
    total: number;
    totalChange: number;
    revenue: number;
    revenueChange: number;
    acceptRate: number;
    acceptChange: number;
    responseTime: number;
    responseChange: number;
  };
  chart: { label: string; ambulance: number; vsl: number }[];
  byStatus: { status: string; label: string; value: number }[];
  byType: { type: string; label: string; value: number; pct: number }[];
  byDay: { label: string; value: number }[];
  topCities: { city: string; count: number }[];
  recentActivity: {
    requestedDate: string;
    requestedTime: string;
    patient: string;
    type: "AMBULANCE" | "VSL";
    status: string;
    from: string;
    to: string;
  }[];
}

// ─── Constantes de style côté client ─────────────────────────────────────────

const STATUS_STYLE: Record<string, { bg: string; bar: string; text: string; dot: string; badgeBg: string }> = {
  COMPLETED:       { bg: "bg-primary-500",  bar: "bg-primary-500",  text: "text-primary-700",  dot: "bg-primary-500",  badgeBg: "bg-primary-50" },
  ACCEPTED:        { bg: "bg-success-500",  bar: "bg-success-500",  text: "text-success-700",  dot: "bg-success-500",  badgeBg: "bg-success-50" },
  REFUSED:         { bg: "bg-danger-500",   bar: "bg-danger-500",   text: "text-danger-700",   dot: "bg-danger-500",   badgeBg: "bg-danger-50" },
  COUNTER_PROPOSAL:{ bg: "bg-warning-500",  bar: "bg-warning-500",  text: "text-warning-700",  dot: "bg-warning-500",  badgeBg: "bg-warning-50" },
  PENDING:         { bg: "bg-neutral-400",  bar: "bg-neutral-400",  text: "text-neutral-600",  dot: "bg-neutral-400",  badgeBg: "bg-neutral-50" },
  CANCELLED:       { bg: "bg-neutral-300",  bar: "bg-neutral-300",  text: "text-neutral-500",  dot: "bg-neutral-300",  badgeBg: "bg-neutral-50" },
};

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: "Terminée",
  ACCEPTED: "Acceptée",
  REFUSED: "Refusée",
  COUNTER_PROPOSAL: "Contre-prop.",
  PENDING: "En attente",
  CANCELLED: "Annulée",
};

const TYPE_CONFIG = {
  AMBULANCE: { icon: Ambulance, bg: "bg-primary-600", label: "Ambulance" },
  VSL: { icon: Car, bg: "bg-secondary-400", label: "VSL" },
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PERIOD_LABELS: Record<Period, string> = {
  "7j": "7 derniers jours",
  "30j": "30 derniers jours",
  "3m": "3 derniers mois",
  "1an": "12 derniers mois",
};

function formatRevenue(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(".", ",")} k€` : `${n} €`;
}

function formatActivityDate(isoDate: string, time: string): string {
  const today = new Date();
  const date = new Date(isoDate);
  const todayStr = today.toDateString();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === todayStr) return `Auj. ${time}`;
  if (date.toDateString() === yesterday.toDateString()) return `Hier ${time}`;

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm} ${time}`;
}

function TrendBadge({ value, unit = "%" }: { value: number; unit?: string }) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-sm font-medium text-neutral-500">
        <Minus className="h-3.5 w-3.5" />
        stable
      </span>
    );
  }
  const isPositive = value > 0;
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-sm font-medium ${
        isPositive ? "text-success-600" : "text-danger-600"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {isPositive ? "+" : ""}
      {value}
      {unit}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StatistiquesPage() {
  const [period, setPeriod] = useState<Period>("30j");
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/ambulancier/statistiques?period=${period}`)
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors du chargement des statistiques");
        return res.json();
      })
      .then((json: StatsData) => {
        setData(json);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [period]);

  const kpis = data
    ? [
        {
          label: "Total transports",
          value: data.kpis.total.toString(),
          change: data.kpis.totalChange,
          icon: FileText,
          iconBg: "bg-primary-50",
          iconColor: "text-primary-600",
          unit: "%",
        },
        {
          label: "Chiffre d'affaires estimé",
          value: formatRevenue(data.kpis.revenue),
          change: data.kpis.revenueChange,
          icon: Euro,
          iconBg: "bg-success-50",
          iconColor: "text-success-600",
          unit: "%",
        },
        {
          label: "Taux d'acceptation",
          value: `${data.kpis.acceptRate} %`,
          change: data.kpis.acceptChange,
          icon: CheckCircle,
          iconBg: "bg-accent-50",
          iconColor: "text-accent-600",
          unit: " pts",
        },
        {
          label: "Temps de réponse moyen",
          value: data.kpis.responseTime === 0 ? "—" : `${data.kpis.responseTime} min`,
          change: data.kpis.responseChange,
          icon: Clock,
          iconBg: "bg-warning-50",
          iconColor: "text-warning-600",
          unit: " min",
        },
      ]
    : [];

  const maxBarValue = data ? Math.max(...data.chart.map((m) => m.ambulance + m.vsl), 1) : 1;
  const maxDayValue = data ? Math.max(...data.byDay.map((d) => d.value), 1) : 1;
  const maxCityCount = data?.topCities[0]?.count ?? 1;
  const totalStatus = data ? data.byStatus.reduce((acc, s) => acc + s.value, 0) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        badge="Analyse"
        title="Statistiques"
        subtitle={`Vue d'ensemble de votre activité — ${PERIOD_LABELS[period]}`}
        actions={
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl">
            {(["7j", "30j", "3m", "1an"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  period === p
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        }
      />

      {/* État de chargement */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner size="lg" text="Chargement des statistiques…" />
        </div>
      )}

      {/* État d'erreur */}
      {!loading && error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-danger-50 border border-danger-200 rounded-xl text-sm text-danger-700">
          <Activity className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Contenu principal */}
      {!loading && !error && data && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <Card key={kpi.label}>
                  <CardContent>
                    <div className="flex items-start justify-between">
                      <div className={`p-2.5 rounded-xl ${kpi.iconBg}`}>
                        <Icon className={`h-5 w-5 ${kpi.iconColor}`} />
                      </div>
                      <TrendBadge value={kpi.change} unit={kpi.unit} />
                    </div>
                    <div className="mt-3">
                      <p className="text-2xl font-bold text-neutral-900 leading-none">
                        {kpi.value}
                      </p>
                      <p className="text-sm text-neutral-500 mt-1.5">{kpi.label}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Graphique d'activité */}
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-semibold text-neutral-900">Activité</h2>
                  <p className="text-sm text-neutral-500 mt-0.5">Ambulances et VSL par période</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-neutral-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-primary-600 inline-block" />
                    Ambulance
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-secondary-400 inline-block" />
                    VSL
                  </span>
                </div>
              </div>

              {/* items-stretch : toutes les colonnes ont une hauteur définie (h-44),
                  ce qui permet aux height:% des barres de se résoudre correctement */}
              <div className="flex items-stretch gap-2 h-44">
                {data.chart.map((bar) => {
                  const total = bar.ambulance + bar.vsl;
                  const heightPct = maxBarValue > 0 ? (total / maxBarValue) * 100 : 0;
                  const ambPct = total > 0 ? (bar.ambulance / total) * 100 : 0;
                  const vslPct = 100 - ambPct;

                  return (
                    <div key={bar.label} className="flex-1 flex flex-col items-center">
                      {/* Valeur au-dessus */}
                      <div className="h-5 flex items-end justify-center">
                        <span className="text-xs font-medium text-neutral-500">
                          {total > 0 ? total : ""}
                        </span>
                      </div>
                      {/* Zone de barre : flex-1 a une hauteur définie (h-44 - 20px - 20px),
                          permettant à height:% de se résoudre */}
                      <div className="flex-1 w-full flex flex-col justify-end">
                        <div
                          className="w-full rounded-t-md overflow-hidden"
                          style={{ height: `${heightPct}%`, minHeight: total > 0 ? "4px" : "0" }}
                        >
                          <div className="w-full bg-secondary-400" style={{ height: `${vslPct}%` }} />
                          <div className="w-full bg-primary-600" style={{ height: `${ambPct}%` }} />
                        </div>
                      </div>
                      {/* Label en dessous */}
                      <div className="h-5 flex items-start justify-center pt-1">
                        <span className="text-xs text-neutral-500">{bar.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Répartition + Statuts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Par type de transport */}
            <Card>
              <CardContent>
                <h2 className="text-base font-semibold text-neutral-900 mb-5">
                  Type de transport
                </h2>
                <div className="space-y-4">
                  {data.byType.map((type) => {
                    const cfg = TYPE_CONFIG[type.type as keyof typeof TYPE_CONFIG];
                    const Icon = cfg?.icon ?? Ambulance;
                    return (
                      <div key={type.label}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="flex items-center gap-2 text-sm text-neutral-700">
                            <Icon className="h-4 w-4 text-neutral-500" />
                            {type.label}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-neutral-400">{type.value} transports</span>
                            <span className="text-sm font-semibold text-neutral-900 w-10 text-right">
                              {type.pct} %
                            </span>
                          </div>
                        </div>
                        <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${cfg?.bg ?? "bg-primary-600"} rounded-full transition-all duration-500`}
                            style={{ width: `${type.pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mini donut visuel */}
                <div className="mt-6 pt-5 border-t border-neutral-100 flex items-center justify-center gap-6">
                  {data.byType.map((type) => (
                    <div key={type.label} className="flex flex-col items-center gap-1">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{
                          background: `conic-gradient(var(--color-primary-600) ${type.pct}%, var(--color-neutral-100) 0)`,
                        }}
                      >
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                          <span className="text-xs font-bold text-neutral-700">{type.pct}%</span>
                        </div>
                      </div>
                      <span className="text-xs text-neutral-500">{type.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Par statut */}
            <Card>
              <CardContent>
                <h2 className="text-base font-semibold text-neutral-900 mb-5">
                  Répartition par statut
                </h2>
                {data.byStatus.length === 0 ? (
                  <p className="text-sm text-neutral-400 text-center py-4">Aucune demande sur cette période</p>
                ) : (
                  <div className="space-y-3">
                    {data.byStatus.map((s) => {
                      const pct = totalStatus > 0 ? Math.round((s.value / totalStatus) * 100) : 0;
                      const style = STATUS_STYLE[s.status] ?? STATUS_STYLE.PENDING;
                      return (
                        <div key={s.status}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm text-neutral-700">{s.label}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-neutral-400">{s.value}</span>
                              <span className="text-sm font-semibold text-neutral-900 w-10 text-right">
                                {pct} %
                              </span>
                            </div>
                          </div>
                          <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${style.bar} rounded-full transition-all duration-500`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-6 pt-5 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-sm text-neutral-500">Total traité</span>
                  <span className="text-xl font-bold text-neutral-900">{totalStatus}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Jours de la semaine + Top villes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Activité par jour */}
            <Card>
              <CardContent>
                <div className="flex items-center gap-2 mb-5">
                  <Calendar className="h-4 w-4 text-neutral-400" />
                  <h2 className="text-base font-semibold text-neutral-900">Par jour de la semaine</h2>
                </div>
                <div className="space-y-2">
                  {data.byDay.map((day) => {
                    const pct = maxDayValue > 0 ? Math.round((day.value / maxDayValue) * 100) : 0;
                    const isWeekend = day.label === "Sam" || day.label === "Dim";
                    return (
                      <div key={day.label} className="flex items-center gap-3">
                        <span
                          className={`text-xs font-medium w-8 ${
                            isWeekend ? "text-neutral-400" : "text-neutral-600"
                          }`}
                        >
                          {day.label}
                        </span>
                        <div className="flex-1 h-6 bg-neutral-100 rounded-md overflow-hidden">
                          <div
                            className={`h-full rounded-md transition-all duration-500 flex items-center justify-end pr-2 ${
                              isWeekend ? "bg-neutral-300" : "bg-primary-200"
                            }`}
                            style={{ width: `${Math.max(pct, 4)}%` }}
                          >
                            {pct >= 20 && (
                              <span className="text-xs font-medium text-primary-800">{day.value}</span>
                            )}
                          </div>
                        </div>
                        {pct < 20 && (
                          <span className="text-xs text-neutral-500 w-6">{day.value}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top destinations */}
            <Card>
              <CardContent>
                <div className="flex items-center gap-2 mb-5">
                  <MapPin className="h-4 w-4 text-neutral-400" />
                  <h2 className="text-base font-semibold text-neutral-900">Top destinations</h2>
                </div>
                {data.topCities.length === 0 ? (
                  <p className="text-sm text-neutral-400 text-center py-4">Aucune donnée disponible</p>
                ) : (
                  <div className="space-y-3">
                    {data.topCities.map((city, i) => {
                      const pct = Math.round((city.count / maxCityCount) * 100);
                      return (
                        <div key={city.city} className="flex items-center gap-3">
                          <span className="text-xs font-bold text-neutral-400 w-4">
                            {i + 1}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-neutral-700">{city.city}</span>
                              <span className="text-sm font-semibold text-neutral-900">{city.count}</span>
                            </div>
                            <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary-400 rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activité récente */}
          <Card>
            <CardContent>
              <div className="flex items-center gap-2 mb-5">
                <Activity className="h-4 w-4 text-neutral-400" />
                <h2 className="text-base font-semibold text-neutral-900">Activité récente</h2>
              </div>
              {data.recentActivity.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-4">Aucune activité récente</p>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {data.recentActivity.map((item, i) => {
                    const sc = STATUS_STYLE[item.status] ?? STATUS_STYLE.PENDING;
                    const statusLabel = STATUS_LABELS[item.status] ?? item.status;
                    const TransportIcon =
                      item.type === "AMBULANCE" ? Ambulance : Car;
                    return (
                      <div key={i} className="flex items-center gap-4 py-3">
                        <div className="shrink-0 w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center">
                          <TransportIcon className="h-4 w-4 text-neutral-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 truncate">
                            {item.patient}
                          </p>
                          <p className="text-xs text-neutral-500 truncate">
                            {item.from} → {item.to}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-neutral-400">
                            {formatActivityDate(item.requestedDate, item.requestedTime)}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${sc.badgeBg} ${sc.text}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {statusLabel}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bandeau revenus estimés */}
          <div className="flex items-center gap-2 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-500">
            <TrendingUp className="h-4 w-4 shrink-0 text-neutral-400" />
            Le chiffre d'affaires affiché est une estimation basée sur les tarifs indicatifs (Ambulance : 130 €, VSL : 40 €). Les montants réels peuvent varier selon les conventions et majorations applicables.
          </div>
        </>
      )}
    </div>
  );
}
