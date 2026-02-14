/**
 * Script de géocodage des companies
 *
 * Ce script parcourt toutes les companies sans coordonnées GPS
 * et tente de les géocoder via l'API adresse.data.gouv.fr
 *
 * Usage: npx tsx prisma/geocode-companies.ts
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

interface GeocodeResponse {
  features: Array<{
    geometry: {
      coordinates: [number, number];
    };
    properties: {
      label: string;
      score: number;
    };
  }>;
}

async function geocodeAddress(
  address: string,
  city: string,
  postalCode: string
): Promise<{ latitude: number; longitude: number } | null> {
  const query = [address, postalCode, city].filter(Boolean).join(" ");

  if (!query.trim()) {
    return null;
  }

  try {
    const url = new URL("https://api-adresse.data.gouv.fr/search/");
    url.searchParams.set("q", query);
    url.searchParams.set("limit", "1");

    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      console.error(`  Erreur API: ${response.status}`);
      return null;
    }

    const data: GeocodeResponse = await response.json();

    if (!data.features || data.features.length === 0) {
      return null;
    }

    const feature = data.features[0];
    const [longitude, latitude] = feature.geometry.coordinates;
    const score = feature.properties.score;

    // Seuil de confiance minimum (0.5 = 50%)
    if (score < 0.5) {
      console.log(`  Score trop bas (${score.toFixed(2)}), ignoré`);
      return null;
    }

    return { latitude, longitude };
  } catch (error) {
    console.error(`  Erreur:`, error);
    return null;
  }
}

async function main() {
  console.log("Démarrage du géocodage des companies...\n");

  // Récupérer les companies sans coordonnées
  const companies = await prisma.company.findMany({
    where: {
      OR: [{ latitude: null }, { longitude: null }],
    },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      postalCode: true,
    },
  });

  console.log(`${companies.length} companies à géocoder\n`);

  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (const company of companies) {
    console.log(`[${company.name}]`);

    // Vérifier qu'on a assez d'infos pour géocoder
    if (!company.city && !company.postalCode) {
      console.log("  Pas d'adresse, ignoré\n");
      skipped++;
      continue;
    }

    const coords = await geocodeAddress(
      company.address || "",
      company.city || "",
      company.postalCode || ""
    );

    if (coords) {
      await prisma.company.update({
        where: { id: company.id },
        data: {
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
      });
      console.log(`  Géocodé: ${coords.latitude}, ${coords.longitude}\n`);
      success++;
    } else {
      console.log("  Échec du géocodage\n");
      failed++;
    }

    // Petite pause pour ne pas surcharger l'API
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log("---");
  console.log(`Terminé!`);
  console.log(`  Succès: ${success}`);
  console.log(`  Échecs: ${failed}`);
  console.log(`  Ignorés: ${skipped}`);
}

main()
  .catch((error) => {
    console.error("Erreur fatale:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
