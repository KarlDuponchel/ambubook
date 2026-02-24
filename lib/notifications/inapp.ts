/**
 * Service de notifications in-app
 * Gère la création et les templates des notifications dans l'application
 */

import { prisma } from "@/lib/prisma";
import { NotificationType } from "./types";

const BASE_URL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

interface InAppContent {
  title: string;
  message: string;
  link?: string;
}

interface CreateInAppNotificationParams {
  userId: string;
  type: NotificationType;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Génère le contenu in-app pour un type de notification donné
 */
export function getInAppContent(
  type: NotificationType,
  data: Record<string, unknown>
): InAppContent {
  switch (type) {
    // Transport - Client
    case "TRANSPORT_REQUEST_CREATED":
      return {
        title: "Demande envoyée",
        message: `Votre demande auprès de ${data.companyName} a bien été enregistrée.`,
        link: `/mes-transports/${data.trackingId}`,
      };

    case "TRANSPORT_ACCEPTED":
      return {
        title: "Transport confirmé !",
        message: `${data.companyName} a accepté votre demande pour le ${data.date} à ${data.time}.`,
        link: data.trackingId ? `/mes-transports/${data.trackingId}` : "/mes-transports",
      };

    case "TRANSPORT_REFUSED":
      return {
        title: "Demande non acceptée",
        message: `${data.companyName} n'est pas disponible pour votre transport.${data.reason ? ` Motif : ${data.reason}` : ""}`,
        link: data.trackingId ? `/mes-transports/${data.trackingId}` : "/mes-transports",
      };

    case "TRANSPORT_COUNTER_PROPOSAL":
      return {
        title: "Nouvelle proposition",
        message: `${data.companyName} vous propose un nouveau créneau : ${data.proposedDate} à ${data.proposedTime}.`,
        link: `/mes-transports/${data.trackingId}`,
      };

    case "TRANSPORT_REMINDER":
      return {
        title: "Rappel transport demain",
        message: `Votre transport avec ${data.companyName} est prévu demain à ${data.time}.`,
        link: data.trackingId ? `/mes-transports/${data.trackingId}` : "/mes-transports",
      };

    // Transport - Ambulancier
    case "TRANSPORT_NEW_REQUEST":
      return {
        title: "Nouvelle demande",
        message: `${data.patientName} demande un transport le ${data.date} à ${data.time}. ${data.pickupCity} → ${data.destinationCity}`,
        link: "/dashboard/demandes",
      };

    case "TRANSPORT_CUSTOMER_RESPONSE": {
      const responseText =
        data.response === "accepted"
          ? "a accepté votre proposition"
          : data.response === "refused"
            ? "a refusé votre proposition"
            : "a proposé un nouveau créneau";
      return {
        title: "Réponse du client",
        message: `${data.patientName} ${responseText}.`,
        link: "/dashboard/demandes",
      };
    }

    case "TRANSPORT_ATTACHMENT_ADDED":
      return {
        title: "Nouvelle pièce jointe",
        message: `${data.uploaderName} a ajouté un document : ${data.fileName}`,
        link: data.trackingId
          ? `/mes-transports/${data.trackingId}`
          : "/dashboard/demandes",
      };

    // Compte
    case "WELCOME_CUSTOMER":
      return {
        title: "Bienvenue sur AmbuBook !",
        message: "Votre compte a été créé. Recherchez et réservez vos transports facilement.",
        link: "/",
      };

    case "WELCOME_AMBULANCIER":
      return {
        title: "Bienvenue !",
        message: `Votre compte pour ${data.companyName} est en attente de validation.`,
        link: "/dashboard",
      };

    case "ACCOUNT_ACTIVATED":
      return {
        title: "Compte activé !",
        message: "Votre compte AmbuBook a été validé. Vous pouvez maintenant gérer vos demandes.",
        link: "/dashboard",
      };

    // Admin
    case "ADMIN_NEW_SIGNUP":
      return {
        title: "Nouvelle inscription",
        message: `${data.userName} (${data.companyName}) a créé un compte et attend validation.`,
        link: "/admin/utilisateurs",
      };

    case "ADMIN_NEW_FEEDBACK":
      return {
        title: "Nouveau feedback",
        message: `${data.userName} a soumis un ${data.typeLabel} : ${data.subject}`,
        link: "/admin/feedback",
      };

    // Par défaut
    default:
      return {
        title: "Notification",
        message: (data.message as string) || "Vous avez une nouvelle notification.",
      };
  }
}

/**
 * Crée une notification in-app pour un utilisateur
 */
export async function createInAppNotification({
  userId,
  type,
  data,
  metadata,
}: CreateInAppNotificationParams) {
  const content = getInAppContent(type, data);

  return prisma.inAppNotification.create({
    data: {
      userId,
      type,
      title: content.title,
      message: content.message,
      link: content.link,
      metadata: metadata || (data as object),
    },
  });
}

/**
 * Récupère le nombre de notifications non lues pour un utilisateur
 */
export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.inAppNotification.count({
    where: {
      userId,
      status: "UNREAD",
    },
  });
}

/**
 * Récupère les notifications d'un utilisateur avec pagination
 */
export async function getNotifications(
  userId: string,
  options: {
    status?: "UNREAD" | "READ" | "ARCHIVED";
    limit?: number;
    offset?: number;
  } = {}
) {
  const { status, limit = 20, offset = 0 } = options;

  const where = {
    userId,
    ...(status && { status }),
    // Ne pas afficher les notifications archivées par défaut
    ...(!status && { status: { not: "ARCHIVED" as const } }),
  };

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.inAppNotification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.inAppNotification.count({ where }),
    prisma.inAppNotification.count({
      where: { userId, status: "UNREAD" },
    }),
  ]);

  return {
    notifications,
    total,
    unreadCount,
    hasMore: offset + notifications.length < total,
  };
}

/**
 * Marque une notification comme lue
 */
export async function markAsRead(notificationId: string, userId: string) {
  return prisma.inAppNotification.updateMany({
    where: { id: notificationId, userId },
    data: { status: "READ", readAt: new Date() },
  });
}

/**
 * Marque toutes les notifications comme lues
 */
export async function markAllAsRead(userId: string) {
  return prisma.inAppNotification.updateMany({
    where: { userId, status: "UNREAD" },
    data: { status: "READ", readAt: new Date() },
  });
}

/**
 * Archive une notification
 */
export async function archiveNotification(notificationId: string, userId: string) {
  return prisma.inAppNotification.updateMany({
    where: { id: notificationId, userId },
    data: { status: "ARCHIVED" },
  });
}

/**
 * Supprime les anciennes notifications
 * - Lues : plus de 30 jours
 * - Non lues : plus de 90 jours
 */
export async function cleanupOldNotifications() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const [deletedRead, deletedUnread] = await Promise.all([
    // Notifications lues de plus de 30 jours
    prisma.inAppNotification.deleteMany({
      where: {
        status: { in: ["READ", "ARCHIVED"] },
        createdAt: { lt: thirtyDaysAgo },
      },
    }),
    // Notifications non lues de plus de 90 jours
    prisma.inAppNotification.deleteMany({
      where: {
        status: "UNREAD",
        createdAt: { lt: ninetyDaysAgo },
      },
    }),
  ]);

  return {
    deletedRead: deletedRead.count,
    deletedUnread: deletedUnread.count,
  };
}
