/**
 * Cron de rétention RGPD
 * - Anonymise les comptes CLIENTS inactifs depuis plus de 3 ans
 * - Purge les demandes de transport de plus de 5 ans (obligation médicale)
 *
 * Configuration Cron Dokploy :
 * {
 *   "crons": [{
 *     "path": "/api/cron/retention",
 *     "schedule": "0 5 * * 0"  // Tous les dimanches à 5h
 *   }]
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { anonymizeUser } from "@/lib/user-anonymization";
import { deleteFromS3 } from "@/lib/s3";

const ACCOUNT_RETENTION_YEARS = 3; // comptes inactifs
const TRANSPORT_RETENTION_YEARS = 5; // données de transport (secteur médical)
const ACCOUNT_BATCH = 50;
const TRANSPORT_BATCH = 200;

export async function GET(request: NextRequest) {
  // Auth fail-closed (identique aux autres crons)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (process.env.NODE_ENV === "production") {
    if (!cronSecret) {
      console.error("[CRON] CRON_SECRET non configuré");
      return NextResponse.json(
        { error: "Configuration manquante" },
        { status: 500 }
      );
    }
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
  } else if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const now = new Date();

    const accountCutoff = new Date(now);
    accountCutoff.setFullYear(now.getFullYear() - ACCOUNT_RETENTION_YEARS);

    const transportCutoff = new Date(now);
    transportCutoff.setFullYear(now.getFullYear() - TRANSPORT_RETENTION_YEARS);

    // 1) Anonymisation des comptes clients inactifs (updatedAt = proxy d'activité)
    const inactiveUsers = await prisma.user.findMany({
      where: {
        role: "CUSTOMER",
        deletedAt: null,
        updatedAt: { lt: accountCutoff },
      },
      select: { id: true },
      take: ACCOUNT_BATCH,
    });

    let anonymizedAccounts = 0;
    for (const u of inactiveUsers) {
      const result = await anonymizeUser(u.id);
      if (result.success) anonymizedAccounts++;
    }

    // 2) Purge des demandes de transport de plus de 5 ans
    // (les pièces jointes et l'historique sont supprimés en cascade en base ;
    //  on nettoie d'abord les fichiers S3 associés)
    const oldTransports = await prisma.transportRequest.findMany({
      where: { createdAt: { lt: transportCutoff } },
      select: { id: true, attachments: { select: { fileKey: true } } },
      take: TRANSPORT_BATCH,
    });

    for (const transport of oldTransports) {
      for (const att of transport.attachments) {
        if (att.fileKey) {
          await deleteFromS3(att.fileKey).catch(() => {});
        }
      }
    }

    let deletedTransports = 0;
    if (oldTransports.length > 0) {
      const deleted = await prisma.transportRequest.deleteMany({
        where: { id: { in: oldTransports.map((t) => t.id) } },
      });
      deletedTransports = deleted.count;
    }

    console.log(
      `[CRON] Rétention : ${anonymizedAccounts} comptes anonymisés, ${deletedTransports} transports purgés`
    );

    return NextResponse.json({
      success: true,
      anonymizedAccounts,
      deletedTransports,
    });
  } catch (error) {
    console.error("[CRON] Erreur rétention:", error);
    return NextResponse.json(
      { error: "Erreur lors de la rétention" },
      { status: 500 }
    );
  }
}
