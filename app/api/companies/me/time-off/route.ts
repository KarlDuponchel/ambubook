import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAuthError } from "@/lib/auth-guard";

// Schema de validation pour l'ajout d'un congé
const createTimeOffSchema = z.object({
  title: z.string().min(2, "Le titre doit contenir au moins 2 caractères").max(100),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Date de début invalide"),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Date de fin invalide"),
}).refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  { message: "La date de fin doit être après la date de début", path: ["endDate"] }
);

/**
 * GET /api/companies/me/time-off
 * Liste des congés de l'entreprise
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

  const timeOffs = await prisma.companyTimeOff.findMany({
    where: { companyId: user.companyId },
    orderBy: { startDate: "asc" },
  });

  return NextResponse.json(timeOffs);
}

/**
 * POST /api/companies/me/time-off
 * Ajouter un congé (owner seulement)
 */
export async function POST(request: NextRequest) {
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

  if (!company) {
    return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });
  }

  if (company.ownerId !== user.id) {
    return NextResponse.json(
      { error: "Seul le gérant peut gérer les congés" },
      { status: 403 }
    );
  }

  // Validation des données
  const body = await request.json();
  const validation = createTimeOffSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.issues[0].message },
      { status: 400 }
    );
  }

  const { title, startDate, endDate } = validation.data;
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Vérifier que la date de début est dans le futur
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (start < today) {
    return NextResponse.json(
      { error: "La date de début doit être dans le futur" },
      { status: 400 }
    );
  }

  // Vérifier qu'il n'y a pas de chevauchement avec d'autres congés
  const overlapping = await prisma.companyTimeOff.findFirst({
    where: {
      companyId: user.companyId,
      OR: [
        // Le nouveau congé commence pendant un congé existant
        { startDate: { lte: start }, endDate: { gte: start } },
        // Le nouveau congé se termine pendant un congé existant
        { startDate: { lte: end }, endDate: { gte: end } },
        // Le nouveau congé englobe un congé existant
        { startDate: { gte: start }, endDate: { lte: end } },
      ],
    },
  });

  if (overlapping) {
    return NextResponse.json(
      { error: `Ce congé chevauche "${overlapping.title}" (${new Date(overlapping.startDate).toLocaleDateString("fr-FR")} - ${new Date(overlapping.endDate).toLocaleDateString("fr-FR")})` },
      { status: 400 }
    );
  }

  // Créer le congé
  const timeOff = await prisma.companyTimeOff.create({
    data: {
      title,
      startDate: start,
      endDate: end,
      companyId: user.companyId,
    },
  });

  return NextResponse.json(timeOff, { status: 201 });
}
