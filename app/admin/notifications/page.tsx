"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, Send, XCircle, Clock } from "lucide-react";
import {
  AdminNotificationLog,
  AdminNotificationFilters,
  AdminPagination,
  AdminNotificationStats,
  AdminNotificationResponse,
} from "@/lib/types";
import { NotificationFilters } from "@/components/admin/notifications/NotificationFilters";
import { NotificationsTable } from "@/components/admin/notifications/NotificationsTable";
import { NotificationDetailsModal } from "@/components/admin/notifications/NotificationDetailsModal";
import { Pagination } from "@/components/admin";

async function loadNotifications(
  filters: AdminNotificationFilters,
  page: number,
  limit: number
): Promise<AdminNotificationResponse> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.channel !== "ALL") params.set("channel", filters.channel);
  if (filters.status !== "ALL") params.set("status", filters.status);
  if (filters.type) params.set("type", filters.type);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const response = await fetch(`/api/admin/notifications?${params}`);
  if (response.ok) {
    return response.json();
  }
  return {
    logs: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    stats: { total: 0, sent: 0, failed: 0, pending: 0, bounced: 0, byChannel: {}, byType: [] },
  };
}

export default function NotificationsPage() {
  const [logs, setLogs] = useState<AdminNotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AdminNotificationFilters>({
    search: "",
    channel: "ALL",
    status: "ALL",
    type: "",
    dateFrom: "",
    dateTo: "",
  });
  const [pagination, setPagination] = useState<AdminPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState<AdminNotificationStats>({
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0,
    bounced: 0,
    byChannel: {},
    byType: [],
  });
  const [viewingLog, setViewingLog] = useState<AdminNotificationLog | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(false);

  // Fonction de chargement des données
  const fetchData = useCallback(
    async (newFilters: AdminNotificationFilters, page: number, limit: number) => {
      setLoading(true);
      const data = await loadNotifications(newFilters, page, limit);
      setLogs(data.logs);
      setPagination(data.pagination);
      setStats(data.stats);
      setLoading(false);
    },
    []
  );

  // Chargement initial
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      fetchData(filters, pagination.page, pagination.limit);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Changement de filtres avec debounce pour la recherche
  const handleFiltersChange = useCallback(
    (newFilters: AdminNotificationFilters) => {
      setFilters(newFilters);

      // Debounce uniquement pour la recherche
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      const isSearchChange = newFilters.search !== filters.search;
      const delay = isSearchChange ? 300 : 0;

      debounceRef.current = setTimeout(() => {
        // Reset à la page 1 quand les filtres changent
        fetchData(newFilters, 1, pagination.limit);
      }, delay);
    },
    [filters.search, pagination.limit, fetchData]
  );

  // Changement de page
  const handlePageChange = useCallback(
    (page: number) => {
      fetchData(filters, page, pagination.limit);
    },
    [filters, pagination.limit, fetchData]
  );

  // Changement de limite
  const handleLimitChange = useCallback(
    (limit: number) => {
      fetchData(filters, 1, limit);
    },
    [filters, fetchData]
  );

  // Calcul du taux de succès
  const successRate = stats.total > 0
    ? Math.round((stats.sent / stats.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          {pagination.total} notification{pagination.total > 1 ? "s" : ""}
        </p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-neutral-500 text-sm mb-1">
            <Bell className="h-4 w-4" />
            Total
          </div>
          <p className="text-2xl font-semibold text-neutral-900">{stats.total}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-600 text-sm mb-1">
            <Send className="h-4 w-4" />
            Envoyées
          </div>
          <p className="text-2xl font-semibold text-green-600">{stats.sent}</p>
          <p className="text-xs text-neutral-500">{successRate}% de succès</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600 text-sm mb-1">
            <XCircle className="h-4 w-4" />
            Échecs
          </div>
          <p className="text-2xl font-semibold text-red-600">{stats.failed}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-600 text-sm mb-1">
            <Clock className="h-4 w-4" />
            En attente
          </div>
          <p className="text-2xl font-semibold text-amber-600">{stats.pending}</p>
        </div>
      </div>

      {/* Filtres */}
      <NotificationFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        stats={stats}
      />

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3 text-neutral-500">
            <div className="h-4 w-4 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
            <span className="text-sm">Chargement...</span>
          </div>
        </div>
      ) : (
        <>
          <NotificationsTable
            logs={logs}
            onViewDetails={setViewingLog}
          />

          {/* Pagination */}
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </>
      )}

      {/* Modal détails */}
      {viewingLog && (
        <NotificationDetailsModal
          log={viewingLog}
          onClose={() => setViewingLog(null)}
        />
      )}
    </div>
  );
}
