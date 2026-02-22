"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Building2 } from "lucide-react";
import {
  AdminCompanyFull,
  AdminCompaniesFilters,
  AdminPagination,
  AdminCompaniesCounts,
  AdminCompaniesResponse,
} from "@/lib/types";
import {
  CompanyFilters,
  CompaniesTable,
  CompanyDetailsModal,
  DeleteCompanyModal,
  Pagination,
} from "@/components/admin";

async function loadCompanies(
  filters: AdminCompaniesFilters,
  page: number,
  limit: number
): Promise<AdminCompaniesResponse> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status !== "ALL") params.set("status", filters.status);
  if (filters.service !== "ALL") params.set("service", filters.service);
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const response = await fetch(`/api/admin/companies?${params}`);
  if (response.ok) {
    return response.json();
  }
  return {
    companies: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    counts: { total: 0, active: 0, inactive: 0, withAmbulance: 0, withVSL: 0 },
  };
}

export default function EntreprisesPage() {
  const [companies, setCompanies] = useState<AdminCompanyFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AdminCompaniesFilters>({
    search: "",
    status: "ALL",
    service: "ALL",
  });
  const [pagination, setPagination] = useState<AdminPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [counts, setCounts] = useState<AdminCompaniesCounts>({
    total: 0,
    active: 0,
    inactive: 0,
    withAmbulance: 0,
    withVSL: 0,
  });
  const [viewingCompany, setViewingCompany] = useState<AdminCompanyFull | null>(
    null
  );
  const [deletingCompany, setDeletingCompany] =
    useState<AdminCompanyFull | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(false);

  // Fonction de chargement des données
  const fetchData = useCallback(
    async (
      newFilters: AdminCompaniesFilters,
      page: number,
      limit: number
    ) => {
      setLoading(true);
      const data = await loadCompanies(newFilters, page, limit);
      setCompanies(data.companies);
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
    (newFilters: AdminCompaniesFilters) => {
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

  const handleToggleActive = async (company: AdminCompanyFull) => {
    const response = await fetch(`/api/admin/companies/${company.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !company.isActive }),
    });

    if (response.ok) {
      refreshData();
    }
  };

  const handleDeleteCompany = async () => {
    if (!deletingCompany) return;

    const response = await fetch(`/api/admin/companies/${deletingCompany.id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setDeletingCompany(null);
      refreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Entreprises
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          {pagination.total} entreprise{pagination.total > 1 ? "s" : ""}
          {counts.inactive > 0 && (
            <span className="ml-2 text-amber-600">
              ({counts.inactive} inactive{counts.inactive > 1 ? "s" : ""})
            </span>
          )}
        </p>
      </div>

      {/* Filtres */}
      <CompanyFilters
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
          <CompaniesTable
            companies={companies}
            onViewDetails={setViewingCompany}
            onToggleActive={handleToggleActive}
            onDelete={setDeletingCompany}
          />

          {/* Pagination */}
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </>
      )}

      {/* Modals */}
      {viewingCompany && (
        <CompanyDetailsModal
          company={viewingCompany}
          onClose={() => setViewingCompany(null)}
        />
      )}

      {deletingCompany && (
        <DeleteCompanyModal
          company={deletingCompany}
          onClose={() => setDeletingCompany(null)}
          onConfirm={handleDeleteCompany}
        />
      )}
    </div>
  );
}
