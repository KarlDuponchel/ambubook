import { CompanyCard } from "./CompanyCard";

interface Company {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  phone: string | null;
  distance?: number;
}

interface GeoSearchResponse {
  type: "geo";
  query: string;
  coordinates: { latitude: number; longitude: number };
  radius: number;
  results: Company[];
}

interface TextSearchResponse {
  type: "text";
  query: string;
  results: Company[];
}

type SearchResponse = GeoSearchResponse | TextSearchResponse;

interface SearchResultsProps {
  query: string;
}

async function fetchSearchResults(query: string): Promise<SearchResponse | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = `${baseUrl}/api/search?q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch {
    return null;
  }
}

export async function SearchResults({ query }: SearchResultsProps) {
  const data = await fetchSearchResults(query);

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600">
          Une erreur est survenue lors de la recherche.
        </p>
      </div>
    );
  }

  if (data.results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-neutral-900 mb-2">
          Aucun résultat trouvé
        </h3>
        <p className="text-neutral-600 max-w-md mx-auto">
          {data.type === "geo"
            ? `Aucun ambulancier trouvé dans un rayon de ${data.radius} km autour de "${data.query}".`
            : `Aucun ambulancier ne correspond à "${data.query}".`}
        </p>
        <p className="text-neutral-500 text-sm mt-4">
          Essayez une autre ville ou un autre nom.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-neutral-600 mb-6">
        {data.type === "geo" ? (
          <>
            <span className="font-medium">{data.results.length}</span> ambulancier
            {data.results.length > 1 ? "s" : ""} trouvé
            {data.results.length > 1 ? "s" : ""} près de{" "}
            <span className="font-medium">{data.query}</span>
          </>
        ) : (
          <>
            <span className="font-medium">{data.results.length}</span> résultat
            {data.results.length > 1 ? "s" : ""} pour &quot;
            <span className="font-medium">{data.query}</span>&quot;
          </>
        )}
      </p>

      <div className="grid gap-4">
        {data.results.map((company) => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>
    </div>
  );
}
