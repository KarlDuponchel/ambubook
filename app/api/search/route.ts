import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { geocodeAddress, haversineDistance } from "@/lib/geo";

const DEFAULT_COVERAGE_RADIUS_KM = 30; // Rayon par défaut si non défini par l'entreprise
const DEFAULT_LIMIT = 20;

// Régions françaises pour détection
const FRENCH_REGIONS = [
  "île-de-france", "ile-de-france", "idf",
  "provence-alpes-côte d'azur", "provence-alpes-cote d'azur", "paca",
  "auvergne-rhône-alpes", "auvergne-rhone-alpes", "ara",
  "occitanie",
  "nouvelle-aquitaine",
  "hauts-de-france",
  "grand est",
  "bretagne",
  "pays de la loire",
  "normandie",
  "bourgogne-franche-comté", "bourgogne-franche-comte",
  "centre-val de loire",
  "corse",
];

// Départements avec leur numéro
const DEPARTMENT_PREFIXES: Record<string, string[]> = {
  "normandie": ["14", "27", "50", "61", "76"],
  "bretagne": ["22", "29", "35", "56"],
  "île-de-france": ["75", "77", "78", "91", "92", "93", "94", "95"],
  "ile-de-france": ["75", "77", "78", "91", "92", "93", "94", "95"],
  "provence-alpes-côte d'azur": ["04", "05", "06", "13", "83", "84"],
  "paca": ["04", "05", "06", "13", "83", "84"],
  "auvergne-rhône-alpes": ["01", "03", "07", "15", "26", "38", "42", "43", "63", "69", "73", "74"],
  "occitanie": ["09", "11", "12", "30", "31", "32", "34", "46", "48", "65", "66", "81", "82"],
  "nouvelle-aquitaine": ["16", "17", "19", "23", "24", "33", "40", "47", "64", "79", "86", "87"],
  "hauts-de-france": ["02", "59", "60", "62", "80"],
  "grand est": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"],
  "pays de la loire": ["44", "49", "53", "72", "85"],
  "bourgogne-franche-comté": ["21", "25", "39", "58", "70", "71", "89", "90"],
  "centre-val de loire": ["18", "28", "36", "37", "41", "45"],
  "corse": ["2A", "2B", "20"],
};

interface CompanyWithDistance {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  phone: string | null;
  distance?: number;
  coverageRadius?: number | null;
  logoUrl?: string | null;
  acceptsOnlineBooking?: boolean;
  hasAmbulance?: boolean;
  hasVSL?: boolean;
}

/**
 * Vérifie si la requête est une région française
 */
function isRegionSearch(query: string): string | null {
  const queryLower = query.toLowerCase().trim();
  for (const region of FRENCH_REGIONS) {
    if (queryLower === region || queryLower.includes(region)) {
      return region;
    }
  }
  return null;
}

/**
 * Récupère les préfixes de département pour une région
 */
function getDepartmentPrefixes(region: string): string[] {
  const regionLower = region.toLowerCase();
  for (const [key, prefixes] of Object.entries(DEPARTMENT_PREFIXES)) {
    if (regionLower.includes(key) || key.includes(regionLower)) {
      return prefixes;
    }
  }
  return [];
}

/**
 * GET /api/search - Recherche d'ambulanciers
 *
 * Paramètres:
 * - q: terme de recherche (ville, adresse, région ou nom d'entreprise)
 * - limit: nombre max de résultats (défaut: 20, pour autocomplete: 5)
 *
 * Logique:
 * 1. Recherche par nom d'entreprise
 * 2. Recherche par région (département)
 * 3. Recherche par ville (match partiel)
 * 4. Recherche géographique avec rayon de couverture de l'entreprise
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim();
  const limit = parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10);

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "Le terme de recherche doit contenir au moins 2 caractères" },
      { status: 400 }
    );
  }

  // Récupérer toutes les companies actives avec leurs coordonnées et rayon de couverture
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
      logoUrl: true,
      acceptsOnlineBooking: true,
      coverageRadius: true,
      hasAmbulance: true,
      hasVSL: true,
    },
  });

  const queryLower = query.toLowerCase();

  // 1. Recherche par nom d'entreprise
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
      logoUrl: company.logoUrl,
      acceptsOnlineBooking: company.acceptsOnlineBooking,
      coverageRadius: company.coverageRadius,
      hasAmbulance: company.hasAmbulance,
      hasVSL: company.hasVSL,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"))
    .slice(0, limit);

  if (textResults.length > 0) {
    return NextResponse.json({
      type: "text",
      query,
      results: textResults,
    });
  }

  // 2. Recherche par région
  const detectedRegion = isRegionSearch(query);
  if (detectedRegion) {
    const departmentPrefixes = getDepartmentPrefixes(detectedRegion);

    if (departmentPrefixes.length > 0) {
      const regionResults: CompanyWithDistance[] = allCompanies
        .filter((company) => {
          if (!company.postalCode) return false;
          const prefix = company.postalCode.substring(0, 2);
          return departmentPrefixes.includes(prefix);
        })
        .map((company) => ({
          id: company.id,
          name: company.name,
          slug: company.slug,
          address: company.address,
          city: company.city,
          postalCode: company.postalCode,
          phone: company.phone,
          logoUrl: company.logoUrl,
          acceptsOnlineBooking: company.acceptsOnlineBooking,
          coverageRadius: company.coverageRadius,
          hasAmbulance: company.hasAmbulance,
          hasVSL: company.hasVSL,
        }))
        .sort((a, b) => a.name.localeCompare(b.name, "fr"))
        .slice(0, limit);

      if (regionResults.length > 0) {
        return NextResponse.json({
          type: "region",
          query: detectedRegion.charAt(0).toUpperCase() + detectedRegion.slice(1),
          results: regionResults,
        });
      }
    }
  }

  // 3. Recherche par ville (match partiel sur city)
  const cityResults: CompanyWithDistance[] = allCompanies
    .filter((company) => {
      if (!company.city) return false;
      return company.city.toLowerCase().includes(queryLower) ||
             queryLower.includes(company.city.toLowerCase());
    })
    .map((company) => ({
      id: company.id,
      name: company.name,
      slug: company.slug,
      address: company.address,
      city: company.city,
      postalCode: company.postalCode,
      phone: company.phone,
      logoUrl: company.logoUrl,
      acceptsOnlineBooking: company.acceptsOnlineBooking,
      coverageRadius: company.coverageRadius,
      hasAmbulance: company.hasAmbulance,
      hasVSL: company.hasVSL,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"))
    .slice(0, limit);

  if (cityResults.length > 0) {
    return NextResponse.json({
      type: "city",
      query,
      results: cityResults,
    });
  }

  // 4. Recherche géographique avec rayon de couverture de l'entreprise
  const geocoded = await geocodeAddress(query);

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
          logoUrl: company.logoUrl,
          acceptsOnlineBooking: company.acceptsOnlineBooking,
          coverageRadius: company.coverageRadius,
          hasAmbulance: company.hasAmbulance,
          hasVSL: company.hasVSL,
        };
      })
      // Utiliser le rayon de couverture de l'entreprise au lieu du rayon fixe
      .filter((company) => {
        const effectiveRadius = company.coverageRadius || DEFAULT_COVERAGE_RADIUS_KM;
        return company.distance! <= effectiveRadius;
      })
      .sort((a, b) => a.distance! - b.distance!)
      .slice(0, limit);

    // Calculer le rayon max effectif pour l'affichage
    const maxRadius = companiesWithDistance.length > 0
      ? Math.max(...companiesWithDistance.map(c => c.coverageRadius || DEFAULT_COVERAGE_RADIUS_KM))
      : DEFAULT_COVERAGE_RADIUS_KM;

    return NextResponse.json({
      type: "geo",
      query: geocoded.label,
      coordinates: {
        latitude: geocoded.latitude,
        longitude: geocoded.longitude,
      },
      radius: maxRadius,
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
