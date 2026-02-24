"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MessageSquare } from "lucide-react";
import {
  AdminFeedback,
  AdminFeedbackFilters,
  AdminPagination,
  AdminFeedbackCounts,
  AdminFeedbackResponse,
  AdminFeedbackStatus,
  AdminFeedbackPriority,
} from "@/lib/types";
import { FeedbackFilters } from "@/components/admin/feedback/FeedbackFilters";
import { FeedbackTable } from "@/components/admin/feedback/FeedbackTable";
import { FeedbackDetailsModal } from "@/components/admin/feedback/FeedbackDetailsModal";
import { Pagination } from "@/components/admin";

async function loadFeedbacks(
  filters: AdminFeedbackFilters,
  page: number,
  limit: number
): Promise<AdminFeedbackResponse> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.type !== "ALL") params.set("type", filters.type);
  if (filters.status !== "ALL") params.set("status", filters.status);
  if (filters.priority !== "ALL") params.set("priority", filters.priority);
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const response = await fetch(`/api/admin/feedback?${params}`);
  if (response.ok) {
    return response.json();
  }
  return {
    feedbacks: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    counts: { total: 0, new: 0, inProgress: 0, resolved: 0, bugs: 0, critical: 0 },
  };
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<AdminFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AdminFeedbackFilters>({
    search: "",
    type: "ALL",
    status: "ALL",
    priority: "ALL",
  });
  const [pagination, setPagination] = useState<AdminPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [counts, setCounts] = useState<AdminFeedbackCounts>({
    total: 0,
    new: 0,
    inProgress: 0,
    resolved: 0,
    bugs: 0,
    critical: 0,
  });
  const [viewingFeedback, setViewingFeedback] = useState<AdminFeedback | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(false);

  // Fonction de chargement des données
  const fetchData = useCallback(
    async (newFilters: AdminFeedbackFilters, page: number, limit: number) => {
      setLoading(true);
      const data = await loadFeedbacks(newFilters, page, limit);
      setFeedbacks(data.feedbacks);
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
    (newFilters: AdminFeedbackFilters) => {
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

  // Mettre à jour le statut
  const handleUpdateStatus = async (feedbackId: string, status: AdminFeedbackStatus) => {
    const response = await fetch(`/api/admin/feedback/${feedbackId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      const updatedFeedback = await response.json();
      // Mettre à jour la liste localement
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === feedbackId ? updatedFeedback : f))
      );
      // Mettre à jour la modal si ouverte
      if (viewingFeedback?.id === feedbackId) {
        setViewingFeedback(updatedFeedback);
      }
      // Rafraîchir les comptages
      refreshData();
    }
  };

  // Mettre à jour la priorité
  const handleUpdatePriority = async (feedbackId: string, priority: AdminFeedbackPriority) => {
    const response = await fetch(`/api/admin/feedback/${feedbackId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority }),
    });

    if (response.ok) {
      const updatedFeedback = await response.json();
      // Mettre à jour la liste localement
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === feedbackId ? updatedFeedback : f))
      );
      // Mettre à jour la modal si ouverte
      if (viewingFeedback?.id === feedbackId) {
        setViewingFeedback(updatedFeedback);
      }
      // Rafraîchir les comptages
      refreshData();
    }
  };

  // Mettre à jour les notes admin
  const handleUpdateNotes = async (feedbackId: string, adminNotes: string) => {
    const response = await fetch(`/api/admin/feedback/${feedbackId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNotes }),
    });

    if (response.ok) {
      const updatedFeedback = await response.json();
      // Mettre à jour la liste localement
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === feedbackId ? updatedFeedback : f))
      );
      // Mettre à jour la modal si ouverte
      if (viewingFeedback?.id === feedbackId) {
        setViewingFeedback(updatedFeedback);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Feedbacks
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          {pagination.total} feedback{pagination.total > 1 ? "s" : ""}
          {counts.new > 0 && (
            <span className="ml-2 text-amber-600">
              ({counts.new} nouveau{counts.new > 1 ? "x" : ""})
            </span>
          )}
          {counts.critical > 0 && (
            <span className="ml-2 text-red-600">
              ({counts.critical} critique{counts.critical > 1 ? "s" : ""})
            </span>
          )}
        </p>
      </div>

      {/* Filtres */}
      <FeedbackFilters
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
          <FeedbackTable
            feedbacks={feedbacks}
            onViewDetails={setViewingFeedback}
            onUpdateStatus={handleUpdateStatus}
            onUpdatePriority={handleUpdatePriority}
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
      {viewingFeedback && (
        <FeedbackDetailsModal
          feedback={viewingFeedback}
          onClose={() => setViewingFeedback(null)}
          onUpdateStatus={handleUpdateStatus}
          onUpdatePriority={handleUpdatePriority}
          onUpdateNotes={handleUpdateNotes}
        />
      )}
    </div>
  );
}
