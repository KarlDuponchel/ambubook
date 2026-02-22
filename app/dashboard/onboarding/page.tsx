"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingWizard, OnboardingFormData } from "@/components/onboarding";
import { LoadingSpinner } from "@/components/ui";
import { Sparkles } from "lucide-react";

interface OnboardingData {
  companyId: string;
  onboardingStep: number | null;
  data: OnboardingFormData;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOnboardingData = async () => {
      try {
        const response = await fetch("/api/onboarding");

        if (!response.ok) {
          if (response.status === 403) {
            // Pas owner, rediriger vers le dashboard
            router.push("/dashboard");
            return;
          }
          throw new Error("Erreur lors du chargement des données");
        }

        const data = await response.json();

        // Si l'onboarding est déjà terminé, rediriger
        if (data.onboardingStep === null) {
          router.push("/dashboard");
          return;
        }

        setOnboardingData(data);
      } catch (err) {
        console.error("Erreur chargement onboarding:", err);
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    fetchOnboardingData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <p className="text-danger-600 mb-4">{error}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-primary-600 hover:underline"
        >
          Retour au tableau de bord
        </button>
      </div>
    );
  }

  if (!onboardingData) {
    return null;
  }

  return (
    <div>
      {/* Message de bienvenue (seulement à la première étape) */}
      {onboardingData.onboardingStep === 0 && (
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Bienvenue sur AmbuBook !
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">
            Configurons votre entreprise
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            En quelques minutes, complétez votre profil pour maximiser votre
            visibilité et commencer à recevoir des réservations.
          </p>
        </div>
      )}

      {/* Wizard d'onboarding */}
      <OnboardingWizard
        initialStep={onboardingData.onboardingStep || 1}
        initialData={onboardingData.data}
        companyId={onboardingData.companyId}
      />
    </div>
  );
}
