"use client";

import { useState } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  Calendar,
  Truck,
  Car,
  MapPin,
  Clock,
  ArrowRight,
  ArrowLeftRight,
  FileText,
  Download,
  Building2,
  History,
  Paperclip,
  AlertCircle,
  Plus,
  MessageSquare,
  Accessibility,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AdminTransportFull,
  RequestStatus,
  TransportType,
  MobilityType,
  TripType,
  HistoryEventType,
  STATUS_LABELS,
  TRANSPORT_LABELS,
  MOBILITY_LABELS,
  ATTACHMENT_TYPE_LABELS,
  AttachmentType,
  UserRole,
} from "@/lib/types";

interface TransportDetailsModalProps {
  transport: AdminTransportFull;
  onClose: () => void;
  onUpdateStatus: (transportId: string, status: RequestStatus, adminNote?: string) => void;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatBirthDate(dateString: string) {
  const date = new Date(dateString);
  const age = Math.floor(
    (new Date().getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
  return `${date.toLocaleDateString("fr-FR")} (${age} ans)`;
}

function getStatusStyles(status: RequestStatus) {
  switch (status) {
    case "PENDING":
      return "bg-neutral-900 text-white";
    case "ACCEPTED":
      return "bg-green-100 text-green-700";
    case "REFUSED":
      return "bg-red-100 text-red-700";
    case "COUNTER_PROPOSAL":
      return "bg-amber-100 text-amber-700";
    case "COMPLETED":
      return "bg-blue-100 text-blue-700";
    case "CANCELLED":
      return "bg-neutral-200 text-neutral-500";
  }
}

function getTransportTypeStyles(type: TransportType) {
  return type === "AMBULANCE" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700";
}

function getMobilityIcon(type: MobilityType) {
  switch (type) {
    case "WHEELCHAIR":
      return Accessibility;
    case "STRETCHER":
      return Truck;
    default:
      return User;
  }
}

const EVENT_ICONS: Record<HistoryEventType, React.ComponentType<{ className?: string }>> = {
  CREATED: Plus,
  STATUS_CHANGED: Clock,
  COUNTER_PROPOSAL: AlertCircle,
  CUSTOMER_RESPONSE: User,
  NOTE_ADDED: MessageSquare,
  ATTACHMENT_ADDED: Paperclip,
};

const STATUS_COLORS: Record<RequestStatus, string> = {
  PENDING: "text-amber-600",
  ACCEPTED: "text-green-600",
  REFUSED: "text-red-600",
  COUNTER_PROPOSAL: "text-amber-600",
  CANCELLED: "text-neutral-500",
  COMPLETED: "text-blue-600",
};

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  AMBULANCIER: "Ambulancier",
  CUSTOMER: "Client",
};

export function TransportDetailsModal({
  transport,
  onClose,
  onUpdateStatus,
}: TransportDetailsModalProps) {
  const [showStatusChange, setShowStatusChange] = useState(false);
  const [newStatus, setNewStatus] = useState<RequestStatus>(transport.status);
  const [adminNote, setAdminNote] = useState("");

  const handleStatusChange = () => {
    if (newStatus !== transport.status) {
      onUpdateStatus(transport.id, newStatus, adminNote || undefined);
      setShowStatusChange(false);
      setAdminNote("");
    }
  };

  const MobilityIcon = getMobilityIcon(transport.mobilityType);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-4 py-3 border-b border-neutral-200 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-neutral-900">
                Transport #{transport.trackingId.substring(0, 8)}
              </h2>
              <span
                className={cn(
                  "inline-flex px-2 py-0.5 rounded text-xs font-medium",
                  getStatusStyles(transport.status)
                )}
              >
                {STATUS_LABELS[transport.status]}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
                  getTransportTypeStyles(transport.transportType)
                )}
              >
                {transport.transportType === "AMBULANCE" ? (
                  <Truck className="h-3 w-3" />
                ) : (
                  <Car className="h-3 w-3" />
                )}
                {TRANSPORT_LABELS[transport.transportType]}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-600">
                {transport.tripType === "ROUND_TRIP" ? (
                  <ArrowLeftRight className="h-3 w-3" />
                ) : (
                  <ArrowRight className="h-3 w-3" />
                )}
                {transport.tripType === "ROUND_TRIP" ? "Aller-retour" : "Aller simple"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Section 1: Infos patient */}
          <div>
            <h3 className="text-sm font-medium text-neutral-900 mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Informations patient
            </h3>
            <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-neutral-900 flex items-center justify-center text-white font-bold">
                  {transport.patientFirstName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-neutral-900">
                    {transport.patientFirstName} {transport.patientLastName}
                  </p>
                  {transport.patientBirthDate && (
                    <p className="text-xs text-neutral-500">
                      Né(e) le {formatBirthDate(transport.patientBirthDate)}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-neutral-600">
                  <Phone className="h-4 w-4 text-neutral-400" />
                  {transport.patientPhone}
                </div>
                {transport.patientEmail && (
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Mail className="h-4 w-4 text-neutral-400" />
                    {transport.patientEmail}
                  </div>
                )}
              </div>
              {transport.user && (
                <div className="pt-2 border-t border-neutral-200">
                  <p className="text-xs text-neutral-500">
                    Compte utilisateur : {transport.user.name} ({transport.user.email})
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Détails transport */}
          <div>
            <h3 className="text-sm font-medium text-neutral-900 mb-3 flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Détails du transport
            </h3>
            <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-neutral-500">Date :</span>
                  <p className="font-medium text-neutral-900">
                    {formatDate(transport.requestedDate)} à {transport.requestedTime}
                  </p>
                </div>
                {transport.tripType === "ROUND_TRIP" && transport.returnDate && (
                  <div>
                    <span className="text-neutral-500">Retour :</span>
                    <p className="font-medium text-neutral-900">
                      {formatDate(transport.returnDate)} à {transport.returnTime}
                    </p>
                  </div>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <MobilityIcon className="h-4 w-4 text-neutral-400" />
                  <span className="text-neutral-600">
                    {MOBILITY_LABELS[transport.mobilityType]}
                  </span>
                </div>
                {transport.needsAccompanist && (
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-neutral-400" />
                    <span className="text-neutral-600">
                      Accompagnant : {transport.accompanistName || "Oui"}
                    </span>
                  </div>
                )}
              </div>
              {transport.hasTransportVoucher && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-green-500" />
                  <span className="text-green-700">Bon de transport</span>
                </div>
              )}
              {transport.reason && (
                <div className="pt-2 border-t border-neutral-200">
                  <span className="text-neutral-500 text-sm">Motif :</span>
                  <p className="text-sm text-neutral-700">{transport.reason}</p>
                </div>
              )}
              {transport.notes && (
                <div className="pt-2 border-t border-neutral-200">
                  <span className="text-neutral-500 text-sm">Notes :</span>
                  <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                    {transport.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Adresses */}
          <div>
            <h3 className="text-sm font-medium text-neutral-900 mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Adresses
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {/* Départ */}
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">A</span>
                  </div>
                  <span className="text-sm font-medium text-green-700">Départ</span>
                </div>
                <p className="text-sm text-neutral-900">{transport.pickupAddress}</p>
                <p className="text-sm text-neutral-600">
                  {transport.pickupPostalCode} {transport.pickupCity}
                </p>
                {transport.pickupDetails && (
                  <p className="text-xs text-neutral-500 mt-1 italic">
                    {transport.pickupDetails}
                  </p>
                )}
              </div>

              {/* Arrivée */}
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">B</span>
                  </div>
                  <span className="text-sm font-medium text-red-700">Arrivée</span>
                </div>
                <p className="text-sm text-neutral-900">{transport.destinationAddress}</p>
                <p className="text-sm text-neutral-600">
                  {transport.destinationPostalCode} {transport.destinationCity}
                </p>
                {transport.destinationDetails && (
                  <p className="text-xs text-neutral-500 mt-1 italic">
                    {transport.destinationDetails}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Entreprise */}
          <div>
            <h3 className="text-sm font-medium text-neutral-900 mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Entreprise
            </h3>
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="font-medium text-neutral-900">{transport.company.name}</p>
              <div className="grid sm:grid-cols-2 gap-2 mt-2 text-sm">
                {transport.company.phone && (
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Phone className="h-4 w-4 text-neutral-400" />
                    {transport.company.phone}
                  </div>
                )}
                {transport.company.email && (
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Mail className="h-4 w-4 text-neutral-400" />
                    {transport.company.email}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Historique */}
          <div>
            <h3 className="text-sm font-medium text-neutral-900 mb-3 flex items-center gap-2">
              <History className="h-4 w-4" />
              Historique ({transport.history.length})
            </h3>
            {transport.history.length === 0 ? (
              <p className="text-sm text-neutral-500">Aucun historique</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {transport.history.map((entry) => {
                  const EventIcon = EVENT_ICONS[entry.eventType];
                  const color = entry.newStatus
                    ? STATUS_COLORS[entry.newStatus]
                    : "text-neutral-600";

                  return (
                    <div
                      key={entry.id}
                      className="flex gap-3 p-3 bg-neutral-50 rounded-lg"
                    >
                      <div className={cn("shrink-0 p-1.5 rounded-full bg-white", color)}>
                        <EventIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium", color)}>
                          {entry.eventType === "STATUS_CHANGED" && entry.newStatus
                            ? `Statut : ${STATUS_LABELS[entry.newStatus]}`
                            : entry.eventType === "CREATED"
                              ? "Demande créée"
                              : entry.eventType === "NOTE_ADDED"
                                ? "Note ajoutée"
                                : entry.eventType}
                        </p>
                        {entry.comment && (
                          <p className="text-xs text-neutral-600 mt-0.5">
                            {entry.comment}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                          <span>{formatDateTime(entry.createdAt)}</span>
                          {entry.user && (
                            <span>
                              • {entry.user.name} ({ROLE_LABELS[entry.user.role]})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 6: Pièces jointes */}
          {transport.attachments.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-neutral-900 mb-3 flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Pièces jointes ({transport.attachments.length})
              </h3>
              <div className="space-y-2">
                {transport.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-5 w-5 text-neutral-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {attachment.fileName}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {ATTACHMENT_TYPE_LABELS[attachment.fileType as AttachmentType]} •{" "}
                          {attachment.fileSizeKb} Ko
                        </p>
                      </div>
                    </div>
                    <a
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200 transition-colors"
                      title="Télécharger"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions admin */}
          <div className="pt-4 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400">ID: {transport.id}</p>
                <p className="text-xs text-neutral-400">
                  Créé le {formatDateTime(transport.createdAt)}
                </p>
              </div>
              {!showStatusChange ? (
                <button
                  onClick={() => setShowStatusChange(true)}
                  className="px-3 py-1.5 text-sm bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors"
                >
                  Modifier le statut
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as RequestStatus)}
                      className="px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    >
                      {(Object.keys(STATUS_LABELS) as RequestStatus[]).map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleStatusChange}
                      disabled={newStatus === transport.status}
                      className="px-3 py-1.5 text-sm bg-neutral-900 text-white rounded-md hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                    >
                      Appliquer
                    </button>
                    <button
                      onClick={() => {
                        setShowStatusChange(false);
                        setNewStatus(transport.status);
                        setAdminNote("");
                      }}
                      className="px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                  <input
                    type="text"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Note administrative (optionnel)"
                    className="px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-neutral-200 shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-neutral-100 text-neutral-700 rounded-md hover:bg-neutral-200 transition-colors font-medium text-sm"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
