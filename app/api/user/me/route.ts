import { prisma } from "@/lib/prisma";
import { getSignedDownloadUrl } from "@/lib/s3";
import { requireAuth, isAuthError } from "@/lib/auth-guard";
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
