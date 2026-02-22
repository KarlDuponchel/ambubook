"use client";

import { X, Mail, Phone, Building2, Calendar, Crown, FileText, BadgeCheck, MapPin } from "lucide-react";
import { AdminUser, UserRole } from "@/lib/types";

interface UserDetailsModalProps {
  user: AdminUser;
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

function getRoleLabel(role: UserRole) {
  switch (role) {
    case "ADMIN":
      return "Administrateur";
    case "AMBULANCIER":
      return "Ambulancier";
    case "CUSTOMER":
      return "Client";
    default:
      return role;
  }
}

export function UserDetailsModal({ user, onClose }: UserDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
          <h2 className="font-semibold text-neutral-900">
            Détails de l&apos;utilisateur
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
          {/* Avatar et nom */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-full bg-neutral-900 flex items-center justify-center text-white font-bold text-xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">{user.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-700">
                  {getRoleLabel(user.role)}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  user.isActive
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-200 text-neutral-600"
                }`}>
                  {user.isActive ? "Actif" : "En attente"}
                </span>
              </div>
            </div>
          </div>

          {/* Informations */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-neutral-400" />
              <span className="text-neutral-700">{user.email}</span>
            </div>

            {user.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-neutral-400" />
                <span className="text-neutral-700">{user.phone}</span>
              </div>
            )}

            <div className="flex items-center gap-3 text-sm">
              <Building2 className="h-4 w-4 text-neutral-400" />
              {user.company ? (
                <div className="flex items-center gap-2">
                  <span className="text-neutral-700">{user.company.name}</span>
                  {user.isCompanyOwner && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-700">
                      <Crown className="h-3 w-3" />
                      Gérant
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-neutral-400">Aucune entreprise</span>
              )}
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-neutral-400" />
              <span className="text-neutral-500">
                Inscrit le {formatDate(user.createdAt)}
              </span>
            </div>
          </div>

          {/* Infos entreprise pour ambulanciers */}
          {user.role === "AMBULANCIER" && user.company && (
            <div className="mt-6 pt-4 border-t border-neutral-100">
              <h4 className="text-sm font-medium text-neutral-900 mb-3">
                Informations entreprise
              </h4>
              <div className="space-y-3">
                {/* SIRET */}
                <div className="flex items-start gap-3 text-sm">
                  <FileText className="h-4 w-4 text-neutral-400 mt-0.5" />
                  <div>
                    <span className="text-neutral-500 text-xs">SIRET</span>
                    <p className="text-neutral-700">
                      {user.company.siret || <span className="text-neutral-400 italic">Non renseigné</span>}
                    </p>
                  </div>
                </div>

                {/* N° Agrément ARS */}
                <div className="flex items-start gap-3 text-sm">
                  <BadgeCheck className="h-4 w-4 text-neutral-400 mt-0.5" />
                  <div>
                    <span className="text-neutral-500 text-xs">N° Agrément ARS</span>
                    <p className="text-neutral-700">
                      {user.company.licenseNumber || <span className="text-neutral-400 italic">Non renseigné</span>}
                    </p>
                  </div>
                </div>

                {/* Adresse */}
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-neutral-400 mt-0.5" />
                  <div>
                    <span className="text-neutral-500 text-xs">Adresse</span>
                    <p className="text-neutral-700">
                      {user.company.address || user.company.city || user.company.postalCode ? (
                        <>
                          {user.company.address && <span>{user.company.address}</span>}
                          {(user.company.postalCode || user.company.city) && (
                            <span className="block">
                              {user.company.postalCode} {user.company.city}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-neutral-400 italic">Non renseignée</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Contact entreprise */}
                {(user.company.phone || user.company.email) && (
                  <>
                    {user.company.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-neutral-400" />
                        <div>
                          <span className="text-neutral-500 text-xs">Tél. entreprise</span>
                          <p className="text-neutral-700">{user.company.phone}</p>
                        </div>
                      </div>
                    )}
                    {user.company.email && (
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-neutral-400" />
                        <div>
                          <span className="text-neutral-500 text-xs">Email entreprise</span>
                          <p className="text-neutral-700">{user.company.email}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ID */}
          <div className="mt-6 pt-4 border-t border-neutral-100">
            <p className="text-xs text-neutral-400">
              ID: {user.id}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-neutral-200">
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
