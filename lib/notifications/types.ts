/**
 * Types pour le système de notifications unifié
 */

// Types de notifications disponibles
export type NotificationType =
  // Transport - Client
  | "TRANSPORT_REQUEST_CREATED" // Confirmation création demande
  | "TRANSPORT_ACCEPTED" // Demande acceptée
  | "TRANSPORT_REFUSED" // Demande refusée
  | "TRANSPORT_COUNTER_PROPOSAL" // Contre-proposition reçue
  | "TRANSPORT_REMINDER" // Rappel J-1

  // Transport - Ambulancier
  | "TRANSPORT_NEW_REQUEST" // Nouvelle demande reçue
  | "TRANSPORT_CUSTOMER_RESPONSE" // Réponse du client à contre-proposition
  | "TRANSPORT_ATTACHMENT_ADDED" // Nouvelle pièce jointe

  // Compte
  | "WELCOME_CUSTOMER" // Bienvenue nouveau client
  | "WELCOME_AMBULANCIER" // Bienvenue nouvel ambulancier
  | "ACCOUNT_ACTIVATED" // Compte activé (ambulancier)

  // Admin
  | "ADMIN_NEW_SIGNUP" // Nouvelle inscription en attente

  // Système
  | "VERIFICATION_CODE"; // Code de vérification

// Canaux de notification
export type NotificationChannel = "email" | "sms";

// Destinataire d'une notification
export interface NotificationRecipient {
  email?: string;
  phone?: string;
  userId?: string;
  name?: string;
}

// Payload d'une notification
export interface NotificationPayload {
  type: NotificationType;
  recipient: NotificationRecipient;
  channels: NotificationChannel[];
  data: Record<string, unknown>;
  // Optionnel : forcer l'envoi même si l'utilisateur a désactivé
  force?: boolean;
}

// Résultat d'envoi
export interface NotificationResult {
  channel: NotificationChannel;
  success: boolean;
  messageId?: string;
  error?: string;
}

// Résultat global d'une notification multi-canal
export interface SendNotificationResult {
  success: boolean;
  results: NotificationResult[];
}

// Configuration pour chaque type de notification
export interface NotificationConfig {
  type: NotificationType;
  // Template email
  emailSubject?: (data: Record<string, unknown>) => string;
  emailHtml?: (data: Record<string, unknown>) => string;
  emailText?: (data: Record<string, unknown>) => string;
  // Template SMS
  smsMessage?: (data: Record<string, unknown>) => string;
}

// Labels français pour les types de notifications (pour l'admin)
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  TRANSPORT_REQUEST_CREATED: "Confirmation de demande",
  TRANSPORT_ACCEPTED: "Transport accepté",
  TRANSPORT_REFUSED: "Transport refusé",
  TRANSPORT_COUNTER_PROPOSAL: "Contre-proposition",
  TRANSPORT_REMINDER: "Rappel de transport",
  TRANSPORT_NEW_REQUEST: "Nouvelle demande",
  TRANSPORT_CUSTOMER_RESPONSE: "Réponse client",
  TRANSPORT_ATTACHMENT_ADDED: "Pièce jointe ajoutée",
  WELCOME_CUSTOMER: "Bienvenue client",
  WELCOME_AMBULANCIER: "Bienvenue ambulancier",
  ACCOUNT_ACTIVATED: "Compte activé",
  ADMIN_NEW_SIGNUP: "Nouvelle inscription",
  VERIFICATION_CODE: "Code de vérification",
};

// Labels français pour les canaux
export const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  email: "Email",
  sms: "SMS",
};

// Labels français pour les statuts
export const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  SENT: "Envoyé",
  FAILED: "Échec",
  BOUNCED: "Rejeté",
};
