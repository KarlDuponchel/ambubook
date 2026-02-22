"use client";

import { AlertTriangle, X } from "lucide-react";
import { AdminCompanyFull } from "@/lib/types";

interface DeleteCompanyModalProps {
  company: AdminCompanyFull;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteCompanyModal({
  company,
  onClose,
  onConfirm,
}: DeleteCompanyModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
          <h2 className="font-semibold text-neutral-900">
            Supprimer l&apos;entreprise
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
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-neutral-900 font-medium">
                Êtes-vous sûr de vouloir supprimer cette entreprise ?
              </p>
              <p className="text-neutral-600 text-sm mt-1">
                L&apos;entreprise{" "}
                <span className="font-medium">{company.name}</span> sera
                définitivement supprimée. Cette action est irréversible.
              </p>
              {company._count.users > 0 && (
                <p className="text-amber-600 text-sm mt-2">
                  Attention : {company._count.users} utilisateur
                  {company._count.users > 1 ? "s" : ""}{" "}
                  {company._count.users > 1 ? "sont associés" : "est associé"} à
                  cette entreprise.
                </p>
              )}
              {company._count.transportRequests > 0 && (
                <p className="text-amber-600 text-sm mt-1">
                  {company._count.transportRequests} demande
                  {company._count.transportRequests > 1 ? "s" : ""} de transport{" "}
                  {company._count.transportRequests > 1
                    ? "sont liées"
                    : "est liée"}{" "}
                  à cette entreprise.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-neutral-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors text-sm font-medium"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
