"use client";

import { FileText, Calendar, TrendingUp, Clock } from "lucide-react";
import { PageHeader, Card, CardHeader, CardContent, EmptyState } from "@/components/ui";

export default function DashboardPage() {
  // Données fictives pour la démo
  const stats = [
    {
      label: "Demandes en attente",
      value: 5,
      icon: Clock,
      color: "text-warning-600",
      bgColor: "bg-warning-50",
    },
    {
      label: "Demandes du jour",
      value: 8,
      icon: FileText,
      color: "text-primary-600",
      bgColor: "bg-primary-50",
    },
    {
      label: "Cette semaine",
      value: 24,
      icon: Calendar,
      color: "text-secondary-600",
      bgColor: "bg-secondary-50",
    },
    {
      label: "Ce mois",
      value: 87,
      icon: TrendingUp,
      color: "text-accent-600",
      bgColor: "bg-accent-50",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord"
        subtitle="Bienvenue sur votre espace ambulancier"
      />

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-900">
                      {stat.value}
                    </p>
                    <p className="text-sm text-neutral-500">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Demandes récentes */}
      <Card>
        <CardHeader title="Demandes récentes" />
        <CardContent>
          <EmptyState description="Aucune demande récente à afficher" />
        </CardContent>
      </Card>
    </div>
  );
}
