import { CompanyCard } from "./CompanyCard";
import type { SearchResponse } from "@/lib/types";

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
    const getMessage = () => {
      switch (data.type) {
        case "geo":
          return `Aucun ambulancier ne couvre la zone de "${data.query}".`;
        case "region":
          return `Aucun ambulancier inscrit en ${data.query} pour le moment.`;
        case "city":
          return `Aucun ambulancier trouvé à "${data.query}".`;
        default:
          return `Aucun ambulancier ne correspond à "${data.query}".`;
      }
    };

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
          {getMessage()}
        </p>
        <p className="text-neutral-500 text-sm mt-4">
          Essayez une autre ville, région ou un autre nom.
        </p>
      </div>
    );
  }

  const getResultMessage = () => {
    const count = data.results.length;
    const plural = count > 1 ? "s" : "";

    switch (data.type) {
      case "geo":
        return (
          <>
            <span className="font-medium">{count}</span> ambulancier{plural} couvrant{" "}
            <span className="font-medium">{data.query}</span>
          </>
        );
      case "region":
        return (
          <>
            <span className="font-medium">{count}</span> ambulancier{plural} en{" "}
            <span className="font-medium">{data.query}</span>
          </>
        );
      case "city":
        return (
          <>
            <span className="font-medium">{count}</span> ambulancier{plural} à{" "}
            <span className="font-medium">{data.query}</span>
          </>
        );
      default:
        return (
          <>
            <span className="font-medium">{count}</span> résultat{plural} pour &quot;
            <span className="font-medium">{data.query}</span>&quot;
          </>
        );
    }
  };

  return (
    <div>
      <p className="text-neutral-600 mb-6">
        {getResultMessage()}
      </p>

      <div className="grid gap-4">
        {data.results.map((company) => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>
    </div>
  );
}
