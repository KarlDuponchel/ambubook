import { prisma } from "@/lib/prisma";
import { getSignedDownloadUrl } from "@/lib/s3";
import { requireAuth, isAuthError } from "@/lib/auth-guard";
import { anonymizeUser } from "@/lib/user-anonymization";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Schéma de validation pour la mise à jour du profil
const updateProfileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
});

export async function GET() {
  try {
    const authResult = await requireAuth();
    if (isAuthError(authResult)) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const user = await prisma.user.findUnique({
      where: { id: authResult.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    let imageUrl: string | null = null;
    if (user.image && user.image.startsWith("users/")) {
      imageUrl = await getSignedDownloadUrl(user.image);
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? null,
      imageUrl,
    });
  } catch (error) {
    console.error("Erreur API GET /api/user/me:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (isAuthError(authResult)) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const parsed = updateProfileSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const body = parsed.data;

    if (body.name !== undefined && body.name.trim() === "") {
      return NextResponse.json({ error: "Le nom ne peut pas être vide" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: authResult.user.id },
      data: {
        ...(body.name !== undefined && { name: body.name.trim() }),
        ...(body.phone !== undefined && { phone: body.phone }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur API PATCH /api/user/me:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Suppression (anonymisation) du compte en libre-service
export async function DELETE() {
  try {
    const authResult = await requireAuth();
    if (isAuthError(authResult)) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Réservé aux clients : les comptes professionnels (ambulancier/admin)
    // passent par un processus dédié pour ne pas orphaniner une société.
    if (authResult.user.role !== "CUSTOMER") {
      return NextResponse.json(
        {
          error:
            "La suppression en libre-service est réservée aux comptes clients.",
        },
        { status: 403 }
      );
    }

    // Anonymisation : les données personnelles sont effacées, l'historique
    // de transport est conservé sous forme anonymisée (obligation ambulancier).
    const result = await anonymizeUser(authResult.user.id);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur API DELETE /api/user/me:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
