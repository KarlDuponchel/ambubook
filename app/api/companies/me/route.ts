import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAuthError } from "@/lib/auth-guard";
import { getSignedDownloadUrl } from "@/lib/s3";
import { geocodeAddress } from "@/lib/geo";

/**
 * GET /api/companies/me
 * Récupère les informations de l'entreprise de l'utilisateur connecté
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

  const company = await prisma.company.findUnique({
    where: { id: user.companyId },
    include: {
      photos: {
        orderBy: { order: "asc" },
      },
      hours: {
        orderBy: { dayOfWeek: "asc" },
      },
      timeOffs: {
        orderBy: { startDate: "asc" },
      },
    },
  });

  if (!company) {
    return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });
  }

  // Générer les URLs signées pour les images
  let logoUrl = company.logoUrl;
  let coverImageUrl = company.coverImageUrl;

  if (company.logoUrl && company.logoUrl.startsWith("companies/")) {
    logoUrl = await getSignedDownloadUrl(company.logoUrl);
  }

  if (company.coverImageUrl && company.coverImageUrl.startsWith("companies/")) {
    coverImageUrl = await getSignedDownloadUrl(company.coverImageUrl);
  }

  // Générer les URLs signées pour les photos
  const photosWithSignedUrls = await Promise.all(
    company.photos.map(async (photo) => ({
      ...photo,
      url: photo.fileKey.startsWith("companies/")
        ? await getSignedDownloadUrl(photo.fileKey)
        : photo.url,
    }))
  );

  return NextResponse.json({
    ...company,
    logoUrl,
    coverImageUrl,
    photos: photosWithSignedUrls,
    isOwner: company.ownerId === user.id,
  });
}

/**
 * Schema de validation pour la mise à jour
 */
const updateCompanySchema = z.object({
  name: z.string().min(2).optional(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  siret: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  hasAmbulance: z.boolean().optional(),
  hasVSL: z.boolean().optional(),
  acceptsOnlineBooking: z.boolean().optional(),
  foundedYear: z.number().int().min(1900).max(new Date().getFullYear()).optional().nullable(),
  fleetSize: z.number().int().min(1).optional().nullable(),
  coverageRadius: z.number().int().min(1).optional().nullable(),
  licenseNumber: z.string().optional().nullable(),
});

/**
 * PATCH /api/companies/me
 * Modifie les informations de l'entreprise (owner seulement)
 */
export async function PATCH(request: NextRequest) {
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
      { error: "Seul le gérant peut modifier les informations de l'entreprise" },
      { status: 403 }
    );
  }

  // Validation des données
  const body = await request.json();
  const validation = updateCompanySchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.issues[0].message },
      { status: 400 }
    );
  }

  const updateData = { ...validation.data };

  // Recalculer les coordonnées GPS si l'adresse change
  const addressChanged =
    validation.data.address !== undefined ||
    validation.data.city !== undefined ||
    validation.data.postalCode !== undefined;

  if (addressChanged) {
    // Récupérer les valeurs actuelles pour construire l'adresse complète
    const currentCompany = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: { address: true, city: true, postalCode: true },
    });

    const fullAddress = [
      validation.data.address ?? currentCompany?.address,
      validation.data.postalCode ?? currentCompany?.postalCode,
      validation.data.city ?? currentCompany?.city,
    ]
      .filter(Boolean)
      .join(" ");

    if (fullAddress.trim()) {
      const geocodeResult = await geocodeAddress(fullAddress);
      if (geocodeResult) {
        (updateData as Record<string, unknown>).latitude = geocodeResult.latitude;
        (updateData as Record<string, unknown>).longitude = geocodeResult.longitude;
      }
    }
  }

  // Mise à jour
  const updatedCompany = await prisma.company.update({
    where: { id: user.companyId },
    data: updateData,
    include: {
      photos: {
        orderBy: { order: "asc" },
      },
      hours: {
        orderBy: { dayOfWeek: "asc" },
      },
      timeOffs: {
        orderBy: { startDate: "asc" },
      },
    },
  });

  return NextResponse.json({
    ...updatedCompany,
    isOwner: true,
  });
}
