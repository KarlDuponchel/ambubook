"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/ambulancier/Sidebar";
import { LoadingSpinner } from "@/components/ui";

interface SidebarUserData {
  id: string;
  name: string;
  email: string;
  role: string;
  isOwner: boolean;
  company: {
    id: string;
    name: string;
  } | null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<SidebarUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/ambulancier/me");

        if (response.status === 401) {
          router.push("/dashboard/login");
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
        setUser(data);
      } catch (error) {
        console.error("Erreur de récupération utilisateur:", error);
        router.push("/dashboard/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

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
      <Sidebar user={user} />

      {/* Contenu principal avec marge pour la sidebar */}
      <main className="relative lg:ml-72 min-h-screen">
        <div className="px-4 sm:px-6 lg:px-10 py-6 pt-20 lg:pt-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </div>
      </main>
    </div>
  );
}
