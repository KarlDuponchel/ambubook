"use client";

import { OnboardingFormData, OnboardingHour, ONBOARDING_DAY_LABELS } from "../types";
import { Clock, Copy, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui";

interface HoursStepProps {
  data: OnboardingFormData;
  onChange: (data: Partial<OnboardingFormData>) => void;
  errors: Record<string, string>;
}

// Ordre d'affichage des jours (Lundi à Dimanche)
const DAYS_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function HoursStep({ data, onChange, errors }: HoursStepProps) {
  const updateHour = (dayOfWeek: number, updates: Partial<OnboardingHour>) => {
    const newHours = data.hours.map((h) =>
      h.dayOfWeek === dayOfWeek ? { ...h, ...updates } : h
    );
    onChange({ hours: newHours });
  };

  const copyToAll = (sourceDayOfWeek: number) => {
    const sourceHour = data.hours.find((h) => h.dayOfWeek === sourceDayOfWeek);
    if (!sourceHour) return;

    const newHours = data.hours.map((h) =>
      h.dayOfWeek !== sourceDayOfWeek
        ? {
            ...h,
            openTime: sourceHour.openTime,
            closeTime: sourceHour.closeTime,
            isClosed: sourceHour.isClosed,
          }
        : h
    );
    onChange({ hours: newHours });
  };

  const setWeekdayHours = () => {
    const newHours = data.hours.map((h) => {
      // Lundi à Vendredi : 8h-18h
      if (h.dayOfWeek >= 1 && h.dayOfWeek <= 5) {
        return { ...h, openTime: "08:00", closeTime: "18:00", isClosed: false };
      }
      // Samedi : 8h-12h
      if (h.dayOfWeek === 6) {
        return { ...h, openTime: "08:00", closeTime: "12:00", isClosed: false };
      }
      // Dimanche : fermé
      return { ...h, openTime: null, closeTime: null, isClosed: true };
    });
    onChange({ hours: newHours });
  };

  const set24h7j = () => {
    const newHours = data.hours.map((h) => ({
      ...h,
      openTime: "00:00",
      closeTime: "23:59",
      isClosed: false,
    }));
    onChange({ hours: newHours });
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Horaires d'ouverture
        </h2>
        <p className="text-neutral-600">
          Indiquez vos horaires d'ouverture pour que les patients sachent quand vous joindre.
        </p>
      </div>

      {/* Raccourcis */}
      <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
        <p className="text-sm font-medium text-primary-900 mb-3">
          Raccourcis :
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={setWeekdayHours}
            className="bg-white"
          >
            <Sun className="w-4 h-4 mr-2" />
            Horaires bureau classiques
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={set24h7j}
            className="bg-white"
          >
            <Moon className="w-4 h-4 mr-2" />
            24h/24 - 7j/7
          </Button>
        </div>
      </div>

      {/* Grille des horaires */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="p-4 bg-neutral-50 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-neutral-900">
              Horaires par jour
            </h3>
          </div>
        </div>

        <div className="divide-y divide-neutral-100">
          {DAYS_ORDER.map((dayOfWeek) => {
            const hour = data.hours.find((h) => h.dayOfWeek === dayOfWeek);
            if (!hour) return null;

            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            return (
              <div
                key={dayOfWeek}
                className={`p-4 ${isWeekend ? "bg-neutral-50" : ""}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Jour */}
                  <div className="w-32 shrink-0">
                    <p className="font-medium text-neutral-900">
                      {ONBOARDING_DAY_LABELS[dayOfWeek]}
                    </p>
                  </div>

                  {/* Toggle fermé */}
                  <label className="flex items-center gap-2 cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={hour.isClosed}
                      onChange={(e) =>
                        updateHour(dayOfWeek, {
                          isClosed: e.target.checked,
                          openTime: e.target.checked ? null : "08:00",
                          closeTime: e.target.checked ? null : "18:00",
                        })
                      }
                      className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-600">Fermé</span>
                  </label>

                  {/* Horaires */}
                  {!hour.isClosed && (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={hour.openTime || "08:00"}
                        onChange={(e) =>
                          updateHour(dayOfWeek, { openTime: e.target.value })
                        }
                        className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <span className="text-neutral-400">à</span>
                      <input
                        type="time"
                        value={hour.closeTime || "18:00"}
                        onChange={(e) =>
                          updateHour(dayOfWeek, { closeTime: e.target.value })
                        }
                        className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />

                      {/* Bouton copier */}
                      <button
                        type="button"
                        onClick={() => copyToAll(dayOfWeek)}
                        className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Appliquer à tous les jours"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {hour.isClosed && (
                    <span className="text-sm text-neutral-500 italic">
                      Non disponible
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {errors.hours && (
        <p className="text-sm text-danger-600">{errors.hours}</p>
      )}

      {/* Note */}
      <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
        <p className="text-sm text-neutral-600">
          <strong>Note :</strong> Ces horaires indiquent quand vous êtes joignable
          pour les réservations. Les transports peuvent être effectués en dehors
          de ces horaires selon vos disponibilités.
        </p>
      </div>
    </div>
  );
}
