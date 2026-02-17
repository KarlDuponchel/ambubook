"use client";

import { useState, useEffect } from "react";
import { MapPin, Navigation } from "lucide-react";
import { CompanyCard } from "./CompanyCard";
import type { CompanySearchResult } from "@/lib/types";

type GeoState = "loading" | "granted" | "denied" | "error" | "unsupported";

export function NearbyResults() {
  const [geoState, setGeoState] = useState<GeoState>("loading");
  const [companies, setCompanies] = useState<CompanySearchResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    // Vérifier si la géolocalisation est supportée
    if (!navigator.geolocation) {
      setGeoState("unsupported");
      return;
    }

    // Demander la position
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setGeoState("granted");
        setLoadingResults(true);

        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `/api/search/nearby?lat=${latitude}&lng=${longitude}`
          );

          if (res.ok) {
            const data = await res.json();
            setCompanies(data.results || []);
          }
        } catch (error) {
          console.error("Erreur lors de la recherche:", error);
        } finally {
          setLoadingResults(false);
        }
      },
      (error) => {
        // L'utilisateur a refusé ou erreur
        if (error.code === error.PERMISSION_DENIED) {
          setGeoState("denied");
        } else {
          setGeoState("error");
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // Cache de 5 minutes
      }
    );
  }, []);

  // État de chargement initial (demande de permission)
  if (geoState === "loading") {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-50 flex items-center justify-center">
          <Navigation className="w-10 h-10 text-primary-500 animate-pulse" />
        </div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">
          Localisation en cours...
        </h2>
        <p className="text-neutral-600 max-w-md mx-auto">
          Autorisez l&apos;accès à votre position pour voir les ambulanciers près de chez vous.
        </p>
      </div>
    );
  }

  // Géolocalisation refusée ou non supportée - afficher l'état vide standard
  if (geoState === "denied" || geoState === "unsupported" || geoState === "error") {
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

  // Chargement des résultats
  if (loadingResults) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-neutral-600">
          <Navigation className="h-5 w-5 animate-spin" />
          <span>Recherche des ambulanciers à proximité...</span>
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-6 bg-white rounded-xl border border-neutral-200 animate-pulse"
          >
            <div className="h-6 w-48 bg-neutral-200 rounded mb-3" />
            <div className="h-4 w-64 bg-neutral-100 rounded mb-2" />
            <div className="h-4 w-32 bg-neutral-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Aucun résultat
  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-neutral-100 flex items-center justify-center">
          <MapPin className="w-10 h-10 text-neutral-400" />
        </div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">
          Aucun ambulancier à proximité
        </h2>
        <p className="text-neutral-600 max-w-md mx-auto">
          Aucun ambulancier n&apos;est disponible dans votre zone. Essayez de rechercher par ville ou région.
        </p>
      </div>
    );
  }

  // Afficher les résultats avec CompanyCard
  return (
    <div>
      <p className="text-neutral-600 mb-6 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary-500" />
        <span>
          <span className="font-medium">{companies.length}</span> ambulancier
          {companies.length > 1 ? "s" : ""} près de vous
        </span>
      </p>

      <div className="grid gap-4">
        {companies.map((company) => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>
    </div>
  );
}
