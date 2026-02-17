"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Ambulance,
  Car,
  MapPin,
  Phone,
  Mail,
  Building2,
  Calendar,
  User,
  FileText,
  Send,
  CalendarDays,
  Loader2,
} from "lucide-react";
import { Header, Footer } from "@/components/landing";
import {
  Container,
  Card,
  CardContent,
  CardHeader,
  LoadingSpinner,
  StatusBadge,
  useToast,
} from "@/components/ui";
import { RequestAttachments, RequestHistory } from "@/components/demandes";
import { useSession } from "@/lib/auth-client";
import type {
  RequestStatus,
  TransportType,
  MobilityType,
  TripType,
  StatusConfig,
  RequestAttachment,
  RequestHistoryEntry,
} from "@/lib/types";

interface TransportDetail {
  id: string;
  trackingId: string;
  status: RequestStatus;
  transportType: TransportType;
  tripType: TripType;
  mobilityType: MobilityType;
  requestedDate: string;
  requestedTime: string;
  returnDate: string | null;
  returnTime: string | null;
  proposedDate: string | null;
  proposedTime: string | null;
  pickupAddress: string;
  pickupCity: string;
  pickupPostalCode: string;
  pickupDetails: string | null;
  destinationAddress: string;
  destinationCity: string;
  destinationPostalCode: string;
  destinationDetails: string | null;
  hasTransportVoucher: boolean;
  needsAccompanist: boolean;
  accompanistName: string | null;
  reason: string | null;
  notes: string | null;
  responseNote: string | null;
  createdAt: string;
  company: {
    id: string;
    name: string;
    slug: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    postalCode: string | null;
  };
  history: RequestHistoryEntry[];
  attachments: RequestAttachment[];
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

const TRANSPORT_LABELS: Record<TransportType, string> = {
  AMBULANCE: "Ambulance",
  VSL: "VSL (Véhicule Sanitaire Léger)",
};

const MOBILITY_LABELS: Record<MobilityType, string> = {
  WALKING: "Patient valide (peut marcher)",
  WHEELCHAIR: "Fauteuil roulant",
  STRETCHER: "Brancard",
};

const TRIP_LABELS: Record<TripType, string> = {
  ONE_WAY: "Aller simple",
  ROUND_TRIP: "Aller-retour",
};

export default function TransportDetailPage({
  params,
}: {
  params: Promise<{ trackingId: string }>;
}) {
  const { trackingId } = use(params);
  const router = useRouter();
  const toast = useToast();
  const { data: session, isPending: sessionLoading } = useSession();
  const [transport, setTransport] = useState<TransportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour la réponse à une contre-proposition
  const [showCounterForm, setShowCounterForm] = useState(false);
  const [responseNote, setResponseNote] = useState("");
  const [proposedDate, setProposedDate] = useState("");
  const [proposedTime, setProposedTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseError, setResponseError] = useState<string | null>(null);

  // Rediriger si non connecté
  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push(`/connexion?redirect=/mes-transports/${trackingId}`);
    }
  }, [session, sessionLoading, router, trackingId]);

  useEffect(() => {
    if (session?.user) {
      fetchTransport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, trackingId]);

  const fetchTransport = async () => {
    try {
      const response = await fetch(`/api/customer/transports/${trackingId}`);
      if (response.ok) {
        const data = await response.json();
        setTransport(data);
      } else if (response.status === 404) {
        setError("Transport non trouvé");
      } else {
        setError("Erreur lors du chargement");
      }
    } catch {
      toast.error("Erreur lors du chargement du transport");
      setError("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleAttachmentAdded = (attachment: RequestAttachment) => {
    if (transport) {
      setTransport({
        ...transport,
        attachments: [attachment, ...transport.attachments],
      });
    }
  };

  const handleAttachmentDeleted = (attachmentId: string) => {
    if (transport) {
      setTransport({
        ...transport,
        attachments: transport.attachments.filter((a) => a.id !== attachmentId),
      });
    }
  };

  // Répondre à une contre-proposition
  const handleResponse = async (action: "accept" | "counter_proposal" | "cancel") => {
    if (isSubmitting) return;

    // Validation pour contre-proposition
    if (action === "counter_proposal" && (!proposedDate || !proposedTime)) {
      setResponseError("Veuillez sélectionner une date et une heure");
      return;
    }

    setIsSubmitting(true);
    setResponseError(null);

    try {
      const response = await fetch(`/api/customer/transports/${trackingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          responseNote: responseNote || null,
          proposedDate: action === "counter_proposal" ? proposedDate : null,
          proposedTime: action === "counter_proposal" ? proposedTime : null,
        }),
      });

      if (response.ok) {
        // Recharger les données
        await fetchTransport();
        // Réinitialiser le formulaire
        setShowCounterForm(false);
        setResponseNote("");
        setProposedDate("");
        setProposedTime("");
        // Toast de succès
        if (action === "accept") {
          toast.success("Vous avez accepté la contre-proposition");
        } else if (action === "counter_proposal") {
          toast.success("Votre proposition a été envoyée");
        } else if (action === "cancel") {
          toast.info("La demande a été annulée");
        }
      } else {
        const data = await response.json();
        const errorMsg = data.error || "Une erreur est survenue";
        setResponseError(errorMsg);
        toast.error(errorMsg);
      }
    } catch {
      toast.error("Une erreur est survenue");
      setResponseError("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
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

  // Ne rien afficher si non connecté
  if (!session?.user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 lg:pt-28">
          <LoadingSpinner fullPage text="Chargement des détails..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !transport) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 lg:pt-28 pb-16">
          <Container>
            <Link
              href="/mes-transports"
              className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à mes transports
            </Link>
            <Card>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-neutral-500">
                    {error || "Transport non trouvé"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  const status = statusConfig[transport.status];
  const StatusIcon = status.icon;
  const TransportIcon = transport.transportType === "AMBULANCE" ? Ambulance : Car;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 lg:pt-28 pb-16">
        <Container>
          {/* Back link */}
          <Link
            href="/mes-transports"
            className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à mes transports
          </Link>

          {/* En-tête */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900">
                  Demande #{transport.trackingId.slice(0, 8)}
                </h1>
                <p className="mt-1 text-neutral-500">
                  Créée le {formatDate(transport.createdAt)}
                </p>
              </div>
              <StatusBadge
                variant={statusToBadgeVariant[transport.status]}
                label={status.label}
                icon={StatusIcon}
                size="md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contre-proposition avec actions */}
              {transport.status === "COUNTER_PROPOSAL" &&
                transport.proposedDate &&
                transport.proposedTime && (
                  <Card className="border-accent-200 bg-accent-50/50">
                    <CardContent>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-accent-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-accent-800">
                            Contre-proposition reçue
                          </h3>
                          <p className="text-sm text-accent-700 mt-1">
                            L&apos;ambulancier propose une nouvelle date :
                          </p>
                          <p className="text-lg font-semibold text-accent-900 mt-2">
                            {formatDate(transport.proposedDate)} à {transport.proposedTime}
                          </p>
                          {transport.responseNote && (
                            <p className="text-sm text-accent-700 mt-2 italic">
                              &ldquo;{transport.responseNote}&rdquo;
                            </p>
                          )}

                          {/* Formulaire de réponse */}
                          <div className="mt-6 pt-4 border-t border-accent-200">
                            <p className="text-sm font-medium text-accent-800 mb-3">
                              Comment souhaitez-vous répondre ?
                            </p>

                            {/* Note optionnelle */}
                            <div className="mb-4">
                              <label className="block text-sm text-accent-700 mb-1">
                                Message (optionnel)
                              </label>
                              <textarea
                                value={responseNote}
                                onChange={(e) => setResponseNote(e.target.value)}
                                placeholder="Ajouter un message..."
                                className="w-full px-3 py-2 border border-accent-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none h-20 text-sm"
                                disabled={isSubmitting}
                              />
                            </div>

                            {/* Formulaire contre-proposition */}
                            {showCounterForm && (
                              <div className="mb-4 p-4 bg-white rounded-lg border border-accent-200">
                                <p className="text-sm font-medium text-neutral-700 mb-3">
                                  Proposer une autre date
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs text-neutral-500 mb-1">
                                      Date
                                    </label>
                                    <input
                                      type="date"
                                      value={proposedDate}
                                      onChange={(e) => setProposedDate(e.target.value)}
                                      min={new Date().toISOString().split("T")[0]}
                                      className="w-full px-3 py-2 border border-input-border rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                      disabled={isSubmitting}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-neutral-500 mb-1">
                                      Heure
                                    </label>
                                    <input
                                      type="time"
                                      value={proposedTime}
                                      onChange={(e) => setProposedTime(e.target.value)}
                                      className="w-full px-3 py-2 border border-input-border rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                      disabled={isSubmitting}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Erreur */}
                            {responseError && (
                              <p className="text-sm text-danger-600 mb-3">{responseError}</p>
                            )}

                            {/* Boutons d'action */}
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleResponse("accept")}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 disabled:opacity-50 transition-colors text-sm font-medium"
                              >
                                {isSubmitting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                                Accepter cette date
                              </button>

                              {!showCounterForm ? (
                                <button
                                  onClick={() => setShowCounterForm(true)}
                                  disabled={isSubmitting}
                                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm font-medium"
                                >
                                  <CalendarDays className="h-4 w-4" />
                                  Proposer une autre date
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleResponse("counter_proposal")}
                                    disabled={isSubmitting || !proposedDate || !proposedTime}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm font-medium"
                                  >
                                    {isSubmitting ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Send className="h-4 w-4" />
                                    )}
                                    Envoyer ma proposition
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShowCounterForm(false);
                                      setProposedDate("");
                                      setProposedTime("");
                                    }}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors text-sm"
                                  >
                                    Annuler
                                  </button>
                                </>
                              )}

                              <button
                                onClick={() => handleResponse("cancel")}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-4 py-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors text-sm font-medium ml-auto"
                              >
                                <XCircle className="h-4 w-4" />
                                Annuler la demande
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Note de réponse */}
              {transport.responseNote && transport.status !== "COUNTER_PROPOSAL" && (() => {
                // Déterminer qui a envoyé le dernier message en regardant l'historique
                const lastEventWithComment = transport.history.find(
                  (event) => event.comment && event.user
                );
                const isFromAmbulancier = lastEventWithComment?.user?.role === "AMBULANCIER";
                const title = isFromAmbulancier ? "Message de l'ambulancier" : "Votre message";

                return (
                  <Card>
                    <CardHeader icon={FileText} title={title} />
                    <CardContent>
                      <p className="text-neutral-600 italic">
                        &ldquo;{transport.responseNote}&rdquo;
                      </p>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Détails du transport */}
              <Card>
                <CardHeader icon={TransportIcon} title="Détails du transport" />
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-neutral-500">Type de véhicule</p>
                      <p className="font-medium text-neutral-900">
                        {TRANSPORT_LABELS[transport.transportType]}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Type de trajet</p>
                      <p className="font-medium text-neutral-900">
                        {TRIP_LABELS[transport.tripType]}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Mobilité du patient</p>
                      <p className="font-medium text-neutral-900">
                        {MOBILITY_LABELS[transport.mobilityType]}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Bon de transport</p>
                      <p className="font-medium text-neutral-900">
                        {transport.hasTransportVoucher ? "Oui" : "Non"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Date et heure */}
              <Card>
                <CardHeader icon={Calendar} title="Date et heure" />
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-neutral-500">Date demandée</p>
                      <p className="font-medium text-neutral-900">
                        {formatDate(transport.requestedDate)} à {transport.requestedTime}
                      </p>
                    </div>
                    {transport.tripType === "ROUND_TRIP" &&
                      transport.returnDate &&
                      transport.returnTime && (
                        <div>
                          <p className="text-sm text-neutral-500">Retour prévu</p>
                          <p className="font-medium text-neutral-900">
                            {formatDate(transport.returnDate)} à {transport.returnTime}
                          </p>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>

              {/* Trajet */}
              <Card>
                <CardHeader icon={MapPin} title="Trajet" />
                <CardContent>
                  <div className="relative">
                    {/* Ligne de connexion */}
                    <div className="absolute left-3 top-8 bottom-8 w-0.5 bg-neutral-200" />

                    {/* Départ */}
                    <div className="relative flex gap-4 pb-6">
                      <div className="w-6 h-6 rounded-full bg-success-500 flex items-center justify-center shrink-0 z-10">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-success-600 mb-1">Départ</p>
                        <p className="font-medium text-neutral-900">
                          {transport.pickupAddress}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {transport.pickupPostalCode} {transport.pickupCity}
                        </p>
                        {transport.pickupDetails && (
                          <p className="text-sm text-neutral-500 mt-1 italic">
                            {transport.pickupDetails}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Arrivée */}
                    <div className="relative flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center shrink-0 z-10">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary-600 mb-1">Arrivée</p>
                        <p className="font-medium text-neutral-900">
                          {transport.destinationAddress}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {transport.destinationPostalCode} {transport.destinationCity}
                        </p>
                        {transport.destinationDetails && (
                          <p className="text-sm text-neutral-500 mt-1 italic">
                            {transport.destinationDetails}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Accompagnant */}
              {transport.needsAccompanist && (
                <Card>
                  <CardHeader icon={User} title="Accompagnant" />
                  <CardContent>
                    <p className="text-neutral-900">
                      {transport.accompanistName || "Oui (nom non précisé)"}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {(transport.reason || transport.notes) && (
                <Card>
                  <CardHeader icon={FileText} title="Informations complémentaires" />
                  <CardContent>
                    {transport.reason && (
                      <div className="mb-4">
                        <p className="text-sm text-neutral-500">Motif du transport</p>
                        <p className="text-neutral-900">{transport.reason}</p>
                      </div>
                    )}
                    {transport.notes && (
                      <div>
                        <p className="text-sm text-neutral-500">Notes</p>
                        <p className="text-neutral-900">{transport.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Pièces jointes */}
              <RequestAttachments
                trackingId={transport.trackingId}
                attachments={transport.attachments || []}
                context="customer"
                onAttachmentAdded={handleAttachmentAdded}
                onAttachmentDeleted={handleAttachmentDeleted}
                currentUserId={session.user.id}
              />

              {/* Historique */}
              <RequestHistory
                history={transport.history || []}
                readOnly
              />
            </div>

            {/* Colonne latérale */}
            <div className="space-y-6">
              {/* Entreprise */}
              <Card>
                <CardHeader icon={Building2} title="Entreprise" />
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Link
                        href={`/ambulanciers/${transport.company.slug}`}
                        className="text-lg font-semibold text-primary-600 hover:text-primary-700 hover:underline"
                      >
                        {transport.company.name}
                      </Link>
                    </div>
                    {transport.company.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-neutral-400" />
                        <a
                          href={`tel:${transport.company.phone}`}
                          className="text-neutral-600 hover:text-neutral-900"
                        >
                          {transport.company.phone}
                        </a>
                      </div>
                    )}
                    {transport.company.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-neutral-400" />
                        <a
                          href={`mailto:${transport.company.email}`}
                          className="text-neutral-600 hover:text-neutral-900"
                        >
                          {transport.company.email}
                        </a>
                      </div>
                    )}
                    {transport.company.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-neutral-600">
                          {transport.company.address}
                          <br />
                          {transport.company.postalCode} {transport.company.city}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Numéro de suivi */}
              <Card>
                <CardContent>
                  <p className="text-sm text-neutral-500 mb-1">Numéro de suivi</p>
                  <p className="font-mono text-sm text-neutral-900 break-all">
                    {transport.trackingId}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
