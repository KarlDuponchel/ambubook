"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Calendar,
  TrendingUp,
  Clock,
  Euro,
  CheckCircle,
  Timer,
  ArrowUpRight,
  ArrowDownRight,
  Ambulance,
  Car,
  Plus,
  Users,
  Building2,
  ChevronRight,
  MapPin,
  AlertCircle,
} from "lucide-react";
import {
  PageHeader,
  Card,
  CardHeader,
  CardContent,
  EmptyState,
  LoadingSpinner,
  StatusBadge,
  Button,
} from "@/components/ui";

// Types pour les données de l'API
interface DashboardStats {
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
    type: string;
    status: string;
    from: string;
    to: string;
  }[];
}

interface TodayTransport {
  id: string;
  trackingId: string;
  patientFirstName: string;
  patientLastName: string;
  requestedTime: string;
  transportType: string;
  status: string;
  pickupCity: string;
  destinationCity: string;
}

// Mapping des statuts vers les variantes de badge
const STATUS_TO_VARIANT: Record<string, "pending" | "accepted" | "refused" | "counter_proposal" | "cancelled" | "completed"> = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REFUSED: "refused",
  COUNTER_PROPOSAL: "counter_proposal",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  ACCEPTED: "Acceptée",
  REFUSED: "Refusée",
  COUNTER_PROPOSAL: "Contre-prop.",
  CANCELLED: "Annulée",
  COMPLETED: "Terminée",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayTransports, setTodayTransports] = useState<TodayTransport[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger les statistiques et les transports du jour en parallèle
        const [statsRes, demandesRes] = await Promise.all([
          fetch("/api/ambulancier/statistiques?period=30j"),
          fetch("/api/ambulancier/demandes"),
        ]);

        if (!statsRes.ok || !demandesRes.ok) {
          throw new Error("Erreur lors du chargement des données");
        }

        const statsData = await statsRes.json();
        const demandesData = await demandesRes.json();

        setStats(statsData);

        // Filtrer les transports du jour et compter les en attente
        const today = new Date().toISOString().split("T")[0];
        const todayRequests = demandesData.filter(
          (d: TodayTransport & { requestedDate: string }) =>
            d.requestedDate === today &&
            (d.status === "ACCEPTED" || d.status === "PENDING")
        );
        setTodayTransports(todayRequests.slice(0, 5));

        const pending = demandesData.filter(
          (d: TodayTransport) => d.status === "PENDING"
        );
        setPendingCount(pending.length);
      } catch (err) {
        console.error("Erreur dashboard:", err);
        setError("Impossible de charger les données du tableau de bord");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" text="Chargement du tableau de bord..." />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Tableau de bord"
          subtitle="Bienvenue sur votre espace ambulancier"
        />
        <Card>
          <CardContent>
            <EmptyState
              icon={AlertCircle}
              title="Erreur de chargement"
              description={error || "Impossible de charger les données"}
              action={
                <Button onClick={() => window.location.reload()}>
                  Réessayer
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const kpiCards = [
    {
      label: "Demandes (30j)",
      value: stats.kpis.total,
      change: stats.kpis.totalChange,
      icon: FileText,
      color: "text-primary-600",
      bgColor: "bg-primary-50",
      suffix: "",
    },
    {
      label: "Revenus estimés",
      value: stats.kpis.revenue,
      change: stats.kpis.revenueChange,
      icon: Euro,
      color: "text-success-600",
      bgColor: "bg-success-50",
      suffix: "€",
      prefix: "",
    },
    {
      label: "Taux d'acceptation",
      value: stats.kpis.acceptRate,
      change: stats.kpis.acceptChange,
      icon: CheckCircle,
      color: "text-accent-600",
      bgColor: "bg-accent-50",
      suffix: "%",
    },
    {
      label: "Temps de réponse",
      value: stats.kpis.responseTime,
      change: stats.kpis.responseChange,
      icon: Timer,
      color: "text-secondary-600",
      bgColor: "bg-secondary-50",
      suffix: " min",
      invertChange: true, // Pour ce KPI, une baisse est positive
    },
  ];

  const quickLinks = [
    {
      label: "Nouvelle demande",
      description: "Créer un transport manuellement",
      href: "/dashboard/demandes/nouveau",
      icon: Plus,
      color: "text-primary-600",
      bgColor: "bg-primary-50",
    },
    {
      label: "Voir le calendrier",
      description: "Planning des transports",
      href: "/dashboard/calendrier",
      icon: Calendar,
      color: "text-accent-600",
      bgColor: "bg-accent-50",
    },
    {
      label: "Inviter un collègue",
      description: "Ajouter un membre à l'équipe",
      href: "/dashboard/invite",
      icon: Users,
      color: "text-secondary-600",
      bgColor: "bg-secondary-50",
    },
    {
      label: "Mon entreprise",
      description: "Modifier le profil public",
      href: "/dashboard/mon-entreprise",
      icon: Building2,
      color: "text-warning-600",
      bgColor: "bg-warning-50",
    },
  ];

  // Calculer le max pour le graphique
  const chartMax = Math.max(
    ...stats.chart.map((d) => d.ambulance + d.vsl),
    1
  );

  return (
    <div className="space-y-6">
      {/* En-tête avec alerte demandes en attente */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Tableau de bord"
          subtitle="Vue d'ensemble de votre activité"
        />
        {pendingCount > 0 && (
          <Link href="/dashboard/demandes?status=PENDING">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-warning-50 border border-warning-200 rounded-xl text-warning-700 hover:bg-warning-100 transition-colors">
              <Clock className="h-5 w-5" />
              <span className="font-medium">
                {pendingCount} demande{pendingCount > 1 ? "s" : ""} en attente
              </span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </Link>
        )}
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          const isPositive = kpi.invertChange
            ? kpi.change <= 0
            : kpi.change >= 0;
          const showChange = kpi.change !== 0;

          return (
            <Card key={kpi.label}>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${kpi.bgColor}`}>
                      <Icon className={`h-5 w-5 ${kpi.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-neutral-900">
                        {kpi.prefix}
                        {kpi.value.toLocaleString("fr-FR")}
                        {kpi.suffix}
                      </p>
                      <p className="text-sm text-neutral-500">{kpi.label}</p>
                    </div>
                  </div>
                  {showChange && (
                    <div
                      className={`flex items-center gap-0.5 text-sm font-medium ${
                        isPositive ? "text-success-600" : "text-danger-600"
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      <span>
                        {Math.abs(kpi.change)}
                        {kpi.label.includes("Taux") ||
                        kpi.label.includes("Temps")
                          ? ""
                          : "%"}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Contenu principal en 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Graphique d'activité */}
          <Card>
            <CardHeader
              title="Activité des 30 derniers jours"
              action={
                <Link
                  href="/dashboard/statistiques"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Voir plus
                </Link>
              }
            />
            <CardContent>
              <div className="flex items-end gap-2 h-40">
                {stats.chart.map((day, index) => {
                  const total = day.ambulance + day.vsl;
                  const heightPct = (total / chartMax) * 100;
                  const ambulancePct =
                    total > 0 ? (day.ambulance / total) * 100 : 0;

                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <div
                        className="w-full rounded-t-md overflow-hidden bg-neutral-100 flex flex-col justify-end"
                        style={{ height: "100%" }}
                      >
                        <div
                          className="w-full flex flex-col transition-all duration-300"
                          style={{ height: `${heightPct}%` }}
                        >
                          <div
                            className="bg-primary-500"
                            style={{ height: `${ambulancePct}%` }}
                          />
                          <div
                            className="bg-accent-400"
                            style={{ height: `${100 - ambulancePct}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-neutral-500">
                        {day.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-primary-500" />
                  <span className="text-sm text-neutral-600">Ambulance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-accent-400" />
                  <span className="text-sm text-neutral-600">VSL</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transports du jour */}
          <Card>
            <CardHeader
              title="Transports du jour"
              icon={Calendar}
              action={
                <Link
                  href="/dashboard/calendrier"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Voir le planning
                </Link>
              }
            />
            <CardContent noPadding>
              {todayTransports.length > 0 ? (
                <div className="divide-y divide-neutral-100">
                  {todayTransports.map((transport) => (
                    <Link
                      key={transport.id}
                      href={`/dashboard/demandes/${transport.id}`}
                      className="flex items-center gap-4 p-4 hover:bg-neutral-50 transition-colors"
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          transport.transportType === "AMBULANCE"
                            ? "bg-primary-50"
                            : "bg-accent-50"
                        }`}
                      >
                        {transport.transportType === "AMBULANCE" ? (
                          <Ambulance
                            className={`h-5 w-5 ${
                              transport.transportType === "AMBULANCE"
                                ? "text-primary-600"
                                : "text-accent-600"
                            }`}
                          />
                        ) : (
                          <Car className="h-5 w-5 text-accent-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-neutral-900">
                            {transport.requestedTime}
                          </span>
                          <span className="text-neutral-400">•</span>
                          <span className="text-neutral-700 truncate">
                            {transport.patientFirstName}{" "}
                            {transport.patientLastName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-neutral-500 mt-0.5">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="truncate">
                            {transport.pickupCity} → {transport.destinationCity}
                          </span>
                        </div>
                      </div>
                      <StatusBadge
                        variant={STATUS_TO_VARIANT[transport.status]}
                        label={STATUS_LABELS[transport.status]}
                        size="sm"
                      />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-6">
                  <EmptyState
                    icon={Calendar}
                    title="Aucun transport aujourd'hui"
                    description="Vous n'avez pas de transport prévu pour aujourd'hui"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite (1/3) */}
        <div className="space-y-6">
          {/* Liens rapides */}
          <Card>
            <CardHeader title="Actions rapides" />
            <CardContent noPadding>
              <div className="divide-y divide-neutral-100">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-3 p-4 hover:bg-neutral-50 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${link.bgColor}`}>
                        <Icon className={`h-5 w-5 ${link.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900">
                          {link.label}
                        </p>
                        <p className="text-sm text-neutral-500 truncate">
                          {link.description}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-neutral-400" />
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Répartition par type */}
          <Card>
            <CardHeader title="Répartition par type" />
            <CardContent>
              <div className="space-y-4">
                {stats.byType.map((type) => (
                  <div key={type.type}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {type.type === "AMBULANCE" ? (
                          <Ambulance className="h-4 w-4 text-primary-600" />
                        ) : (
                          <Car className="h-4 w-4 text-accent-600" />
                        )}
                        <span className="text-sm font-medium text-neutral-700">
                          {type.label}
                        </span>
                      </div>
                      <span className="text-sm text-neutral-500">
                        {type.value} ({type.pct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          type.type === "AMBULANCE"
                            ? "bg-primary-500"
                            : "bg-accent-500"
                        }`}
                        style={{ width: `${type.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Répartition par statut */}
          <Card>
            <CardHeader title="Statuts des demandes" />
            <CardContent>
              {stats.byStatus.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {stats.byStatus.map((s) => (
                    <div
                      key={s.status}
                      className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 rounded-lg"
                    >
                      <StatusBadge
                        variant={STATUS_TO_VARIANT[s.status]}
                        label={s.label}
                        size="sm"
                      />
                      <span className="text-sm font-medium text-neutral-700">
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500 text-center py-4">
                  Aucune demande sur cette période
                </p>
              )}
            </CardContent>
          </Card>

          {/* Top villes de destination */}
          {stats.topCities.length > 0 && (
            <Card>
              <CardHeader title="Top destinations" icon={MapPin} />
              <CardContent>
                <div className="space-y-3">
                  {stats.topCities.slice(0, 5).map((city, index) => (
                    <div
                      key={city.city}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-neutral-400 w-4">
                          {index + 1}.
                        </span>
                        <span className="text-sm text-neutral-700">
                          {city.city}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-neutral-900">
                        {city.count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Activité récente */}
      <Card>
        <CardHeader
          title="Activité récente"
          icon={TrendingUp}
          action={
            <Link
              href="/dashboard/demandes"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Voir toutes les demandes
            </Link>
          }
        />
        <CardContent noPadding>
          {stats.recentActivity.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">
                      Date
                    </th>
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">
                      Patient
                    </th>
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">
                      Type
                    </th>
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">
                      Trajet
                    </th>
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {stats.recentActivity.map((activity, index) => {
                    const date = new Date(activity.requestedDate);
                    const formattedDate = date.toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                    });

                    return (
                      <tr
                        key={index}
                        className="hover:bg-neutral-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-neutral-900">
                              {formattedDate}
                            </span>
                            <span className="text-xs text-neutral-500">
                              {activity.requestedTime}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-neutral-700">
                            {activity.patient}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {activity.type === "AMBULANCE" ? (
                              <Ambulance className="h-4 w-4 text-primary-600" />
                            ) : (
                              <Car className="h-4 w-4 text-accent-600" />
                            )}
                            <span className="text-sm text-neutral-700">
                              {activity.type === "AMBULANCE"
                                ? "Ambulance"
                                : "VSL"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-neutral-700">
                            {activity.from} → {activity.to}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            variant={STATUS_TO_VARIANT[activity.status]}
                            label={STATUS_LABELS[activity.status]}
                            size="sm"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <EmptyState
                icon={FileText}
                title="Aucune activité récente"
                description="Vos dernières demandes apparaîtront ici"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
