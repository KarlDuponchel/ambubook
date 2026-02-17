/**
 * Service de notifications unifié
 * Orchestrateur pour l'envoi d'emails et SMS avec logging
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

// Re-export types
export * from "./types";

/**
 * Envoie une notification multi-canal avec logging
 */
export async function sendNotification(
  payload: NotificationPayload
): Promise<SendNotificationResult> {
  const { type, recipient, channels, data } = payload;
  const results: NotificationResult[] = [];

  // Récupérer les templates pour ce type de notification
  const templates = getNotificationTemplates(type, data);

  // Envoyer sur chaque canal demandé
  for (const channel of channels) {
    let result: NotificationResult;

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
  userId?: string;
}): Promise<SendNotificationResult> {
  const channels: NotificationChannel[] = ["sms"];
  if (params.patientEmail) channels.push("email");

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
  userId?: string;
}): Promise<SendNotificationResult> {
  const channels: NotificationChannel[] = ["sms"];
  if (params.patientEmail) channels.push("email");

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
  userId?: string;
}): Promise<SendNotificationResult> {
  const channels: NotificationChannel[] = ["sms"];
  if (params.patientEmail) channels.push("email");

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
