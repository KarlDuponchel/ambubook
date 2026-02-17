import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyTransportReminder } from "@/lib/notifications";

/**
 * Cron job pour envoyer les rappels de transport
 *
 * - Rappel J-1 : Envoie un rappel la veille du transport
 *
 * Configuration Cron Dokploy :
 * {
 *   "crons": [{
 *     "path": "/api/cron/reminders",
 *     "schedule": "0 18 * * *"  // Tous les jours à 18h
 *   }]
 * }
 *
 * Sécurité : Requiert le header Authorization avec CRON_SECRET
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // En production, vérifier le secret
    if (process.env.NODE_ENV === "production") {
      if (!cronSecret) {
        console.error("CRON_SECRET non configuré");
        return NextResponse.json(
          { error: "Configuration manquante" },
          { status: 500 }
        );
      }

      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: "Non autorisé" },
          { status: 401 }
        );
      }
    }

    // Calculer la date de demain (début et fin de journée)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Trouver les transports confirmés pour demain
    const transportsForTomorrow = await prisma.transportRequest.findMany({
      where: {
        status: "ACCEPTED",
        requestedDate: {
          gte: tomorrow,
          lt: dayAfterTomorrow,
        },
        // Ne pas renvoyer de rappel si déjà envoyé (optionnel : ajouter un champ reminderSentAt)
      },
      include: {
        company: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });

    console.log(`[CRON] Rappels J-1 : ${transportsForTomorrow.length} transports trouvés pour demain`);

    const results = {
      total: transportsForTomorrow.length,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Envoyer les rappels
    for (const transport of transportsForTomorrow) {
      try {
        const patientName = `${transport.patientFirstName} ${transport.patientLastName}`;
        const formattedDate = transport.requestedDate.toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        });

        await notifyTransportReminder({
          patientName,
          patientEmail: transport.patientEmail || undefined,
          patientPhone: transport.patientPhone,
          companyName: transport.company.name,
          companyPhone: transport.company.phone || undefined,
          date: formattedDate,
          time: transport.requestedTime,
          pickupAddress: `${transport.pickupAddress}, ${transport.pickupPostalCode} ${transport.pickupCity}`,
          userId: transport.userId || undefined,
        });

        results.sent++;
        console.log(`[CRON] Rappel envoyé pour transport ${transport.trackingId}`);
      } catch (error) {
        results.failed++;
        const errorMsg = error instanceof Error ? error.message : "Erreur inconnue";
        results.errors.push(`Transport ${transport.trackingId}: ${errorMsg}`);
        console.error(`[CRON] Erreur rappel transport ${transport.trackingId}:`, error);
      }
    }

    console.log(`[CRON] Rappels terminés : ${results.sent} envoyés, ${results.failed} échecs`);

    return NextResponse.json({
      success: true,
      message: `Rappels J-1 envoyés`,
      results,
    });
  } catch (error) {
    console.error("[CRON] Erreur générale rappels:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi des rappels" },
      { status: 500 }
    );
  }
}
