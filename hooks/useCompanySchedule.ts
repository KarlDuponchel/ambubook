"use client";

import { useState, useEffect } from "react";
import type { CompanyHour, CompanyTimeOff } from "@/lib/types";

interface UseCompanyScheduleReturn {
  hours: CompanyHour[];
  timeOffs: CompanyTimeOff[];
}

/**
 * Charge les horaires (jours de fermeture récurrents) et les congés de
 * l'entreprise de l'ambulancier connecté. Ces données ne dépendent pas de la
 * plage affichée : un seul fetch au montage.
 */
export function useCompanySchedule(): UseCompanyScheduleReturn {
  const [hours, setHours] = useState<CompanyHour[]>([]);
  const [timeOffs, setTimeOffs] = useState<CompanyTimeOff[]>([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [hoursRes, timeOffRes] = await Promise.all([
          fetch("/api/companies/me/hours"),
          fetch("/api/companies/me/time-off"),
        ]);

        if (!cancelled && hoursRes.ok) {
          setHours(await hoursRes.json());
        }
        if (!cancelled && timeOffRes.ok) {
          setTimeOffs(await timeOffRes.json());
        }
      } catch {
        // Silencieux : le calendrier reste fonctionnel sans ces informations
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { hours, timeOffs };
}
