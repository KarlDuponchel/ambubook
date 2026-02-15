"use client";

import { useMemo } from "react";
import {
  getTimeSlots,
  getDateKey,
  getCurrentTimePosition,
  getEventTopPosition,
  isToday,
} from "@/lib/calendar-utils";
import type { CalendarEvent } from "@/lib/types";
import { CalendarEvent as CalendarEventComponent } from "./CalendarEvent";

interface CalendarDayViewProps {
  currentDate: Date;
  eventsByDate: Map<string, CalendarEvent[]>;
}

const START_HOUR = 6;
const END_HOUR = 22;
const HOUR_HEIGHT = 80; // pixels par heure
const MINUTE_HEIGHT = HOUR_HEIGHT / 60;

export function CalendarDayView({
  currentDate,
  eventsByDate,
}: CalendarDayViewProps) {
  const timeSlots = getTimeSlots(START_HOUR, END_HOUR);
  const dateKey = getDateKey(currentDate);
  const dayEvents = eventsByDate.get(dateKey) || [];
  const isTodayView = isToday(currentDate);
  const currentTimePosition = isTodayView ? getCurrentTimePosition(START_HOUR) : null;

  // Positionner les événements sur la timeline
  const positionedEvents = useMemo(() => {
    return dayEvents.map(event => {
      const topPosition = getEventTopPosition(event.time, START_HOUR);
      return {
        ...event,
        top: topPosition * MINUTE_HEIGHT,
      };
    });
  }, [dayEvents]);

  return (
    <div className="flex overflow-auto">
      {/* Colonne des heures */}
      <div className="w-20 shrink-0 border-r border-card-border">
        {timeSlots.map((slot) => (
          <div
            key={slot.hour}
            className="relative border-b border-card-border"
            style={{ height: `${HOUR_HEIGHT}px` }}
          >
            <span className="absolute -top-2.5 right-3 text-xs text-neutral-400 bg-card-bg px-1">
              {slot.label}
            </span>
          </div>
        ))}
      </div>

      {/* Zone des événements */}
      <div className="flex-1 relative">
        {/* Lignes horaires */}
        {timeSlots.map((slot) => (
          <div
            key={slot.hour}
            className="border-b border-card-border"
            style={{ height: `${HOUR_HEIGHT}px` }}
          />
        ))}

        {/* Ligne du temps actuel */}
        {currentTimePosition !== null && (
          <div
            className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
            style={{ top: `${currentTimePosition * MINUTE_HEIGHT}px` }}
          >
            <div className="w-3 h-3 rounded-full bg-danger-500 -ml-1.5" />
            <div className="flex-1 h-0.5 bg-danger-500" />
          </div>
        )}

        {/* Événements */}
        <div className="absolute inset-0 p-2">
          {positionedEvents.map((event) => (
            <div
              key={event.id}
              className="absolute left-2 right-2"
              style={{ top: `${event.top}px` }}
            >
              <CalendarEventComponent event={event} variant="detailed" />
            </div>
          ))}
        </div>

        {/* Message si aucun événement */}
        {dayEvents.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-neutral-400 text-sm">Aucun transport prévu</p>
              <p className="text-neutral-300 text-xs mt-1">
                Les demandes acceptées apparaîtront ici
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Résumé de la journée */}
      {dayEvents.length > 0 && (
        <div className="w-64 shrink-0 border-l border-card-border p-4 bg-neutral-50/50">
          <h3 className="text-sm font-semibold text-neutral-900 mb-3">
            Résumé du jour
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Total transports</span>
              <span className="font-semibold text-neutral-900">{dayEvents.length}</span>
            </div>

            <div className="pt-3 border-t border-card-border">
              <p className="text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">
                Par statut
              </p>
              <div className="space-y-1.5">
                {Object.entries(
                  dayEvents.reduce((acc, event) => {
                    acc[event.status] = (acc[event.status] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between text-xs">
                    <span className="text-neutral-600">{getStatusLabel(status)}</span>
                    <span className="font-medium text-neutral-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-card-border">
              <p className="text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">
                Prochains transports
              </p>
              <div className="space-y-2">
                {dayEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="text-xs">
                    <span className="font-semibold text-neutral-900">{event.time}</span>
                    <span className="text-neutral-500"> - {event.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "En attente",
    ACCEPTED: "Acceptées",
    REFUSED: "Refusées",
    COUNTER_PROPOSAL: "Contre-propositions",
    CANCELLED: "Annulées",
    COMPLETED: "Terminées",
  };
  return labels[status] || status;
}
