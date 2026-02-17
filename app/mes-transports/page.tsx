"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Ambulance,
  Car,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { Header, Footer } from "@/components/landing";
import {
  Container,
  Card,
  CardContent,
  EmptyState,
  LoadingSpinner,
  StatusBadge,
  useToast,
} from "@/components/ui";
import { useSession } from "@/lib/auth-client";
import type { RequestStatus, TransportType, StatusConfig } from "@/lib/types";

interface CustomerTransport {
  id: string;
  trackingId: string;
  status: RequestStatus;
  transportType: TransportType;
  tripType: string;
  mobilityType: string;
  requestedDate: string;
  requestedTime: string;
  proposedDate: string | null;
  proposedTime: string | null;
  pickupCity: string;
  destinationCity: string;
  createdAt: string;
  company: {
    name: string;
    slug: string;
    phone: string | null;
  };
}

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

const statusToBadgeVariant: Record<
  RequestStatus,
  "pending" | "accepted" | "refused" | "counter_proposal" | "cancelled" | "completed"
> = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REFUSED: "refused",
  COUNTER_PROPOSAL: "counter_proposal",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

export default function MesTransportsPage() {
  const router = useRouter();
  const toast = useToast();
  const { data: session, isPending: sessionLoading } = useSession();
  const [transports, setTransports] = useState<CustomerTransport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "ALL">("ALL");

  // Rediriger si non connecté
  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push("/connexion?redirect=/mes-transports");
    }
  }, [session, sessionLoading, router]);

  const fetchTransports = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const response = await fetch(`/api/customer/transports?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTransports(data);
      }
    } catch {
      toast.error("Erreur lors du chargement de vos transports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchTransports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, statusFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const truncateTrackingId = (trackingId: string) => {
    if (trackingId.length <= 12) return trackingId;
    return `${trackingId.slice(0, 8)}...`;
  };

  // Afficher le chargement pendant la vérification de session
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 lg:pt-28">
          <LoadingSpinner fullPage text="Chargement..." />
        </main>
        <Footer />
      </div>
    );
  }

  // Ne rien afficher si non connecté (redirection en cours)
  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 lg:pt-28 pb-16">
        <Container>
          {/* En-tête */}
          <div className="mb-8">
            <div className="inline-flex items-center rounded-lg bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 mb-2">
              <Calendar className="w-4 h-4 mr-2" />
              Espace patient
            </div>
            <h1 className="text-3xl font-bold text-neutral-900">Mes transports</h1>
            <p className="mt-2 text-neutral-500">
              Consultez l&apos;historique et le statut de vos demandes de transport
            </p>
          </div>

          {/* Filtres par statut */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { value: "ALL", label: "Tous", icon: null },
              { value: "PENDING", label: "En attente", icon: Clock },
              { value: "ACCEPTED", label: "Acceptées", icon: CheckCircle },
              { value: "COUNTER_PROPOSAL", label: "Contre-propositions", icon: AlertCircle },
              { value: "REFUSED", label: "Refusées", icon: XCircle },
              { value: "COMPLETED", label: "Terminées", icon: CheckCircle },
            ].map((filter) => {
              const isActive = statusFilter === filter.value;
              const Icon = filter.icon;
              return (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value as RequestStatus | "ALL")}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary-600 text-white shadow-sm"
                      : "bg-white text-neutral-600 border border-neutral-200 hover:border-primary-300 hover:text-primary-600"
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Liste des transports */}
          <Card>
            {loading ? (
              <CardContent>
                <LoadingSpinner text="Chargement de vos transports..." />
              </CardContent>
            ) : transports.length === 0 ? (
              <CardContent>
                <EmptyState
                  icon={Calendar}
                  title="Aucune demande"
                  description="Vous n'avez pas encore effectué de demande de transport. Recherchez un ambulancier pour commencer."
                  action={
                    <Link
                      href="/recherche"
                      className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                    >
                      Trouver un ambulancier
                    </Link>
                  }
                />
              </CardContent>
            ) : (
              <div className="divide-y divide-card-border">
                {transports.map((transport) => {
                  const status = statusConfig[transport.status];
                  const StatusIcon = status.icon;
                  const TransportIcon =
                    transport.transportType === "AMBULANCE" ? Ambulance : Car;

                  return (
                    <Link
                      key={transport.id}
                      href={`/mes-transports/${transport.trackingId}`}
                      className="block p-5 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Ligne 1 : Entreprise + Statut */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-semibold text-neutral-900 text-base">
                              {transport.company.name}
                            </span>
                            <StatusBadge
                              variant={statusToBadgeVariant[transport.status]}
                              label={status.label}
                              icon={StatusIcon}
                              size="sm"
                            />
                          </div>

                          {/* Ligne 2 : Trajet */}
                          <p className="text-sm text-neutral-600 mt-1.5">
                            <span className="font-medium">{transport.pickupCity}</span>
                            {" → "}
                            <span className="font-medium">{transport.destinationCity}</span>
                          </p>

                          {/* Ligne 3 : Date + Type + Tracking ID */}
                          <div className="flex items-center gap-4 mt-2 flex-wrap">
                            <span className="text-sm text-neutral-600">
                              {formatDate(transport.requestedDate)} à {transport.requestedTime}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 rounded-lg text-xs text-neutral-600">
                              <TransportIcon className="h-3 w-3" />
                              {transport.transportType}
                            </span>
                            <span className="text-xs text-neutral-400 font-mono">
                              #{truncateTrackingId(transport.trackingId)}
                            </span>
                          </div>

                          {/* Ligne 4 : Contre-proposition si applicable */}
                          {transport.status === "COUNTER_PROPOSAL" &&
                            transport.proposedDate &&
                            transport.proposedTime && (
                              <div className="mt-2 px-3 py-2 bg-accent-50 rounded-lg">
                                <p className="text-sm text-accent-700">
                                  <span className="font-medium">Nouvelle date proposée : </span>
                                  {formatDate(transport.proposedDate)} à {transport.proposedTime}
                                </p>
                              </div>
                            )}
                        </div>

                        <ChevronRight className="h-5 w-5 text-neutral-400 shrink-0 mt-1" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
