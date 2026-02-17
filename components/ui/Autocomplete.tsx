"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Suggestion {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  distance?: number;
  hasAmbulance?: boolean;
  hasVSL?: boolean;
}

interface AutocompleteProps {
  placeholder?: string;
  defaultValue?: string;
  onSubmit?: (query: string) => void;
  onBookClick?: (company: Suggestion) => void;
  className?: string;
  inputClassName?: string;
  size?: "default" | "large";
}

export function Autocomplete({
  placeholder = "Ville ou nom d'ambulancier...",
  defaultValue = "",
  onSubmit,
  onBookClick,
  className = "",
  inputClassName = "",
  size = "default",
}: AutocompleteProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fermer le dropdown en cliquant ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch des suggestions avec debounce
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.results || []);
        setIsOpen((data.results || []).length > 0);
        setHighlightedIndex(-1);
      }
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce de 300ms
  const handleInputChange = (value: string) => {
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  // Navigation clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" && query.trim()) {
        e.preventDefault();
        handleSubmit();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          navigateToCompany(suggestions[highlightedIndex].slug);
        } else if (query.trim()) {
          handleSubmit();
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const navigateToCompany = (slug: string) => {
    setIsOpen(false);
    router.push(`/${slug}`);
  };

  const handleSubmit = () => {
    setIsOpen(false);
    if (onSubmit) {
      onSubmit(query.trim());
    } else {
      router.push(`/recherche?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const sizeClasses = size === "large"
    ? "py-4 text-lg"
    : "py-3 text-base";

  return (
    <div ref={containerRef} className={`relative ${isOpen ? "z-[9999]" : ""} ${className}`}>
      {/* Input avec icône */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {isLoading ? (
            <svg
              className="w-5 h-5 text-neutral-400 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-neutral-400"
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
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className={`w-full pl-12 pr-4 ${sizeClasses} rounded-xl border border-neutral-300 bg-white shadow-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all ${inputClassName}`}
        />
      </div>

      {/* Dropdown des suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-[9999] w-full mt-2 bg-white rounded-xl border border-neutral-200 shadow-lg overflow-hidden">
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li key={suggestion.id}>
                <div
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`flex items-center gap-2 px-4 py-3 transition-colors ${
                    index === highlightedIndex
                      ? "bg-primary-50"
                      : "hover:bg-neutral-50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => navigateToCompany(suggestion.slug)}
                    className="flex-1 text-left"
                  >
                    <div className={`font-medium ${
                      index === highlightedIndex ? "text-primary-700" : "text-neutral-900"
                    }`}>
                      {suggestion.name}
                    </div>
                    <div className="text-sm text-neutral-500 flex items-center gap-2">
                      {suggestion.city && <span>{suggestion.city}</span>}
                      {suggestion.distance !== undefined && (
                        <span className="text-primary-600">
                          {suggestion.distance < 1
                            ? `${Math.round(suggestion.distance * 1000)} m`
                            : `${suggestion.distance.toFixed(1)} km`}
                        </span>
                      )}
                    </div>
                  </button>
                  {onBookClick && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(false);
                        onBookClick(suggestion);
                      }}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors flex-shrink-0"
                    >
                      Réserver
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {/* Lien vers tous les résultats */}
          <div className="border-t border-neutral-100">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full px-4 py-3 text-sm text-primary-600 hover:bg-neutral-50 text-left font-medium transition-colors"
            >
              Voir tous les résultats pour "{query}"
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
