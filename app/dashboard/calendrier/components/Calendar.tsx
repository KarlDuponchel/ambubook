"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui";
import { useCalendarNavigation } from "@/hooks/useCalendarNavigation";
import { useTransportRequests } from "@/hooks/useTransportRequests";
import { useCompanySchedule } from "@/hooks/useCompanySchedule";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarDayView } from "./CalendarDayView";
import { CalendarWeekView } from "./CalendarWeekView";
import { CalendarMonthView } from "./CalendarMonthView";
import type { CalendarView } from "@/lib/types";

interface CalendarProps {
  defaultView?: CalendarView;
}

export function Calendar({ defaultView = "month" }: CalendarProps) {
  const {
    currentDate,
    view,
    dateRange,
    setView,
    goToPrevious,
    goToNext,
    goToToday,
    goToDate,
    formattedTitle,
  } = useCalendarNavigation(defaultView);

  const { eventsByDate, isLoading, refetch } = useTransportRequests({
    dateFrom: dateRange.from,
    dateTo: dateRange.to,
  });

  // Congés + jours de fermeture de l'entreprise
  const { hours, timeOffs } = useCompanySchedule();

  // Rafraîchir les données quand la plage de dates change
  useEffect(() => {
    refetch();
  }, [dateRange.from.getTime(), dateRange.to.getTime(), refetch]);

  const handleDayClick = (date: Date) => {
    goToDate(date);
    setView("day");
  };

  return (
    <Card className="overflow-hidden">
      <CalendarHeader
        title={formattedTitle}
        view={view}
        isLoading={isLoading}
        onViewChange={setView}
        onPrevious={goToPrevious}
        onNext={goToNext}
        onToday={goToToday}
      />

      <div className="min-h-125">
        {view === "day" && (
          <CalendarDayView
            currentDate={currentDate}
            eventsByDate={eventsByDate}
            hours={hours}
            timeOffs={timeOffs}
          />
        )}

        {view === "week" && (
          <CalendarWeekView
            currentDate={currentDate}
            eventsByDate={eventsByDate}
            hours={hours}
            timeOffs={timeOffs}
            onDayClick={handleDayClick}
          />
        )}

        {view === "month" && (
          <CalendarMonthView
            currentDate={currentDate}
            eventsByDate={eventsByDate}
            hours={hours}
            timeOffs={timeOffs}
            onDayClick={handleDayClick}
          />
        )}
      </div>
    </Card>
  );
}
