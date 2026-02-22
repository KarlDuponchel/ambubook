import { prisma } from "@/lib/prisma";
import { deleteFromS3 } from "@/lib/s3";

/**
 * Génère un identifiant anonyme unique
 */
function generateAnonymousId(): string {
  return `anon_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Anonymise un utilisateur (soft delete + anonymisation des données personnelles)
 *
 * Cette fonction :
 * - Remplace les données personnelles par des valeurs anonymes
 * - Supprime les sessions actives
 * - Supprime l'image de profil du S3
 * - Supprime les pièces jointes (documents d'identité, etc.) du S3
 * - Conserve l'historique des transports (avec données anonymisées)
 * - Marque l'utilisateur comme supprimé (deletedAt)
 *
 * IMPORTANT: Cette fonction ne doit être appelée que par un admin
 */
export async function anonymizeUser(userId: string): Promise<{
  success: boolean;
  message: string;
  deletedFilesCount?: number;
}> {
  // Récupérer l'utilisateur avec ses pièces jointes
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      addresses: true,
      company: true,
      // Pièces jointes uploadées par l'utilisateur
      attachments: {
        select: {
          id: true,
          fileKey: true,
          fileUrl: true,
        },
      },
      // Demandes de transport pour récupérer les PJ associées
      transportRequests: {
        select: {
          id: true,
          attachments: {
            select: {
              id: true,
              fileKey: true,
              fileUrl: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return { success: false, message: "Utilisateur non trouvé" };
  }

  if (user.deletedAt) {
    return { success: false, message: "Utilisateur déjà supprimé" };
  }

  const anonymousId = generateAnonymousId();
  const anonymousEmail = `${anonymousId}@deleted.ambubook.local`;

  // Transaction pour garantir l'intégrité
  await prisma.$transaction(async (tx) => {
    // 1. Supprimer les sessions (déconnexion forcée)
    await tx.session.deleteMany({
      where: { userId },
    });

    // 2. Supprimer les accounts OAuth
    await tx.account.deleteMany({
      where: { userId },
    });

    // 3. Supprimer les adresses sauvegardées
    await tx.userAddress.deleteMany({
      where: { userId },
    });

    // 4. Supprimer les préférences de notifications
    await tx.notificationPreferences.deleteMany({
      where: { userId },
    });

    // 5. Supprimer les notifications in-app
    await tx.inAppNotification.deleteMany({
      where: { userId },
    });

    // 6. Supprimer les pièces jointes en base (les fichiers S3 seront supprimés après)
    // Récupérer les IDs des demandes de l'utilisateur
    const transportRequestIds = user.transportRequests.map((tr) => tr.id);

    // Supprimer les pièces jointes liées aux demandes de l'utilisateur
    if (transportRequestIds.length > 0) {
      await tx.requestAttachment.deleteMany({
        where: { requestId: { in: transportRequestIds } },
      });
    }

    // 7. Anonymiser les demandes de transport (conserver l'historique)
    await tx.transportRequest.updateMany({
      where: { userId },
      data: {
        patientFirstName: "Utilisateur",
        patientLastName: "Supprimé",
        patientEmail: anonymousEmail,
        patientPhone: "0000000000",
        notes: null,
      },
    });

    // 8. Si c'est un gérant, retirer le lien
    if (user.company) {
      await tx.company.updateMany({
        where: { ownerId: userId },
        data: { ownerId: null },
      });
    }

    // 9. Anonymiser l'utilisateur
    await tx.user.update({
      where: { id: userId },
      data: {
        name: "Utilisateur supprimé",
        email: anonymousEmail,
        phone: null,
        image: null,
        emailVerified: false,
        isActive: false,
        companyId: null,
        deletedAt: new Date(),
      },
    });
  });

  // 10. Supprimer les fichiers du S3 (hors transaction)
  let deletedFilesCount = 0;

  // Collecter toutes les clés S3 à supprimer
  const s3KeysToDelete: string[] = [];

  // Image de profil
  if (user.image) {
    try {
      const url = new URL(user.image);
      s3KeysToDelete.push(url.pathname.substring(1));
    } catch {
      // URL invalide, ignorer
    }
  }

  // Pièces jointes uploadées par l'utilisateur
  for (const attachment of user.attachments) {
    if (attachment.fileKey) {
      s3KeysToDelete.push(attachment.fileKey);
    }
  }

  // Pièces jointes des demandes de transport (documents d'identité, etc.)
  for (const transport of user.transportRequests) {
    for (const attachment of transport.attachments) {
      if (attachment.fileKey) {
        s3KeysToDelete.push(attachment.fileKey);
      }
    }
  }

  // Supprimer tous les fichiers S3
  for (const key of s3KeysToDelete) {
    try {
      await deleteFromS3(key);
      deletedFilesCount++;
    } catch (error) {
      console.error(`Erreur lors de la suppression S3 (${key}):`, error);
      // Continuer même en cas d'erreur
    }
  }

  return {
    success: true,
    message: `Compte supprimé et données anonymisées avec succès. ${deletedFilesCount} fichier(s) supprimé(s).`,
    deletedFilesCount,
  };
}

/**
 * Vérifie si un utilisateur est supprimé (soft deleted)
 */
export function isUserDeleted(user: { deletedAt: Date | null }): boolean {
  return user.deletedAt !== null;
}

/**
 * Filtre Prisma pour exclure les utilisateurs supprimés
 */
export const excludeDeletedUsers = {
  deletedAt: null,
};
