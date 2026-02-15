import { NextRequest, NextResponse } from "next/server";

interface GeocodingResult {
  features: Array<{
    geometry: {
      coordinates: [number, number]; // [lng, lat]
    };
    properties: {
      label: string;
    };
  }>;
}

interface OSRMRoute {
  routes: Array<{
    distance: number; // en mètres
    duration: number; // en secondes
  }>;
}

// Géocodage via l'API gouvernementale française
async function geocodeAddress(address: string, city: string, postalCode: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const query = encodeURIComponent(`${address} ${postalCode} ${city}`);
    const response = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${query}&limit=1`
    );

    if (!response.ok) return null;

    const data: GeocodingResult = await response.json();

    if (data.features.length === 0) return null;

    const [lng, lat] = data.features[0].geometry.coordinates;
    return { lat, lng };
  } catch (error) {
    console.error("Erreur géocodage:", error);
    return null;
  }
}

// Calcul de route via OSRM (Open Source Routing Machine)
async function calculateRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<{ distance: number; duration: number } | null> {
  try {
    // OSRM public demo server (pour la prod, utiliser son propre serveur ou un service payant)
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=false`
    );

    if (!response.ok) return null;

    const data: OSRMRoute = await response.json();

    if (!data.routes || data.routes.length === 0) return null;

    return {
      distance: data.routes[0].distance, // mètres
      duration: data.routes[0].duration, // secondes
    };
  } catch (error) {
    console.error("Erreur calcul route:", error);
    return null;
  }
}

// Formater la distance
function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

// Formater la durée
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h${minutes > 0 ? ` ${minutes}min` : ""}`;
  }
  return `${minutes} min`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyAddress, pickupAddress, destinationAddress } = body;

    const results: {
      companyToPickup?: {
        distance: string;
        duration: string;
        distanceMeters: number;
        durationSeconds: number;
      };
      pickupToDestination?: {
        distance: string;
        duration: string;
        distanceMeters: number;
        durationSeconds: number;
      };
      total?: {
        distance: string;
        duration: string;
        distanceMeters: number;
        durationSeconds: number;
      };
    } = {};

    // Géocoder les adresses
    const [companyCoords, pickupCoords, destinationCoords] = await Promise.all([
      companyAddress
        ? geocodeAddress(companyAddress.address, companyAddress.city, companyAddress.postalCode)
        : null,
      geocodeAddress(pickupAddress.address, pickupAddress.city, pickupAddress.postalCode),
      geocodeAddress(destinationAddress.address, destinationAddress.city, destinationAddress.postalCode),
    ]);

    // Calcul entreprise → pickup
    if (companyCoords && pickupCoords) {
      const route = await calculateRoute(companyCoords, pickupCoords);
      if (route) {
        results.companyToPickup = {
          distance: formatDistance(route.distance),
          duration: formatDuration(route.duration),
          distanceMeters: route.distance,
          durationSeconds: route.duration,
        };
      }
    }

    // Calcul pickup → destination
    if (pickupCoords && destinationCoords) {
      const route = await calculateRoute(pickupCoords, destinationCoords);
      if (route) {
        results.pickupToDestination = {
          distance: formatDistance(route.distance),
          duration: formatDuration(route.duration),
          distanceMeters: route.distance,
          durationSeconds: route.duration,
        };
      }
    }

    // Total
    if (results.companyToPickup && results.pickupToDestination) {
      const totalDistance =
        results.companyToPickup.distanceMeters + results.pickupToDestination.distanceMeters;
      const totalDuration =
        results.companyToPickup.durationSeconds + results.pickupToDestination.durationSeconds;

      results.total = {
        distance: formatDistance(totalDistance),
        duration: formatDuration(totalDuration),
        distanceMeters: totalDistance,
        durationSeconds: totalDuration,
      };
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Erreur API /api/distance:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
