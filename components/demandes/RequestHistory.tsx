"use client";

import { useState } from "react";
import {
  History,
  Clock,
  AlertCircle,
  MessageSquare,
  Paperclip,
  Plus,
  Send,
  User,
  Building2,
} from "lucide-react";
import { useToast } from "@/components/ui";
import type {
  RequestHistoryEntry,
  HistoryEventType,
  RequestStatus,
  UserRole,
} from "@/lib/types";

interface RequestHistoryProps {
  requestId?: string;
  history: RequestHistoryEntry[];
  onNoteAdded?: (entry: RequestHistoryEntry) => void;
  /** Mode lecture seule (pas d'ajout de notes) */
  readOnly?: boolean;
}

const EVENT_ICONS: Record<HistoryEventType, React.ComponentType<{ className?: string }>> = {
  CREATED: Plus,
  STATUS_CHANGED: Clock,
  COUNTER_PROPOSAL: AlertCircle,
  CUSTOMER_RESPONSE: User,
  NOTE_ADDED: MessageSquare,
  ATTACHMENT_ADDED: Paperclip,
};

const STATUS_LABELS: Record<RequestStatus, string> = {
  PENDING: "En attente",
  ACCEPTED: "Acceptée",
  REFUSED: "Refusée",
  COUNTER_PROPOSAL: "Contre-proposition",
  CANCELLED: "Annulée",
  COMPLETED: "Terminée",
};

const STATUS_COLORS: Record<RequestStatus, string> = {
  PENDING: "text-ambre",
  ACCEPTED: "text-vert",
  REFUSED: "text-rouge",
  COUNTER_PROPOSAL: "text-violet",
  CANCELLED: "text-ink-3",
  COMPLETED: "text-brand",
};

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  AMBULANCIER: "Ambulancier",
  CUSTOMER: "Client",
};

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getEventDescription(entry: RequestHistoryEntry): string {
  switch (entry.eventType) {
    case "CREATED":
      return "Demande créée";
    case "STATUS_CHANGED":
      if (entry.previousStatus && entry.newStatus) {
        return `Statut modifié : ${STATUS_LABELS[entry.previousStatus]} → ${STATUS_LABELS[entry.newStatus]}`;
      }
      return "Statut modifié";
    case "COUNTER_PROPOSAL":
      if (entry.proposedDate && entry.proposedTime) {
        return `Contre-proposition : ${formatDate(entry.proposedDate)} à ${entry.proposedTime}`;
      }
      return "Contre-proposition envoyée";
    case "CUSTOMER_RESPONSE":
      return "Réponse du client";
    case "NOTE_ADDED":
      return "Note ajoutée";
    case "ATTACHMENT_ADDED":
      return "Pièce jointe ajoutée";
    default:
      return "Événement";
  }
}

function getEventColor(entry: RequestHistoryEntry): string {
  if (entry.newStatus) {
    return STATUS_COLORS[entry.newStatus];
  }
  switch (entry.eventType) {
    case "CREATED":
      return "text-brand";
    case "NOTE_ADDED":
      return "text-ink-2";
    case "ATTACHMENT_ADDED":
      return "text-violet";
    default:
      return "text-ink-2";
  }
}

export function RequestHistory({ requestId, history, onNoteAdded, readOnly = false }: RequestHistoryProps) {
  const toast = useToast();
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddNote = async () => {
    if (!noteText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/ambulancier/demandes/${requestId}/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: noteText }),
      });

      if (response.ok) {
        const newEntry = await response.json();
        onNoteAdded?.(newEntry);
        setNoteText("");
        setShowAddNote(false);
        toast.success("Note ajoutée");
      } else {
        toast.error("Erreur lors de l'ajout de la note");
      }
    } catch {
      toast.error("Erreur lors de l'ajout de la note");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface border border-line rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <div className="flex items-center gap-2.5">
          <History className="h-5 w-5 text-ink-3" />
          <h2 className="font-bold text-ink">Historique</h2>
        </div>
        {!readOnly && (
          <button
            onClick={() => setShowAddNote(!showAddNote)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-brand hover:bg-surface-2 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Note
          </button>
        )}
      </div>

      {/* Formulaire d'ajout de note */}
      {!readOnly && showAddNote && (
        <div className="p-4 border-b border-line bg-surface-2">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Ajouter une note..."
            className="w-full px-3 py-2 border border-line rounded-xl bg-surface text-ink text-sm placeholder:text-ink-3 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 resize-none h-20 transition-colors"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => {
                setShowAddNote(false);
                setNoteText("");
              }}
              className="px-3 py-1.5 text-sm font-semibold text-ink-2 hover:bg-surface-3 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleAddNote}
              disabled={!noteText.trim() || isSubmitting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold bg-brand text-white rounded-lg hover:bg-brand-ink disabled:opacity-50 transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              {isSubmitting ? "..." : "Envoyer"}
            </button>
          </div>
        </div>
      )}

      {/* Liste des événements */}
      {history.length === 0 ? (
        <div className="p-6 text-center text-ink-3 text-sm">
          Aucun historique disponible
        </div>
      ) : (
        <div className="divide-y divide-line">
          {history.map((entry) => {
            const EventIcon = EVENT_ICONS[entry.eventType];
            const color = getEventColor(entry);

            return (
              <div key={entry.id} className="p-4 hover:bg-surface-2 transition-colors">
                <div className="flex gap-3">
                  {/* Icône */}
                  <div className={`shrink-0 grid place-items-center w-9 h-9 rounded-full bg-surface-2 ${color}`}>
                    <EventIcon className="h-4 w-4" />
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm ${color}`}>
                      {getEventDescription(entry)}
                    </p>

                    {entry.comment && (
                      <p className="mt-1 text-sm text-ink-2 whitespace-pre-wrap">
                        {entry.comment}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-xs text-ink-3">
                      <span>{formatDateTime(entry.createdAt)}</span>
                      {entry.user && (
                        <span className="flex items-center gap-1">
                          {entry.user.role === "AMBULANCIER" ? (
                            <Building2 className="h-3 w-3" />
                          ) : (
                            <User className="h-3 w-3" />
                          )}
                          {entry.user.name}
                          <span className="text-ink-3">
                            ({ROLE_LABELS[entry.user.role]})
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
