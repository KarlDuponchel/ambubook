"use client";

import { Search, Mail, MessageSquare, Bell, Send, XCircle, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AdminNotificationFilters,
  AdminNotificationChannelFilter,
  AdminNotificationStatusFilter,
  AdminNotificationStats,
  NOTIFICATION_STATUS_FILTER_LABELS,
} from "@/lib/types";

interface NotificationFiltersProps {
  filters: AdminNotificationFilters;
  onFiltersChange: (filters: AdminNotificationFilters) => void;
  stats: AdminNotificationStats;
}

const channelOptions: {
  value: AdminNotificationChannelFilter;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "ALL", label: "Tous", icon: Bell },
  { value: "EMAIL", label: "Email", icon: Mail },
  { value: "SMS", label: "SMS", icon: MessageSquare },
  { value: "INAPP", label: "In-app", icon: Bell },
];

const statusOptions: {
  value: AdminNotificationStatusFilter;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  { value: "ALL", label: "Tous", icon: Bell, color: "text-neutral-600" },
  { value: "SENT", label: "Envoyé", icon: Send, color: "text-green-600" },
  { value: "FAILED", label: "Échec", icon: XCircle, color: "text-red-600" },
  { value: "PENDING", label: "En attente", icon: Clock, color: "text-amber-600" },
  { value: "BOUNCED", label: "Rejeté", icon: AlertTriangle, color: "text-orange-600" },
];

export function NotificationFilters({ filters, onFiltersChange, stats }: NotificationFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Rechercher par destinataire, sujet..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-sm"
        />
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Filtres par canal */}
        <div className="flex flex-wrap gap-1">
          {channelOptions.map((option) => {
            const Icon = option.icon;
            const count =
              option.value === "ALL"
                ? stats.total
                : stats.byChannel[option.value] || 0;

            return (
              <button
                key={option.value}
                onClick={() => onFiltersChange({ ...filters, channel: option.value })}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  filters.channel === option.value
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{option.label}</span>
                <span
                  className={cn(
                    "text-xs",
                    filters.channel === option.value ? "text-neutral-400" : "text-neutral-500"
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
            onFiltersChange({ ...filters, status: e.target.value as AdminNotificationStatusFilter })
          }
          className="px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        >
          {statusOptions.map((option) => {
            const count =
              option.value === "ALL"
                ? stats.total
                : option.value === "SENT"
                  ? stats.sent
                  : option.value === "FAILED"
                    ? stats.failed
                    : option.value === "PENDING"
                      ? stats.pending
                      : 0;

            return (
              <option key={option.value} value={option.value}>
                {NOTIFICATION_STATUS_FILTER_LABELS[option.value]}
                {count > 0 && ` (${count})`}
              </option>
            );
          })}
        </select>

        <div className="h-5 w-px bg-neutral-200 mx-1 hidden sm:block" />

        {/* Filtres par date */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
            className="px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
          <span className="text-neutral-400 text-sm">à</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
            className="px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>

        {/* Reset filtres dates */}
        {(filters.dateFrom || filters.dateTo) && (
          <button
            onClick={() => onFiltersChange({ ...filters, dateFrom: "", dateTo: "" })}
            className="px-2 py-1.5 text-xs text-neutral-500 hover:text-neutral-700"
          >
            Effacer dates
          </button>
        )}
      </div>
    </div>
  );
}
