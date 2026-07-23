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
  Calendar,
  Loader2,
  Search,
  Inbox,
  Route,
  ArrowRight,
  Repeat,
} from "lucide-react";
import { Header, Footer } from "@/components/landing";
import { Container, useToast } from "@/components/ui";
import { useSession } from "@/lib/auth-client";
import type { RequestStatus, TransportType } from "@/lib/types";

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

// Couleur (token éditorial) + libellé + icône par statut.
const statusConfig: Record<
  RequestStatus,
  { label: string; color: string; icon: typeof Clock }
> = {
  PENDING: { label: "En attente", color: "var(--ambre)", icon: Clock },
  ACCEPTED: { label: "Acceptée", color: "var(--vert)", icon: CheckCircle },
  REFUSED: { label: "Refusée", color: "var(--rouge)", icon: XCircle },
  COUNTER_PROPOSAL: { label: "Contre-proposition", color: "var(--violet)", icon: Repeat },
  CANCELLED: { label: "Annulée", color: "var(--neutre)", icon: XCircle },
  COMPLETED: { label: "Terminée", color: "var(--bleu)", icon: CheckCircle },
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
      <div className="min-h-screen flex flex-col bg-page">
        <Header />
        <main className="flex-1 pt-24 lg:pt-28 grid place-items-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </main>
        <Footer />
      </div>
    );
  }

  // Ne rien afficher si non connecté (redirection en cours)
  if (!session?.user) {
    return null;
  }

  const filters = [
    { value: "ALL", label: "Tous", icon: null },
    { value: "PENDING", label: "En attente", icon: Clock },
    { value: "ACCEPTED", label: "Acceptées", icon: CheckCircle },
    { value: "COUNTER_PROPOSAL", label: "Contre-propositions", icon: AlertCircle },
    { value: "REFUSED", label: "Refusées", icon: XCircle },
    { value: "COMPLETED", label: "Terminées", icon: CheckCircle },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <Header />
      <main className="flex-1 pt-24 lg:pt-28 pb-16">
        <Container size="lg">
          {/* En-tête */}
          <div className="mb-7">
            <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-teal">
              Espace patient
            </span>
            <h1 className="serif text-3xl lg:text-4xl text-ink mt-2">Mes transports</h1>
            <p className="mt-2 text-ink-2">
              Suivez l&apos;état de vos demandes de transport sanitaire.
            </p>
          </div>

          {/* Filtres par statut */}
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.map((filter) => {
              const isActive = statusFilter === filter.value;
              const Icon = filter.icon;
              return (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value as RequestStatus | "ALL")}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                    isActive
                      ? "bg-brand text-white"
                      : "bg-surface text-ink-2 border border-line hover:border-brand hover:text-brand"
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Liste des transports */}
          {loading ? (
            <div className="grid place-items-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-brand" />
            </div>
          ) : transports.length === 0 ? (
            <div className="text-center border-[1.5px] border-dashed border-line rounded-2xl px-6 py-12">
              <div className="grid place-items-center w-14 h-14 rounded-2xl bg-surface-2 text-ink-3 mx-auto mb-4">
                <Inbox className="h-7 w-7" />
              </div>
              <p className="font-bold text-lg text-ink">Aucun transport dans cette catégorie</p>
              <p className="text-ink-2 text-sm mt-1 mb-5">
                Vos réservations apparaîtront ici dès qu&apos;elles seront créées.
              </p>
              <Link
                href="/recherche"
                className="inline-flex items-center gap-2 bg-brand text-white font-bold px-5 py-3 rounded-xl hover:bg-brand-ink transition-colors"
              >
                <Search className="h-4 w-4" />
                Trouver un ambulancier
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {transports.map((transport) => {
                const status = statusConfig[transport.status];
                const StatusIcon = status.icon;
                const TransportIcon =
                  transport.transportType === "AMBULANCE" ? Ambulance : Car;

                return (
                  <Link
                    key={transport.id}
                    href={`/mes-transports/${transport.trackingId}`}
                    className="block bg-surface border border-line rounded-2xl p-5 hover:border-brand hover:shadow-soft transition-all"
                  >
                    {/* Ligne 1 : type + entreprise + statut */}
                    <div className="flex items-start justify-between gap-3 mb-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="grid place-items-center w-11 h-11 rounded-xl shrink-0"
                          style={{
                            background: `color-mix(in srgb, ${status.color} 14%, var(--surface))`,
                            color: status.color,
                          }}
                        >
                          <TransportIcon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <div className="font-extrabold text-ink truncate">
                            {transport.company.name}
                          </div>
                          <div className="text-[13px] text-ink-3 font-mono">
                            #{truncateTrackingId(transport.trackingId)}
                          </div>
                        </div>
                      </div>
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap shrink-0"
                        style={{
                          color: status.color,
                          background: `color-mix(in srgb, ${status.color} 13%, var(--surface))`,
                          border: `1px solid color-mix(in srgb, ${status.color} 32%, transparent)`,
                        }}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {status.label}
                      </span>
                    </div>

                    {/* Ligne 2 : trajet / date / type */}
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-2">
                      <span className="inline-flex items-center gap-1.5">
                        <Route className="h-4 w-4 text-ink-3" />
                        {transport.pickupCity}
                        <ArrowRight className="h-3.5 w-3.5 text-ink-3" />
                        {transport.destinationCity}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-ink-3" />
                        {formatDate(transport.requestedDate)} · {transport.requestedTime}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <TransportIcon className="h-4 w-4 text-ink-3" />
                        {transport.transportType}
                      </span>
                    </div>

                    {/* Ligne 3 : contre-proposition */}
                    {transport.status === "COUNTER_PROPOSAL" &&
                      transport.proposedDate &&
                      transport.proposedTime && (
                        <div
                          className="mt-3.5 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
                          style={{
                            background: "color-mix(in srgb, var(--violet) 10%, var(--surface))",
                            border: "1px solid color-mix(in srgb, var(--violet) 28%, transparent)",
                          }}
                        >
                          <Repeat className="h-4 w-4 text-violet shrink-0" />
                          <span className="text-[13px] text-ink font-semibold">
                            Nouvelle date proposée :{" "}
                            <strong>
                              {formatDate(transport.proposedDate)} à {transport.proposedTime}
                            </strong>{" "}
                            — une réponse est attendue.
                          </span>
                        </div>
                      )}
                  </Link>
                );
              })}
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
