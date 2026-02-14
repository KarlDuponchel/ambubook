import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { geocodeAddress, haversineDistance } from "@/lib/geo";

const DEFAULT_RADIUS_KM = 20;
const DEFAULT_LIMIT = 20;

interface CompanyWithDistance {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  phone: string | null;
  distance?: number;
}

/**
 * GET /api/search - Recherche d'ambulanciers
 *
 * Paramètres:
 * - q: terme de recherche (ville, adresse ou nom d'entreprise)
 * - radius: rayon de recherche en km (défaut: 20)
 * - limit: nombre max de résultats (défaut: 20, pour autocomplete: 5)
 *
 * Logique:
 * 1. Fait les deux recherches en parallèle (textuelle + géo)
 * 2. Si recherche textuelle trouve des résultats → retourne ceux-ci
 * 3. Sinon, si géocodage réussit → retourne résultats géo
 * 4. Sinon → retourne tableau vide
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim();
  const radius = parseInt(searchParams.get("radius") || String(DEFAULT_RADIUS_KM), 10);
  const limit = parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10);

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "Le terme de recherche doit contenir au moins 2 caractères" },
      { status: 400 }
    );
  }

  // Récupérer toutes les companies actives avec leurs coordonnées
  const allCompanies = await prisma.company.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      address: true,
      city: true,
      postalCode: true,
      phone: true,
      latitude: true,
      longitude: true,
    },
  });

  // Faire les deux recherches en parallèle
  const queryLower = query.toLowerCase();

  // Recherche textuelle immédiate (synchrone)
  const textResults: CompanyWithDistance[] = allCompanies
    .filter((company) => company.name.toLowerCase().includes(queryLower))
    .map((company) => ({
      id: company.id,
      name: company.name,
      slug: company.slug,
      address: company.address,
      city: company.city,
      postalCode: company.postalCode,
      phone: company.phone,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"))
    .slice(0, limit);

  // Géocodage en parallèle
  const geocoded = await geocodeAddress(query);

  // Prioriser les résultats textuels s'il y en a
  if (textResults.length > 0) {
    return NextResponse.json({
      type: "text",
      query,
      results: textResults,
    });
  }

  // Sinon, utiliser les résultats géocodés
  if (geocoded) {
    const companiesWithDistance: CompanyWithDistance[] = allCompanies
      .filter((company) => company.latitude !== null && company.longitude !== null)
      .map((company) => {
        const distance = haversineDistance(
          geocoded.latitude,
          geocoded.longitude,
          company.latitude!,
          company.longitude!
        );
        return {
          id: company.id,
          name: company.name,
          slug: company.slug,
          address: company.address,
          city: company.city,
          postalCode: company.postalCode,
          phone: company.phone,
          distance,
        };
      })
      .filter((company) => company.distance! <= radius)
      .sort((a, b) => a.distance! - b.distance!)
      .slice(0, limit);

    return NextResponse.json({
      type: "geo",
      query: geocoded.label,
      coordinates: {
        latitude: geocoded.latitude,
        longitude: geocoded.longitude,
      },
      radius,
      results: companiesWithDistance,
    });
  }

  // Aucun résultat
  return NextResponse.json({
    type: "none",
    query,
    results: [],
  });
}
