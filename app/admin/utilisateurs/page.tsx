"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Users } from "lucide-react";
import {
  AdminUser,
  AdminCompany,
  AdminUsersFilters,
  AdminPagination,
  AdminUsersCounts,
  AdminUsersResponse,
} from "@/lib/types";
import {
  UserFilters,
  UsersTable,
  UserModal,
  DeleteModal,
  UserDetailsModal,
  Pagination,
} from "@/components/admin";

async function loadUsers(
  filters: AdminUsersFilters,
  page: number,
  limit: number
): Promise<AdminUsersResponse> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.role !== "ALL") params.set("role", filters.role);
  if (filters.status !== "ALL") params.set("status", filters.status);
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const response = await fetch(`/api/admin/users?${params}`);
  if (response.ok) {
    return response.json();
  }
  return {
    users: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    counts: { total: 0, admins: 0, ambulanciers: 0, customers: 0, pending: 0 },
  };
}

async function loadCompanies(): Promise<AdminCompany[]> {
  const response = await fetch("/api/admin/companies");
  if (response.ok) {
    return response.json();
  }
  return [];
}

export default function UtilisateursPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AdminUsersFilters>({
    search: "",
    role: "ALL",
    status: "ALL",
  });
  const [pagination, setPagination] = useState<AdminPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [counts, setCounts] = useState<AdminUsersCounts>({
    total: 0,
    admins: 0,
    ambulanciers: 0,
    customers: 0,
    pending: 0,
  });
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [viewingUser, setViewingUser] = useState<AdminUser | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(false);

  // Fonction de chargement des données
  const fetchData = useCallback(
    async (newFilters: AdminUsersFilters, page: number, limit: number) => {
      setLoading(true);
      const [data, companiesData] = await Promise.all([
        loadUsers(newFilters, page, limit),
        isMounted.current ? Promise.resolve(companies) : loadCompanies(),
      ]);
      setUsers(data.users);
      setPagination(data.pagination);
      setCounts(data.counts);
      if (!isMounted.current) {
        setCompanies(companiesData as AdminCompany[]);
      }
      setLoading(false);
    },
    [companies]
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
    (newFilters: AdminUsersFilters) => {
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

  const handleToggleActive = async (user: AdminUser) => {
    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });

    if (response.ok) {
      refreshData();
    }
  };

  const handleSaveUser = async (userData: Partial<AdminUser>) => {
    if (!editingUser) return;

    const response = await fetch(`/api/admin/users/${editingUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      setEditingUser(null);
      refreshData();
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    const response = await fetch(`/api/admin/users/${deletingUser.id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setDeletingUser(null);
      refreshData();
    }
  };

  const handleSetOwner = async (user: AdminUser) => {
    if (!user.companyId) return;

    const response = await fetch(`/api/admin/companies/${user.companyId}/owner`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownerId: user.id }),
    });

    if (response.ok) {
      refreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Utilisateurs
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          {pagination.total} résultat{pagination.total > 1 ? "s" : ""}
          {counts.pending > 0 && (
            <span className="ml-2 text-amber-600">
              ({counts.pending} en attente)
            </span>
          )}
        </p>
      </div>

      {/* Filtres */}
      <UserFilters
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
          <UsersTable
            users={users}
            onEdit={setEditingUser}
            onDelete={setDeletingUser}
            onToggleActive={handleToggleActive}
            onSetOwner={handleSetOwner}
            onViewDetails={setViewingUser}
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
      {editingUser && (
        <UserModal
          user={editingUser}
          companies={companies}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveUser}
        />
      )}

      {deletingUser && (
        <DeleteModal
          user={deletingUser}
          onClose={() => setDeletingUser(null)}
          onConfirm={handleDeleteUser}
        />
      )}

      {viewingUser && (
        <UserDetailsModal
          user={viewingUser}
          onClose={() => setViewingUser(null)}
        />
      )}
    </div>
  );
}
