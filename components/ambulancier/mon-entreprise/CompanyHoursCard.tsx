"use client";

import { useState } from "react";
import { Clock, Save, X, Pencil } from "lucide-react";
import { CompanyHour, DAY_LABELS } from "@/lib/types";
import { Card, CardHeader, CardContent } from "@/components/ui";

interface CompanyHoursCardProps {
  hours: CompanyHour[];
  isOwner: boolean;
  onUpdate: (hours: CompanyHour[]) => Promise<void>;
}

// Horaires par défaut si non définis
const defaultHours: Omit<CompanyHour, "id">[] = [
  { dayOfWeek: 0, openTime: null, closeTime: null, isClosed: true },
  { dayOfWeek: 1, openTime: "08:00", closeTime: "18:00", isClosed: false },
  { dayOfWeek: 2, openTime: "08:00", closeTime: "18:00", isClosed: false },
  { dayOfWeek: 3, openTime: "08:00", closeTime: "18:00", isClosed: false },
  { dayOfWeek: 4, openTime: "08:00", closeTime: "18:00", isClosed: false },
  { dayOfWeek: 5, openTime: "08:00", closeTime: "18:00", isClosed: false },
  { dayOfWeek: 6, openTime: "08:00", closeTime: "12:00", isClosed: false },
];

export function CompanyHoursCard({ hours, isOwner, onUpdate }: CompanyHoursCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fusionner les horaires existants avec les valeurs par défaut
  const getInitialHours = () => {
    if (hours.length === 7) return hours;
    return defaultHours.map((dh) => {
      const existing = hours.find((h) => h.dayOfWeek === dh.dayOfWeek);
      return existing || { ...dh, id: `temp-${dh.dayOfWeek}` };
    });
  };

  const [formData, setFormData] = useState<CompanyHour[]>(getInitialHours());

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(formData);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(getInitialHours());
    setIsEditing(false);
  };

  const updateHour = (dayOfWeek: number, field: keyof CompanyHour, value: string | boolean) => {
    setFormData((prev) =>
      prev.map((h) => {
        if (h.dayOfWeek === dayOfWeek) {
          const updated = { ...h, [field]: value };
          // Si on coche "Fermé", on vide les horaires
          if (field === "isClosed" && value === true) {
            updated.openTime = null;
            updated.closeTime = null;
          }
          return updated;
        }
        return h;
      })
    );
  };

  // Trier les horaires par jour (Lundi en premier, Dimanche en dernier)
  const sortedHours = [...formData].sort((a, b) => {
    // Transformer 0 (Dimanche) en 7 pour le tri
    const dayA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
    const dayB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
    return dayA - dayB;
  });

  return (
    <Card>
      <CardHeader
        icon={Clock}
        title="Horaires d'ouverture"
        action={
          isOwner && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Pencil className="h-4 w-4" />
              Modifier
            </button>
          )
        }
      />
      <CardContent>
        <div className="space-y-3">
          {sortedHours.map((hour) => (
            <div
              key={hour.dayOfWeek}
              className={`flex items-center gap-4 p-3 rounded-lg ${
                hour.isClosed ? "bg-neutral-50" : "bg-white"
              }`}
            >
              {/* Jour */}
              <div className="w-24 font-medium text-neutral-900">
                {DAY_LABELS[hour.dayOfWeek]}
              </div>

              {isEditing ? (
                <>
                  {/* Checkbox Fermé */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hour.isClosed}
                      onChange={(e) => updateHour(hour.dayOfWeek, "isClosed", e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-600">Fermé</span>
                  </label>

                  {/* Horaires */}
                  {!hour.isClosed && (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={hour.openTime || ""}
                        onChange={(e) => updateHour(hour.dayOfWeek, "openTime", e.target.value)}
                        className="px-3 py-1.5 border border-input-border rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="text-neutral-400">-</span>
                      <input
                        type="time"
                        value={hour.closeTime || ""}
                        onChange={(e) => updateHour(hour.dayOfWeek, "closeTime", e.target.value)}
                        className="px-3 py-1.5 border border-input-border rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1">
                  {hour.isClosed ? (
                    <span className="text-neutral-500">Fermé</span>
                  ) : hour.openTime && hour.closeTime ? (
                    <span className="text-neutral-700">
                      {hour.openTime} - {hour.closeTime}
                    </span>
                  ) : (
                    <span className="text-neutral-400 italic">Non défini</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>

      {isEditing && (
        <div className="px-6 py-4 border-t border-card-border flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      )}
    </Card>
  );
}
