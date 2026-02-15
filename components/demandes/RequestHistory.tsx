"use client";

import { useState } from "react";
import {
  History,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Paperclip,
  Plus,
  Send,
  User,
  Building2,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui";
import type {
  RequestHistoryEntry,
  HistoryEventType,
  RequestStatus,
  UserRole,
} from "@/lib/types";

interface RequestHistoryProps {
  requestId: string;
  history: RequestHistoryEntry[];
  onNoteAdded?: (entry: RequestHistoryEntry) => void;
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
  PENDING: "text-warning-600",
  ACCEPTED: "text-success-600",
  REFUSED: "text-danger-600",
  COUNTER_PROPOSAL: "text-accent-600",
  CANCELLED: "text-neutral-500",
  COMPLETED: "text-primary-600",
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
      return "text-primary-600";
    case "NOTE_ADDED":
      return "text-neutral-600";
    case "ATTACHMENT_ADDED":
      return "text-accent-600";
    default:
      return "text-neutral-600";
  }
}

export function RequestHistory({ requestId, history, onNoteAdded }: RequestHistoryProps) {
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
      }
    } catch (error) {
      console.error("Erreur ajout note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader
        icon={History}
        title="Historique"
        action={
          <button
            onClick={() => setShowAddNote(!showAddNote)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Note
          </button>
        }
      />
      <CardContent noPadding>
        {/* Formulaire d'ajout de note */}
        {showAddNote && (
          <div className="p-4 border-b border-card-border bg-neutral-50">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Ajouter une note..."
              className="w-full px-3 py-2 border border-input-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none h-20 text-sm"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => {
                  setShowAddNote(false);
                  setNoteText("");
                }}
                className="px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAddNote}
                disabled={!noteText.trim() || isSubmitting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
                {isSubmitting ? "..." : "Envoyer"}
              </button>
            </div>
          </div>
        )}

        {/* Liste des événements */}
        {history.length === 0 ? (
          <div className="p-6 text-center text-neutral-500 text-sm">
            Aucun historique disponible
          </div>
        ) : (
          <div className="divide-y divide-card-border">
            {history.map((entry) => {
              const EventIcon = EVENT_ICONS[entry.eventType];
              const color = getEventColor(entry);

              return (
                <div key={entry.id} className="p-4 hover:bg-neutral-50 transition-colors">
                  <div className="flex gap-3">
                    {/* Icône */}
                    <div className={`shrink-0 p-2 rounded-full bg-neutral-100 ${color}`}>
                      <EventIcon className="h-4 w-4" />
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm ${color}`}>
                        {getEventDescription(entry)}
                      </p>

                      {entry.comment && (
                        <p className="mt-1 text-sm text-neutral-700 whitespace-pre-wrap">
                          {entry.comment}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                        <span>{formatDateTime(entry.createdAt)}</span>
                        {entry.user && (
                          <span className="flex items-center gap-1">
                            {entry.user.role === "AMBULANCIER" ? (
                              <Building2 className="h-3 w-3" />
                            ) : (
                              <User className="h-3 w-3" />
                            )}
                            {entry.user.name}
                            <span className="text-neutral-400">
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
      </CardContent>
    </Card>
  );
}
