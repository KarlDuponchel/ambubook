"use client";

import { Search, Bug, Lightbulb, HelpCircle, MoreHorizontal, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AdminFeedbackFilters,
  AdminFeedbackTypeFilter,
  AdminFeedbackStatusFilter,
  AdminFeedbackPriorityFilter,
  AdminFeedbackCounts,
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_PRIORITY_LABELS,
} from "@/lib/types";

interface FeedbackFiltersProps {
  filters: AdminFeedbackFilters;
  onFiltersChange: (filters: AdminFeedbackFilters) => void;
  counts: AdminFeedbackCounts;
}

const typeOptions: {
  value: AdminFeedbackTypeFilter;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  { value: "ALL", label: "Tous", icon: MessageSquare, color: "text-neutral-600" },
  { value: "BUG", label: "Bugs", icon: Bug, color: "text-red-600" },
  { value: "IMPROVEMENT", label: "Améliorations", icon: Lightbulb, color: "text-orange-600" },
  { value: "QUESTION", label: "Questions", icon: HelpCircle, color: "text-blue-600" },
  { value: "OTHER", label: "Autres", icon: MoreHorizontal, color: "text-neutral-500" },
];

const statusOptions: { value: AdminFeedbackStatusFilter; label: string }[] = [
  { value: "ALL", label: "Tous les statuts" },
  { value: "NEW", label: FEEDBACK_STATUS_LABELS.NEW },
  { value: "IN_PROGRESS", label: FEEDBACK_STATUS_LABELS.IN_PROGRESS },
  { value: "RESOLVED", label: FEEDBACK_STATUS_LABELS.RESOLVED },
  { value: "WONT_FIX", label: FEEDBACK_STATUS_LABELS.WONT_FIX },
];

const priorityOptions: { value: AdminFeedbackPriorityFilter; label: string }[] = [
  { value: "ALL", label: "Toutes les priorités" },
  { value: "CRITICAL", label: FEEDBACK_PRIORITY_LABELS.CRITICAL },
  { value: "HIGH", label: FEEDBACK_PRIORITY_LABELS.HIGH },
  { value: "MEDIUM", label: FEEDBACK_PRIORITY_LABELS.MEDIUM },
  { value: "LOW", label: FEEDBACK_PRIORITY_LABELS.LOW },
];

export function FeedbackFilters({ filters, onFiltersChange, counts }: FeedbackFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Rechercher par sujet, message ou utilisateur..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-sm"
        />
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Filtres par type */}
        <div className="flex flex-wrap gap-1">
          {typeOptions.map((option) => {
            const Icon = option.icon;
            const count =
              option.value === "ALL"
                ? counts.total
                : option.value === "BUG"
                  ? counts.bugs
                  : undefined;

            return (
              <button
                key={option.value}
                onClick={() => onFiltersChange({ ...filters, type: option.value })}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  filters.type === option.value
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                )}
              >
                <Icon
                  className={cn(
                    "h-3.5 w-3.5",
                    filters.type === option.value ? "text-white" : option.color
                  )}
                />
                <span>{option.label}</span>
                {count !== undefined && (
                  <span
                    className={cn(
                      "text-xs",
                      filters.type === option.value ? "text-neutral-400" : "text-neutral-500"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="h-5 w-px bg-neutral-200 mx-1 hidden sm:block" />

        {/* Filtre par statut */}
        <select
          value={filters.status}
          onChange={(e) =>
            onFiltersChange({ ...filters, status: e.target.value as AdminFeedbackStatusFilter })
          }
          className="px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
              {option.value === "NEW" && counts.new > 0 && ` (${counts.new})`}
              {option.value === "IN_PROGRESS" && counts.inProgress > 0 && ` (${counts.inProgress})`}
            </option>
          ))}
        </select>

        {/* Filtre par priorité */}
        <select
          value={filters.priority}
          onChange={(e) =>
            onFiltersChange({ ...filters, priority: e.target.value as AdminFeedbackPriorityFilter })
          }
          className="px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        >
          {priorityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
              {option.value === "CRITICAL" && counts.critical > 0 && ` (${counts.critical})`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
