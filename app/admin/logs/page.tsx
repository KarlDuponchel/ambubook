"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ScrollText, AlertCircle } from "lucide-react";
import {
  AuditLogEntry,
  ErrorLogEntry,
  AdminLogsFilters,
  AdminErrorsFilters,
  AdminPagination,
  AdminLogsResponse,
  AdminErrorsResponse,
} from "@/lib/types";
import { Pagination } from "@/components/admin";
import {
  AuditLogsTable,
  ErrorLogsTable,
  LogsFilters,
} from "@/components/admin/logs";
import { cn } from "@/lib/utils";

type TabType = "audit" | "errors";

async function loadAuditLogs(
  filters: AdminLogsFilters,
  page: number,
  limit: number
): Promise<AdminLogsResponse> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.action !== "ALL") params.set("action", filters.action);
  if (filters.targetType !== "ALL") params.set("targetType", filters.targetType);
  if (filters.userId) params.set("userId", filters.userId);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const response = await fetch(`/api/admin/logs?${params}`);
  if (response.ok) {
    return response.json();
  }
  return {
    logs: [],
    pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
    stats: { total: 0, actionCounts: [] },
  };
}

async function loadErrorLogs(
  filters: AdminErrorsFilters,
  page: number,
  limit: number
): Promise<AdminErrorsResponse> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.severity !== "ALL") params.set("severity", filters.severity);
  if (filters.resolved !== "ALL") params.set("resolved", filters.resolved);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const response = await fetch(`/api/admin/logs/errors?${params}`);
  if (response.ok) {
    return response.json();
  }
  return {
    errors: [],
    pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
    stats: { total: 0, unresolved: 0, severityCounts: [] },
  };
}

export default function LogsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("audit");

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditFilters, setAuditFilters] = useState<AdminLogsFilters>({
    search: "",
    action: "ALL",
    targetType: "ALL",
    userId: "",
    dateFrom: "",
    dateTo: "",
  });
  const [auditPagination, setAuditPagination] = useState<AdminPagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [auditStats, setAuditStats] = useState<{ total: number }>({ total: 0 });

  // Error logs state
  const [errorLogs, setErrorLogs] = useState<ErrorLogEntry[]>([]);
  const [errorFilters, setErrorFilters] = useState<AdminErrorsFilters>({
    search: "",
    severity: "ALL",
    resolved: "false", // Par défaut, afficher les non résolues
    dateFrom: "",
    dateTo: "",
  });
  const [errorPagination, setErrorPagination] = useState<AdminPagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [errorStats, setErrorStats] = useState<{ total: number; unresolved: number }>({
    total: 0,
    unresolved: 0,
  });

  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(false);

  // Fetch audit logs
  const fetchAuditLogs = useCallback(
    async (filters: AdminLogsFilters, page: number, limit: number) => {
      setLoading(true);
      const data = await loadAuditLogs(filters, page, limit);
      setAuditLogs(data.logs);
      setAuditPagination(data.pagination);
      setAuditStats({ total: data.stats.total });
      setLoading(false);
    },
    []
  );

  // Fetch error logs
  const fetchErrorLogs = useCallback(
    async (filters: AdminErrorsFilters, page: number, limit: number) => {
      setLoading(true);
      const data = await loadErrorLogs(filters, page, limit);
      setErrorLogs(data.errors);
      setErrorPagination(data.pagination);
      setErrorStats({ total: data.stats.total, unresolved: data.stats.unresolved });
      setLoading(false);
    },
    []
  );

  // Initial load
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      fetchAuditLogs(auditFilters, auditPagination.page, auditPagination.limit);
      // Also prefetch error stats
      loadErrorLogs(errorFilters, 1, 1).then((data) => {
        setErrorStats({ total: data.stats.total, unresolved: data.stats.unresolved });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === "audit" && auditLogs.length === 0) {
      fetchAuditLogs(auditFilters, 1, auditPagination.limit);
    } else if (tab === "errors" && errorLogs.length === 0) {
      fetchErrorLogs(errorFilters, 1, errorPagination.limit);
    }
  };

  // Handle audit filters change
  const handleAuditFiltersChange = useCallback(
    (newFilters: AdminLogsFilters) => {
      setAuditFilters(newFilters);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      const isSearchChange = newFilters.search !== auditFilters.search;
      const delay = isSearchChange ? 300 : 0;

      debounceRef.current = setTimeout(() => {
        fetchAuditLogs(newFilters, 1, auditPagination.limit);
      }, delay);
    },
    [auditFilters.search, auditPagination.limit, fetchAuditLogs]
  );

  // Handle error filters change
  const handleErrorFiltersChange = useCallback(
    (key: keyof AdminErrorsFilters, value: string) => {
      const newFilters = { ...errorFilters, [key]: value };
      setErrorFilters(newFilters);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      const isSearchChange = key === "search";
      const delay = isSearchChange ? 300 : 0;

      debounceRef.current = setTimeout(() => {
        fetchErrorLogs(newFilters, 1, errorPagination.limit);
      }, delay);
    },
    [errorFilters, errorPagination.limit, fetchErrorLogs]
  );

  // Handle mark errors resolved
  const handleMarkResolved = async (ids: string[], resolved: boolean) => {
    const response = await fetch("/api/admin/logs/errors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, resolved }),
    });

    if (response.ok) {
      fetchErrorLogs(errorFilters, errorPagination.page, errorPagination.limit);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 flex items-center gap-2">
          <ScrollText className="h-5 w-5" />
          Logs système
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          Historique des actions et erreurs de la plateforme
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-200">
        <button
          onClick={() => handleTabChange("audit")}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
            activeTab === "audit"
              ? "border-neutral-900 text-neutral-900"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          )}
        >
          <span className="flex items-center gap-2">
            <ScrollText className="h-4 w-4" />
            Audit
            <span className="px-1.5 py-0.5 text-xs rounded bg-neutral-100 text-neutral-600">
              {auditStats.total}
            </span>
          </span>
        </button>
        <button
          onClick={() => handleTabChange("errors")}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
            activeTab === "errors"
              ? "border-neutral-900 text-neutral-900"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          )}
        >
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Erreurs
            {errorStats.unresolved > 0 && (
              <span className="px-1.5 py-0.5 text-xs rounded bg-red-100 text-red-700">
                {errorStats.unresolved}
              </span>
            )}
          </span>
        </button>
      </div>

      {/* Content */}
      {activeTab === "audit" ? (
        <>
          {/* Filtres Audit */}
          <LogsFilters
            filters={auditFilters}
            onFiltersChange={handleAuditFiltersChange}
          />

          {/* Table Audit */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-3 text-neutral-500">
                <div className="h-4 w-4 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
                <span className="text-sm">Chargement...</span>
              </div>
            </div>
          ) : (
            <>
              <AuditLogsTable logs={auditLogs} />
              <Pagination
                pagination={auditPagination}
                onPageChange={(page) =>
                  fetchAuditLogs(auditFilters, page, auditPagination.limit)
                }
                onLimitChange={(limit) =>
                  fetchAuditLogs(auditFilters, 1, limit)
                }
              />
            </>
          )}
        </>
      ) : (
        <>
          {/* Filtres Erreurs */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Rechercher..."
              value={errorFilters.search}
              onChange={(e) => handleErrorFiltersChange("search", e.target.value)}
              className="px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
            <select
              value={errorFilters.severity}
              onChange={(e) => handleErrorFiltersChange("severity", e.target.value)}
              className="px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="ALL">Toutes sévérités</option>
              <option value="DEBUG">Debug</option>
              <option value="INFO">Info</option>
              <option value="WARNING">Warning</option>
              <option value="ERROR">Error</option>
              <option value="CRITICAL">Critical</option>
            </select>
            <select
              value={errorFilters.resolved}
              onChange={(e) => handleErrorFiltersChange("resolved", e.target.value)}
              className="px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="ALL">Tous statuts</option>
              <option value="false">Non résolues</option>
              <option value="true">Résolues</option>
            </select>
          </div>

          {/* Table Erreurs */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-3 text-neutral-500">
                <div className="h-4 w-4 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
                <span className="text-sm">Chargement...</span>
              </div>
            </div>
          ) : (
            <>
              <ErrorLogsTable
                errors={errorLogs}
                onMarkResolved={handleMarkResolved}
              />
              <Pagination
                pagination={errorPagination}
                onPageChange={(page) =>
                  fetchErrorLogs(errorFilters, page, errorPagination.limit)
                }
                onLimitChange={(limit) =>
                  fetchErrorLogs(errorFilters, 1, limit)
                }
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
