"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/ambulancier/Sidebar";
import { LoadingSpinner } from "@/components/ui";

// Pages qui ne nécessitent pas d'authentification
const PUBLIC_PATHS = ["/dashboard/connexion", "/dashboard/inscription"];

// Pages qui ne doivent pas déclencher la redirection onboarding
const ONBOARDING_EXCLUDED_PATHS = [
  "/dashboard/onboarding",
  "/dashboard/connexion",
  "/dashboard/inscription",
  "/dashboard/mot-de-passe-oublie",
  "/dashboard/reinitialiser-mot-de-passe",
];

interface SidebarUserData {
  id: string;
  name: string;
  email: string;
  role: string;
  isOwner: boolean;
  company: {
    id: string;
    name: string;
    onboardingStep: number | null;
  } | null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<SidebarUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  const isOnboardingPage = pathname.startsWith("/dashboard/onboarding");
  const isOnboardingExcluded = ONBOARDING_EXCLUDED_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  useEffect(() => {
    // Ne pas vérifier l'authentification sur les pages publiques
    if (isPublicPath) {
      setIsLoading(false);
      return;
    }

    const fetchUser = async () => {
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

        // Rediriger vers l'onboarding si nécessaire
        // (owner avec onboardingStep non null = onboarding non terminé)
        if (
          !isOnboardingExcluded &&
          data.isOwner &&
          data.company?.onboardingStep !== null &&
          data.company?.onboardingStep !== undefined
        ) {
          router.push("/dashboard/onboarding");
          return;
        }

        setUser(data);
      } catch (error) {
        console.error("Erreur de récupération utilisateur:", error);
        router.push("/dashboard/connexion");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router, isPublicPath, isOnboardingExcluded]);

  // Pages publiques : afficher directement le contenu (le layout (auth) s'en charge)
  if (isPublicPath) {
    return <>{children}</>;
  }

  // Page onboarding : layout minimaliste sans sidebar (géré par son propre layout)
  if (isOnboardingPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="Chargement..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen dashboard-shell">
      <Sidebar
        user={user}
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
      />

      {/* Contenu principal avec marge adaptative pour la sidebar */}
      <main
        className={`relative min-h-screen transition-[margin] duration-300 ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-72"
        }`}
      >
        <div className="px-4 sm:px-6 lg:px-10 py-6 pt-20 lg:pt-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </div>
      </main>
    </div>
  );
}
