"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Truck } from "lucide-react";
import {
  AdminTransport,
  AdminTransportFull,
  AdminTransportsFilters,
  AdminPagination,
  AdminTransportsCounts,
  AdminTransportsResponse,
  RequestStatus,
} from "@/lib/types";
import { TransportFilters } from "@/components/admin/transports/TransportFilters";
import { TransportsTable } from "@/components/admin/transports/TransportsTable";
import { TransportDetailsModal } from "@/components/admin/transports/TransportDetailsModal";
import { Pagination } from "@/components/admin";

async function loadTransports(
  filters: AdminTransportsFilters,
  page: number,
  limit: number
): Promise<AdminTransportsResponse> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status !== "ALL") params.set("status", filters.status);
  if (filters.transportType !== "ALL") params.set("transportType", filters.transportType);
  if (filters.tripType !== "ALL") params.set("tripType", filters.tripType);
  if (filters.companyId) params.set("companyId", filters.companyId);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const response = await fetch(`/api/admin/transports?${params}`);
  if (response.ok) {
    return response.json();
  }
  return {
    transports: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    counts: {
      total: 0,
      pending: 0,
      accepted: 0,
      refused: 0,
      completed: 0,
      cancelled: 0,
      ambulance: 0,
      vsl: 0,
    },
  };
}

async function loadTransportDetails(id: string): Promise<AdminTransportFull | null> {
  const response = await fetch(`/api/admin/transports/${id}`);
  if (response.ok) {
    return response.json();
  }
  return null;
}

export default function TransportsPage() {
  const [transports, setTransports] = useState<AdminTransport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AdminTransportsFilters>({
    search: "",
    status: "ALL",
    transportType: "ALL",
    tripType: "ALL",
    companyId: "",
    dateFrom: "",
    dateTo: "",
  });
  const [pagination, setPagination] = useState<AdminPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [counts, setCounts] = useState<AdminTransportsCounts>({
    total: 0,
    pending: 0,
    accepted: 0,
    refused: 0,
    completed: 0,
    cancelled: 0,
    ambulance: 0,
    vsl: 0,
  });
  const [viewingTransport, setViewingTransport] = useState<AdminTransportFull | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(false);

  // Fonction de chargement des données
  const fetchData = useCallback(
    async (newFilters: AdminTransportsFilters, page: number, limit: number) => {
      setLoading(true);
      const data = await loadTransports(newFilters, page, limit);
      setTransports(data.transports);
      setPagination(data.pagination);
      setCounts(data.counts);
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
    (newFilters: AdminTransportsFilters) => {
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

  // Rafraîchir les données
  const refreshData = useCallback(() => {
    fetchData(filters, pagination.page, pagination.limit);
  }, [filters, pagination.page, pagination.limit, fetchData]);

  // Voir les détails d'un transport
  const handleViewDetails = async (transport: AdminTransport) => {
    setLoadingDetails(true);
    const details = await loadTransportDetails(transport.id);
    if (details) {
      setViewingTransport(details);
    }
    setLoadingDetails(false);
  };

  // Mettre à jour le statut
  const handleUpdateStatus = async (
    transportId: string,
    status: RequestStatus,
    adminNote?: string
  ) => {
    const response = await fetch(`/api/admin/transports/${transportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNote }),
    });

    if (response.ok) {
      // Recharger les détails du transport
      const details = await loadTransportDetails(transportId);
      if (details) {
        setViewingTransport(details);
      }
      // Rafraîchir la liste et les comptages
      refreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Transports
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          {pagination.total} transport{pagination.total > 1 ? "s" : ""}
          {counts.pending > 0 && (
            <span className="ml-2 text-amber-600">
              ({counts.pending} en attente)
            </span>
          )}
        </p>
      </div>

      {/* Filtres */}
      <TransportFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        counts={counts}
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
          <TransportsTable
            transports={transports}
            onViewDetails={handleViewDetails}
          />

          {/* Pagination */}
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </>
      )}

      {/* Loading détails overlay */}
      {loadingDetails && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <div className="h-5 w-5 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
            <span className="text-sm text-neutral-700">Chargement des détails...</span>
          </div>
        </div>
      )}

      {/* Modal détails */}
      {viewingTransport && (
        <TransportDetailsModal
          transport={viewingTransport}
          onClose={() => setViewingTransport(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}
