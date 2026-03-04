import { prisma } from "@/lib/prisma";

const DEFAULT_CONFIG_ID = "default";

export interface SiteConfigData {
  siteName: string;
  siteLogoUrl: string | null;
  contactEmail: string;
  supportEmail: string;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  registrationEnabled: boolean;
  bookingEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
}

const DEFAULT_CONFIG: SiteConfigData = {
  siteName: "AmbuBook",
  siteLogoUrl: null,
  contactEmail: "contact@ambubook.fr",
  supportEmail: "support@ambubook.fr",
  maintenanceMode: false,
  maintenanceMessage: null,
  registrationEnabled: true,
  bookingEnabled: true,
  smsEnabled: true,
  emailEnabled: true,
};

/**
 * Récupère la configuration du site depuis la base de données
 * Retourne la configuration par défaut si elle n'existe pas
 */
export async function getSiteConfig(): Promise<SiteConfigData> {
  try {
    const config = await prisma.siteConfig.findUnique({
      where: { id: DEFAULT_CONFIG_ID },
    });

    if (!config) {
      return DEFAULT_CONFIG;
    }

    return {
      siteName: config.siteName,
      siteLogoUrl: config.siteLogoUrl,
      contactEmail: config.contactEmail,
      supportEmail: config.supportEmail,
      maintenanceMode: config.maintenanceMode,
      maintenanceMessage: config.maintenanceMessage,
      registrationEnabled: config.registrationEnabled,
      bookingEnabled: config.bookingEnabled,
      smsEnabled: config.smsEnabled,
      emailEnabled: config.emailEnabled,
    };
  } catch {
    // En cas d'erreur de connexion DB, retourner la config par défaut
    return DEFAULT_CONFIG;
  }
}

/**
 * Vérifie si les inscriptions sont ouvertes
 */
export async function isRegistrationEnabled(): Promise<boolean> {
  const config = await getSiteConfig();
  return config.registrationEnabled && !config.maintenanceMode;
}

/**
 * Vérifie si les réservations en ligne sont activées
 */
export async function isBookingEnabled(): Promise<boolean> {
  const config = await getSiteConfig();
  return config.bookingEnabled && !config.maintenanceMode;
}

/**
 * Vérifie si les notifications SMS sont activées
 */
export async function isSmsEnabled(): Promise<boolean> {
  const config = await getSiteConfig();
  return config.smsEnabled;
}

/**
 * Vérifie si les notifications Email sont activées
 */
export async function isEmailEnabled(): Promise<boolean> {
  const config = await getSiteConfig();
  return config.emailEnabled;
}

/**
 * Vérifie si le site est en mode maintenance
 */
export async function isMaintenanceMode(): Promise<boolean> {
  const config = await getSiteConfig();
  return config.maintenanceMode;
}
