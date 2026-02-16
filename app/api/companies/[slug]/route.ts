import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSignedDownloadUrl } from "@/lib/s3";

/**
 * GET /api/companies/[slug]
 * Récupère une company par son slug (page publique)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const company = await prisma.company.findUnique({
      where: {
        slug,
        isActive: true,
      },
      include: {
        photos: {
          orderBy: { order: "asc" },
        },
        hours: {
          orderBy: { dayOfWeek: "asc" },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Société non trouvée" },
        { status: 404 }
      );
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
    });
  } catch (error) {
    console.error("Erreur récupération company:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
