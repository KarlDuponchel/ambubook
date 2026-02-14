import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

/**
 * Configuration Better Auth côté serveur
 */
export const auth = betterAuth({
  // Connexion à la base de données via Prisma
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Méthodes d'authentification activées
  emailAndPassword: {
    enabled: true,
    // Désactive la vérification email pour le dev (à activer en prod)
    requireEmailVerification: false,
  },

  // Champs additionnels sur le modèle User
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "CUSTOMER", // Customers par défaut
        input: false, // Non modifiable par l'utilisateur lors de l'inscription
      },
      phone: {
        type: "string",
        required: false,
        input: true, // Permet de passer le téléphone lors de l'inscription
      },
      companyId: {
        type: "string",
        required: false,
        input: false,
      },
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true, // Actif par défaut (customers)
        input: false,
      },
    },
  },

  // Configuration des sessions
  session: {
    // Durée de vie : 7 jours
    expiresIn: 60 * 60 * 24,
  },
});

// Export du type pour TypeScript
export type Session = typeof auth.$Infer.Session;
