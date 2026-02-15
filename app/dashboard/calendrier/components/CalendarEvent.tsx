"use client";

import Link from "next/link";
import { Clock, MapPin, Ambulance, Car } from "lucide-react";
import type { CalendarEvent as CalendarEventType, RequestStatus } from "@/lib/types";

type EventVariant = "compact" | "detailed" | "dot";

interface CalendarEventProps {
  event: CalendarEventType;
  variant?: EventVariant;
  showTime?: boolean;
}

const STATUS_STYLES: Record<RequestStatus, { bg: string; border: string; text: string; dot: string }> = {
  PENDING: {
    bg: "bg-warning-50",
    border: "border-l-warning-500",
    text: "text-warning-700",
    dot: "bg-warning-500",
  },
  ACCEPTED: {
    bg: "bg-success-50",
    border: "border-l-success-500",
    text: "text-success-700",
    dot: "bg-success-500",
  },
  REFUSED: {
    bg: "bg-danger-50",
    border: "border-l-danger-500",
    text: "text-danger-700",
    dot: "bg-danger-500",
  },
  COUNTER_PROPOSAL: {
    bg: "bg-accent-50",
    border: "border-l-accent-500",
    text: "text-accent-700",
    dot: "bg-accent-500",
  },
  CANCELLED: {
    bg: "bg-neutral-100",
    border: "border-l-neutral-400",
    text: "text-neutral-600",
    dot: "bg-neutral-400",
  },
  COMPLETED: {
    bg: "bg-primary-50",
    border: "border-l-primary-500",
    text: "text-primary-700",
    dot: "bg-primary-500",
  },
};

const STATUS_LABELS: Record<RequestStatus, string> = {
  PENDING: "En attente",
  ACCEPTED: "Acceptée",
  REFUSED: "Refusée",
  COUNTER_PROPOSAL: "Contre-proposition",
  CANCELLED: "Annulée",
  COMPLETED: "Terminée",
};

export function CalendarEvent({ event, variant = "compact", showTime = true }: CalendarEventProps) {
  const styles = STATUS_STYLES[event.status];
  const TransportIcon = event.transportType === "AMBULANCE" ? Ambulance : Car;

  // Variant: dot (pour la vue mois, juste un indicateur)
  if (variant === "dot") {
    return (
      <Link
        href={`/dashboard/demandes/${event.id}`}
        className={`block w-2 h-2 rounded-full ${styles.dot} hover:ring-2 hover:ring-offset-1 hover:ring-current transition-all`}
        title={`${event.time} - ${event.title}`}
      />
    );
  }

  // Variant: compact (pour timeline avec espace limité)
  if (variant === "compact") {
    return (
      <Link
        href={`/dashboard/demandes/${event.id}`}
        className={`block p-2 rounded-lg border-l-4 ${styles.bg} ${styles.border} hover:shadow-md transition-all duration-200`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {showTime && (
              <span className={`text-xs font-semibold ${styles.text}`}>
                {event.time}
              </span>
            )}
            <p className="text-sm font-medium text-neutral-900 truncate">
              {event.title}
            </p>
            <p className="text-xs text-neutral-500 truncate">
              {event.pickupCity} → {event.destinationCity}
            </p>
          </div>
          <TransportIcon className="h-4 w-4 text-neutral-400 shrink-0" />
        </div>
      </Link>
    );
  }

  // Variant: detailed (affichage complet)
  return (
    <Link
      href={`/dashboard/demandes/${event.id}`}
      className={`block p-4 rounded-xl border-l-4 ${styles.bg} ${styles.border} hover:shadow-lg transition-all duration-200`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {showTime && (
              <span className="flex items-center gap-1 text-sm font-semibold text-neutral-900">
                <Clock className="h-4 w-4" />
                {event.time}
              </span>
            )}
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles.bg} ${styles.text}`}>
              {STATUS_LABELS[event.status]}
            </span>
          </div>

          <p className="mt-2 text-base font-semibold text-neutral-900">
            {event.title}
          </p>

          <div className="mt-1 flex items-center gap-1 text-sm text-neutral-600">
            <MapPin className="h-4 w-4 text-neutral-400" />
            <span>{event.pickupCity}</span>
            <span className="text-neutral-400">→</span>
            <span>{event.destinationCity}</span>
          </div>

          <div className="mt-2 flex items-center gap-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/50 rounded text-xs text-neutral-600">
              <TransportIcon className="h-3 w-3" />
              {event.transportType}
            </span>
            {event.tripType === "ROUND_TRIP" && (
              <span className="text-xs text-neutral-500">Aller-retour</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Composant pour afficher plusieurs événements en liste
interface CalendarEventListProps {
  events: CalendarEventType[];
  variant?: EventVariant;
  maxDisplay?: number;
  showMore?: boolean;
}

export function CalendarEventList({
  events,
  variant = "compact",
  maxDisplay,
  showMore = true,
}: CalendarEventListProps) {
  const displayEvents = maxDisplay ? events.slice(0, maxDisplay) : events;
  const remaining = maxDisplay ? events.length - maxDisplay : 0;

  if (variant === "dot") {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {displayEvents.map((event) => (
          <CalendarEvent key={event.id} event={event} variant="dot" />
        ))}
        {showMore && remaining > 0 && (
          <span className="text-xs text-neutral-500 font-medium">
            +{remaining}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayEvents.map((event) => (
        <CalendarEvent key={event.id} event={event} variant={variant} />
      ))}
      {showMore && remaining > 0 && (
        <p className="text-xs text-neutral-500 text-center py-1">
          +{remaining} autre{remaining > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
