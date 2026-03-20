import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuditHelpers, extractRequestInfo } from "@/lib/audit-log";

interface AuthResult {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    companyId: string | null;
  };
}

/** Résultat spécifique pour ambulancier avec companyId garanti */
interface AmbulancierAuthResult {
  user: {
    id: string;
    email: string;
    name: string;
    role: "AMBULANCIER";
    companyId: string;
  };
}

interface AuthError {
  error: string;
  status: number;
}

/**
 * Log un accès refusé (403) et retourne l'erreur
 */
async function logAccessDenied(
  userId: string | null,
  reason: string,
  reqHeaders: Headers
): Promise<AuthError> {
  const { ipAddress, userAgent } = extractRequestInfo(reqHeaders);
  const path = reqHeaders.get("x-invoke-path") || reqHeaders.get("referer") || "unknown";

  // Log async sans bloquer la réponse
  AuditHelpers.accessDenied(userId, path, reason, ipAddress, userAgent).catch(() => {});

  return { error: reason, status: 403 };
}

/**
 * Vérifie que l'utilisateur est authentifié
 */
export async function requireAuth(): Promise<AuthResult | AuthError> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "Non authentifié", status: 401 };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      companyId: true,
    },
  });

  if (!user) {
    return { error: "Utilisateur non trouvé", status: 401 };
  }

  return { user };
}

/**
 * Vérifie que l'utilisateur est admin
 */
export async function requireAdmin(): Promise<AuthResult | AuthError> {
  const reqHeaders = await headers();
  const result = await requireAuth();

  if ("error" in result) {
    return result;
  }

  if (result.user.role !== "ADMIN") {
    return logAccessDenied(result.user.id, "Accès réservé aux administrateurs", reqHeaders);
  }

  return result;
}

/**
 * Vérifie que l'utilisateur est ambulancier avec une entreprise associée
 */
export async function requireAmbulancier(): Promise<AmbulancierAuthResult | AuthError> {
  const reqHeaders = await headers();
  const result = await requireAuth();

  if ("error" in result) {
    return result;
  }

  if (result.user.role !== "AMBULANCIER") {
    return logAccessDenied(result.user.id, "Accès réservé aux ambulanciers", reqHeaders);
  }

  if (!result.user.companyId) {
    return logAccessDenied(result.user.id, "Aucune entreprise associée", reqHeaders);
  }

  return {
    user: {
      ...result.user,
      role: "AMBULANCIER" as const,
      companyId: result.user.companyId,
    },
  };
}

/**
 * Vérifie que l'utilisateur est un client (CUSTOMER)
 */
export async function requireCustomer(): Promise<AuthResult | AuthError> {
  const reqHeaders = await headers();
  const result = await requireAuth();

  if ("error" in result) {
    return result;
  }

  if (result.user.role !== "CUSTOMER") {
    return logAccessDenied(result.user.id, "Accès réservé aux clients", reqHeaders);
  }

  return result;
}

/**
 * Helper pour vérifier si le résultat est une erreur
 */
export function isAuthError(
  result: AuthResult | AmbulancierAuthResult | AuthError
): result is AuthError {
  return "error" in result;
}
