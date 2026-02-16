"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { CompanyFull, CompanyHour, UserData } from "@/lib/types";
import { PageHeader } from "@/components/ui";
import { CompanyHeader } from "@/components/ambulancier/mon-entreprise/CompanyHeader";
import { CompanyInfoCard } from "@/components/ambulancier/mon-entreprise/CompanyInfoCard";
import { CompanyDescriptionCard } from "@/components/ambulancier/mon-entreprise/CompanyDescriptionCard";
import { CompanyServicesCard } from "@/components/ambulancier/mon-entreprise/CompanyServicesCard";
import { CompanyHoursCard } from "@/components/ambulancier/mon-entreprise/CompanyHoursCard";
import { CompanyGalleryCard } from "@/components/ambulancier/mon-entreprise/CompanyGalleryCard";
import { UsersCompany } from "@/components/ambulancier/mon-entreprise/UsersCompany";

export default function MonEntreprisePage() {
  const [company, setCompany] = useState<CompanyFull | null>(null);
  const [employees, setEmployees] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompany = useCallback(async () => {
    try {
      const response = await fetch("/api/companies/me");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors du chargement");
      }
      const data = await response.json();
      setCompany(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await fetch("/api/companies/users");
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des employés:", err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCompany(), fetchEmployees()]);
      setLoading(false);
    };
    loadData();
  }, [fetchCompany, fetchEmployees]);

  const handleUpdateCompany = async (data: Partial<CompanyFull>) => {
    if (!company) return;

    const response = await fetch("/api/companies/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "Erreur lors de la mise à jour");
    }

    // Rafraîchir les données
    await fetchCompany();
  };

  const handleUpdateHours = async (hours: CompanyHour[]) => {
    const response = await fetch("/api/companies/me/hours", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hours),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "Erreur lors de la mise à jour des horaires");
    }

    // Rafraîchir les données
    await fetchCompany();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Mon entreprise"
          subtitle="Gérez les informations de votre société d'ambulances"
        />
        <div className="bg-danger-50 text-danger-600 p-6 rounded-xl text-center">
          {error || "Entreprise non trouvée"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mon entreprise"
        subtitle={
          company.isOwner
            ? "Vous êtes le gérant de cette entreprise"
            : "Vous êtes membre de cette entreprise (lecture seule)"
        }
      />

      {/* Header avec Cover + Logo */}
      <CompanyHeader
        company={company}
        isOwner={company.isOwner}
        onUpdate={fetchCompany}
      />

      {/* Grid 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne gauche */}
        <div className="space-y-6">
          <CompanyInfoCard
            company={company}
            isOwner={company.isOwner}
            onUpdate={handleUpdateCompany}
          />
          <CompanyServicesCard
            company={company}
            isOwner={company.isOwner}
            onUpdate={handleUpdateCompany}
          />
          <CompanyHoursCard
            hours={company.hours}
            isOwner={company.isOwner}
            onUpdate={handleUpdateHours}
          />
        </div>

        {/* Colonne droite */}
        <div className="space-y-6">
          <CompanyDescriptionCard
            company={company}
            isOwner={company.isOwner}
            onUpdate={handleUpdateCompany}
          />
          <CompanyGalleryCard
            photos={company.photos}
            isOwner={company.isOwner}
            onUpdate={fetchCompany}
          />
        </div>
      </div>

      {/* Équipe (pleine largeur) */}
      <UsersCompany employees={employees} />
    </div>
  );
}
