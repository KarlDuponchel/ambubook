import { NextRequest, NextResponse } from "next/server";

interface AddressFeature {
  properties: {
    label: string;
    name: string;
    city: string;
    postcode: string;
    context: string;
  };
}

interface AddressResponse {
  features: AddressFeature[];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query || query.length < 3) {
    return NextResponse.json({ results: [] });
  }

  try {
    const apiUrl = new URL("https://api-adresse.data.gouv.fr/search/");
    apiUrl.searchParams.set("q", query);
    apiUrl.searchParams.set("limit", "5");
    apiUrl.searchParams.set("type", "housenumber");

    const response = await fetch(apiUrl.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      // Fallback: essayer sans le filtre type si pas de résultat housenumber
      apiUrl.searchParams.delete("type");
      const fallbackResponse = await fetch(apiUrl.toString());
      if (!fallbackResponse.ok) {
        return NextResponse.json({ results: [] });
      }
      const fallbackData: AddressResponse = await fallbackResponse.json();
      return formatResponse(fallbackData);
    }

    const data: AddressResponse = await response.json();

    // Si pas de résultats avec housenumber, réessayer sans le filtre
    if (data.features.length === 0) {
      apiUrl.searchParams.delete("type");
      const fallbackResponse = await fetch(apiUrl.toString());
      if (fallbackResponse.ok) {
        const fallbackData: AddressResponse = await fallbackResponse.json();
        return formatResponse(fallbackData);
      }
    }

    return formatResponse(data);
  } catch (error) {
    console.error("Erreur lors de l'autocomplétion d'adresse:", error);
    return NextResponse.json({ results: [] });
  }
}

function formatResponse(data: AddressResponse) {
  const results = data.features.map((feature) => ({
    label: feature.properties.label,
    address: feature.properties.name,
    city: feature.properties.city,
    postalCode: feature.properties.postcode,
  }));

  return NextResponse.json({ results });
}
