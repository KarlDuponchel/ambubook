"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  User,
  Ambulance,
  Car,
  CheckCircle,
  XCircle,
  AlertCircle,
  Navigation,
  FileText,
  Users,
  Route,
  Building2,
  CheckCircle2,
  CalendarX,
  HelpCircle,
} from "lucide-react";
import { PageHeader, Card, CardHeader, CardContent, LoadingSpinner, StatusBadge, useToast } from "@/components/ui";
import { RequestHistory, RequestAttachments } from "@/components/demandes";
import type {
  RequestStatus,
  TransportRequest,
  CompanyAddress,
  DistanceResult,
  StatusConfig,
  MobilityType,
  RequestHistoryEntry,
  RequestAttachment,
} from "@/lib/types";

interface TransportRequestWithRelations extends TransportRequest {
  history: RequestHistoryEntry[];
  attachments: RequestAttachment[];
}

const statusConfig: Record<RequestStatus, Omit<StatusConfig, "icon">> = {
  PENDING: { label: "En attente", color: "text-warning-600", bgColor: "bg-warning-50" },
  ACCEPTED: { label: "Acceptée", color: "text-success-600", bgColor: "bg-success-50" },
  REFUSED: { label: "Refusée", color: "text-danger-600", bgColor: "bg-danger-50" },
  COUNTER_PROPOSAL: { label: "Contre-proposition", color: "text-accent-600", bgColor: "bg-accent-50" },
  CANCELLED: { label: "Annulée", color: "text-neutral-600", bgColor: "bg-neutral-100" },
  COMPLETED: { label: "Terminée", color: "text-primary-600", bgColor: "bg-primary-50" },
};

const statusToBadgeVariant: Record<RequestStatus, "pending" | "accepted" | "refused" | "counter_proposal" | "cancelled" | "completed"> = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REFUSED: "refused",
  COUNTER_PROPOSAL: "counter_proposal",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

const mobilityLabels: Record<MobilityType, string> = {
  WALKING: "Patient valide (peut marcher)",
  WHEELCHAIR: "Fauteuil roulant",
  STRETCHER: "Brancard",
};

export default function DemandeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();
  const [demande, setDemande] = useState<TransportRequestWithRelations | null>(null);
  const [company, setCompany] = useState<CompanyAddress | null>(null);
  const [distances, setDistances] = useState<DistanceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRefuseModal, setShowRefuseModal] = useState(false);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [responseNote, setResponseNote] = useState("");
  const [completeNote, setCompleteNote] = useState("");
  const [proposedDate, setProposedDate] = useState("");
  const [proposedTime, setProposedTime] = useState("");

  useEffect(() => {
    const fetchDemande = async () => {
      try {
        const response = await fetch(`/api/ambulancier/demandes/${id}`);
        if (response.ok) {
          const data = await response.json();
          setDemande(data.demande);
          setCompany(data.company);
        } else if (response.status === 404) {
          toast.error("Demande non trouvée");
          router.push("/dashboard/demandes");
        }
      } catch {
        toast.error("Erreur lors du chargement de la demande");
      } finally {
        setLoading(false);
      }
    };

    fetchDemande();
  }, [id, router]);

  // Calculer les distances quand on a les données
  useEffect(() => {
    const calculateDistances = async () => {
      if (!demande || !company?.address) return;

      try {
        const response = await fetch("/api/distance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyAddress: {
              address: company.address,
              city: company.city,
              postalCode: company.postalCode,
            },
            pickupAddress: {
              address: demande.pickupAddress,
              city: demande.pickupCity,
              postalCode: demande.pickupPostalCode,
            },
            destinationAddress: {
              address: demande.destinationAddress,
              city: demande.destinationCity,
              postalCode: demande.destinationPostalCode,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setDistances(data);
        }
      } catch {
        // Silencieux - les distances sont optionnelles
      }
    };

    calculateDistances();
  }, [demande, company]);

  const handleAction = async (action: string, note?: string, date?: string, time?: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/ambulancier/demandes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          responseNote: note,
          proposedDate: date,
          proposedTime: time,
        }),
      });

      if (response.ok) {
        // Recharger la demande complète pour avoir l'historique mis à jour
        const demandeResponse = await fetch(`/api/ambulancier/demandes/${id}`);
        if (demandeResponse.ok) {
          const data = await demandeResponse.json();
          setDemande(data.demande);
        }
        setShowRefuseModal(false);
        setShowCounterModal(false);
        setResponseNote("");
        // Toast de succès selon l'action
        if (action === "accept") {
          toast.success("Demande acceptée");
        } else if (action === "refuse") {
          toast.info("Demande refusée");
        } else if (action === "counter_proposal") {
          toast.success("Contre-proposition envoyée");
        } else if (action === "complete") {
          toast.success("Transport clôturé avec succès");
          setShowCompleteModal(false);
          setCompleteNote("");
        }
      } else {
        toast.error("Erreur lors du traitement de la demande");
      }
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setActionLoading(false);
    }
  };

  const handleNoteAdded = (entry: RequestHistoryEntry) => {
    if (demande) {
      setDemande({
        ...demande,
        history: [entry, ...demande.history],
      });
    }
  };

  const handleAttachmentAdded = (attachment: RequestAttachment) => {
    if (demande) {
      setDemande({
        ...demande,
        attachments: [attachment, ...demande.attachments],
      });
    }
  };

  const handleAttachmentDeleted = (attachmentId: string) => {
    if (demande) {
      setDemande({
        ...demande,
        attachments: demande.attachments.filter((a) => a.id !== attachmentId),
      });
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

  const formatBirthDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Chargement de la demande..." />;
  }

  if (!demande) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">Demande non trouvée</p>
        <Link href="/dashboard/demandes" className="text-primary-600 hover:underline mt-2 inline-block">
          Retour aux demandes
        </Link>
      </div>
    );
  }

  const status = statusConfig[demande.status];
  const isPending = demande.status === "PENDING";

  // Calcul des dates pour la logique de clôture
  const transportDate = new Date(`${demande.requestedDate}T${demande.requestedTime ?? "00:00"}`);
  const isDatePassed = transportDate < new Date();

  const proposedTransportDate =
    demande.proposedDate && demande.proposedTime
      ? new Date(`${demande.proposedDate}T${demande.proposedTime}`)
      : null;
  const isProposedDatePassed = proposedTransportDate ? proposedTransportDate < new Date() : false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        backLink="/dashboard/demandes"
        title={`${demande.patientFirstName} ${demande.patientLastName}`}
        subtitle={`Demande #${demande.trackingId.slice(-8).toUpperCase()}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge
              variant={statusToBadgeVariant[demande.status]}
              label={status.label}
            />
            <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-500">
              <span className="h-2 w-2 rounded-full bg-success-500" />
              Mise à jour instantanée
            </div>
          </div>
        }
      />

      {/* Cas 1 : En attente de réponse */}
      {isPending && !isDatePassed && (
        <div className="bg-warning-50 border border-warning-200 rounded-2xl p-4 shadow-sm">
          <p className="text-warning-800 font-medium mb-4">Cette demande est en attente de votre réponse</p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleAction("accept")}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-success-600 text-white rounded-xl hover:bg-success-700 disabled:opacity-50 transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              Accepter
            </button>
            <button
              onClick={() => setShowCounterModal(true)}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-accent-600 text-white rounded-xl hover:bg-accent-700 disabled:opacity-50 transition-colors"
            >
              <AlertCircle className="h-4 w-4" />
              Contre-proposition
            </button>
            <button
              onClick={() => setShowRefuseModal(true)}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-danger-600 text-white rounded-xl hover:bg-danger-700 disabled:opacity-50 transition-colors"
            >
              <XCircle className="h-4 w-4" />
              Refuser
            </button>
          </div>
        </div>
      )}

      {/* Cas 2 : PENDING + date passée — demande jamais traitée */}
      {isPending && isDatePassed && (
        <div className="bg-danger-50 border border-danger-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <CalendarX className="h-5 w-5 text-danger-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-danger-900">Date de transport dépassée — demande non traitée</p>
              <p className="text-sm text-danger-700 mt-1">
                La date demandée ({formatDate(demande.requestedDate)} à {demande.requestedTime}) est passée
                sans réponse de votre part.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => setShowCompleteModal(true)}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Le transport a eu lieu — clôturer
                </button>
                <button
                  onClick={() => handleAction("refuse", "Date de transport expirée — demande non traitée")}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-danger-600 text-white rounded-xl hover:bg-danger-700 disabled:opacity-50 transition-colors text-sm"
                >
                  <XCircle className="h-4 w-4" />
                  Marquer comme expirée
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cas 3 : ACCEPTED + date passée — clôture normale */}
      {demande.status === "ACCEPTED" && isDatePassed && (
        <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-primary-900">
                Transport du {formatDate(demande.requestedDate)} à {demande.requestedTime} — date passée
              </p>
              <p className="text-sm text-primary-700 mt-1">
                Si le transport a bien eu lieu, clôturez cette demande pour garder votre tableau de bord à jour.
              </p>
              <div className="mt-3">
                <button
                  onClick={() => setShowCompleteModal(true)}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm font-medium"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Clôturer — transport effectué
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cas 4 : ACCEPTED + date future — clôture anticipée */}
      {demande.status === "ACCEPTED" && !isDatePassed && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Calendar className="h-4 w-4 text-success-600" />
              <span>
                Transport prévu le{" "}
                <span className="font-medium text-neutral-900">{formatDate(demande.requestedDate)}</span>{" "}
                à <span className="font-medium text-neutral-900">{demande.requestedTime}</span>
              </span>
            </div>
            <button
              onClick={() => setShowCompleteModal(true)}
              disabled={actionLoading}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-primary-700 bg-primary-100 hover:bg-primary-200 rounded-lg disabled:opacity-50 transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Clôturer par anticipation
            </button>
          </div>
        </div>
      )}

      {/* Cas 5 : COUNTER_PROPOSAL + date proposée passée */}
      {demande.status === "COUNTER_PROPOSAL" && isProposedDatePassed && (
        <div className="bg-accent-50 border border-accent-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-accent-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-accent-900">Date de votre contre-proposition passée</p>
              <p className="text-sm text-accent-700 mt-1">
                La date proposée ({formatDate(demande.proposedDate!)} à {demande.proposedTime}) est passée.
                Le transport a-t-il finalement eu lieu ?
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => setShowCompleteModal(true)}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Oui — clôturer
                </button>
                <button
                  onClick={() => setShowRefuseModal(true)}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-danger-600 text-white rounded-xl hover:bg-danger-700 disabled:opacity-50 transition-colors text-sm"
                >
                  <XCircle className="h-4 w-4" />
                  Non — refuser
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Infos transport */}
          <Card>
            <CardHeader icon={Calendar} title="Transport demandé" />
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-500">Date</p>
                    <p className="font-medium text-neutral-900">{formatDate(demande.requestedDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Heure</p>
                    <p className="font-medium text-neutral-900">{demande.requestedTime}</p>
                  </div>
                </div>

                {demande.tripType === "ROUND_TRIP" && demande.returnDate && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
                    <div>
                      <p className="text-sm text-neutral-500">Retour</p>
                      <p className="font-medium text-neutral-900">{formatDate(demande.returnDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Heure retour</p>
                      <p className="font-medium text-neutral-900">{demande.returnTime}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-4 border-t border-neutral-100">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-xl text-sm">
                    {demande.transportType === "AMBULANCE" ? (
                      <Ambulance className="h-4 w-4" />
                    ) : (
                      <Car className="h-4 w-4" />
                    )}
                    {demande.transportType}
                  </span>
                  <span className="px-3 py-1.5 bg-neutral-100 rounded-xl text-sm">
                    {mobilityLabels[demande.mobilityType]}
                  </span>
                  <span className="px-3 py-1.5 bg-neutral-100 rounded-xl text-sm">
                    {demande.tripType === "ROUND_TRIP" ? "Aller-retour" : "Aller simple"}
                  </span>
                  {demande.hasTransportVoucher && (
                    <span className="px-3 py-1.5 bg-secondary-100 text-secondary-700 rounded-xl text-sm font-medium">
                      Bon de transport
                    </span>
                  )}
                  {demande.isRecurring && (
                    <span className="px-3 py-1.5 bg-accent-100 text-accent-700 rounded-xl text-sm">
                      Transport régulier
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Adresses */}
          <Card>
            <CardHeader icon={MapPin} title="Trajet" />
            <CardContent>
              <div className="relative">
                {/* Point de départ */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-success-500" />
                    <div className="w-0.5 h-full bg-neutral-200 my-2" />
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="text-xs text-success-600 font-medium uppercase tracking-wide">Départ</p>
                    <p className="font-medium text-neutral-900 mt-1">
                      {demande.pickupAddress}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {demande.pickupPostalCode} {demande.pickupCity}
                    </p>
                    {demande.pickupDetails && (
                      <p className="text-sm text-neutral-500 mt-1 italic">
                        {demande.pickupDetails}
                      </p>
                    )}
                  </div>
                </div>

                {/* Point d'arrivée */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-danger-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-danger-600 font-medium uppercase tracking-wide">Arrivée</p>
                    <p className="font-medium text-neutral-900 mt-1">
                      {demande.destinationAddress}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {demande.destinationPostalCode} {demande.destinationCity}
                    </p>
                    {demande.destinationDetails && (
                      <p className="text-sm text-neutral-500 mt-1 italic">
                        {demande.destinationDetails}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Distances */}
              {distances ? (
                <div className="mt-6 pt-6 border-t border-neutral-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Route className="h-4 w-4 text-primary-600" />
                    <span className="text-sm font-medium text-neutral-700">Estimations de trajet</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {distances.companyToPickup && (
                      <div className="bg-neutral-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                          <Building2 className="h-3 w-3" />
                          <span>Entreprise à Départ</span>
                        </div>
                        <p className="font-semibold text-neutral-900">{distances.companyToPickup.distance}</p>
                        <p className="text-sm text-neutral-600">{distances.companyToPickup.duration}</p>
                      </div>
                    )}
                    {distances.pickupToDestination && (
                      <div className="bg-neutral-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                          <Navigation className="h-3 w-3" />
                          <span>Départ à Arrivée</span>
                        </div>
                        <p className="font-semibold text-neutral-900">{distances.pickupToDestination.distance}</p>
                        <p className="text-sm text-neutral-600">{distances.pickupToDestination.duration}</p>
                      </div>
                    )}
                    {distances.total && (
                      <div className="bg-primary-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 text-xs text-primary-600 mb-1">
                          <Route className="h-3 w-3" />
                          <span>Total</span>
                        </div>
                        <p className="font-semibold text-primary-900">{distances.total.distance}</p>
                        <p className="text-sm text-primary-700">{distances.total.duration}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-6 pt-6 border-t border-neutral-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Route className="h-4 w-4 text-primary-600" />
                    <span className="text-sm font-medium text-neutral-700">
                      Chargement des estimations de trajet...
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes et motif */}
          {(demande.reason || demande.notes) && (
            <Card>
              <CardHeader icon={FileText} title="Informations complémentaires" />
              <CardContent>
                <div className="space-y-4">
                  {demande.reason && (
                    <div>
                      <p className="text-sm text-neutral-500">Motif du transport</p>
                      <p className="text-neutral-900 mt-1">{demande.reason}</p>
                    </div>
                  )}
                  {demande.notes && (
                    <div>
                      <p className="text-sm text-neutral-500">Notes</p>
                      <p className="text-neutral-900 mt-1">{demande.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Réponse */}
          {demande.responseNote && (
            <Card>
              <CardHeader title="Votre réponse" />
              <CardContent>
                <p className="text-neutral-900">{demande.responseNote}</p>
                {demande.proposedDate && (
                  <p className="text-sm text-neutral-500 mt-2">
                    Date proposée : {formatDate(demande.proposedDate)} à {demande.proposedTime}
                  </p>
                )}
                {demande.respondedAt && (
                  <p className="text-xs text-neutral-400 mt-2">
                    Répondu le {new Date(demande.respondedAt).toLocaleString("fr-FR")}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Pièces jointes */}
          <RequestAttachments
            requestId={id}
            attachments={demande.attachments || []}
            onAttachmentAdded={handleAttachmentAdded}
            onAttachmentDeleted={handleAttachmentDeleted}
          />

          {/* Historique */}
          <RequestHistory
            requestId={id}
            history={demande.history || []}
            onNoteAdded={handleNoteAdded}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-8 h-fit">
          {/* Contact patient */}
          <Card>
            <CardHeader icon={User} title="Patient" />
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-neutral-900">
                    {demande.patientFirstName} {demande.patientLastName}
                  </p>
                  {demande.patientBirthDate && (
                    <p className="text-sm text-neutral-500">
                      Né(e) le {formatBirthDate(demande.patientBirthDate)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Link
                    href={`tel:${demande.patientPhone}`}
                    className="flex items-center gap-3 w-full px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                  >
                    <Phone className="h-5 w-5" />
                    <span className="font-medium">{demande.patientPhone}</span>
                  </Link>


                  {demande.patientEmail && (
                    <Link
                      href={`mailto:${demande.patientEmail}`}
                      className="flex items-center gap-3 w-full px-4 py-3 border border-primary-200 text-primary-600 rounded-xl hover:bg-primary-50 transition-colors"
                    >
                      <Mail className="h-5 w-5" />
                      <span className="text-sm truncate">{demande.patientEmail}</span>
                    </Link>

                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accompagnant */}
          {demande.needsAccompanist && (
            <Card>
              <CardHeader icon={Users} title="Accompagnant" />
              <CardContent>
                <p className="text-neutral-900">
                  {demande.accompanistName || "Accompagnant requis"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Infos demande */}
          <Card>
            <CardHeader icon={Clock} title="Informations" />
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Créée le</span>
                  <span className="text-neutral-900">
                    {new Date(demande.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">N° de suivi</span>
                  <span className="font-mono text-neutral-900">
                    {demande.trackingId.slice(-8).toUpperCase()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Refuser */}
      {showRefuseModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Refuser la demande</h3>
            <textarea
              value={responseNote}
              onChange={(e) => setResponseNote(e.target.value)}
              placeholder="Motif du refus (optionnel)..."
              className="w-full px-4 py-3 border border-input-border rounded-xl bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none h-32"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowRefuseModal(false)}
                className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleAction("refuse", responseNote)}
                disabled={actionLoading}
                className="px-4 py-2 bg-danger-600 text-white rounded-xl hover:bg-danger-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading ? "..." : "Refuser"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Clôture */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">Clôturer le transport</h3>
            </div>
            <p className="text-sm text-neutral-600 mb-4">
              Cette action marque le transport comme <strong>effectué</strong> et le retire de vos demandes actives.
              Le patient sera notifié.
            </p>

            {/* Phrases pré-définies */}
            <div className="mb-3">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                Réponse rapide
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Transport effectué sans incident.",
                  "Transport annulé à la dernière minute.",
                  "Patient pris en charge et transporté à destination.",
                  "Transport effectué, patient en bonne santé.",
                ].map((phrase) => (
                  <button
                    key={phrase}
                    type="button"
                    onClick={() => setCompleteNote(phrase)}
                    className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                      completeNote === phrase
                        ? "bg-primary-600 text-white border-primary-600"
                        : "bg-white text-neutral-600 border-neutral-200 hover:border-primary-300 hover:text-primary-700"
                    }`}
                  >
                    {phrase}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Note personnalisée <span className="text-neutral-400 font-normal">(optionnel)</span>
              </label>
              <textarea
                value={completeNote}
                onChange={(e) => setCompleteNote(e.target.value)}
                placeholder="Ex : Transport effectué sans incident, patient pris en charge à 09h15..."
                className="w-full px-4 py-3 border border-input-border rounded-xl bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none h-24 text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setShowCompleteModal(false); setCompleteNote(""); }}
                className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors text-sm"
              >
                Annuler
              </button>
              <button
                onClick={() => handleAction("complete", completeNote || undefined)}
                disabled={actionLoading}
                className="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                <CheckCircle2 className="h-4 w-4" />
                {actionLoading ? "Clôture en cours..." : "Confirmer la clôture"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Contre-proposition */}
      {showCounterModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Proposer un autre créneau</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Date proposée *
                </label>
                <input
                  type="date"
                  value={proposedDate}
                  onChange={(e) => setProposedDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-input-border rounded-xl bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Heure proposée *
                </label>
                <input
                  type="time"
                  value={proposedTime}
                  onChange={(e) => setProposedTime(e.target.value)}
                  className="w-full px-4 py-2.5 border border-input-border rounded-xl bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Message (optionnel)
                </label>
                <textarea
                  value={responseNote}
                  onChange={(e) => setResponseNote(e.target.value)}
                  placeholder="Explication de la contre-proposition..."
                  className="w-full px-4 py-3 border border-input-border rounded-xl bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none h-24"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCounterModal(false)}
                className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleAction("counter_proposal", responseNote, proposedDate, proposedTime)}
                disabled={actionLoading || !proposedDate || !proposedTime}
                className="px-4 py-2 bg-accent-600 text-white rounded-xl hover:bg-accent-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading ? "..." : "Envoyer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
