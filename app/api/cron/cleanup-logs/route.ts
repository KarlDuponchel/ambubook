/**
 * Cron de nettoyage des logs système
 * Exécuté tous les jours à 4h du matin
 * - Supprime les logs d'audit de plus de 90 jours
 * - Supprime les logs d'erreur résolus de plus de 90 jours
 * - Supprime les logs d'erreur non résolus de plus de 180 jours
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Configuration Cron Dokploy :
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup-logs",
 *     "schedule": "0 4 * * *"  // Tous les jours à 4h du matin
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
    const now = new Date();

    // Date limite pour les logs d'audit (90 jours)
    const auditCutoff = new Date(now);
    auditCutoff.setDate(auditCutoff.getDate() - 90);

    // Date limite pour les logs d'erreur résolus (90 jours)
    const errorResolvedCutoff = new Date(now);
    errorResolvedCutoff.setDate(errorResolvedCutoff.getDate() - 90);

    // Date limite pour les logs d'erreur non résolus (180 jours)
    const errorUnresolvedCutoff = new Date(now);
    errorUnresolvedCutoff.setDate(errorUnresolvedCutoff.getDate() - 180);

    // Supprimer les logs d'audit de plus de 90 jours
    const deletedAuditLogs = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: auditCutoff,
        },
      },
    });

    // Supprimer les logs d'erreur résolus de plus de 90 jours
    const deletedResolvedErrors = await prisma.errorLog.deleteMany({
      where: {
        resolved: true,
        createdAt: {
          lt: errorResolvedCutoff,
        },
      },
    });

    // Supprimer les logs d'erreur non résolus de plus de 180 jours
    const deletedUnresolvedErrors = await prisma.errorLog.deleteMany({
      where: {
        resolved: false,
        createdAt: {
          lt: errorUnresolvedCutoff,
        },
      },
    });

    console.log(
      `[CRON] Cleanup logs: ${deletedAuditLogs.count} audit logs supprimés, ` +
      `${deletedResolvedErrors.count} erreurs résolues supprimées, ` +
      `${deletedUnresolvedErrors.count} erreurs non résolues supprimées`
    );

    return NextResponse.json({
      success: true,
      deletedAuditLogs: deletedAuditLogs.count,
      deletedResolvedErrors: deletedResolvedErrors.count,
      deletedUnresolvedErrors: deletedUnresolvedErrors.count,
    });
  } catch (error) {
    console.error("[CRON] Erreur cleanup logs:", error);
    return NextResponse.json(
      { error: "Erreur lors du nettoyage des logs" },
      { status: 500 }
    );
  }
}
