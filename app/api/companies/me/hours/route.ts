import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAuthError } from "@/lib/auth-guard";

/**
 * Schema de validation pour les horaires
 */
const hourSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  isClosed: z.boolean(),
});

const updateHoursSchema = z.array(hourSchema).length(7);

/**
 * GET /api/companies/me/hours
 * Récupère les horaires de l'entreprise
 */
export async function GET() {
  const authResult = await requireAuth();

  if (isAuthError(authResult)) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { user } = authResult;

  if (!user.companyId) {
    return NextResponse.json({ error: "Aucune entreprise associée" }, { status: 404 });
  }

  const hours = await prisma.companyHours.findMany({
    where: { companyId: user.companyId },
    orderBy: { dayOfWeek: "asc" },
  });

  // Si pas d'horaires, retourner les 7 jours avec valeurs par défaut
  if (hours.length === 0) {
    const defaultHours = Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      openTime: i === 0 ? null : "08:00", // Fermé le dimanche par défaut
      closeTime: i === 0 ? null : "18:00",
      isClosed: i === 0, // Dimanche fermé
    }));
    return NextResponse.json(defaultHours);
  }

  return NextResponse.json(hours);
}

/**
 * PUT /api/companies/me/hours
 * Remplace tous les horaires (tableau de 7 jours)
 */
export async function PUT(request: NextRequest) {
  const authResult = await requireAuth();

  if (isAuthError(authResult)) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { user } = authResult;

  if (!user.companyId) {
    return NextResponse.json({ error: "Aucune entreprise associée" }, { status: 404 });
  }

  // Vérifier que l'utilisateur est le owner
  const company = await prisma.company.findUnique({
    where: { id: user.companyId },
    select: { ownerId: true },
  });

  if (!company || company.ownerId !== user.id) {
    return NextResponse.json(
      { error: "Seul le gérant peut modifier les horaires" },
      { status: 403 }
    );
  }

  // Validation des données
  const body = await request.json();
  const validation = updateHoursSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: "Format des horaires invalide. Attendu: tableau de 7 jours (0=Dimanche à 6=Samedi)" },
      { status: 400 }
    );
  }

  const hours = validation.data;

  // Vérifier que tous les jours sont présents
  const days = hours.map(h => h.dayOfWeek).sort();
  if (JSON.stringify(days) !== JSON.stringify([0, 1, 2, 3, 4, 5, 6])) {
    return NextResponse.json(
      { error: "Tous les jours de la semaine doivent être présents (0-6)" },
      { status: 400 }
    );
  }

  // Upsert pour chaque jour
  await Promise.all(
    hours.map((hour) =>
      prisma.companyHours.upsert({
        where: {
          companyId_dayOfWeek: {
            companyId: user.companyId!,
            dayOfWeek: hour.dayOfWeek,
          },
        },
        update: {
          openTime: hour.isClosed ? null : hour.openTime,
          closeTime: hour.isClosed ? null : hour.closeTime,
          isClosed: hour.isClosed,
        },
        create: {
          companyId: user.companyId!,
          dayOfWeek: hour.dayOfWeek,
          openTime: hour.isClosed ? null : hour.openTime,
          closeTime: hour.isClosed ? null : hour.closeTime,
          isClosed: hour.isClosed,
        },
      })
    )
  );

  // Retourner les horaires mis à jour
  const updatedHours = await prisma.companyHours.findMany({
    where: { companyId: user.companyId },
    orderBy: { dayOfWeek: "asc" },
  });

  return NextResponse.json(updatedHours);
}
