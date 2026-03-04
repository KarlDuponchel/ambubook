import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthError } from "@/lib/auth-guard";

const DEFAULT_CONFIG_ID = "default";

/**
 * GET /api/admin/config - Récupérer la configuration
 */
export async function GET() {
  const authResult = await requireAdmin();
  if (isAuthError(authResult)) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  // Récupérer ou créer la configuration par défaut
  let config = await prisma.siteConfig.findUnique({
    where: { id: DEFAULT_CONFIG_ID },
  });

  if (!config) {
    config = await prisma.siteConfig.create({
      data: { id: DEFAULT_CONFIG_ID },
    });
  }

  return NextResponse.json(config);
}

/**
 * PATCH /api/admin/config - Mettre à jour la configuration
 */
export async function PATCH(request: NextRequest) {
  const authResult = await requireAdmin();
  if (isAuthError(authResult)) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const body = await request.json();

  // Valider les champs autorisés
  const allowedFields = [
    "siteName",
    "siteLogoUrl",
    "contactEmail",
    "supportEmail",
    "maintenanceMode",
    "maintenanceMessage",
    "registrationEnabled",
    "bookingEnabled",
    "smsEnabled",
    "emailEnabled",
  ];

  const updateData: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  // Validation basique des emails
  if (updateData.contactEmail && typeof updateData.contactEmail === "string") {
    if (!updateData.contactEmail.includes("@")) {
      return NextResponse.json({ error: "Email de contact invalide" }, { status: 400 });
    }
  }
  if (updateData.supportEmail && typeof updateData.supportEmail === "string") {
    if (!updateData.supportEmail.includes("@")) {
      return NextResponse.json({ error: "Email de support invalide" }, { status: 400 });
    }
  }

  // Mettre à jour ou créer la configuration
  const config = await prisma.siteConfig.upsert({
    where: { id: DEFAULT_CONFIG_ID },
    update: updateData,
    create: {
      id: DEFAULT_CONFIG_ID,
      ...updateData,
    },
  });

  // Logger l'action
  await prisma.auditLog.create({
    data: {
      action: "ADMIN_ACTION",
      details: "Mise à jour de la configuration plateforme",
      metadata: JSON.parse(JSON.stringify({ changes: updateData })),
      userId: authResult.user.id,
    },
  });

  return NextResponse.json(config);
}
