"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { CalendarView } from "@/lib/types";
import {
  addDays,
  addWeeks,
  addMonths,
  startOfDay,
  startOfWeek,
  startOfMonth,
  formatDayTitle,
  formatWeekTitle,
  formatMonthTitle,
  isToday as checkIsToday,
  getDayRange,
  getWeekRange,
  getMonthRange,
  type DateRange,
} from "@/lib/calendar-utils";

const COOKIE_NAME = "calendar_view";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 an

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

function setCookie(name: string, value: string, maxAge: number): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function isValidView(value: string | null): value is CalendarView {
  return value === "day" || value === "week" || value === "month";
}

interface UseCalendarNavigationReturn {
  currentDate: Date;
  view: CalendarView;
  dateRange: DateRange;
  setView: (view: CalendarView) => void;
  goToPrevious: () => void;
  goToNext: () => void;
  goToToday: () => void;
  goToDate: (date: Date) => void;
  isToday: boolean;
  formattedTitle: string;
}

export function useCalendarNavigation(
  initialView: CalendarView = "month"
): UseCalendarNavigationReturn {
  const [currentDate, setCurrentDate] = useState<Date>(() => startOfDay(new Date()));
  const [view, setView] = useState<CalendarView>(() => {
    const savedView = getCookie(COOKIE_NAME);
    return isValidView(savedView) ? savedView : initialView;
  });

  // Sauvegarder la vue dans un cookie quand elle change
  useEffect(() => {
    setCookie(COOKIE_NAME, view, COOKIE_MAX_AGE);
  }, [view]);

  const goToPrevious = useCallback(() => {
    setCurrentDate((prev) => {
      switch (view) {
        case "day":
          return addDays(prev, -1);
        case "week":
          return addWeeks(prev, -1);
        case "month":
          return addMonths(prev, -1);
        default:
          return prev;
      }
    });
  }, [view]);

  const goToNext = useCallback(() => {
    setCurrentDate((prev) => {
      switch (view) {
        case "day":
          return addDays(prev, 1);
        case "week":
          return addWeeks(prev, 1);
        case "month":
          return addMonths(prev, 1);
        default:
          return prev;
      }
    });
  }, [view]);

  const goToToday = useCallback(() => {
    setCurrentDate(startOfDay(new Date()));
  }, []);

  const goToDate = useCallback((date: Date) => {
    setCurrentDate(startOfDay(date));
  }, []);

  const handleSetView = useCallback((newView: CalendarView) => {
    setView(newView);
    // Normaliser la date selon la nouvelle vue
    setCurrentDate((prev) => {
      switch (newView) {
        case "day":
          return startOfDay(prev);
        case "week":
          return startOfWeek(prev);
        case "month":
          return startOfMonth(prev);
        default:
          return prev;
      }
    });
  }, []);

  const dateRange = useMemo<DateRange>(() => {
    switch (view) {
      case "day":
        return getDayRange(currentDate);
      case "week":
        return getWeekRange(currentDate);
      case "month":
        return getMonthRange(currentDate);
      default:
        return getDayRange(currentDate);
    }
  }, [view, currentDate]);

  const formattedTitle = useMemo(() => {
    switch (view) {
      case "day":
        return formatDayTitle(currentDate);
      case "week":
        return formatWeekTitle(currentDate);
      case "month":
        return formatMonthTitle(currentDate);
      default:
        return formatMonthTitle(currentDate);
    }
  }, [view, currentDate]);

  const isToday = useMemo(() => checkIsToday(currentDate), [currentDate]);

  return {
    currentDate,
    view,
    dateRange,
    setView: handleSetView,
    goToPrevious,
    goToNext,
    goToToday,
    goToDate,
    isToday,
    formattedTitle,
  };
}
