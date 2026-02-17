import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * GET /api/user/notifications
 * Récupère les préférences de notifications de l'utilisateur connecté
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer ou créer les préférences
    let preferences = await prisma.notificationPreferences.findUnique({
      where: { userId: session.user.id },
    });

    // Si pas de préférences, les créer avec les valeurs par défaut
    if (!preferences) {
      preferences = await prisma.notificationPreferences.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Erreur GET /api/user/notifications:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

const updatePreferencesSchema = z.object({
  emailEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  transportUpdates: z.boolean().optional(),
  transportReminders: z.boolean().optional(),
  marketing: z.boolean().optional(),
});

/**
 * PATCH /api/user/notifications
 * Met à jour les préférences de notifications
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const validation = updatePreferencesSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    // Upsert : créer si n'existe pas, sinon mettre à jour
    const preferences = await prisma.notificationPreferences.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...validation.data,
      },
      update: validation.data,
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Erreur PATCH /api/user/notifications:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
