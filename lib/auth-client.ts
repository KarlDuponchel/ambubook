import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

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
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          required: false,
        },
        phone: {
          type: "string",
          required: false,
        },
        companyId: {
          type: "string",
          required: false,
        },
        isActive: {
          type: "boolean",
          required: false,
        },
      },
    }),
  ],
});

// Export des fonctions et hooks pour faciliter l'import
export const { signIn, signUp, signOut, useSession } = authClient;
