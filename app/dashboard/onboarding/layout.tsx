"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui";
import Image from "next/image";
import Link from "next/link";

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/ambulancier/me");

        if (response.status === 401) {
          router.push("/dashboard/connexion");
          return;
        }

        if (response.status === 403) {
          router.push("/");
          return;
        }

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données");
        }

        const data = await response.json();

        // Vérifier que l'utilisateur est owner
        if (!data.isOwner) {
          router.push("/dashboard");
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Erreur auth onboarding:", error);
        router.push("/dashboard/connexion");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary-50 to-white">
        <LoadingSpinner size="lg" text="Chargement..." />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 to-white">
      {/* Contenu principal */}
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>

      {/* Footer minimaliste */}
      <footer className="fixed bottom-0 inset-x-0 py-4 text-center text-sm text-neutral-400 bg-white/80 backdrop-blur-md border-t border-neutral-100">
        <p>
          Besoin d'aide ?{" "}
          <a href="mailto:support@ambubook.fr" className="text-primary-600 hover:underline">
            Contactez-nous
          </a>
        </p>
      </footer>
    </div>
  );
}
