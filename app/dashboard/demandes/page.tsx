"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Ambulance,
  Car,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { PageHeader, Card, CardContent, EmptyState, LoadingSpinner, StatusBadge } from "@/components/ui";
import type { RequestStatus, TransportRequestSummary, StatusConfig } from "@/lib/types";

const statusConfig: Record<RequestStatus, Required<StatusConfig>> = {
  PENDING: {
    label: "En attente",
    color: "text-warning-600",
    bgColor: "bg-warning-50",
    icon: Clock,
  },
  ACCEPTED: {
    label: "Acceptée",
    color: "text-success-600",
    bgColor: "bg-success-50",
    icon: CheckCircle,
  },
  REFUSED: {
    label: "Refusée",
    color: "text-danger-600",
    bgColor: "bg-danger-50",
    icon: XCircle,
  },
  COUNTER_PROPOSAL: {
    label: "Contre-proposition",
    color: "text-accent-600",
    bgColor: "bg-accent-50",
    icon: AlertCircle,
  },
  CANCELLED: {
    label: "Annulée",
    color: "text-neutral-600",
    bgColor: "bg-neutral-100",
    icon: XCircle,
  },
  COMPLETED: {
    label: "Terminée",
    color: "text-primary-600",
    bgColor: "bg-primary-50",
    icon: CheckCircle,
  },
};

const statusToBadgeVariant: Record<RequestStatus, "pending" | "accepted" | "refused" | "counter_proposal" | "cancelled" | "completed"> = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REFUSED: "refused",
  COUNTER_PROPOSAL: "counter_proposal",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

const mobilityLabels: Record<string, string> = {
  WALKING: "Valide",
  WHEELCHAIR: "Fauteuil",
  STRETCHER: "Brancard",
};

export default function DemandesPage() {
  const [demandes, setDemandes] = useState<TransportRequestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "ALL">("ALL");
  const [refreshing, setRefreshing] = useState(false);

  const fetchDemandes = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (searchQuery) params.set("search", searchQuery);

      const response = await fetch(`/api/ambulancier/demandes?${params}`);
      if (response.ok) {
        const data = await response.json();
        setDemandes(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des demandes:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(fetchDemandes, 500);
    return () => clearTimeout(debounce);
  }, [statusFilter, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchDemandes();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDemandes();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isTomorrow = (dateString: string) => {
    const date = new Date(dateString);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  };

  const isPast = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Compter les demandes par statut
  const pendingCount = demandes.filter((d) => d.status === "PENDING").length;

  if (loading && !refreshing) {
    return <LoadingSpinner fullPage text="Chargement des demandes..." />;
  }

  const pendingSubtitle = pendingCount > 0 ? (
    <span className="text-warning-600 font-medium">
      {pendingCount} demande{pendingCount > 1 ? "s" : ""} en attente
    </span>
  ) : (
    "Gérez les demandes de transport de vos patients"
  );

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Centre d'activité"
        title="Demandes de transport"
        subtitle={pendingSubtitle}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Actualiser
            </button>
            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-card-border bg-card-bg px-3 py-2 text-xs text-neutral-600 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-success-500" />
              Temps réel
            </div>
          </div>
        }
      />

      {/* Filtres */}
      <Card>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <form onSubmit={handleSearch} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Rechercher par patient ou ville..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-input-border rounded-xl bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </form>
            <div className="relative min-w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as RequestStatus | "ALL")}
                className="w-full pl-10 pr-8 py-2.5 border border-input-border rounded-xl bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="PENDING">En attente ({demandes.filter((d) => d.status === "PENDING").length})</option>
                <option value="ACCEPTED">Acceptées</option>
                <option value="COUNTER_PROPOSAL">Contre-propositions</option>
                <option value="REFUSED">Refusées</option>
                <option value="COMPLETED">Terminées</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des demandes */}
      <Card>
        {demandes.length === 0 ? (
          <CardContent>
            <EmptyState description="Aucune demande trouvée" />
          </CardContent>
        ) : (
          <div className="divide-y divide-card-border">
            {demandes.map((demande) => {
              const status = statusConfig[demande.status];
              const StatusIcon = status.icon;
              const TransportIcon = demande.transportType === "AMBULANCE" ? Ambulance : Car;

              return (
                <Link
                  key={demande.id}
                  href={`/dashboard/demandes/${demande.id}`}
                  className="block p-5 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Ligne 1 : Patient + Statut */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-semibold text-neutral-900 text-base">
                          {demande.patientFirstName} {demande.patientLastName}
                        </span>
                        <StatusBadge
                          variant={statusToBadgeVariant[demande.status]}
                          label={status.label}
                          icon={StatusIcon}
                          size="sm"
                        />
                        {demande.hasTransportVoucher && (
                          <span className="px-2.5 py-1 bg-secondary-50 text-secondary-700 rounded-full text-xs font-medium">
                            Bon de transport
                          </span>
                        )}
                      </div>

                      {/* Ligne 2 : Trajet */}
                      <p className="text-sm text-neutral-600 mt-1.5">
                        <span className="font-medium">{demande.pickupCity}</span>
                        {" à "}
                        <span className="font-medium">{demande.destinationCity}</span>
                      </p>

                      {/* Ligne 3 : Date + Type */}
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <span
                          className={`text-sm font-medium ${
                            isPast(demande.requestedDate)
                              ? "text-danger-600"
                              : isToday(demande.requestedDate)
                                ? "text-warning-600"
                                : isTomorrow(demande.requestedDate)
                                  ? "text-accent-600"
                                  : "text-neutral-600"
                          }`}
                        >
                          {isToday(demande.requestedDate)
                            ? "Aujourd'hui"
                            : isTomorrow(demande.requestedDate)
                              ? "Demain"
                              : formatDate(demande.requestedDate)}{" "}
                          à {demande.requestedTime}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 rounded-lg text-xs text-neutral-600">
                          <TransportIcon className="h-3 w-3" />
                          {demande.transportType}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {mobilityLabels[demande.mobilityType]}
                        </span>
                        {demande.tripType === "ROUND_TRIP" && (
                          <span className="text-xs text-neutral-500">Aller-retour</span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-neutral-400 shrink-0 mt-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
