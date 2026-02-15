"use client";

import { useState, useEffect, useCallback } from "react";
import type { TransportRequestSummary, CalendarEvent } from "@/lib/types";
import { toCalendarEvent, groupEventsByDate } from "@/lib/calendar-utils";

interface UseTransportRequestsOptions {
  dateFrom?: Date;
  dateTo?: Date;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseTransportRequestsReturn {
  data: TransportRequestSummary[];
  events: CalendarEvent[];
  eventsByDate: Map<string, CalendarEvent[]>;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTransportRequests(
  options: UseTransportRequestsOptions = {}
): UseTransportRequestsReturn {
  const { dateFrom, dateTo, autoRefresh = false, refreshInterval = 60000 } = options;

  const [data, setData] = useState<TransportRequestSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (dateFrom) {
        params.set("dateFrom", dateFrom.toISOString().split("T")[0]);
      }
      if (dateTo) {
        params.set("dateTo", dateTo.toISOString().split("T")[0]);
      }

      const response = await fetch(`/api/ambulancier/demandes?${params}`);

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des données");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  const events = data.map(toCalendarEvent);
  const eventsByDate = groupEventsByDate(events);

  return {
    data,
    events,
    eventsByDate,
    isLoading,
    error,
    refetch: fetchData,
  };
}
