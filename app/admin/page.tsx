"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  Truck,
  Bell,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStats {
  users: {
    total: number;
    active: number;
    admins: number;
    ambulanciers: number;
    customers: number;
    pendingAmbulanciers: number;
    newThisMonth: number;
    growth: number;
  };
  companies: {
    total: number;
    active: number;
    newThisMonth: number;
    growth: number;
  };
  transports: {
    total: number;
    pending: number;
    accepted: number;
    refused: number;
    completed: number;
    cancelled: number;
    thisMonth: number;
    growth: number;
    acceptanceRate: number;
  };
  notifications: {
    total: number;
    sent: number;
    failed: number;
    successRate: number;
  };
  feedbacks: {
    total: number;
    new: number;
    inProgress: number;
    critical: number;
  };
  chart: {
    data: Array<{ date: string; label: string; count: number }>;
    maxValue: number;
  };
  topCompanies: Array<{
    id: string;
    name: string;
    transportsCount: number;
  }>;
  alerts: {
    pendingTransports: number;
    pendingAmbulanciers: number;
    newFeedbacks: number;
    criticalFeedbacks: number;
    failedNotifications: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch("/api/admin/dashboard/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-neutral-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Chargement du dashboard...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-neutral-500 mb-4">Impossible de charger les statistiques</p>
          <button
            onClick={() => fetchStats()}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const hasAlerts =
    stats.alerts.pendingTransports > 0 ||
    stats.alerts.pendingAmbulanciers > 0 ||
    stats.alerts.criticalFeedbacks > 0 ||
    stats.alerts.failedNotifications > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Vue d&apos;ensemble de la plateforme
          </p>
        </div>
        <button
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          Actualiser
        </button>
      </div>

      {/* Alertes */}
      {hasAlerts && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-amber-900">Attention requise</h3>
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                {stats.alerts.pendingTransports > 0 && (
                  <Link
                    href="/admin/transports?status=PENDING"
                    className="flex items-center gap-1.5 text-amber-700 hover:text-amber-900"
                  >
                    <Clock className="h-4 w-4" />
                    {stats.alerts.pendingTransports} transport{stats.alerts.pendingTransports > 1 ? "s" : ""} en attente
                  </Link>
                )}
                {stats.alerts.pendingAmbulanciers > 0 && (
                  <Link
                    href="/admin/utilisateurs?status=PENDING"
                    className="flex items-center gap-1.5 text-amber-700 hover:text-amber-900"
                  >
                    <Users className="h-4 w-4" />
                    {stats.alerts.pendingAmbulanciers} ambulancier{stats.alerts.pendingAmbulanciers > 1 ? "s" : ""} en attente
                  </Link>
                )}
                {stats.alerts.criticalFeedbacks > 0 && (
                  <Link
                    href="/admin/feedback?priority=CRITICAL"
                    className="flex items-center gap-1.5 text-red-700 hover:text-red-900"
                  >
                    <MessageSquare className="h-4 w-4" />
                    {stats.alerts.criticalFeedbacks} feedback{stats.alerts.criticalFeedbacks > 1 ? "s" : ""} critique{stats.alerts.criticalFeedbacks > 1 ? "s" : ""}
                  </Link>
                )}
                {stats.alerts.failedNotifications > 0 && (
                  <Link
                    href="/admin/notifications?status=FAILED"
                    className="flex items-center gap-1.5 text-red-700 hover:text-red-900"
                  >
                    <Bell className="h-4 w-4" />
                    {stats.alerts.failedNotifications} notification{stats.alerts.failedNotifications > 1 ? "s" : ""} en échec
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Utilisateurs */}
        <Link
          href="/admin/utilisateurs"
          className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-neutral-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <GrowthBadge value={stats.users.growth} />
          </div>
          <div className="text-2xl font-semibold text-neutral-900">{stats.users.total}</div>
          <div className="text-sm text-neutral-500 mt-1">Utilisateurs</div>
          <div className="mt-3 flex gap-3 text-xs text-neutral-400">
            <span>{stats.users.customers} clients</span>
            <span>{stats.users.ambulanciers} ambulanciers</span>
          </div>
        </Link>

        {/* Entreprises */}
        <Link
          href="/admin/entreprises"
          className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-neutral-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Building2 className="h-5 w-5 text-green-600" />
            </div>
            <GrowthBadge value={stats.companies.growth} />
          </div>
          <div className="text-2xl font-semibold text-neutral-900">{stats.companies.total}</div>
          <div className="text-sm text-neutral-500 mt-1">Entreprises</div>
          <div className="mt-3 text-xs text-neutral-400">
            {stats.companies.active} actives
          </div>
        </Link>

        {/* Transports */}
        <Link
          href="/admin/transports"
          className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-neutral-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Truck className="h-5 w-5 text-amber-600" />
            </div>
            <GrowthBadge value={stats.transports.growth} />
          </div>
          <div className="text-2xl font-semibold text-neutral-900">{stats.transports.total}</div>
          <div className="text-sm text-neutral-500 mt-1">Transports</div>
          <div className="mt-3 flex gap-3 text-xs text-neutral-400">
            <span className="text-amber-600">{stats.transports.pending} en attente</span>
            <span>{stats.transports.completed} effectués</span>
          </div>
        </Link>

        {/* Notifications */}
        <Link
          href="/admin/notifications"
          className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-neutral-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Bell className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-neutral-500">
              {stats.notifications.successRate}% succès
            </span>
          </div>
          <div className="text-2xl font-semibold text-neutral-900">{stats.notifications.total}</div>
          <div className="text-sm text-neutral-500 mt-1">Notifications</div>
          <div className="mt-3 flex gap-3 text-xs text-neutral-400">
            <span className="text-green-600">{stats.notifications.sent} envoyées</span>
            {stats.notifications.failed > 0 && (
              <span className="text-red-600">{stats.notifications.failed} en échec</span>
            )}
          </div>
        </Link>
      </div>

      {/* Section graphique et statistiques détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique évolution 7 jours */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-neutral-900">Transports (7 derniers jours)</h2>
            <span className="text-sm text-neutral-500">{stats.transports.thisMonth} ce mois</span>
          </div>
          <div className="h-48">
            <BarChart data={stats.chart.data} maxValue={stats.chart.maxValue} />
          </div>
        </div>

        {/* Répartition des transports */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <h2 className="font-semibold text-neutral-900 mb-4">Statuts des transports</h2>
          <div className="space-y-3">
            <StatusRow
              icon={<Clock className="h-4 w-4" />}
              label="En attente"
              count={stats.transports.pending}
              total={stats.transports.total}
              color="amber"
            />
            <StatusRow
              icon={<CheckCircle2 className="h-4 w-4" />}
              label="Acceptés"
              count={stats.transports.accepted}
              total={stats.transports.total}
              color="blue"
            />
            <StatusRow
              icon={<CheckCircle2 className="h-4 w-4" />}
              label="Effectués"
              count={stats.transports.completed}
              total={stats.transports.total}
              color="green"
            />
            <StatusRow
              icon={<XCircle className="h-4 w-4" />}
              label="Refusés"
              count={stats.transports.refused}
              total={stats.transports.total}
              color="red"
            />
            <StatusRow
              icon={<XCircle className="h-4 w-4" />}
              label="Annulés"
              count={stats.transports.cancelled}
              total={stats.transports.total}
              color="neutral"
            />
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">Taux d&apos;acceptation</span>
              <span className="font-semibold text-neutral-900">{stats.transports.acceptanceRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section inférieure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top entreprises */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-neutral-900">Top entreprises</h2>
            <Link
              href="/admin/entreprises"
              className="text-sm text-neutral-500 hover:text-neutral-900 flex items-center gap-1"
            >
              Voir tout <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {stats.topCompanies.length > 0 ? (
            <div className="space-y-3">
              {stats.topCompanies.map((company, index) => (
                <div key={company.id} className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded-full bg-neutral-100 text-neutral-600 text-xs font-medium flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-sm text-neutral-900 truncate">{company.name}</span>
                  <span className="text-sm text-neutral-500">{company.transportsCount} transports</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500 text-center py-4">Aucune entreprise</p>
          )}
        </div>

        {/* Feedbacks */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-neutral-900">Feedbacks</h2>
            <Link
              href="/admin/feedback"
              className="text-sm text-neutral-500 hover:text-neutral-900 flex items-center gap-1"
            >
              Voir tout <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-semibold text-neutral-900">{stats.feedbacks.new}</div>
              <div className="text-sm text-neutral-500 mt-1">Nouveaux</div>
            </div>
            <div className="bg-neutral-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-semibold text-neutral-900">{stats.feedbacks.inProgress}</div>
              <div className="text-sm text-neutral-500 mt-1">En cours</div>
            </div>
          </div>
          {stats.feedbacks.critical > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertTriangle className="h-4 w-4" />
              {stats.feedbacks.critical} feedback{stats.feedbacks.critical > 1 ? "s" : ""} critique{stats.feedbacks.critical > 1 ? "s" : ""} à traiter
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Composant Badge de croissance
function GrowthBadge({ value }: { value: number }) {
  if (value === 0) return null;

  const isPositive = value > 0;
  return (
    <span
      className={cn(
        "flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded",
        isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      )}
    >
      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {isPositive ? "+" : ""}{value}%
    </span>
  );
}

// Composant ligne de statut
function StatusRow({
  icon,
  label,
  count,
  total,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  total: number;
  color: "amber" | "blue" | "green" | "red" | "neutral";
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  const colorClasses = {
    amber: "bg-amber-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    neutral: "bg-neutral-400",
  };

  const iconColorClasses = {
    amber: "text-amber-600",
    blue: "text-blue-600",
    green: "text-green-600",
    red: "text-red-600",
    neutral: "text-neutral-500",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className={iconColorClasses[color]}>{icon}</span>
          <span className="text-sm text-neutral-700">{label}</span>
        </div>
        <span className="text-sm font-medium text-neutral-900">{count}</span>
      </div>
      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Composant graphique en barres
function BarChart({
  data,
  maxValue,
}: {
  data: Array<{ date: string; label: string; count: number }>;
  maxValue: number;
}) {
  return (
    <div className="flex items-end justify-between h-full gap-2">
      {data.map((item) => {
        const height = maxValue > 0 ? (item.count / maxValue) * 100 : 0;
        return (
          <div key={item.date} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex items-end justify-center h-36">
              <div
                className="w-full max-w-12 bg-neutral-900 rounded-t-md transition-all duration-300 hover:bg-neutral-700 relative group"
                style={{ height: `${Math.max(height, 4)}%` }}
              >
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {item.count} transport{item.count > 1 ? "s" : ""}
                </div>
              </div>
            </div>
            <span className="text-xs text-neutral-500">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
