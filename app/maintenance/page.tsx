import { Wrench } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getMaintenanceMessage() {
  try {
    const config = await prisma.siteConfig.findUnique({
      where: { id: "default" },
      select: { maintenanceMessage: true, siteName: true },
    });
    return {
      message: config?.maintenanceMessage || "Le site est actuellement en maintenance. Veuillez réessayer plus tard.",
      siteName: config?.siteName || "AmbuBook",
    };
  } catch {
    return {
      message: "Le site est actuellement en maintenance. Veuillez réessayer plus tard.",
      siteName: "AmbuBook",
    };
  }
}

export default async function MaintenancePage() {
  const { message, siteName } = await getMaintenanceMessage();

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
          {/* Icône */}
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
            <Wrench className="h-8 w-8 text-amber-600" />
          </div>

          {/* Titre */}
          <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
            Maintenance en cours
          </h1>

          {/* Message */}
          <p className="text-neutral-600 mb-6">
            {message}
          </p>

          {/* Info */}
          <div className="bg-neutral-50 rounded-xl p-4 text-sm text-neutral-500">
            <p>Nous travaillons à améliorer votre expérience.</p>
            <p className="mt-1">Merci de votre patience.</p>
          </div>

          {/* Logo/Nom */}
          <div className="mt-8 pt-6 border-t border-neutral-100">
            <span className="text-sm font-medium text-neutral-400">{siteName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata() {
  const { siteName } = await getMaintenanceMessage();
  return {
    title: `Maintenance - ${siteName}`,
    description: "Le site est actuellement en maintenance. Veuillez réessayer plus tard.",
    robots: "noindex, nofollow",
  };
}
