"use client";

import { Search, Calendar } from "lucide-react";
import { AdminLogsFilters, AuditActionType } from "@/lib/types";

interface LogsFiltersProps {
  filters: AdminLogsFilters;
  onFiltersChange: (filters: AdminLogsFilters) => void;
}

const actionOptions: { value: "ALL" | AuditActionType; label: string; group: string }[] = [
  { value: "ALL", label: "Toutes les actions", group: "" },
  // Auth
  { value: "LOGIN", label: "Connexion", group: "Auth" },
  { value: "LOGOUT", label: "Déconnexion", group: "Auth" },
  { value: "LOGIN_FAILED", label: "Connexion échouée", group: "Auth" },
  { value: "ACCESS_DENIED", label: "Accès refusé", group: "Auth" },
  { value: "PASSWORD_CHANGED", label: "Mot de passe changé", group: "Auth" },
  // Utilisateurs
  { value: "USER_CREATED", label: "Utilisateur créé", group: "Users" },
  { value: "USER_UPDATED", label: "Utilisateur modifié", group: "Users" },
  { value: "USER_DELETED", label: "Utilisateur supprimé", group: "Users" },
  { value: "USER_ACTIVATED", label: "Compte activé", group: "Users" },
  { value: "USER_DEACTIVATED", label: "Compte désactivé", group: "Users" },
  { value: "USER_ROLE_CHANGED", label: "Rôle modifié", group: "Users" },
  // Entreprises
  { value: "COMPANY_CREATED", label: "Entreprise créée", group: "Companies" },
  { value: "COMPANY_UPDATED", label: "Entreprise modifiée", group: "Companies" },
  { value: "COMPANY_DELETED", label: "Entreprise supprimée", group: "Companies" },
  { value: "COMPANY_ACTIVATED", label: "Entreprise activée", group: "Companies" },
  { value: "COMPANY_DEACTIVATED", label: "Entreprise désactivée", group: "Companies" },
  { value: "COMPANY_OWNER_CHANGED", label: "Gérant modifié", group: "Companies" },
  // Transports
  { value: "TRANSPORT_CREATED", label: "Transport créé", group: "Transports" },
  { value: "TRANSPORT_ACCEPTED", label: "Transport accepté", group: "Transports" },
  { value: "TRANSPORT_REFUSED", label: "Transport refusé", group: "Transports" },
  { value: "TRANSPORT_CANCELLED", label: "Transport annulé", group: "Transports" },
  // Admin
  { value: "ADMIN_ACTION", label: "Action admin", group: "Admin" },
];

const targetTypeOptions = [
  { value: "ALL", label: "Toutes les cibles" },
  { value: "user", label: "Utilisateurs" },
  { value: "company", label: "Entreprises" },
  { value: "transport", label: "Transports" },
];

export function LogsFilters({ filters, onFiltersChange }: LogsFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Rechercher dans les détails..."
          value={filters.search}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value })
          }
          className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-sm"
        />
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Action */}
        <select
          value={filters.action}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              action: e.target.value as "ALL" | AuditActionType,
            })
          }
          className="px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        >
          {actionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.group ? `${option.group}: ` : ""}
              {option.label}
            </option>
          ))}
        </select>

        {/* Type de cible */}
        <select
          value={filters.targetType}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              targetType: e.target.value as "ALL" | "user" | "company" | "transport",
            })
          }
          className="px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        >
          {targetTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="h-5 w-px bg-neutral-200 mx-1 hidden sm:block" />

        {/* Date de début */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-neutral-400" />
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) =>
              onFiltersChange({ ...filters, dateFrom: e.target.value })
            }
            className="px-2 py-1.5 bg-white border border-neutral-200 rounded-md text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
          <span className="text-neutral-400 text-sm">à</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) =>
              onFiltersChange({ ...filters, dateTo: e.target.value })
            }
            className="px-2 py-1.5 bg-white border border-neutral-200 rounded-md text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>

        {/* Reset */}
        {(filters.search ||
          filters.action !== "ALL" ||
          filters.targetType !== "ALL" ||
          filters.dateFrom ||
          filters.dateTo) && (
          <button
            onClick={() =>
              onFiltersChange({
                search: "",
                action: "ALL",
                targetType: "ALL",
                userId: "",
                dateFrom: "",
                dateTo: "",
              })
            }
            className="px-3 py-1.5 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md"
          >
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}
