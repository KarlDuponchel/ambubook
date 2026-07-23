"use client";

import { useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
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
  CalendarClock,
  Loader2,
  Repeat,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Header, Footer } from "@/components/landing";
import { Container, useToast } from "@/components/ui";
import type {
  RequestStatus,
  TransportType,
  MobilityType,
  TripType,
  RequestHistoryEntry,
} from "@/lib/types";

interface TransportDetail {
  id: string;
  trackingId: string;
  status: RequestStatus;
  transportType: TransportType;
  tripType: TripType;
  mobilityType: MobilityType;
  patientFirstName: string;
  patientLastName: string;
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
}

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

const EVENT_LABELS: Record<string, string> = {
  CREATED: "Demande créée",
  STATUS_CHANGED: "Statut modifié",
  COUNTER_PROPOSAL: "Contre-proposition",
  CUSTOMER_RESPONSE: "Réponse du client",
  NOTE_ADDED: "Note ajoutée",
  ATTACHMENT_ADDED: "Pièce jointe ajoutée",
};

/** Carte de section éditoriale avec en-tête optionnel. */
function SectionCard({
  icon: Icon,
  title,
  children,
  className = "",
  style,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`bg-surface border border-line rounded-2xl p-5 ${className}`} style={style}>
      {title && (
        <div className="flex items-center gap-2.5 mb-4">
          {Icon && <Icon className="h-5 w-5 text-ink-3" />}
          <h2 className="font-bold text-ink">{title}</h2>
        </div>
      )}
      {children}
    </div>
  );
}

export default function SuiviTransportPage({
  params,
}: {
  params: Promise<{ trackingId: string }>;
}) {
  const { trackingId } = use(params);
  const toast = useToast();
  const [transport, setTransport] = useState<TransportDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Vérification 2e facteur : nom du patient
  const [nameInput, setNameInput] = useState("");
  const [verifiedName, setVerifiedName] = useState("");
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // États pour la réponse à une contre-proposition
  const [showCounterForm, setShowCounterForm] = useState(false);
  const [responseNote, setResponseNote] = useState("");
  const [proposedDate, setProposedDate] = useState("");
  const [proposedTime, setProposedTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseError, setResponseError] = useState<string | null>(null);

  const loadTransport = async (name: string) => {
    setLoading(true);
    setVerifyError(null);
    try {
      const response = await fetch(
        `/api/public/transport/${trackingId}?nom=${encodeURIComponent(name)}`
      );
      if (response.ok) {
        const data = await response.json();
        setTransport(data);
        setVerifiedName(name);
      } else if (response.status === 401) {
        setVerifyError("Nom du patient incorrect. Veuillez réessayer.");
      } else if (response.status === 429) {
        setVerifyError("Trop de tentatives. Veuillez réessayer plus tard.");
      } else if (response.status === 404) {
        setError("Demande de transport non trouvée");
      } else if (response.status === 400) {
        setError("Identifiant de suivi invalide");
      } else {
        setVerifyError("Erreur lors du chargement");
      }
    } catch {
      setVerifyError("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameInput.trim();
    if (name) loadTransport(name);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Répondre à une contre-proposition
  const handleResponse = async (action: "accept" | "counter_proposal" | "cancel") => {
    if (isSubmitting) return;

    if (action === "counter_proposal" && (!proposedDate || !proposedTime)) {
      setResponseError("Veuillez sélectionner une date et une heure");
      return;
    }

    setIsSubmitting(true);
    setResponseError(null);

    try {
      const response = await fetch(
        `/api/public/transport/${trackingId}?nom=${encodeURIComponent(verifiedName)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            responseNote: responseNote || null,
            proposedDate: action === "counter_proposal" ? proposedDate : null,
            proposedTime: action === "counter_proposal" ? proposedTime : null,
          }),
        }
      );

      if (response.ok) {
        await loadTransport(verifiedName);
        setShowCounterForm(false);
        setResponseNote("");
        setProposedDate("");
        setProposedTime("");

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

  const chrome = (children: React.ReactNode) => (
    <div className="min-h-screen flex flex-col bg-page">
      <Header />
      <main className="flex-1 pt-24 lg:pt-28 pb-16">{children}</main>
      <Footer />
    </div>
  );

  if (loading) {
    return chrome(
      <div className="grid place-items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (error) {
    return chrome(
      <Container>
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-ink-2 transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l&apos;accueil
        </Link>
        <div className="bg-surface border border-line rounded-2xl p-12 text-center max-w-lg mx-auto">
          <XCircle className="h-12 w-12 text-ink-3 mx-auto mb-4" />
          <p className="text-lg font-bold text-ink mb-2">{error || "Demande non trouvée"}</p>
          <p className="text-ink-2 text-sm">
            Vérifiez que le lien de suivi est correct ou contactez l&apos;entreprise.
          </p>
        </div>
      </Container>
    );
  }

  // Formulaire de vérification : demande le nom du patient (2e facteur)
  if (!transport) {
    return chrome(
      <Container size="md">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-ink-2 transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l&apos;accueil
        </Link>
        <div className="max-w-md mx-auto bg-surface border border-line rounded-2xl shadow-soft p-8">
          <div className="grid place-items-center w-14 h-14 rounded-2xl bg-brand/12 text-brand mx-auto mb-5">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="serif text-2xl text-ink text-center mb-2">Suivi de votre transport</h1>
          <p className="text-sm text-ink-2 text-center mb-6 leading-relaxed">
            Pour votre confidentialité, confirmez le <strong className="text-ink">nom de famille
            du patient</strong> avant d&apos;accéder aux informations.
          </p>
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label
                htmlFor="nom"
                className="block text-xs font-bold uppercase tracking-wide text-ink-3 mb-1.5"
              >
                Nom de famille
              </label>
              <input
                id="nom"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                required
                autoComplete="off"
                className="w-full border border-line rounded-xl px-3.5 py-3 text-[15px] text-ink bg-surface placeholder:text-ink-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors"
                placeholder="Ex : Dupont"
              />
            </div>
            {verifyError && <p className="text-sm text-rouge">{verifyError}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-brand text-white font-bold py-3 rounded-xl hover:bg-brand-ink disabled:opacity-50 transition-colors"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Vérifier et accéder au suivi
            </button>
          </form>
        </div>
      </Container>
    );
  }

  const status = statusConfig[transport.status];
  const TransportIcon = transport.transportType === "AMBULANCE" ? Ambulance : Car;
  const detailFields = [
    { label: "Type de véhicule", value: TRANSPORT_LABELS[transport.transportType] },
    { label: "Type de trajet", value: TRIP_LABELS[transport.tripType] },
    { label: "Mobilité du patient", value: MOBILITY_LABELS[transport.mobilityType] },
    { label: "Bon de transport", value: transport.hasTransportVoucher ? "Oui" : "Non" },
  ];

  return chrome(
    <Container>
      {/* Back link */}
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-ink-2 transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à l&apos;accueil
      </Link>

      {/* En-tête */}
      <div className="mb-7 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-teal mb-1">
            Suivi de votre demande
          </p>
          <h1 className="serif text-2xl lg:text-3xl text-ink">
            Transport pour {transport.patientFirstName} {transport.patientLastName}
          </h1>
          <p className="mt-1 text-sm text-ink-2">
            Demande créée le {formatDate(transport.createdAt)}
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 text-sm font-bold px-3.5 py-2 rounded-full whitespace-nowrap self-start"
          style={{
            color: status.color,
            background: `color-mix(in srgb, ${status.color} 13%, var(--surface))`,
            border: `1px solid color-mix(in srgb, ${status.color} 32%, transparent)`,
          }}
        >
          <status.icon className="h-4 w-4" />
          {status.label}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-5">
          {/* Contre-proposition avec actions */}
          {transport.status === "COUNTER_PROPOSAL" &&
            transport.proposedDate &&
            transport.proposedTime && (
              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: "1px solid color-mix(in srgb, var(--violet) 34%, transparent)" }}
              >
                <div
                  className="p-5"
                  style={{
                    background: "color-mix(in srgb, var(--violet) 11%, var(--surface))",
                    borderBottom: "1px solid color-mix(in srgb, var(--violet) 24%, transparent)",
                  }}
                >
                  <div className="flex items-center gap-2.5 font-extrabold text-violet mb-2">
                    <Repeat className="h-5 w-5" />
                    Contre-proposition de l&apos;ambulancier
                  </div>
                  <p className="text-sm text-ink mb-1">
                    <strong>Nouvelle date proposée :</strong>{" "}
                    {formatDate(transport.proposedDate)} à {transport.proposedTime}
                  </p>
                  {transport.responseNote && (
                    <p className="text-sm text-ink-2 leading-relaxed">
                      «&nbsp;{transport.responseNote}&nbsp;»
                    </p>
                  )}
                </div>

                <div className="p-5">
                  <div className="text-xs font-bold uppercase tracking-wide text-ink-3 mb-3">
                    Votre réponse
                  </div>

                  <div className="mb-3">
                    <textarea
                      value={responseNote}
                      onChange={(e) => setResponseNote(e.target.value)}
                      placeholder="Message optionnel à l'ambulancier…"
                      rows={2}
                      disabled={isSubmitting}
                      className="w-full px-3.5 py-2.5 border border-line rounded-xl bg-surface-2 text-ink text-sm placeholder:text-ink-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 resize-y transition-colors"
                    />
                  </div>

                  {responseError && <p className="text-sm text-rouge mb-3">{responseError}</p>}

                  <div className="flex flex-col gap-2.5">
                    <button
                      onClick={() => handleResponse("accept")}
                      disabled={isSubmitting}
                      className="flex items-center gap-3 text-left bg-surface border border-line rounded-xl p-3.5 hover:border-vert transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin text-vert shrink-0" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-vert shrink-0" />
                      )}
                      <span>
                        <span className="block font-bold text-sm text-ink">Accepter cette date</span>
                        <span className="block text-[13px] text-ink-2">
                          Confirmer le créneau du {formatDate(transport.proposedDate)} à {transport.proposedTime}.
                        </span>
                      </span>
                    </button>

                    <button
                      onClick={() => setShowCounterForm(!showCounterForm)}
                      disabled={isSubmitting}
                      className={`flex items-center gap-3 text-left bg-surface border rounded-xl p-3.5 transition-colors disabled:opacity-50 ${
                        showCounterForm ? "border-brand" : "border-line hover:border-brand"
                      }`}
                    >
                      <CalendarClock className="h-5 w-5 text-brand shrink-0" />
                      <span>
                        <span className="block font-bold text-sm text-ink">Proposer une autre date</span>
                        <span className="block text-[13px] text-ink-2">
                          Suggérer un créneau qui vous convient.
                        </span>
                      </span>
                    </button>

                    {showCounterForm && (
                      <div className="flex gap-2.5 px-1 pb-1 animate-in fade-in duration-200">
                        <input
                          type="date"
                          value={proposedDate}
                          onChange={(e) => setProposedDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          disabled={isSubmitting}
                          className="flex-1 px-3 py-2.5 border border-line rounded-xl bg-surface-2 text-ink text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors"
                        />
                        <input
                          type="time"
                          value={proposedTime}
                          onChange={(e) => setProposedTime(e.target.value)}
                          disabled={isSubmitting}
                          className="w-32 px-3 py-2.5 border border-line rounded-xl bg-surface-2 text-ink text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors"
                        />
                      </div>
                    )}

                    <button
                      onClick={() => handleResponse("cancel")}
                      disabled={isSubmitting}
                      className="flex items-center gap-3 text-left bg-surface border border-line rounded-xl p-3.5 hover:border-rouge transition-colors disabled:opacity-50"
                    >
                      <XCircle className="h-5 w-5 text-rouge shrink-0" />
                      <span>
                        <span className="block font-bold text-sm text-ink">Annuler la demande</span>
                        <span className="block text-[13px] text-ink-2">
                          Vous ne souhaitez plus ce transport.
                        </span>
                      </span>
                    </button>

                    {showCounterForm && (
                      <button
                        onClick={() => handleResponse("counter_proposal")}
                        disabled={isSubmitting || !proposedDate || !proposedTime}
                        className="flex items-center justify-center gap-2 bg-brand text-white font-bold rounded-xl py-3 hover:bg-brand-ink transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        Envoyer ma réponse
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* Message de statut : accepté */}
          {transport.status === "ACCEPTED" && (
            <div
              className="rounded-2xl p-5 flex items-start gap-3"
              style={{
                background: "color-mix(in srgb, var(--vert) 10%, var(--surface))",
                border: "1px solid color-mix(in srgb, var(--vert) 28%, transparent)",
              }}
            >
              <CheckCircle className="h-5 w-5 text-vert shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-vert">Transport accepté</h3>
                <p className="text-sm text-ink-2 mt-1">
                  Votre transport est confirmé pour le {formatDate(transport.requestedDate)} à {transport.requestedTime}.
                </p>
              </div>
            </div>
          )}

          {/* Message de statut : refusé */}
          {transport.status === "REFUSED" && (
            <div
              className="rounded-2xl p-5 flex items-start gap-3"
              style={{
                background: "color-mix(in srgb, var(--rouge) 8%, var(--surface))",
                border: "1px solid color-mix(in srgb, var(--rouge) 28%, transparent)",
              }}
            >
              <XCircle className="h-5 w-5 text-rouge shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-rouge">Demande refusée</h3>
                <p className="text-sm text-ink-2 mt-1">
                  L&apos;entreprise n&apos;est pas disponible pour ce transport.
                  {transport.responseNote && (
                    <span className="block mt-2 italic">«&nbsp;{transport.responseNote}&nbsp;»</span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Détails du transport */}
          <SectionCard icon={TransportIcon} title="Détails du transport">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {detailFields.map((f) => (
                <div key={f.label}>
                  <p className="text-[13px] text-ink-3">{f.label}</p>
                  <p className="font-semibold text-ink">{f.value}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Date et heure */}
          <SectionCard icon={Calendar} title="Date et heure">
            <div className="space-y-4">
              <div>
                <p className="text-[13px] text-ink-3">Date du transport</p>
                <p className="font-semibold text-ink">
                  {formatDate(transport.requestedDate)} à {transport.requestedTime}
                </p>
              </div>
              {transport.tripType === "ROUND_TRIP" &&
                transport.returnDate &&
                transport.returnTime && (
                  <div>
                    <p className="text-[13px] text-ink-3">Retour prévu</p>
                    <p className="font-semibold text-ink">
                      {formatDate(transport.returnDate)} à {transport.returnTime}
                    </p>
                  </div>
                )}
            </div>
          </SectionCard>

          {/* Trajet */}
          <SectionCard icon={MapPin} title="Trajet">
            <div className="relative">
              <div className="absolute left-3 top-8 bottom-8 w-0.5 bg-line" />
              <div className="relative flex gap-4 pb-6">
                <div className="w-6 h-6 rounded-full bg-vert flex items-center justify-center shrink-0 z-10">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-vert mb-1">Départ</p>
                  <p className="font-semibold text-ink">{transport.pickupAddress}</p>
                  <p className="text-sm text-ink-2">
                    {transport.pickupPostalCode} {transport.pickupCity}
                  </p>
                  {transport.pickupDetails && (
                    <p className="text-sm text-ink-3 mt-1 italic">{transport.pickupDetails}</p>
                  )}
                </div>
              </div>
              <div className="relative flex gap-4">
                <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center shrink-0 z-10">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-brand mb-1">Arrivée</p>
                  <p className="font-semibold text-ink">{transport.destinationAddress}</p>
                  <p className="text-sm text-ink-2">
                    {transport.destinationPostalCode} {transport.destinationCity}
                  </p>
                  {transport.destinationDetails && (
                    <p className="text-sm text-ink-3 mt-1 italic">{transport.destinationDetails}</p>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Accompagnant */}
          {transport.needsAccompanist && (
            <SectionCard icon={User} title="Accompagnant">
              <p className="text-ink">{transport.accompanistName || "Oui (nom non précisé)"}</p>
            </SectionCard>
          )}

          {/* Documents : non exposés en suivi public */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "color-mix(in srgb, var(--brand) 6%, var(--surface))",
              border: "1px solid color-mix(in srgb, var(--brand) 22%, transparent)",
            }}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <FileText className="h-5 w-5 text-brand" />
              <h2 className="font-bold text-ink">Vos documents</h2>
            </div>
            <p className="text-sm text-ink-2 mb-4 leading-relaxed">
              Pour protéger vos données de santé, les documents liés à cette demande (ordonnance,
              carte vitale, bon de transport) ne sont pas accessibles depuis ce lien de suivi.
              Créez un compte pour retrouver toutes vos demandes et vos documents centralisés.
            </p>
            <Link
              href="/inscription"
              className="inline-flex items-center justify-center bg-brand text-white font-bold px-4 py-2.5 rounded-xl hover:bg-brand-ink transition-colors text-sm"
            >
              Créer un compte gratuit
            </Link>
          </div>

          {/* Historique simplifié */}
          {transport.history && transport.history.length > 0 && (
            <SectionCard icon={Clock} title="Historique">
              <div className="space-y-3">
                {transport.history.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-ink-3 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-ink">
                        {EVENT_LABELS[event.eventType] || event.eventType}
                      </p>
                      {event.comment && (
                        <p className="text-ink-3 truncate">{event.comment}</p>
                      )}
                    </div>
                    <p className="text-ink-3 text-xs whitespace-nowrap">
                      {formatDateTime(event.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="space-y-5">
          {/* Entreprise */}
          <SectionCard icon={Building2} title="Entreprise">
            <div className="space-y-3">
              <Link
                href={`/${transport.company.slug}`}
                className="inline-flex items-center gap-1 text-lg font-bold text-brand hover:text-brand-ink hover:underline"
              >
                {transport.company.name}
                <ExternalLink className="h-4 w-4" />
              </Link>
              {transport.company.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-ink-3" />
                  <a href={`tel:${transport.company.phone}`} className="text-sm text-ink-2 hover:text-ink">
                    {transport.company.phone}
                  </a>
                </div>
              )}
              {transport.company.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-ink-3" />
                  <a
                    href={`mailto:${transport.company.email}`}
                    className="text-sm text-ink-2 hover:text-ink break-all"
                  >
                    {transport.company.email}
                  </a>
                </div>
              )}
              {transport.company.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-ink-3 shrink-0 mt-0.5" />
                  <p className="text-sm text-ink-2">
                    {transport.company.address}
                    <br />
                    {transport.company.postalCode} {transport.company.city}
                  </p>
                </div>
              )}
            </div>
          </SectionCard>

          {/* CTA créer un compte */}
          <div
            className="rounded-2xl p-5 text-center"
            style={{ background: "var(--brand)", color: "#fff" }}
          >
            <h3 className="serif text-lg mb-1">Suivez tous vos transports au même endroit</h3>
            <p className="text-sm text-white/85 mb-4">
              Créez un compte gratuit pour gérer vos demandes et documents.
            </p>
            <Link
              href="/inscription"
              className="inline-flex items-center justify-center w-full bg-white text-brand font-bold px-4 py-2.5 rounded-xl hover:bg-white/90 transition-colors text-sm"
            >
              Créer un compte gratuit
            </Link>
          </div>

          {/* Numéro de suivi */}
          <SectionCard>
            <p className="text-[13px] text-ink-3 mb-1">Numéro de suivi</p>
            <p className="font-mono text-xs text-ink break-all">{transport.trackingId}</p>
          </SectionCard>
        </div>
      </div>
    </Container>
  );
}
