/**
 * Utilitaires de géolocalisation pour la recherche d'ambulanciers
 */

// Rayon de la Terre en kilomètres
const EARTH_RADIUS_KM = 6371;

/**
 * Calcule la distance entre deux points GPS en utilisant la formule de Haversine
 * @returns Distance en kilomètres
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Résultat du géocodage d'une adresse
 */
export interface GeocodeResult {
  latitude: number;
  longitude: number;
  label: string;
  city?: string;
  postcode?: string;
  type: "housenumber" | "street" | "locality" | "municipality";
}

/**
 * Géocode une adresse via l'API adresse.data.gouv.fr
 * @returns Le premier résultat ou null si non trouvé
 */
export async function geocodeAddress(
  query: string
): Promise<GeocodeResult | null> {
  if (!query || query.trim().length < 2) {
    return null;
  }

  try {
    const url = new URL("https://api-adresse.data.gouv.fr/search/");
    url.searchParams.set("q", query.trim());
    url.searchParams.set("limit", "1");

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Erreur géocodage: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      return null;
    }

    const feature = data.features[0];
    const [longitude, latitude] = feature.geometry.coordinates;
    const props = feature.properties;

    return {
      latitude,
      longitude,
      label: props.label,
      city: props.city,
      postcode: props.postcode,
      type: props.type,
    };
  } catch (error) {
    console.error("Erreur lors du géocodage:", error);
    return null;
  }
}

/**
 * Formate une distance pour l'affichage
 * @param km Distance en kilomètres
 * @returns Chaîne formatée (ex: "2.5 km" ou "800 m")
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  if (km < 10) {
    return `${km.toFixed(1)} km`;
  }
  return `${Math.round(km)} km`;
}

/**
 * Vérifie si une query ressemble à une ville/adresse plutôt qu'à un nom d'entreprise
 * Heuristique simple basée sur des patterns courants
 */
export function looksLikeAddress(query: string): boolean {
  const q = query.toLowerCase().trim();

  // Contient un code postal (5 chiffres)
  if (/\b\d{5}\b/.test(q)) {
    return true;
  }

  // Contient des mots-clés d'adresse
  const addressKeywords = [
    "rue",
    "avenue",
    "boulevard",
    "place",
    "allée",
    "chemin",
    "impasse",
    "passage",
  ];
  if (addressKeywords.some((kw) => q.includes(kw))) {
    return true;
  }

  // Un seul mot court (probablement une ville)
  if (q.split(/\s+/).length === 1 && q.length >= 3) {
    return true;
  }

  return false;
}
