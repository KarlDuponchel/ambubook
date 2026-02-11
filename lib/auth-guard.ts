import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface AuthResult {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    companyId: string | null;
  };
}

interface AuthError {
  error: string;
  status: number;
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
  const result = await requireAuth();

  if ("error" in result) {
    return result;
  }

  if (result.user.role !== "ADMIN") {
    return { error: "Accès non autorisé", status: 403 };
  }

  return result;
}

/**
 * Helper pour vérifier si le résultat est une erreur
 */
export function isAuthError(result: AuthResult | AuthError): result is AuthError {
  return "error" in result;
}
