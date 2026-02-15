"use client";

import { getWeekDays, getTimeSlots, getDateKey, getCurrentTimePosition } from "@/lib/calendar-utils";
import type { CalendarEvent } from "@/lib/types";
import { CalendarEventList } from "./CalendarEvent";

interface CalendarWeekViewProps {
  currentDate: Date;
  eventsByDate: Map<string, CalendarEvent[]>;
  onDayClick: (date: Date) => void;
}

const START_HOUR = 6;
const END_HOUR = 22;
const HOUR_HEIGHT = 60; // pixels par heure

export function CalendarWeekView({
  currentDate,
  eventsByDate,
  onDayClick,
}: CalendarWeekViewProps) {
  const weekDays = getWeekDays(currentDate);
  const timeSlots = getTimeSlots(START_HOUR, END_HOUR);
  const currentTimePosition = getCurrentTimePosition(START_HOUR);

  // Grouper les événements par heure pour chaque jour
  const getEventsForDayAndHour = (date: Date, hour: number): CalendarEvent[] => {
    const dateKey = getDateKey(date);
    const dayEvents = eventsByDate.get(dateKey) || [];
    return dayEvents.filter(event => {
      const eventHour = parseInt(event.time.split(":")[0], 10);
      return eventHour === hour;
    });
  };

  return (
    <div className="overflow-auto">
      {/* En-tête des jours */}
      <div className="sticky top-0 z-10 bg-card-bg border-b border-card-border">
        <div className="grid grid-cols-8">
          {/* Colonne vide pour les heures */}
          <div className="w-16 shrink-0" />

          {/* Jours de la semaine */}
          {weekDays.map((day) => {
            const dateKey = getDateKey(day.date);
            const dayEvents = eventsByDate.get(dateKey) || [];
            const eventCount = dayEvents.length;

            return (
              <button
                key={day.date.toISOString()}
                onClick={() => onDayClick(day.date)}
                className={`
                  flex-1 py-3 px-2 text-center border-l border-card-border transition-colors
                  ${day.isToday ? "bg-primary-50" : "hover:bg-neutral-50"}
                  ${day.isWeekend ? "bg-neutral-50/30" : ""}
                `}
              >
                <p className={`text-xs font-medium ${day.isWeekend ? "text-neutral-400" : "text-neutral-500"}`}>
                  {day.dayName}
                </p>
                <p
                  className={`
                    mt-1 text-xl font-semibold
                    ${day.isToday ? "text-primary-600" : "text-neutral-900"}
                  `}
                >
                  {day.dayNumber}
                </p>
                {eventCount > 0 && (
                  <p className="mt-0.5 text-xs text-primary-600 font-medium">
                    {eventCount} transport{eventCount > 1 ? "s" : ""}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grille horaire */}
      <div className="relative">
        {/* Ligne du temps actuel */}
        {currentTimePosition !== null && (
          <div
            className="absolute left-0 right-0 z-20 pointer-events-none"
            style={{ top: `${currentTimePosition}px` }}
          >
            <div className="flex items-center">
              <div className="w-16 pr-2 text-right">
                <span className="text-xs font-medium text-danger-500">
                  {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="flex-1 h-0.5 bg-danger-500" />
            </div>
          </div>
        )}

        {/* Lignes horaires */}
        {timeSlots.map((slot) => (
          <div key={slot.hour} className="grid grid-cols-8" style={{ height: `${HOUR_HEIGHT}px` }}>
            {/* Colonne heure */}
            <div className="w-16 shrink-0 pr-2 pt-0 text-right border-r border-card-border">
              <span className="text-xs text-neutral-400 -translate-y-1/2 inline-block">
                {slot.label}
              </span>
            </div>

            {/* Colonnes des jours */}
            {weekDays.map((day) => {
              const hourEvents = getEventsForDayAndHour(day.date, slot.hour);

              return (
                <div
                  key={`${day.date.toISOString()}-${slot.hour}`}
                  className={`
                    flex-1 border-l border-b border-card-border p-1
                    ${day.isToday ? "bg-primary-50/30" : ""}
                    ${day.isWeekend ? "bg-neutral-50/50" : ""}
                  `}
                >
                  {hourEvents.length > 0 && (
                    <CalendarEventList
                      events={hourEvents}
                      variant="compact"
                      maxDisplay={2}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
