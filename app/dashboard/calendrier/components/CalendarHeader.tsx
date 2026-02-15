"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { CalendarView } from "@/lib/types";

interface CalendarHeaderProps {
  title: string;
  view: CalendarView;
  isLoading?: boolean;
  onViewChange: (view: CalendarView) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

const VIEW_LABELS: Record<CalendarView, string> = {
  day: "Jour",
  week: "Semaine",
  month: "Mois",
};

export function CalendarHeader({
  title,
  view,
  isLoading = false,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-card-border">
      {/* Titre et navigation */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={onPrevious}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Période précédente"
          >
            <ChevronLeft className="h-5 w-5 text-neutral-600" />
          </button>
          <button
            onClick={onNext}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Période suivante"
          >
            <ChevronRight className="h-5 w-5 text-neutral-600" />
          </button>
        </div>

        <h2 className="text-lg font-semibold text-neutral-900 capitalize min-w-0 truncate">
          {title}
        </h2>

        {isLoading && (
          <Loader2 className="h-4 w-4 text-primary-500 animate-spin shrink-0" />
        )}

        <button
          onClick={onToday}
          className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors shrink-0"
        >
          Aujourd&apos;hui
        </button>
      </div>

      {/* Sélecteur de vue */}
      <div className="flex items-center p-1 bg-neutral-100 rounded-lg">
        {(["day", "week", "month"] as CalendarView[]).map((v) => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              view === v
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            {VIEW_LABELS[v]}
          </button>
        ))}
      </div>
    </div>
  );
}
