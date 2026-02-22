"use client";

import { useState } from "react";
import { CalendarOff, Plus, Trash2, Loader2 } from "lucide-react";
import { CompanyTimeOff } from "@/lib/types";
import { Card, CardHeader, CardContent, useToast } from "@/components/ui";

interface CompanyTimeOffCardProps {
  timeOffs: CompanyTimeOff[];
  isOwner: boolean;
  onUpdate: () => Promise<void>;
}

export function CompanyTimeOffCard({ timeOffs, isOwner, onUpdate }: CompanyTimeOffCardProps) {
  const toast = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/companies/me/time-off", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, startDate, endDate }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de l'ajout");
      }

      toast.success("Congé ajouté avec succès");
      setIsAdding(false);
      setTitle("");
      setStartDate("");
      setEndDate("");
      await onUpdate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce congé ?")) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/companies/me/time-off/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la suppression");
      }

      toast.success("Congé supprimé");
      await onUpdate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setDeletingId(null);
    }
  };

  // Séparer les congés passés, en cours et futurs
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const categorizedTimeOffs = timeOffs.reduce(
    (acc, timeOff) => {
      const start = new Date(timeOff.startDate);
      const end = new Date(timeOff.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      if (end < now) {
        acc.past.push(timeOff);
      } else if (start <= now && end >= now) {
        acc.current.push(timeOff);
      } else {
        acc.upcoming.push(timeOff);
      }
      return acc;
    },
    { past: [] as CompanyTimeOff[], current: [] as CompanyTimeOff[], upcoming: [] as CompanyTimeOff[] }
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Si même jour
    if (startDate.toDateString() === endDate.toDateString()) {
      return formatDate(start);
    }

    // Si même mois et année
    if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
      return `${startDate.getDate()} - ${endDate.getDate()} ${endDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`;
    }

    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  return (
    <Card>
      <CardHeader
        icon={CalendarOff}
        title="Congés et fermetures"
        action={
          isOwner && !isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </button>
          )
        }
      />
      <CardContent>
        {/* Formulaire d'ajout */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-neutral-50 rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Titre
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Vacances d'été, Jour férié..."
                className="w-full px-3 py-2 border border-input-border rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Date de début
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={today}
                  className="w-full px-3 py-2 border border-input-border rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || today}
                  className="w-full px-3 py-2 border border-input-border rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setTitle("");
                  setStartDate("");
                  setEndDate("");
                }}
                className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                disabled={saving}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Ajouter
              </button>
            </div>
          </form>
        )}

        {/* Liste des congés */}
        <div className="space-y-4">
          {/* Congés en cours */}
          {categorizedTimeOffs.current.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-neutral-500 mb-2">En cours</h4>
              <div className="space-y-2">
                {categorizedTimeOffs.current.map((timeOff) => (
                  <TimeOffItem
                    key={timeOff.id}
                    timeOff={timeOff}
                    formatDateRange={formatDateRange}
                    isOwner={isOwner}
                    onDelete={handleDelete}
                    deleting={deletingId === timeOff.id}
                    variant="current"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Congés à venir */}
          {categorizedTimeOffs.upcoming.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-neutral-500 mb-2">À venir</h4>
              <div className="space-y-2">
                {categorizedTimeOffs.upcoming.map((timeOff) => (
                  <TimeOffItem
                    key={timeOff.id}
                    timeOff={timeOff}
                    formatDateRange={formatDateRange}
                    isOwner={isOwner}
                    onDelete={handleDelete}
                    deleting={deletingId === timeOff.id}
                    variant="upcoming"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Congés passés */}
          {categorizedTimeOffs.past.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-neutral-500 mb-2">Passés</h4>
              <div className="space-y-2">
                {categorizedTimeOffs.past.map((timeOff) => (
                  <TimeOffItem
                    key={timeOff.id}
                    timeOff={timeOff}
                    formatDateRange={formatDateRange}
                    isOwner={isOwner}
                    onDelete={handleDelete}
                    deleting={deletingId === timeOff.id}
                    variant="past"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {timeOffs.length === 0 && !isAdding && (
            <div className="text-center py-8 text-neutral-500">
              <CalendarOff className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
              <p>Aucun congé programmé</p>
              {isOwner && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Ajouter un congé
                </button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface TimeOffItemProps {
  timeOff: CompanyTimeOff;
  formatDateRange: (start: string, end: string) => string;
  isOwner: boolean;
  onDelete: (id: string) => void;
  deleting: boolean;
  variant: "current" | "upcoming" | "past";
}

function TimeOffItem({ timeOff, formatDateRange, isOwner, onDelete, deleting, variant }: TimeOffItemProps) {
  const variantStyles = {
    current: "bg-warning-50 border-warning-200",
    upcoming: "bg-white border-neutral-200",
    past: "bg-neutral-50 border-neutral-200 opacity-60",
  };

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border ${variantStyles[variant]}`}
    >
      <div className="flex items-center gap-3">
        {variant === "current" && (
          <span className="px-2 py-0.5 text-xs font-medium bg-warning-100 text-warning-700 rounded-full">
            En cours
          </span>
        )}
        <div>
          <p className="font-medium text-neutral-900">{timeOff.title}</p>
          <p className="text-sm text-neutral-500">
            {formatDateRange(timeOff.startDate, timeOff.endDate)}
          </p>
        </div>
      </div>
      {isOwner && variant !== "past" && (
        <button
          onClick={() => onDelete(timeOff.id)}
          disabled={deleting}
          className="p-2 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors disabled:opacity-50"
          title="Supprimer"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
}
