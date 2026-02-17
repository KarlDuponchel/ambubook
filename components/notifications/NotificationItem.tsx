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

// Icône et couleur selon le type
function getTypeStyles(type: string) {
  switch (type) {
    case "TRANSPORT_ACCEPTED":
      return {
        icon: CheckCircle,
        iconColor: "text-success-500",
        bgColor: "bg-success-50",
      };
    case "TRANSPORT_REFUSED":
      return {
        icon: XCircle,
        iconColor: "text-danger-500",
        bgColor: "bg-danger-50",
      };
    case "TRANSPORT_COUNTER_PROPOSAL":
      return {
        icon: MessageSquare,
        iconColor: "text-accent-500",
        bgColor: "bg-accent-50",
      };
    case "TRANSPORT_NEW_REQUEST":
      return {
        icon: Bell,
        iconColor: "text-primary-500",
        bgColor: "bg-primary-50",
      };
    case "TRANSPORT_REMINDER":
      return {
        icon: Clock,
        iconColor: "text-warning-500",
        bgColor: "bg-warning-50",
      };
    case "TRANSPORT_CUSTOMER_RESPONSE":
      return {
        icon: MessageSquare,
        iconColor: "text-primary-500",
        bgColor: "bg-primary-50",
      };
    case "TRANSPORT_ATTACHMENT_ADDED":
      return {
        icon: Paperclip,
        iconColor: "text-neutral-500",
        bgColor: "bg-neutral-100",
      };
    case "WELCOME_CUSTOMER":
    case "WELCOME_AMBULANCIER":
      return {
        icon: UserPlus,
        iconColor: "text-success-500",
        bgColor: "bg-success-50",
      };
    case "ACCOUNT_ACTIVATED":
      return {
        icon: CheckCircle,
        iconColor: "text-success-500",
        bgColor: "bg-success-50",
      };
    default:
      return {
        icon: Bell,
        iconColor: "text-neutral-500",
        bgColor: "bg-neutral-100",
      };
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
  const { icon: Icon, iconColor, bgColor } = getTypeStyles(type);
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
        hover:bg-neutral-50 transition-colors
        ${isUnread ? "bg-primary-50/30" : ""}
      `}
    >
      {/* Indicateur non-lu */}
      {isUnread && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-r" />
      )}

      {/* Icône */}
      <div className={`flex-shrink-0 p-2 rounded-full ${bgColor}`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${isUnread ? "font-semibold text-neutral-900" : "text-neutral-700"}`}>
          {title}
        </p>
        <p className="text-sm text-neutral-500 line-clamp-2 mt-0.5">
          {message}
        </p>
        <p className="text-xs text-neutral-400 mt-1">
          {getRelativeTime(createdAt)}
        </p>
      </div>

      {/* Bouton supprimer (hover) */}
      <button
        onClick={handleArchive}
        className="
          flex-shrink-0 p-1.5 rounded-full
          opacity-0 group-hover:opacity-100
          hover:bg-neutral-200 transition-all
        "
        aria-label="Supprimer"
      >
        <X className="h-4 w-4 text-neutral-400" />
      </button>
    </div>
  );
}
