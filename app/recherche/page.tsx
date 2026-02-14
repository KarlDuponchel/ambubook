import { Suspense } from "react";
import Link from "next/link";
import { Container } from "@/components/ui";
import { Header, Footer } from "@/components/landing";
import { SearchBar } from "./SearchBar";
import { SearchResults } from "./SearchResults";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() || "";

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />

      <main className="flex-1 py-8">
        <Container>
          {/* Fil d'ariane */}
          <nav className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-neutral-500">
              <li>
                <Link href="/" className="hover:text-primary-600 transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </li>
              <li className="text-neutral-900 font-medium">Recherche</li>
            </ol>
          </nav>

          {/* Titre */}
          <h1 className="text-3xl font-bold text-neutral-900 mb-8">
            Trouver un ambulancier
          </h1>

          {/* Barre de recherche */}
          <div className="mb-10">
            <Suspense fallback={<SearchBarSkeleton />}>
              <SearchBar />
            </Suspense>
          </div>

          {/* Résultats */}
          {query ? (
            <Suspense fallback={<ResultsSkeleton />}>
              <SearchResults query={query} />
            </Suspense>
          ) : (
            <EmptyState />
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
}

function SearchBarSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex gap-3">
        <div className="flex-1 h-12 bg-neutral-200 rounded-xl animate-pulse" />
        <div className="w-32 h-12 bg-neutral-200 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-48 bg-neutral-200 rounded animate-pulse" />
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-6 bg-white rounded-xl border border-neutral-200"
        >
          <div className="h-6 w-48 bg-neutral-200 rounded animate-pulse mb-3" />
          <div className="h-4 w-64 bg-neutral-100 rounded animate-pulse mb-2" />
          <div className="h-4 w-32 bg-neutral-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-50 flex items-center justify-center">
        <svg
          className="w-10 h-10 text-primary-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-2">
        Recherchez un ambulancier
      </h2>
      <p className="text-neutral-600 max-w-md mx-auto">
        Entrez une ville pour trouver les ambulanciers à proximité, ou recherchez
        directement par nom d&apos;entreprise.
      </p>
    </div>
  );
}
