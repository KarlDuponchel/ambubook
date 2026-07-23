"use client";

import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  Clock,
  Bell,
  UserPlus,
  Paperclip,
  X,
} from "lucide-react";

interface NotificationItemProps {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  status: "UNREAD" | "READ" | "ARCHIVED";
  createdAt: string;
  onMarkAsRead: (id: string) => void;
  onArchive: (id: string) => void;
}

// Icône et couleur (token éditorial) selon le type
function getTypeStyles(type: string): { icon: typeof Bell; color: string } {
  switch (type) {
    case "TRANSPORT_ACCEPTED":
      return { icon: CheckCircle, color: "var(--vert)" };
    case "TRANSPORT_REFUSED":
      return { icon: XCircle, color: "var(--rouge)" };
    case "TRANSPORT_COUNTER_PROPOSAL":
      return { icon: MessageSquare, color: "var(--violet)" };
    case "TRANSPORT_NEW_REQUEST":
      return { icon: Bell, color: "var(--brand)" };
    case "TRANSPORT_REMINDER":
      return { icon: Clock, color: "var(--ambre)" };
    case "TRANSPORT_CUSTOMER_RESPONSE":
      return { icon: MessageSquare, color: "var(--brand)" };
    case "TRANSPORT_ATTACHMENT_ADDED":
      return { icon: Paperclip, color: "var(--neutre)" };
    case "WELCOME_CUSTOMER":
    case "WELCOME_AMBULANCIER":
      return { icon: UserPlus, color: "var(--vert)" };
    case "ACCOUNT_ACTIVATED":
      return { icon: CheckCircle, color: "var(--vert)" };
    default:
      return { icon: Bell, color: "var(--neutre)" };
  }
}

// Temps relatif
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export function NotificationItem({
  id,
  type,
  title,
  message,
  link,
  status,
  createdAt,
  onMarkAsRead,
  onArchive,
}: NotificationItemProps) {
  const router = useRouter();
  const { icon: Icon, color } = getTypeStyles(type);
  const isUnread = status === "UNREAD";

  const handleClick = () => {
    if (isUnread) {
      onMarkAsRead(id);
    }
    if (link) {
      router.push(link);
    }
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    onArchive(id);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        group relative flex items-start gap-3 p-3 cursor-pointer
        hover:bg-surface-2 transition-colors
        ${isUnread ? "bg-brand/5" : ""}
      `}
    >
      {/* Indicateur non-lu */}
      {isUnread && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand rounded-r" />
      )}

      {/* Icône */}
      <div
        className="flex-shrink-0 grid place-items-center w-9 h-9 rounded-full"
        style={{ background: `color-mix(in srgb, ${color} 14%, var(--surface))`, color }}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${isUnread ? "font-bold text-ink" : "text-ink-2"}`}>
          {title}
        </p>
        <p className="text-sm text-ink-3 line-clamp-2 mt-0.5">
          {message}
        </p>
        <p className="text-xs text-ink-3 mt-1">
          {getRelativeTime(createdAt)}
        </p>
      </div>

      {/* Bouton supprimer (hover) */}
      <button
        onClick={handleArchive}
        className="
          flex-shrink-0 p-1.5 rounded-full
          opacity-0 group-hover:opacity-100
          hover:bg-surface-3 transition-all
        "
        aria-label="Supprimer"
      >
        <X className="h-4 w-4 text-ink-3" />
      </button>
    </div>
  );
}
