"use client";

import {
  X,
  Mail,
  MessageSquare,
  Bell,
  Send,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  FileText,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AdminNotificationLog,
  NotificationChannel,
  NotificationStatus,
  NOTIFICATION_CHANNEL_LABELS,
  NOTIFICATION_STATUS_LABELS,
} from "@/lib/types";

interface NotificationDetailsModalProps {
  log: AdminNotificationLog;
  onClose: () => void;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
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

function formatErrorMsg(errorMsg: string | null): string {
  if (!errorMsg) return "";
  // Si c'est "[object Object]", c'était un objet mal sérialisé
  if (errorMsg === "[object Object]") {
    return "Erreur lors de l'envoi (détails non disponibles)";
  }
  // Essayer de parser si c'est du JSON
  try {
    const parsed = JSON.parse(errorMsg);
    if (typeof parsed === "object" && parsed !== null) {
      // Extraire le message d'erreur de l'objet
      return parsed.message || parsed.error || JSON.stringify(parsed, null, 2);
    }
    return String(parsed);
  } catch {
    // Ce n'est pas du JSON, retourner tel quel
    return errorMsg;
  }
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    TRANSPORT_REQUEST_CREATED: "Demande de transport créée",
    TRANSPORT_ACCEPTED: "Transport accepté",
    TRANSPORT_REFUSED: "Transport refusé",
    TRANSPORT_COUNTER_PROPOSAL: "Contre-proposition",
    TRANSPORT_CUSTOMER_RESPONSE: "Réponse du client",
    TRANSPORT_REMINDER: "Rappel de transport",
    TRANSPORT_NEW_REQUEST: "Nouvelle demande de transport",
    TRANSPORT_ATTACHMENT_ADDED: "Pièce jointe ajoutée",
    WELCOME_CUSTOMER: "Bienvenue nouveau client",
    WELCOME_AMBULANCIER: "Bienvenue nouvel ambulancier",
    ACCOUNT_ACTIVATED: "Compte activé",
    ADMIN_NEW_SIGNUP: "Nouvelle inscription admin",
    VERIFICATION_CODE: "Code de vérification",
    PASSWORD_RESET_REQUEST: "Réinitialisation mot de passe",
  };
  return labels[type] || type;
}

export function NotificationDetailsModal({ log, onClose }: NotificationDetailsModalProps) {
  const ChannelIcon = getChannelIcon(log.channel);
  const StatusIcon = getStatusIcon(log.status);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-4 py-3 border-b border-neutral-200">
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-neutral-900">
              Détails de la notification
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {/* Canal */}
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
                  getChannelColor(log.channel)
                )}
              >
                <ChannelIcon className="h-3 w-3" />
                {NOTIFICATION_CHANNEL_LABELS[log.channel]}
              </span>
              {/* Statut */}
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
                  getStatusStyles(log.status)
                )}
              >
                <StatusIcon className="h-3 w-3" />
                {NOTIFICATION_STATUS_LABELS[log.status]}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Type */}
          <div>
            <h3 className="text-sm font-medium text-neutral-900 mb-1">Type</h3>
            <p className="text-sm text-neutral-700">{getTypeLabel(log.type)}</p>
          </div>

          {/* Destinataire */}
          <div>
            <h3 className="text-sm font-medium text-neutral-900 mb-1">Destinataire</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-700">{log.recipient}</span>
              {log.user && (
                <span className="text-xs text-neutral-500">({log.user.name})</span>
              )}
            </div>
          </div>

          {/* Sujet (pour emails) */}
          {log.subject && (
            <div>
              <h3 className="text-sm font-medium text-neutral-900 mb-1">Sujet</h3>
              <p className="text-sm text-neutral-700">{log.subject}</p>
            </div>
          )}

          {/* Contenu */}
          {log.content && (
            <div>
              <h3 className="text-sm font-medium text-neutral-900 mb-1">Contenu</h3>
              <div className="bg-neutral-50 p-3 rounded-lg">
                {log.channel === "EMAIL" ? (
                  <div
                    className="text-sm text-neutral-700 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: log.content }}
                  />
                ) : (
                  <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                    {log.content}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Erreur si échec */}
          {log.errorMsg && (
            <div>
              <h3 className="text-sm font-medium text-red-700 mb-1 flex items-center gap-1">
                <XCircle className="h-4 w-4" />
                Erreur
              </h3>
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg font-mono whitespace-pre-wrap">
                {formatErrorMsg(log.errorMsg)}
              </p>
            </div>
          )}

          {/* Métadonnées */}
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-neutral-900 mb-1">Métadonnées</h3>
              <div className="bg-neutral-50 p-3 rounded-lg">
                <pre className="text-xs text-neutral-700 overflow-x-auto">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Utilisateur lié */}
          {log.user && (
            <div>
              <h3 className="text-sm font-medium text-neutral-900 mb-1">Utilisateur</h3>
              <div className="flex items-center gap-3 bg-neutral-50 p-3 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-neutral-900 flex items-center justify-center text-white font-bold">
                  {log.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-neutral-900">{log.user.name}</p>
                  <p className="text-xs text-neutral-500">{log.user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Date d'envoi */}
          <div>
            <h3 className="text-sm font-medium text-neutral-900 mb-1">Date d&apos;envoi</h3>
            <div className="flex items-center gap-2 text-sm text-neutral-700">
              <Calendar className="h-4 w-4 text-neutral-400" />
              {formatDate(log.sentAt)}
            </div>
          </div>

          {/* ID */}
          <div className="pt-4 border-t border-neutral-100">
            <p className="text-xs text-neutral-400">ID: {log.id}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-neutral-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-neutral-100 text-neutral-700 rounded-md hover:bg-neutral-200 transition-colors font-medium text-sm"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
