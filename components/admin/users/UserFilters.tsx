"use client";

import { Search, Users, Shield, Truck, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminUsersFilters, AdminUserRole, AdminUserStatus, AdminUsersCounts } from "@/lib/types";

interface UserFiltersProps {
  filters: AdminUsersFilters;
  onFiltersChange: (filters: AdminUsersFilters) => void;
  counts: AdminUsersCounts;
}

const roleOptions: { value: AdminUserRole; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "ALL", label: "Tous", icon: Users },
  { value: "ADMIN", label: "Admins", icon: Shield },
  { value: "AMBULANCIER", label: "Ambulanciers", icon: Truck },
  { value: "CUSTOMER", label: "Clients", icon: UserIcon },
];

const statusOptions: { value: AdminUserStatus; label: string }[] = [
  { value: "ALL", label: "Tous les statuts" },
  { value: "ACTIVE", label: "Actifs" },
  { value: "PENDING", label: "En attente" },
];

export function UserFilters({ filters, onFiltersChange, counts }: UserFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Rechercher par nom, email ou société..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-sm"
        />
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Filtres par rôle */}
        <div className="flex flex-wrap gap-1">
          {roleOptions.map((option) => {
            const Icon = option.icon;
            const count = option.value === "ALL"
              ? counts.total
              : option.value === "ADMIN"
                ? counts.admins
                : option.value === "AMBULANCIER"
                  ? counts.ambulanciers
                  : counts.customers;

            return (
              <button
                key={option.value}
                onClick={() => onFiltersChange({ ...filters, role: option.value })}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  filters.role === option.value
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{option.label}</span>
                <span className={cn(
                  "text-xs",
                  filters.role === option.value ? "text-neutral-400" : "text-neutral-500"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="h-5 w-px bg-neutral-200 mx-1 hidden sm:block" />

        {/* Filtre par statut */}
        <select
          value={filters.status}
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as AdminUserStatus })}
          className="px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
              {option.value === "PENDING" && counts.pending > 0 && ` (${counts.pending})`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
