"use client";

import type { CalendarEvent as CalendarEventType, RequestStatus } from "@/lib/types";
import { getPredomnantStatus } from "@/lib/calendar-utils";
import { CalendarEventList } from "./CalendarEvent";

interface CalendarDayCellProps {
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  isPast: boolean;
  events: CalendarEventType[];
  onClick?: () => void;
}

const STATUS_DOT_COLORS: Record<RequestStatus, string> = {
  PENDING: "bg-warning-500",
  ACCEPTED: "bg-success-500",
  REFUSED: "bg-danger-500",
  COUNTER_PROPOSAL: "bg-accent-500",
  CANCELLED: "bg-neutral-400",
  COMPLETED: "bg-primary-500",
};

export function CalendarDayCell({
  dayNumber,
  isCurrentMonth,
  isToday,
  isWeekend,
  isPast,
  events,
  onClick,
}: CalendarDayCellProps) {
  const hasEvents = events.length > 0;
  const predominantStatus = hasEvents ? getPredomnantStatus(events) : null;

  return (
    <button
      onClick={onClick}
      className={`
        min-h-24 p-2 text-left transition-colors border-b border-r border-card-border
        ${isToday ? "bg-primary-50" : "hover:bg-neutral-50"}
        ${!isCurrentMonth ? "bg-neutral-50/50" : ""}
        ${isWeekend && isCurrentMonth ? "bg-neutral-50/30" : ""}
      `}
    >
      {/* Numéro du jour */}
      <div className="flex items-center justify-between mb-1">
        <span
          className={`
            inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full
            ${isToday ? "bg-primary-600 text-white" : ""}
            ${!isToday && isCurrentMonth ? "text-neutral-900" : ""}
            ${!isToday && !isCurrentMonth ? "text-neutral-400" : ""}
            ${isPast && !isToday && isCurrentMonth ? "text-neutral-500" : ""}
          `}
        >
          {dayNumber}
        </span>

        {/* Badge nombre d'événements */}
        {hasEvents && (
          <span
            className={`
              text-xs font-semibold px-1.5 rounded
              ${predominantStatus ? STATUS_DOT_COLORS[predominantStatus].replace("bg-", "text-") : "text-neutral-600"}
            `}
          >
            {events.length}
          </span>
        )}
      </div>

      {/* Liste des événements (dots) */}
      {hasEvents && (
        <div className="mt-1">
          <CalendarEventList events={events} variant="dot" maxDisplay={4} />
        </div>
      )}
    </button>
  );
}
