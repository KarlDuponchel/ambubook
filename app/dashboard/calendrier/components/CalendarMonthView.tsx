"use client";

import { getMonthDays, getDateKey, getDayClosure } from "@/lib/calendar-utils";
import type { CalendarEvent, CompanyHour, CompanyTimeOff } from "@/lib/types";
import { CalendarDayCell } from "./CalendarDayCell";

interface CalendarMonthViewProps {
  currentDate: Date;
  eventsByDate: Map<string, CalendarEvent[]>;
  hours: CompanyHour[];
  timeOffs: CompanyTimeOff[];
  onDayClick: (date: Date) => void;
}

const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function CalendarMonthView({
  currentDate,
  eventsByDate,
  hours,
  timeOffs,
  onDayClick,
}: CalendarMonthViewProps) {
  const days = getMonthDays(currentDate);

  return (
    <div className="overflow-hidden">
      {/* En-tête jours de la semaine */}
      <div className="grid grid-cols-7 border-b border-card-border">
        {DAY_NAMES.map((day, index) => (
          <div
            key={day}
            className={`
              py-3 text-center text-sm font-medium border-r border-card-border last:border-r-0
              ${index >= 5 ? "text-neutral-400" : "text-neutral-600"}
            `}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const dateKey = getDateKey(day.date);
          const dayEvents = eventsByDate.get(dateKey) || [];
          const closure = getDayClosure(day.date, hours, timeOffs);

          return (
            <CalendarDayCell
              key={index}
              dayNumber={day.dayNumber}
              isCurrentMonth={day.isCurrentMonth}
              isToday={day.isToday}
              isWeekend={day.isWeekend}
              isPast={day.isPast}
              events={dayEvents}
              isClosed={closure.isClosed}
              isTimeOff={!!closure.timeOffTitle}
              closureLabel={closure.label}
              onClick={() => onDayClick(day.date)}
            />
          );
        })}
      </div>
    </div>
  );
}
