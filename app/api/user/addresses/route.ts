import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAuthError } from "@/lib/auth-guard";
import { z } from "zod";

// Schéma de validation pour la création d'une adresse
const createAddressSchema = z.object({
  type: z.enum(["HOME", "WORK", "MEDICAL", "OTHER"]).optional(),
  address: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  details: z.string().optional().nullable(),
});

/**
 * GET /api/user/addresses
 * Récupère les adresses de l'utilisateur connecté
 */
export async function GET() {
  const result = await requireAuth();

  if (isAuthError(result)) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const addresses = await prisma.userAddress.findMany({
    where: { userId: result.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ addresses });
}

/**
 * POST /api/user/addresses
 * Crée une nouvelle adresse pour l'utilisateur connecté
 */
export async function POST(request: Request) {
  const result = await requireAuth();

  if (isAuthError(result)) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const parsed = createAddressSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { type, address, city, postalCode, details } = parsed.data;

  // Label basé sur le type
  const typeLabels: Record<string, string> = {
    HOME: "Domicile",
    WORK: "Travail",
    MEDICAL: "Centre médical",
    OTHER: "Autre",
  };
  const label = (type && typeLabels[type]) || "Autre";

  const newAddress = await prisma.userAddress.create({
    data: {
      userId: result.user.id,
      label,
      type: type || "HOME",
      address,
      city,
      postalCode,
      details: details || null,
      isDefault: false,
    },
  });

  return NextResponse.json({ address: newAddress }, { status: 201 });
}

/**
 * DELETE /api/user/addresses
 * Supprime une adresse de l'utilisateur connecté
 */
export async function DELETE(request: Request) {
  const result = await requireAuth();

  if (isAuthError(result)) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const { searchParams } = new URL(request.url);
  const addressId = searchParams.get("id");

  if (!addressId) {
    return NextResponse.json({ error: "ID requis" }, { status: 400 });
  }

  // Vérifier que l'adresse appartient à l'utilisateur
  const address = await prisma.userAddress.findFirst({
    where: { id: addressId, userId: result.user.id },
  });

  if (!address) {
    return NextResponse.json({ error: "Adresse non trouvée" }, { status: 404 });
  }

  await prisma.userAddress.delete({ where: { id: addressId } });

  return NextResponse.json({ success: true });
}
