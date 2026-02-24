"use client";

import { Eye, Truck, Car, ArrowLeftRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AdminTransport,
  RequestStatus,
  TransportType,
  TripType,
  STATUS_LABELS,
  TRANSPORT_LABELS,
} from "@/lib/types";

interface TransportsTableProps {
  transports: AdminTransport[];
  onViewDetails: (transport: AdminTransport) => void;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
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
  switch (type) {
    case "AMBULANCE":
      return "bg-red-100 text-red-700";
    case "VSL":
      return "bg-blue-100 text-blue-700";
  }
}

function getTripTypeIcon(type: TripType) {
  return type === "ROUND_TRIP" ? ArrowLeftRight : ArrowRight;
}

function getTripTypeLabel(type: TripType) {
  return type === "ROUND_TRIP" ? "A/R" : "Aller";
}

export function TransportsTable({ transports, onViewDetails }: TransportsTableProps) {
  if (transports.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
        <p className="text-neutral-500">Aucun transport trouvé</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                N° Suivi
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Patient
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider hidden lg:table-cell">
                Entreprise
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Type
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider hidden md:table-cell">
                Trajet
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider hidden sm:table-cell">
                Date transport
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider hidden xl:table-cell">
                Créé le
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {transports.map((transport) => {
              const TripIcon = getTripTypeIcon(transport.tripType);

              return (
                <tr
                  key={transport.id}
                  className="hover:bg-neutral-50 transition-colors"
                >
                  {/* N° Suivi */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-neutral-900">
                      {transport.trackingId.substring(0, 8)}
                    </span>
                  </td>

                  {/* Patient */}
                  <td className="px-4 py-3">
                    <div className="min-w-0">
                      <p className="font-medium text-neutral-900 text-sm truncate">
                        {transport.patientFirstName} {transport.patientLastName}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        {transport.patientPhone}
                      </p>
                    </div>
                  </td>

                  {/* Entreprise */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm text-neutral-700 truncate block max-w-32">
                      {transport.company.name}
                    </span>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
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
                  </td>

                  {/* Trajet */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-neutral-600">
                      <TripIcon className="h-3.5 w-3.5 text-neutral-400" />
                      <span className="truncate max-w-24">
                        {transport.pickupCity}
                      </span>
                      <span className="text-neutral-400">→</span>
                      <span className="truncate max-w-24">
                        {transport.destinationCity}
                      </span>
                    </div>
                  </td>

                  {/* Date transport */}
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="text-sm">
                      <span className="text-neutral-900">
                        {formatDate(transport.requestedDate)}
                      </span>
                      <span className="text-neutral-500 ml-1">
                        {transport.requestedTime}
                      </span>
                    </div>
                  </td>

                  {/* Statut */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex px-2 py-0.5 rounded text-xs font-medium",
                        getStatusStyles(transport.status)
                      )}
                    >
                      {STATUS_LABELS[transport.status]}
                    </span>
                  </td>

                  {/* Créé le */}
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <span className="text-sm text-neutral-500">
                      {formatDateTime(transport.createdAt)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onViewDetails(transport)}
                      className="p-1.5 rounded text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                      title="Voir les détails"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
