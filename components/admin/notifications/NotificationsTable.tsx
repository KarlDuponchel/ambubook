"use client";

import { Eye, Mail, MessageSquare, Bell, Send, XCircle, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AdminNotificationLog,
  NotificationChannel,
  NotificationStatus,
  NOTIFICATION_CHANNEL_LABELS,
  NOTIFICATION_STATUS_LABELS,
} from "@/lib/types";

interface NotificationsTableProps {
  logs: AdminNotificationLog[];
  onViewDetails: (log: AdminNotificationLog) => void;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getChannelIcon(channel: NotificationChannel) {
  switch (channel) {
    case "EMAIL":
      return Mail;
    case "SMS":
      return MessageSquare;
    case "INAPP":
      return Bell;
  }
}

function getChannelColor(channel: NotificationChannel) {
  switch (channel) {
    case "EMAIL":
      return "bg-blue-100 text-blue-700";
    case "SMS":
      return "bg-purple-100 text-purple-700";
    case "INAPP":
      return "bg-neutral-100 text-neutral-700";
  }
}

function getStatusIcon(status: NotificationStatus) {
  switch (status) {
    case "SENT":
      return Send;
    case "FAILED":
      return XCircle;
    case "PENDING":
      return Clock;
    case "BOUNCED":
      return AlertTriangle;
  }
}

function getStatusStyles(status: NotificationStatus) {
  switch (status) {
    case "SENT":
      return "bg-green-100 text-green-700";
    case "FAILED":
      return "bg-red-100 text-red-700";
    case "PENDING":
      return "bg-amber-100 text-amber-700";
    case "BOUNCED":
      return "bg-orange-100 text-orange-700";
  }
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    TRANSPORT_REQUEST_CREATED: "Demande créée",
    TRANSPORT_ACCEPTED: "Transport accepté",
    TRANSPORT_REFUSED: "Transport refusé",
    TRANSPORT_COUNTER_PROPOSAL: "Contre-proposition",
    TRANSPORT_CUSTOMER_RESPONSE: "Réponse client",
    TRANSPORT_REMINDER: "Rappel transport",
    TRANSPORT_NEW_REQUEST: "Nouvelle demande",
    TRANSPORT_ATTACHMENT_ADDED: "Pièce jointe",
    WELCOME_CUSTOMER: "Bienvenue client",
    WELCOME_AMBULANCIER: "Bienvenue ambulancier",
    ACCOUNT_ACTIVATED: "Compte activé",
    ADMIN_NEW_SIGNUP: "Nouvelle inscription",
    VERIFICATION_CODE: "Code vérification",
    PASSWORD_RESET_REQUEST: "Reset mot de passe",
  };
  return labels[type] || type;
}

export function NotificationsTable({ logs, onViewDetails }: NotificationsTableProps) {
  if (logs.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
        <p className="text-neutral-500">Aucune notification trouvée</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Date
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Canal
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Type
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Destinataire
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider hidden sm:table-cell">
                Statut
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {logs.map((log) => {
              const ChannelIcon = getChannelIcon(log.channel);
              const StatusIcon = getStatusIcon(log.status);

              return (
                <tr
                  key={log.id}
                  className="hover:bg-neutral-50 transition-colors"
                >
                  {/* Date */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-neutral-500">
                      {formatDate(log.sentAt)}
                    </span>
                  </td>

                  {/* Canal */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
                        getChannelColor(log.channel)
                      )}
                    >
                      <ChannelIcon className="h-3 w-3" />
                      {NOTIFICATION_CHANNEL_LABELS[log.channel]}
                    </span>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-neutral-700">
                      {getTypeLabel(log.type)}
                    </span>
                  </td>

                  {/* Destinataire */}
                  <td className="px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm text-neutral-900 truncate max-w-[200px]">
                        {log.recipient}
                      </p>
                      {log.user && (
                        <p className="text-xs text-neutral-500 truncate">
                          {log.user.name}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Statut */}
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
                        getStatusStyles(log.status)
                      )}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {NOTIFICATION_STATUS_LABELS[log.status]}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onViewDetails(log)}
                      className="p-1.5 rounded text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                      title="Voir détails"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
