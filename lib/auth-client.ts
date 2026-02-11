import { createAuthClient } from "better-auth/react";

/**
 * Client Better Auth pour le frontend
 *
 * Fournit des hooks React et fonctions pour :
 * - signUp() : Inscription
 * - signIn.email() : Connexion
 * - signOut() : Déconnexion
 * - useSession() : Hook pour accéder à la session
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

// Export des fonctions et hooks pour faciliter l'import
export const { signIn, signUp, signOut, useSession } = authClient;
