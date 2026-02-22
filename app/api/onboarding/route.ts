import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { z } from "zod";
import { getSignedDownloadUrl } from "@/lib/s3";

// Schéma de validation pour les données d'onboarding
const onboardingDataSchema = z.object({
  // Étape 1 : Informations de base
  name: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  siret: z.string().optional(),
  licenseNumber: z.string().optional(),

  // Étape 2 : Services
  hasAmbulance: z.boolean().optional(),
  hasVSL: z.boolean().optional(),
  acceptsOnlineBooking: z.boolean().optional(),
  coverageRadius: z.number().nullable().optional(),
  fleetSize: z.number().nullable().optional(),
  foundedYear: z.number().nullable().optional(),

  // Étape 3 : Identité visuelle (géré via API images séparée)
  logoUrl: z.string().nullable().optional(),
  coverImageUrl: z.string().nullable().optional(),

  // Étape 4 : Description
  description: z.string().optional(),

  // Étape 5 : Horaires
  hours: z
    .array(
      z.object({
        dayOfWeek: z.number().min(0).max(6),
        openTime: z.string().nullable(),
        closeTime: z.string().nullable(),
        isClosed: z.boolean(),
      })
    )
    .optional(),

  // Étape 6 : Photos (géré via API photos séparée)
  photos: z.array(z.any()).optional(),
});

const patchSchema = z.object({
  step: z.number().min(1).max(6),
  data: onboardingDataSchema,
  completed: z.boolean().optional(),
});

/**
 * GET /api/onboarding
 * Récupère les données d'onboarding de l'entreprise
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer l'utilisateur avec son entreprise
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        company: {
          include: {
            hours: true,
            photos: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!user || user.role !== "AMBULANCIER") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    if (!user.company) {
      return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });
    }

    // Vérifier que l'utilisateur est owner
    if (user.company.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Seul le gérant peut accéder à l'onboarding" },
        { status: 403 }
      );
    }

    const company = user.company;

    // Générer les URLs signées pour les images
    let logoUrl = null;
    let coverImageUrl = null;

    if (company.logoUrl && company.logoUrl.startsWith("companies/")) {
      logoUrl = await getSignedDownloadUrl(company.logoUrl);
    }
    if (company.coverImageUrl && company.coverImageUrl.startsWith("companies/")) {
      coverImageUrl = await getSignedDownloadUrl(company.coverImageUrl);
    }

    // Générer les URLs signées pour les photos
    const photos = await Promise.all(
      company.photos.map(async (photo) => ({
        id: photo.id,
        fileKey: photo.fileKey,
        url: await getSignedDownloadUrl(photo.fileKey),
        caption: photo.caption,
        order: photo.order,
      }))
    );

    return NextResponse.json({
      companyId: company.id,
      onboardingStep: company.onboardingStep,
      data: {
        name: company.name,
        address: company.address || "",
        city: company.city || "",
        postalCode: company.postalCode || "",
        phone: company.phone || "",
        email: company.email || "",
        siret: company.siret || "",
        licenseNumber: company.licenseNumber || "",
        hasAmbulance: company.hasAmbulance,
        hasVSL: company.hasVSL,
        acceptsOnlineBooking: company.acceptsOnlineBooking,
        coverageRadius: company.coverageRadius,
        fleetSize: company.fleetSize,
        foundedYear: company.foundedYear,
        logoUrl,
        coverImageUrl,
        description: company.description || "",
        hours: company.hours.map((h) => ({
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: h.isClosed,
        })),
        photos,
      },
    });
  } catch (error) {
    console.error("Erreur GET /api/onboarding:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * PATCH /api/onboarding
 * Sauvegarde une étape d'onboarding
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
    const validation = patchSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { step, data, completed } = validation.data;

    // Récupérer l'utilisateur avec son entreprise
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        company: true,
      },
    });

    if (!user || user.role !== "AMBULANCIER") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    if (!user.company) {
      return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });
    }

    // Vérifier que l'utilisateur est owner
    if (user.company.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Seul le gérant peut modifier l'onboarding" },
        { status: 403 }
      );
    }

    const companyId = user.company.id;

    // Préparer les données à mettre à jour selon l'étape
    const updateData: Record<string, unknown> = {};

    // Étape 1 : Informations de base
    if (data.name !== undefined) updateData.name = data.name;
    if (data.address !== undefined) updateData.address = data.address || null;
    if (data.city !== undefined) updateData.city = data.city || null;
    if (data.postalCode !== undefined) updateData.postalCode = data.postalCode || null;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.email !== undefined) updateData.email = data.email || null;
    if (data.siret !== undefined) updateData.siret = data.siret || null;
    if (data.licenseNumber !== undefined) updateData.licenseNumber = data.licenseNumber || null;

    // Étape 2 : Services
    if (data.hasAmbulance !== undefined) updateData.hasAmbulance = data.hasAmbulance;
    if (data.hasVSL !== undefined) updateData.hasVSL = data.hasVSL;
    if (data.acceptsOnlineBooking !== undefined) updateData.acceptsOnlineBooking = data.acceptsOnlineBooking;
    if (data.coverageRadius !== undefined) updateData.coverageRadius = data.coverageRadius;
    if (data.fleetSize !== undefined) updateData.fleetSize = data.fleetSize;
    if (data.foundedYear !== undefined) updateData.foundedYear = data.foundedYear;

    // Étape 4 : Description
    if (data.description !== undefined) updateData.description = data.description || null;

    // Mettre à jour le step d'onboarding
    if (completed) {
      updateData.onboardingStep = null; // Onboarding terminé
      updateData.onboardingCompletedAt = new Date();
    } else {
      updateData.onboardingStep = step;
    }

    // Transaction pour mettre à jour l'entreprise et les horaires
    await prisma.$transaction(async (tx) => {
      // Mettre à jour l'entreprise
      await tx.company.update({
        where: { id: companyId },
        data: updateData,
      });

      // Mettre à jour les horaires si fournis (étape 5)
      if (data.hours && data.hours.length > 0) {
        // Supprimer les anciens horaires
        await tx.companyHours.deleteMany({
          where: { companyId },
        });

        // Créer les nouveaux horaires
        await tx.companyHours.createMany({
          data: data.hours.map((h) => ({
            companyId,
            dayOfWeek: h.dayOfWeek,
            openTime: h.openTime,
            closeTime: h.closeTime,
            isClosed: h.isClosed,
          })),
        });
      }
    });

    return NextResponse.json({
      success: true,
      step,
      completed: !!completed,
    });
  } catch (error) {
    console.error("Erreur PATCH /api/onboarding:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
