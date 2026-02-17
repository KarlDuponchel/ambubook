import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { haversineDistance } from "@/lib/geo";

const DEFAULT_COVERAGE_RADIUS_KM = 30;
const DEFAULT_LIMIT = 20;

interface CompanyWithDistance {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  phone: string | null;
  distance: number;
  coverageRadius: number | null;
  logoUrl: string | null;
  acceptsOnlineBooking: boolean;
  hasAmbulance: boolean;
  hasVSL: boolean;
}

/**
 * GET /api/search/nearby - Recherche par coordonnées GPS
 *
 * Paramètres:
 * - lat: latitude
 * - lng: longitude
 * - limit: nombre max de résultats (défaut: 20)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = parseFloat(searchParams.get("lat") || "");
  const lng = parseFloat(searchParams.get("lng") || "");
  const limit = parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10);

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: "Coordonnées invalides" },
      { status: 400 }
    );
  }

  // Vérifier que les coordonnées sont dans une plage raisonnable (France métropolitaine)
  if (lat < 41 || lat > 51 || lng < -5 || lng > 10) {
    return NextResponse.json(
      { error: "Coordonnées hors de France métropolitaine" },
      { status: 400 }
    );
  }

  // Récupérer toutes les companies actives avec coordonnées
  const allCompanies = await prisma.company.findMany({
    where: {
      isActive: true,
      latitude: { not: null },
      longitude: { not: null },
    },
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

  // Calculer la distance et filtrer par rayon de couverture
  const companiesWithDistance: CompanyWithDistance[] = allCompanies
    .map((company) => {
      const distance = haversineDistance(
        lat,
        lng,
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
    // Filtrer par le rayon de couverture de l'entreprise
    .filter((company) => {
      const effectiveRadius = company.coverageRadius || DEFAULT_COVERAGE_RADIUS_KM;
      return company.distance <= effectiveRadius;
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

  return NextResponse.json({
    type: "nearby",
    coordinates: { latitude: lat, longitude: lng },
    results: companiesWithDistance,
  });
}
