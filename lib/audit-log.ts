import { prisma } from "@/lib/prisma";
import { AuditAction, ErrorSeverity, Prisma } from "@/generated/prisma/client";

// ============================================
// AUDIT LOGS
// ============================================

interface LogAuditActionParams {
  action: AuditAction;
  userId?: string | null;
  details?: string;
  metadata?: Prisma.InputJsonValue;
  targetType?: "user" | "company" | "transport";
  targetId?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Enregistre une action dans les logs d'audit
 */
export async function logAuditAction({
  action,
  userId,
  details,
  metadata,
  targetType,
  targetId,
  ipAddress,
  userAgent,
}: LogAuditActionParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        userId: userId || null,
        details,
        metadata: metadata || undefined,
        targetType,
        targetId,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // Ne pas faire échouer l'action principale si le log échoue
    console.error("Erreur lors de l'enregistrement du log d'audit:", error);
  }
}

/**
 * Helper pour extraire IP et User-Agent des headers
 */
export function extractRequestInfo(headers: Headers): {
  ipAddress: string | undefined;
  userAgent: string | undefined;
} {
  const ipAddress =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    undefined;
  const userAgent = headers.get("user-agent") || undefined;

  return { ipAddress, userAgent };
}

// ============================================
// ERROR LOGS
// ============================================

interface LogErrorParams {
  severity?: ErrorSeverity;
  message: string;
  stack?: string;
  path?: string;
  method?: string;
  metadata?: Prisma.InputJsonValue;
  userId?: string | null;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Enregistre une erreur dans les logs
 */
export async function logError({
  severity = "ERROR",
  message,
  stack,
  path,
  method,
  metadata,
  userId,
  ipAddress,
  userAgent,
}: LogErrorParams): Promise<void> {
  try {
    await prisma.errorLog.create({
      data: {
        severity,
        message,
        stack,
        path,
        method,
        metadata: metadata || undefined,
        userId: userId || null,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // Fallback sur console si la DB échoue
    console.error("Erreur lors de l'enregistrement du log d'erreur:", error);
    console.error("Erreur originale:", { severity, message, stack, path });
  }
}

/**
 * Wrapper pour capturer et logger les erreurs d'une fonction async
 */
export async function withErrorLogging<T>(
  fn: () => Promise<T>,
  context: { path?: string; method?: string; userId?: string }
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const err = error as Error;
    await logError({
      message: err.message,
      stack: err.stack,
      path: context.path,
      method: context.method,
      userId: context.userId,
    });
    throw error;
  }
}

// ============================================
// HELPERS POUR ACTIONS COURANTES
// ============================================

export const AuditHelpers = {
  // Authentification
  login: (userId: string, ipAddress?: string, userAgent?: string) =>
    logAuditAction({
      action: "LOGIN",
      userId,
      details: "Connexion réussie",
      ipAddress,
      userAgent,
    }),

  loginFailed: (email: string, ipAddress?: string, userAgent?: string) =>
    logAuditAction({
      action: "LOGIN_FAILED",
      details: `Tentative de connexion échouée pour ${email}`,
      metadata: { email },
      ipAddress,
      userAgent,
    }),

  logout: (userId: string) =>
    logAuditAction({
      action: "LOGOUT",
      userId,
      details: "Déconnexion",
    }),

  passwordChanged: (userId: string) =>
    logAuditAction({
      action: "PASSWORD_CHANGED",
      userId,
      details: "Mot de passe modifié",
      targetType: "user",
      targetId: userId,
    }),

  // Utilisateurs
  userCreated: (
    adminId: string,
    targetUserId: string,
    userName: string,
    ipAddress?: string
  ) =>
    logAuditAction({
      action: "USER_CREATED",
      userId: adminId,
      details: `Utilisateur créé : ${userName}`,
      targetType: "user",
      targetId: targetUserId,
      ipAddress,
    }),

  userUpdated: (
    adminId: string,
    targetUserId: string,
    changes: Prisma.InputJsonValue,
    ipAddress?: string
  ) =>
    logAuditAction({
      action: "USER_UPDATED",
      userId: adminId,
      details: `Utilisateur modifié`,
      metadata: changes,
      targetType: "user",
      targetId: targetUserId,
      ipAddress,
    }),

  userDeleted: (
    adminId: string,
    targetUserId: string,
    userName: string,
    ipAddress?: string
  ) =>
    logAuditAction({
      action: "USER_DELETED",
      userId: adminId,
      details: `Utilisateur supprimé/anonymisé : ${userName}`,
      targetType: "user",
      targetId: targetUserId,
      ipAddress,
    }),

  userActivated: (
    adminId: string,
    targetUserId: string,
    userName: string,
    ipAddress?: string
  ) =>
    logAuditAction({
      action: "USER_ACTIVATED",
      userId: adminId,
      details: `Compte activé : ${userName}`,
      targetType: "user",
      targetId: targetUserId,
      ipAddress,
    }),

  userDeactivated: (
    adminId: string,
    targetUserId: string,
    userName: string,
    ipAddress?: string
  ) =>
    logAuditAction({
      action: "USER_DEACTIVATED",
      userId: adminId,
      details: `Compte désactivé : ${userName}`,
      targetType: "user",
      targetId: targetUserId,
      ipAddress,
    }),

  userRoleChanged: (
    adminId: string,
    targetUserId: string,
    oldRole: string,
    newRole: string,
    ipAddress?: string
  ) =>
    logAuditAction({
      action: "USER_ROLE_CHANGED",
      userId: adminId,
      details: `Rôle modifié : ${oldRole} → ${newRole}`,
      metadata: { oldRole, newRole },
      targetType: "user",
      targetId: targetUserId,
      ipAddress,
    }),

  // Entreprises
  companyCreated: (userId: string, companyId: string, companyName: string) =>
    logAuditAction({
      action: "COMPANY_CREATED",
      userId,
      details: `Entreprise créée : ${companyName}`,
      targetType: "company",
      targetId: companyId,
    }),

  companyUpdated: (
    userId: string,
    companyId: string,
    changes: Prisma.InputJsonValue
  ) =>
    logAuditAction({
      action: "COMPANY_UPDATED",
      userId,
      details: "Entreprise modifiée",
      metadata: changes,
      targetType: "company",
      targetId: companyId,
    }),

  companyDeleted: (
    adminId: string,
    companyId: string,
    companyName: string,
    ipAddress?: string
  ) =>
    logAuditAction({
      action: "COMPANY_DELETED",
      userId: adminId,
      details: `Entreprise supprimée : ${companyName}`,
      targetType: "company",
      targetId: companyId,
      ipAddress,
    }),

  companyActivated: (
    adminId: string,
    companyId: string,
    companyName: string,
    ipAddress?: string
  ) =>
    logAuditAction({
      action: "COMPANY_ACTIVATED",
      userId: adminId,
      details: `Entreprise activée : ${companyName}`,
      targetType: "company",
      targetId: companyId,
      ipAddress,
    }),

  companyDeactivated: (
    adminId: string,
    companyId: string,
    companyName: string,
    ipAddress?: string
  ) =>
    logAuditAction({
      action: "COMPANY_DEACTIVATED",
      userId: adminId,
      details: `Entreprise désactivée : ${companyName}`,
      targetType: "company",
      targetId: companyId,
      ipAddress,
    }),

  companyOwnerChanged: (
    adminId: string,
    companyId: string,
    newOwnerName: string,
    ipAddress?: string
  ) =>
    logAuditAction({
      action: "COMPANY_OWNER_CHANGED",
      userId: adminId,
      details: `Gérant modifié : ${newOwnerName}`,
      targetType: "company",
      targetId: companyId,
      ipAddress,
    }),

  // Transports
  transportCreated: (userId: string | null, transportId: string) =>
    logAuditAction({
      action: "TRANSPORT_CREATED",
      userId,
      details: "Demande de transport créée",
      targetType: "transport",
      targetId: transportId,
    }),

  transportAccepted: (userId: string, transportId: string) =>
    logAuditAction({
      action: "TRANSPORT_ACCEPTED",
      userId,
      details: "Demande de transport acceptée",
      targetType: "transport",
      targetId: transportId,
    }),

  transportRefused: (userId: string, transportId: string, reason?: string) =>
    logAuditAction({
      action: "TRANSPORT_REFUSED",
      userId,
      details: reason ? `Demande refusée : ${reason}` : "Demande de transport refusée",
      targetType: "transport",
      targetId: transportId,
    }),

  transportCancelled: (userId: string | null, transportId: string) =>
    logAuditAction({
      action: "TRANSPORT_CANCELLED",
      userId,
      details: "Demande de transport annulée",
      targetType: "transport",
      targetId: transportId,
    }),

  // Action admin générique
  adminAction: (
    adminId: string,
    details: string,
    metadata?: Prisma.InputJsonValue
  ) =>
    logAuditAction({
      action: "ADMIN_ACTION",
      userId: adminId,
      details,
      metadata,
    }),
};
