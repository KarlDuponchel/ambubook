import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

/**
 * Configuration Better Auth côté serveur
 */
export const auth = betterAuth({
  // Connexion à la base de données via Prisma
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Méthodes d'authentification activées
  emailAndPassword: {
    enabled: true,
    // Désactive la vérification email pour le dev (à activer en prod)
    requireEmailVerification: false,
    // Fonction d'envoi d'email pour le reset password
    sendResetPassword: async ({ user, url }) => {
      // Import dynamique pour éviter les dépendances circulaires
      const { sendEmail } = await import("@/lib/email");

      const resetUrl = url;
      const userName = user.name || "Utilisateur";

      // Envoyer l'email sans await pour éviter les timing attacks
      // void supprime le warning ESLint sur les promises non attendues
      void sendEmail({
        to: user.email,
        subject: "Réinitialisez votre mot de passe - AmbuBook",
        html: `
          <h2>Bonjour ${userName},</h2>
          <p>Vous avez demandé à réinitialiser votre mot de passe sur AmbuBook.</p>
          <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
          <p style="margin: 24px 0;">
            <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;font-weight:500;">
              Réinitialiser mon mot de passe
            </a>
          </p>
          <p style="color:#666;font-size:14px;">Ce lien expire dans 1 heure.</p>
          <p style="color:#666;font-size:14px;">Si vous n'avez pas fait cette demande, ignorez simplement cet email.</p>
          <br>
          <p>L'équipe AmbuBook</p>
        `,
        text: `Bonjour ${userName},\n\nVous avez demandé à réinitialiser votre mot de passe sur AmbuBook.\n\nCliquez sur ce lien pour créer un nouveau mot de passe : ${resetUrl}\n\nCe lien expire dans 1 heure.\n\nSi vous n'avez pas fait cette demande, ignorez simplement cet email.\n\nL'équipe AmbuBook`,
      });
    },
  },

  // Rate limiting pour protéger contre le spam
  rateLimit: {
    enabled: true,
    window: 60, // Fenêtre de 60 secondes
    max: 10, // Max 10 requêtes par minute par défaut
    // Règles personnalisées pour les endpoints sensibles
    customRules: {
      "/request-password-reset": {
        window: 300, // 5 minutes
        max: 3, // Max 3 demandes de reset par 5 min
      },
      "/sign-in/email": {
        window: 300, // 5 minutes
        max: 5, // Max 5 tentatives de connexion par 5 min
      },
      "/sign-up/email": {
        window: 3600, // 1 heure
        max: 5, // Max 5 inscriptions par heure
      },
    },
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
  socialProviders: {
    google: {
      enabled: true,
      prompt: "select_account consent",
      clientId: process.env.GOOGLE_CLIENT_ID as string, 
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      scope: ["profile", "email"],
      accessType: "offline",
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
