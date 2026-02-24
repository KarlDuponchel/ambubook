"use client";

import { useEffect, useState } from "react";
import { Search, Truck, Car, RotateCcw, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AdminTransportsFilters,
  AdminTransportStatusFilter,
  AdminTransportTypeFilter,
  AdminTripTypeFilter,
  AdminTransportsCounts,
  STATUS_LABELS,
  RequestStatus,
} from "@/lib/types";

interface TransportFiltersProps {
  filters: AdminTransportsFilters;
  onFiltersChange: (filters: AdminTransportsFilters) => void;
  counts: AdminTransportsCounts;
}

interface CompanyOption {
  id: string;
  name: string;
}

const statusOptions: { value: AdminTransportStatusFilter; label: string }[] = [
  { value: "ALL", label: "Tous les statuts" },
  { value: "PENDING", label: STATUS_LABELS.PENDING },
  { value: "ACCEPTED", label: STATUS_LABELS.ACCEPTED },
  { value: "REFUSED", label: STATUS_LABELS.REFUSED },
  { value: "COUNTER_PROPOSAL", label: STATUS_LABELS.COUNTER_PROPOSAL },
  { value: "COMPLETED", label: STATUS_LABELS.COMPLETED },
  { value: "CANCELLED", label: STATUS_LABELS.CANCELLED },
];

const transportTypeOptions: {
  value: AdminTransportTypeFilter;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  { value: "ALL", label: "Tous", icon: Truck, color: "text-neutral-600" },
  { value: "AMBULANCE", label: "Ambulance", icon: Truck, color: "text-red-600" },
  { value: "VSL", label: "VSL", icon: Car, color: "text-blue-600" },
];

const tripTypeOptions: { value: AdminTripTypeFilter; label: string }[] = [
  { value: "ALL", label: "Tous les trajets" },
  { value: "ONE_WAY", label: "Aller simple" },
  { value: "ROUND_TRIP", label: "Aller-retour" },
];

function getStatusCount(status: RequestStatus, counts: AdminTransportsCounts): number {
  switch (status) {
    case "PENDING":
      return counts.pending;
    case "ACCEPTED":
      return counts.accepted;
    case "REFUSED":
      return counts.refused;
    case "COMPLETED":
      return counts.completed;
    case "CANCELLED":
      return counts.cancelled;
    default:
      return 0;
  }
}

export function TransportFilters({ filters, onFiltersChange, counts }: TransportFiltersProps) {
  const [companies, setCompanies] = useState<CompanyOption[]>([]);

  // Charger la liste des entreprises
  useEffect(() => {
    async function loadCompanies() {
      try {
        const response = await fetch("/api/admin/companies?limit=100");
        if (response.ok) {
          const data = await response.json();
          setCompanies(
            data.companies.map((c: { id: string; name: string }) => ({
              id: c.id,
              name: c.name,
            }))
          );
        }
      } catch {
        // Ignorer les erreurs
      }
    }
    loadCompanies();
  }, []);

  const handleReset = () => {
    onFiltersChange({
      search: "",
      status: "ALL",
      transportType: "ALL",
      tripType: "ALL",
      companyId: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.status !== "ALL" ||
    filters.transportType !== "ALL" ||
    filters.tripType !== "ALL" ||
    filters.companyId ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Rechercher par N° suivi, nom patient, email ou téléphone..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-sm"
        />
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Filtres par type de transport */}
        <div className="flex flex-wrap gap-1">
          {transportTypeOptions.map((option) => {
            const Icon = option.icon;
            const count =
              option.value === "ALL"
                ? counts.total
                : option.value === "AMBULANCE"
                  ? counts.ambulance
                  : counts.vsl;

            return (
              <button
                key={option.value}
                onClick={() => onFiltersChange({ ...filters, transportType: option.value })}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  filters.transportType === option.value
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                )}
              >
                <Icon
                  className={cn(
                    "h-3.5 w-3.5",
                    filters.transportType === option.value ? "text-white" : option.color
                  )}
                />
                <span>{option.label}</span>
                <span
                  className={cn(
                    "text-xs",
                    filters.transportType === option.value ? "text-neutral-400" : "text-neutral-500"
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
        <select
          value={filters.status}
          onChange={(e) =>
            onFiltersChange({ ...filters, status: e.target.value as AdminTransportStatusFilter })
          }
          className="px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        >
          {statusOptions.map((option) => {
            const count =
              option.value !== "ALL" ? getStatusCount(option.value, counts) : undefined;
            return (
              <option key={option.value} value={option.value}>
                {option.label}
                {count !== undefined && count > 0 && ` (${count})`}
              </option>
            );
          })}
        </select>

        {/* Filtre par type de trajet */}
        <select
          value={filters.tripType}
          onChange={(e) =>
            onFiltersChange({ ...filters, tripType: e.target.value as AdminTripTypeFilter })
          }
          className="px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        >
          {tripTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Filtre par entreprise */}
        {companies.length > 0 && (
          <select
            value={filters.companyId}
            onChange={(e) => onFiltersChange({ ...filters, companyId: e.target.value })}
            className="px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900 max-w-48"
          >
            <option value="">Toutes les entreprises</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Filtres de date */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-neutral-500">Date du transport :</span>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
          className="px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
        <ArrowRight className="h-4 w-4 text-neutral-400" />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
          className="px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />

        {/* Bouton reset */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}
