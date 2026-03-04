import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_CONFIG_ID = "default";

/**
 * GET /api/config - Récupérer la configuration publique (feature flags, maintenance)
 * Cette route est accessible sans authentification
 */
export async function GET() {
  let config = await prisma.siteConfig.findUnique({
    where: { id: DEFAULT_CONFIG_ID },
    select: {
      siteName: true,
      siteLogoUrl: true,
      contactEmail: true,
      supportEmail: true,
      maintenanceMode: true,
      maintenanceMessage: true,
      registrationEnabled: true,
      bookingEnabled: true,
      smsEnabled: true,
      emailEnabled: true,
    },
  });

  // Retourner la config par défaut si elle n'existe pas encore
  if (!config) {
    config = {
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
  }

  return NextResponse.json(config);
}
