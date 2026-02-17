/**
 * Cron de nettoyage des notifications in-app
 * Exécuté tous les jours à 3h du matin
 * - Supprime les notifications lues de plus de 30 jours
 * - Supprime les notifications non lues de plus de 90 jours
 */

import { NextRequest, NextResponse } from "next/server";
import { cleanupOldNotifications } from "@/lib/notifications/inapp";

/**
 * Configuration Cron Dokploy :
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup-notifications",
 *     "schedule": "0 3 * * *"  // Tous les jours à 3h du matin
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  // Vérifier le secret pour sécuriser le cron
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const result = await cleanupOldNotifications();

    console.log(
      `[CRON] Cleanup notifications: ${result.deletedRead} lues supprimées, ${result.deletedUnread} non-lues supprimées`
    );

    return NextResponse.json({
      success: true,
      deletedRead: result.deletedRead,
      deletedUnread: result.deletedUnread,
    });
  } catch (error) {
    console.error("[CRON] Erreur cleanup notifications:", error);
    return NextResponse.json(
      { error: "Erreur lors du nettoyage" },
      { status: 500 }
    );
  }
}
