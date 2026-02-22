"use client";

import {
  X,
  Mail,
  Phone,
  Building2,
  Calendar,
  Crown,
  FileText,
  BadgeCheck,
  MapPin,
  Truck,
  Car,
  Users,
  Globe,
  Clock,
} from "lucide-react";
import { AdminCompanyFull } from "@/lib/types";

interface CompanyDetailsModalProps {
  company: AdminCompanyFull;
  onClose: () => void;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CompanyDetailsModal({
  company,
  onClose,
}: CompanyDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 sticky top-0 bg-white">
          <h2 className="font-semibold text-neutral-900">
            Détails de l&apos;entreprise
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Logo et nom */}
          <div className="flex items-center gap-4 mb-6">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="h-14 w-14 rounded-full bg-neutral-900 flex items-center justify-center text-white font-bold text-xl">
                {company.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                {company.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    company.isActive
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-200 text-neutral-600"
                  }`}
                >
                  {company.isActive ? "Active" : "Inactive"}
                </span>
                {company.hasAmbulance && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-700">
                    <Truck className="h-3 w-3" />
                    Ambulance
                  </span>
                )}
                {company.hasVSL && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-700">
                    <Car className="h-3 w-3" />
                    VSL
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-neutral-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-neutral-500 text-xs mb-1">
                <Users className="h-3.5 w-3.5" />
                Employés
              </div>
              <p className="text-lg font-semibold text-neutral-900">
                {company._count.users}
              </p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-neutral-500 text-xs mb-1">
                <Truck className="h-3.5 w-3.5" />
                Transports
              </div>
              <p className="text-lg font-semibold text-neutral-900">
                {company._count.transportRequests}
              </p>
            </div>
          </div>

          {/* Informations légales */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-neutral-900 mb-3">
              Informations légales
            </h4>
            <div className="space-y-3">
              {/* SIRET */}
              <div className="flex items-start gap-3 text-sm">
                <FileText className="h-4 w-4 text-neutral-400 mt-0.5" />
                <div>
                  <span className="text-neutral-500 text-xs">SIRET</span>
                  <p className="text-neutral-700">
                    {company.siret || (
                      <span className="text-neutral-400 italic">
                        Non renseigné
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* N° Agrément ARS */}
              <div className="flex items-start gap-3 text-sm">
                <BadgeCheck className="h-4 w-4 text-neutral-400 mt-0.5" />
                <div>
                  <span className="text-neutral-500 text-xs">
                    N° Agrément ARS
                  </span>
                  <p className="text-neutral-700">
                    {company.licenseNumber || (
                      <span className="text-neutral-400 italic">
                        Non renseigné
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-neutral-900 mb-3">
              Contact
            </h4>
            <div className="space-y-3">
              {/* Adresse */}
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-neutral-400 mt-0.5" />
                <div>
                  <span className="text-neutral-500 text-xs">Adresse</span>
                  <p className="text-neutral-700">
                    {company.address ||
                    company.city ||
                    company.postalCode ? (
                      <>
                        {company.address && <span>{company.address}</span>}
                        {(company.postalCode || company.city) && (
                          <span className="block">
                            {company.postalCode} {company.city}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-neutral-400 italic">
                        Non renseignée
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Téléphone */}
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-neutral-400" />
                <div>
                  <span className="text-neutral-500 text-xs">Téléphone</span>
                  <p className="text-neutral-700">
                    {company.phone || (
                      <span className="text-neutral-400 italic">
                        Non renseigné
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-neutral-400" />
                <div>
                  <span className="text-neutral-500 text-xs">Email</span>
                  <p className="text-neutral-700">
                    {company.email || (
                      <span className="text-neutral-400 italic">
                        Non renseigné
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Page publique */}
              <div className="flex items-center gap-3 text-sm">
                <Globe className="h-4 w-4 text-neutral-400" />
                <div>
                  <span className="text-neutral-500 text-xs">Page publique</span>
                  <p className="text-neutral-700">
                    <a
                      href={`/${company.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      /{company.slug}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gérant */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-neutral-900 mb-3">
              Gérant
            </h4>
            {company.owner ? (
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-neutral-900 flex items-center justify-center text-white font-medium">
                  {company.owner.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-neutral-900">
                      {company.owner.name}
                    </p>
                    <Crown className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-sm text-neutral-500">
                    {company.owner.email}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-neutral-400 italic text-sm">Aucun gérant</p>
            )}
          </div>

          {/* Description */}
          {company.description && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-neutral-900 mb-3">
                Description
              </h4>
              <p className="text-sm text-neutral-600 whitespace-pre-wrap">
                {company.description}
              </p>
            </div>
          )}

          {/* Infos supplémentaires */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-neutral-900 mb-3">
              Informations
            </h4>
            <div className="space-y-2 text-sm">
              {company.coverageRadius && (
                <div className="flex items-center gap-2 text-neutral-600">
                  <MapPin className="h-4 w-4 text-neutral-400" />
                  Rayon de couverture : {company.coverageRadius} km
                </div>
              )}
              <div className="flex items-center gap-2 text-neutral-600">
                <Calendar className="h-4 w-4 text-neutral-400" />
                Créée le {formatDate(company.createdAt)}
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                <Clock className="h-4 w-4 text-neutral-400" />
                Modifiée le {formatDate(company.updatedAt)}
              </div>
            </div>
          </div>

          {/* ID */}
          <div className="pt-4 border-t border-neutral-100">
            <p className="text-xs text-neutral-400">ID: {company.id}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-neutral-200 sticky bottom-0 bg-white">
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
