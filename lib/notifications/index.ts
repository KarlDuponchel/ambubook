/**
 * Service de notifications unifié
 * Orchestrateur pour l'envoi d'emails et SMS avec logging
 * Respecte les préférences utilisateur
 */

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { sendSMS, formatPhoneNumber, isValidPhoneNumber } from "@/lib/sms";
import {
  NotificationPayload,
  NotificationResult,
  SendNotificationResult,
  NotificationType,
  NotificationChannel,
} from "./types";
import { getNotificationTemplates } from "./templates";
import { createInAppNotification } from "./inapp";

// Re-export types
export * from "./types";

// Types de notifications liés aux transports (updates)
const TRANSPORT_UPDATE_TYPES: NotificationType[] = [
  "TRANSPORT_REQUEST_CREATED",
  "TRANSPORT_ACCEPTED",
  "TRANSPORT_REFUSED",
  "TRANSPORT_COUNTER_PROPOSAL",
  "TRANSPORT_COMPLETED",
  "TRANSPORT_NEW_REQUEST",
  "TRANSPORT_CUSTOMER_RESPONSE",
  "TRANSPORT_ATTACHMENT_ADDED",
];

// Types de notifications liés aux rappels
const REMINDER_TYPES: NotificationType[] = ["TRANSPORT_REMINDER"];

/**
 * Récupère les préférences de notification d'un utilisateur
 */
async function getUserNotificationPreferences(userId: string | undefined) {
  if (!userId) {
    // Pas d'utilisateur connecté = préférences par défaut (tout activé)
    return {
      emailEnabled: true,
      smsEnabled: true,
      inappEnabled: true,
      transportUpdates: true,
      transportReminders: true,
      marketing: false,
    };
  }

  const preferences = await prisma.notificationPreferences.findUnique({
    where: { userId },
  });

  // Si pas de préférences enregistrées, valeurs par défaut
  return (
    preferences || {
      emailEnabled: true,
      smsEnabled: true,
      inappEnabled: true,
      transportUpdates: true,
      transportReminders: true,
      marketing: false,
    }
  );
}

/**
 * Vérifie si une notification doit être envoyée selon les préférences
 */
function shouldSendNotification(
  type: NotificationType,
  channel: NotificationChannel,
  preferences: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    inappEnabled: boolean;
    transportUpdates: boolean;
    transportReminders: boolean;
    marketing: boolean;
  }
): boolean {
  // Vérifier le canal
  if (channel === "email" && !preferences.emailEnabled) {
    return false;
  }
  if (channel === "sms" && !preferences.smsEnabled) {
    return false;
  }
  if (channel === "inapp" && !preferences.inappEnabled) {
    return false;
  }

  // Vérifier le type de notification
  if (TRANSPORT_UPDATE_TYPES.includes(type) && !preferences.transportUpdates) {
    return false;
  }
  if (REMINDER_TYPES.includes(type) && !preferences.transportReminders) {
    return false;
  }

  // Les notifications de bienvenue et compte sont toujours envoyées
  // (WELCOME_CUSTOMER, WELCOME_AMBULANCIER, ACCOUNT_ACTIVATED, VERIFICATION_CODE)

  return true;
}

/**
 * Envoie une notification multi-canal avec logging
 * Respecte les préférences utilisateur
 */
export async function sendNotification(
  payload: NotificationPayload
): Promise<SendNotificationResult> {
  const { type, recipient, channels, data, force } = payload;
  const results: NotificationResult[] = [];

  // Récupérer les préférences utilisateur
  const preferences = await getUserNotificationPreferences(recipient.userId);

  // Récupérer les templates pour ce type de notification
  const templates = getNotificationTemplates(type, data);

  // Envoyer sur chaque canal demandé
  for (const channel of channels) {
    let result: NotificationResult;

    // Vérifier si l'utilisateur accepte ce type de notification sur ce canal
    // Sauf si force=true (notifications critiques comme VERIFICATION_CODE)
    if (!force && !shouldSendNotification(type, channel, preferences)) {
      result = {
        channel,
        success: false,
        error: `Notification désactivée par l'utilisateur`,
      };
      results.push(result);
      continue;
    }

    if (channel === "email" && recipient.email) {
      result = await sendEmailNotification(
        type,
        recipient.email,
        recipient.userId,
        templates.emailSubject,
        templates.emailHtml,
        templates.emailText,
        data
      );
    } else if (channel === "sms" && recipient.phone) {
      result = await sendSMSNotification(
        type,
        recipient.phone,
        recipient.userId,
        templates.smsMessage,
        data
      );
    } else if (channel === "inapp" && recipient.userId) {
      result = await sendInAppNotification(type, recipient.userId, data);
    } else {
      // Canal demandé mais infos manquantes
      result = {
        channel,
        success: false,
        error: `Information manquante pour le canal ${channel}`,
      };
    }

    results.push(result);
  }

  return {
    success: results.some((r) => r.success),
    results,
  };
}

/**
 * Envoie un email et log le résultat
 */
async function sendEmailNotification(
  type: NotificationType,
  email: string,
  userId: string | undefined,
  subject: string,
  html: string,
  text: string | undefined,
  metadata: Record<string, unknown>
): Promise<NotificationResult> {
  // Créer le log en status PENDING
  const log = await prisma.notificationLog.create({
    data: {
      channel: "EMAIL",
      type,
      recipient: email,
      subject,
      content: text || html.slice(0, 500),
      status: "PENDING",
      userId: userId || null,
      metadata: metadata as object,
    },
  });

  try {
    const result = await sendEmail({ to: email, subject, html, text });

    if (result.success) {
      // Mettre à jour le log en SENT
      await prisma.notificationLog.update({
        where: { id: log.id },
        data: { status: "SENT" },
      });

      return { channel: "email", success: true, messageId: log.id };
    } else {
      // Mettre à jour le log en FAILED
      await prisma.notificationLog.update({
        where: { id: log.id },
        data: {
          status: "FAILED",
          errorMsg: String(result.error),
        },
      });

      return { channel: "email", success: false, error: String(result.error) };
    }
  } catch (error) {
    // Mettre à jour le log en FAILED
    await prisma.notificationLog.update({
      where: { id: log.id },
      data: {
        status: "FAILED",
        errorMsg: error instanceof Error ? error.message : "Erreur inconnue",
      },
    });

    return {
      channel: "email",
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

/**
 * Envoie un SMS et log le résultat
 */
async function sendSMSNotification(
  type: NotificationType,
  phone: string,
  userId: string | undefined,
  message: string,
  metadata: Record<string, unknown>
): Promise<NotificationResult> {
  // Valider le numéro
  if (!isValidPhoneNumber(phone)) {
    return {
      channel: "sms",
      success: false,
      error: `Numéro de téléphone invalide: ${phone}`,
    };
  }

  const formattedPhone = formatPhoneNumber(phone);

  // Créer le log en status PENDING
  const log = await prisma.notificationLog.create({
    data: {
      channel: "SMS",
      type,
      recipient: formattedPhone,
      content: message,
      status: "PENDING",
      userId: userId || null,
      metadata: metadata as object,
    },
  });

  try {
    const result = await sendSMS({ to: formattedPhone, message });

    if (result.success) {
      // Mettre à jour le log en SENT
      await prisma.notificationLog.update({
        where: { id: log.id },
        data: { status: "SENT" },
      });

      return { channel: "sms", success: true, messageId: result.messageId };
    } else {
      // Mettre à jour le log en FAILED
      await prisma.notificationLog.update({
        where: { id: log.id },
        data: {
          status: "FAILED",
          errorMsg: result.error,
        },
      });

      return { channel: "sms", success: false, error: result.error };
    }
  } catch (error) {
    // Mettre à jour le log en FAILED
    await prisma.notificationLog.update({
      where: { id: log.id },
      data: {
        status: "FAILED",
        errorMsg: error instanceof Error ? error.message : "Erreur inconnue",
      },
    });

    return {
      channel: "sms",
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

/**
 * Envoie une notification in-app
 */
async function sendInAppNotification(
  type: NotificationType,
  userId: string,
  data: Record<string, unknown>
): Promise<NotificationResult> {
  try {
    const notification = await createInAppNotification({
      userId,
      type,
      data,
    });

    return {
      channel: "inapp",
      success: true,
      messageId: notification.id,
    };
  } catch (error) {
    return {
      channel: "inapp",
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

// ============================================
// HELPERS POUR LES ÉVÉNEMENTS COURANTS
// ============================================

/**
 * Notifier le client que sa demande a été créée
 */
export async function notifyTransportRequestCreated(params: {
  patientName: string;
  patientEmail?: string;
  patientPhone: string;
  companyName: string;
  date: string;
  time: string;
  trackingId: string;
  userId?: string;
}): Promise<SendNotificationResult> {
  const channels: NotificationChannel[] = ["sms"];
  if (params.patientEmail) channels.push("email");
  if (params.userId) channels.push("inapp");

  return sendNotification({
    type: "TRANSPORT_REQUEST_CREATED",
    recipient: {
      email: params.patientEmail,
      phone: params.patientPhone,
      userId: params.userId,
      name: params.patientName,
    },
    channels,
    data: params,
  });
}

/**
 * Notifier le client que sa demande a été acceptée
 */
export async function notifyTransportAccepted(params: {
  patientName: string;
  patientEmail?: string;
  patientPhone: string;
  companyName: string;
  companyPhone?: string;
  date: string;
  time: string;
  trackingId?: string;
  userId?: string;
}): Promise<SendNotificationResult> {
  const channels: NotificationChannel[] = ["sms"];
  if (params.patientEmail) channels.push("email");
  if (params.userId) channels.push("inapp");

  return sendNotification({
    type: "TRANSPORT_ACCEPTED",
    recipient: {
      email: params.patientEmail,
      phone: params.patientPhone,
      userId: params.userId,
      name: params.patientName,
    },
    channels,
    data: params,
  });
}

/**
 * Notifier le client que sa demande a été refusée
 */
export async function notifyTransportRefused(params: {
  patientName: string;
  patientEmail?: string;
  patientPhone: string;
  companyName: string;
  reason?: string;
  trackingId?: string;
  userId?: string;
}): Promise<SendNotificationResult> {
  const channels: NotificationChannel[] = ["sms"];
  if (params.patientEmail) channels.push("email");
  if (params.userId) channels.push("inapp");

  return sendNotification({
    type: "TRANSPORT_REFUSED",
    recipient: {
      email: params.patientEmail,
      phone: params.patientPhone,
      userId: params.userId,
      name: params.patientName,
    },
    channels,
    data: params,
  });
}

/**
 * Notifier le client d'une contre-proposition
 */
export async function notifyTransportCounterProposal(params: {
  patientName: string;
  patientEmail?: string;
  patientPhone: string;
  companyName: string;
  originalDate: string;
  originalTime: string;
  proposedDate: string;
  proposedTime: string;
  trackingId: string;
  userId?: string;
}): Promise<SendNotificationResult> {
  const channels: NotificationChannel[] = ["sms"];
  if (params.patientEmail) channels.push("email");
  if (params.userId) channels.push("inapp");

  return sendNotification({
    type: "TRANSPORT_COUNTER_PROPOSAL",
    recipient: {
      email: params.patientEmail,
      phone: params.patientPhone,
      userId: params.userId,
      name: params.patientName,
    },
    channels,
    data: params,
  });
}

/**
 * Notifier l'ambulancier d'une nouvelle demande
 */
export async function notifyNewTransportRequest(params: {
  ambulancierEmail: string;
  ambulancierPhone?: string;
  ambulancierName: string;
  patientName: string;
  companyName: string;
  date: string;
  time: string;
  pickupCity: string;
  destinationCity: string;
  userId?: string;
}): Promise<SendNotificationResult> {
  const channels: NotificationChannel[] = ["email"];
  if (params.ambulancierPhone) channels.push("sms");
  if (params.userId) channels.push("inapp");

  return sendNotification({
    type: "TRANSPORT_NEW_REQUEST",
    recipient: {
      email: params.ambulancierEmail,
      phone: params.ambulancierPhone,
      userId: params.userId,
      name: params.ambulancierName,
    },
    channels,
    data: params,
  });
}

/**
 * Rappel de transport J-1
 */
export async function notifyTransportReminder(params: {
  patientName: string;
  patientEmail?: string;
  patientPhone: string;
  companyName: string;
  companyPhone?: string;
  date: string;
  time: string;
  pickupAddress: string;
  trackingId?: string;
  userId?: string;
}): Promise<SendNotificationResult> {
  const channels: NotificationChannel[] = ["sms"];
  if (params.patientEmail) channels.push("email");
  if (params.userId) channels.push("inapp");

  return sendNotification({
    type: "TRANSPORT_REMINDER",
    recipient: {
      email: params.patientEmail,
      phone: params.patientPhone,
      userId: params.userId,
      name: params.patientName,
    },
    channels,
    data: params,
  });
}

/**
 * Notifier l'ambulancier de la réponse du client
 */
export async function notifyTransportCustomerResponse(params: {
  ambulancierEmail: string;
  ambulancierPhone?: string;
  ambulancierName: string;
  patientName: string;
  companyName: string;
  response: "accepted" | "refused" | "new_proposal";
  userId?: string;
}): Promise<SendNotificationResult> {
  const channels: NotificationChannel[] = ["email"];
  if (params.ambulancierPhone) channels.push("sms");
  if (params.userId) channels.push("inapp");

  return sendNotification({
    type: "TRANSPORT_CUSTOMER_RESPONSE",
    recipient: {
      email: params.ambulancierEmail,
      phone: params.ambulancierPhone,
      userId: params.userId,
      name: params.ambulancierName,
    },
    channels,
    data: params,
  });
}

/**
 * Bienvenue nouveau client
 */
export async function notifyWelcomeCustomer(params: {
  userName: string;
  userEmail: string;
  userPhone?: string;
  userId?: string;
}): Promise<SendNotificationResult> {
  const channels: NotificationChannel[] = ["email"];
  if (params.userPhone) channels.push("sms");
  if (params.userId) channels.push("inapp");

  return sendNotification({
    type: "WELCOME_CUSTOMER",
    recipient: {
      email: params.userEmail,
      phone: params.userPhone,
      userId: params.userId,
      name: params.userName,
    },
    channels,
    data: params,
  });
}

/**
 * Bienvenue nouvel ambulancier
 */
export async function notifyWelcomeAmbulancier(params: {
  userName: string;
  userEmail: string;
  userPhone?: string;
  companyName: string;
  userId?: string;
}): Promise<SendNotificationResult> {
  const channels: NotificationChannel[] = ["email"];
  if (params.userPhone) channels.push("sms");
  if (params.userId) channels.push("inapp");

  return sendNotification({
    type: "WELCOME_AMBULANCIER",
    recipient: {
      email: params.userEmail,
      phone: params.userPhone,
      userId: params.userId,
      name: params.userName,
    },
    channels,
    data: params,
  });
}

/**
 * Compte activé (ambulancier)
 */
export async function notifyAccountActivated(params: {
  userName: string;
  userEmail: string;
  userPhone?: string;
  userId?: string;
}): Promise<SendNotificationResult> {
  const channels: NotificationChannel[] = ["email"];
  if (params.userPhone) channels.push("sms");
  if (params.userId) channels.push("inapp");

  return sendNotification({
    type: "ACCOUNT_ACTIVATED",
    recipient: {
      email: params.userEmail,
      phone: params.userPhone,
      userId: params.userId,
      name: params.userName,
    },
    channels,
    data: params,
  });
}

/**
 * Code de vérification (notification critique - toujours envoyée)
 */
export async function notifyVerificationCode(params: {
  email?: string;
  phone?: string;
  code: string;
  userId?: string;
}): Promise<SendNotificationResult> {
  const channels: NotificationChannel[] = [];
  if (params.email) channels.push("email");
  if (params.phone) channels.push("sms");

  return sendNotification({
    type: "VERIFICATION_CODE",
    recipient: {
      email: params.email,
      phone: params.phone,
      userId: params.userId,
    },
    channels,
    data: params,
    force: true, // Notification critique - ignorer les préférences
  });
}

/**
 * Notifier l'ajout d'une pièce jointe
 */
export async function notifyTransportAttachmentAdded(params: {
  recipientEmail: string;
  recipientPhone?: string;
  recipientName: string;
  uploaderName: string;
  fileName: string;
  trackingId: string;
  userId?: string;
}): Promise<SendNotificationResult> {
  const channels: NotificationChannel[] = ["email"];
  if (params.recipientPhone) channels.push("sms");
  if (params.userId) channels.push("inapp");

  return sendNotification({
    type: "TRANSPORT_ATTACHMENT_ADDED",
    recipient: {
      email: params.recipientEmail,
      phone: params.recipientPhone,
      userId: params.userId,
      name: params.recipientName,
    },
    channels,
    data: params,
  });
}

/**
 * Notifier le client que son transport a été clôturé
 */
export async function notifyTransportCompleted(params: {
  patientName: string;
  patientEmail?: string;
  patientPhone: string;
  companyName: string;
  date: string;
  time: string;
  note?: string;
  trackingId?: string;
  userId?: string;
}): Promise<SendNotificationResult> {
  const channels: NotificationChannel[] = ["sms"];
  if (params.patientEmail) channels.push("email");
  if (params.userId) channels.push("inapp");

  return sendNotification({
    type: "TRANSPORT_COMPLETED",
    recipient: {
      email: params.patientEmail,
      phone: params.patientPhone,
      userId: params.userId,
      name: params.patientName,
    },
    channels,
    data: params,
  });
}

/**
 * Notifier l'admin d'une nouvelle inscription en attente
 */
export async function notifyAdminNewSignup(params: {
  adminEmail: string;
  adminPhone?: string;
  userName: string;
  userEmail: string;
  companyName: string;
}): Promise<SendNotificationResult> {
  const channels: NotificationChannel[] = ["email"];
  if (params.adminPhone) channels.push("sms");

  return sendNotification({
    type: "ADMIN_NEW_SIGNUP",
    recipient: {
      email: params.adminEmail,
      phone: params.adminPhone,
    },
    channels,
    data: params,
  });
}
