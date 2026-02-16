"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Autocomplete } from "@/components/ui";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const handleSubmit = (query: string) => {
    if (query) {
      router.push(`/recherche?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex gap-2 sm:gap-3">
        <Autocomplete
          placeholder="Ville ou nom d'ambulancier..."
          defaultValue={initialQuery}
          onSubmit={handleSubmit}
          className="flex-1"
        />
        <button
          type="button"
          onClick={() => {
            const input = document.querySelector<HTMLInputElement>(
              'input[placeholder="Ville ou nom d\'ambulancier..."]'
            );
            if (input?.value.trim()) {
              handleSubmit(input.value.trim());
            }
          }}
          className="px-3 sm:px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 active:bg-primary-800 transition-colors shadow-lg shadow-primary-500/25"
          aria-label="Rechercher"
        >
          <Search className="w-5 h-5 sm:hidden" />
          <span className="hidden sm:inline">Rechercher</span>
        </button>
      </div>
    </div>
  );
}
