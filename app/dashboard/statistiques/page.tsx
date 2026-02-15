"use client";

import { TrendingUp, TrendingDown, Users, FileText, Clock, CheckCircle } from "lucide-react";
import { PageHeader, Card, CardContent } from "@/components/ui";

export default function StatistiquesPage() {
  // Données fictives pour la démo
  const stats = [
    {
      label: "Total transports",
      value: "248",
      change: "+12%",
      trend: "up",
      icon: FileText,
    },
    {
      label: "Taux d'acceptation",
      value: "94%",
      change: "+3%",
      trend: "up",
      icon: CheckCircle,
    },
    {
      label: "Temps de réponse moyen",
      value: "15 min",
      change: "-5 min",
      trend: "up",
      icon: Clock,
    },
    {
      label: "Patients réguliers",
      value: "32",
      change: "+4",
      trend: "up",
      icon: Users,
    },
  ];

  const monthlyData = [
    { month: "Sep", value: 65 },
    { month: "Oct", value: 78 },
    { month: "Nov", value: 72 },
    { month: "Déc", value: 85 },
    { month: "Jan", value: 92 },
    { month: "Fév", value: 88 },
  ];

  const maxValue = Math.max(...monthlyData.map((d) => d.value));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Statistiques"
        subtitle="Analysez vos performances et votre activité"
      />

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;

          return (
            <Card key={stat.label}>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-primary-50">
                    <Icon className="h-5 w-5 text-primary-600" />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      stat.trend === "up" ? "text-success-600" : "text-danger-600"
                    }`}
                  >
                    <TrendIcon className="h-4 w-4" />
                    {stat.change}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                  <p className="text-sm text-neutral-500 mt-1">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Graphique des transports mensuels */}
      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">
            Transports par mois
          </h2>
          <div className="flex items-end justify-between gap-4 h-48">
            {monthlyData.map((data) => (
              <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-primary-100 rounded-t-lg transition-all hover:bg-primary-200"
                  style={{ height: `${(data.value / maxValue) * 100}%` }}
                >
                  <div
                    className="w-full bg-primary-600 rounded-t-lg"
                    style={{ height: "100%" }}
                  />
                </div>
                <span className="text-sm font-medium text-neutral-600">
                  {data.month}
                </span>
                <span className="text-xs text-neutral-500">{data.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Répartition par type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              Par type de transport
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600">Ambulance</span>
                  <span className="text-sm font-medium text-neutral-900">65%</span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-600 rounded-full" style={{ width: "65%" }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600">VSL</span>
                  <span className="text-sm font-medium text-neutral-900">35%</span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary-500 rounded-full" style={{ width: "35%" }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              Par statut
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600">Acceptées</span>
                  <span className="text-sm font-medium text-neutral-900">94%</span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-success-500 rounded-full" style={{ width: "94%" }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600">Refusées</span>
                  <span className="text-sm font-medium text-neutral-900">4%</span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-danger-500 rounded-full" style={{ width: "4%" }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600">Contre-propositions</span>
                  <span className="text-sm font-medium text-neutral-900">2%</span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-warning-500 rounded-full" style={{ width: "2%" }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
