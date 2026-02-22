"use client";

import { Search, Building2, Power, Truck, Car } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AdminCompaniesFilters,
  AdminCompanyStatus,
  AdminCompanyService,
  AdminCompaniesCounts,
} from "@/lib/types";

interface CompanyFiltersProps {
  filters: AdminCompaniesFilters;
  onFiltersChange: (filters: AdminCompaniesFilters) => void;
  counts: AdminCompaniesCounts;
}

const statusOptions: { value: AdminCompanyStatus; label: string }[] = [
  { value: "ALL", label: "Tous les statuts" },
  { value: "ACTIVE", label: "Actives" },
  { value: "INACTIVE", label: "Inactives" },
];

const serviceOptions: {
  value: AdminCompanyService;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "ALL", label: "Tous", icon: Building2 },
  { value: "AMBULANCE", label: "Ambulance", icon: Truck },
  { value: "VSL", label: "VSL", icon: Car },
];

export function CompanyFilters({
  filters,
  onFiltersChange,
  counts,
}: CompanyFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Rechercher par nom, ville ou SIRET..."
          value={filters.search}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value })
          }
          className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-sm"
        />
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Filtres par service */}
        <div className="flex flex-wrap gap-1">
          {serviceOptions.map((option) => {
            const Icon = option.icon;
            const count =
              option.value === "ALL"
                ? counts.total
                : option.value === "AMBULANCE"
                ? counts.withAmbulance
                : counts.withVSL;

            return (
              <button
                key={option.value}
                onClick={() =>
                  onFiltersChange({ ...filters, service: option.value })
                }
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  filters.service === option.value
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{option.label}</span>
                <span
                  className={cn(
                    "text-xs",
                    filters.service === option.value
                      ? "text-neutral-400"
                      : "text-neutral-500"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="h-5 w-px bg-neutral-200 mx-1 hidden sm:block" />

        {/* Filtre par statut */}
        <div className="flex items-center gap-2">
          <Power className="h-4 w-4 text-neutral-400" />
          <select
            value={filters.status}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                status: e.target.value as AdminCompanyStatus,
              })
            }
            className="px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
                {option.value === "ACTIVE" && ` (${counts.active})`}
                {option.value === "INACTIVE" && ` (${counts.inactive})`}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
