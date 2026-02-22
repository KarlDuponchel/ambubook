"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Eye,
  Power,
  ExternalLink,
  Trash2,
  Users,
  Truck,
  Car,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminCompanyFull } from "@/lib/types";

interface CompaniesTableProps {
  companies: AdminCompanyFull[];
  onViewDetails: (company: AdminCompanyFull) => void;
  onToggleActive: (company: AdminCompanyFull) => void;
  onDelete: (company: AdminCompanyFull) => void;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function CompaniesTable({
  companies,
  onViewDetails,
  onToggleActive,
  onDelete,
}: CompaniesTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  if (companies.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
        <p className="text-neutral-500">Aucune entreprise trouvée</p>
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
                Entreprise
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider hidden md:table-cell">
                Ville
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider hidden lg:table-cell">
                Gérant
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Services
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider hidden md:table-cell">
                Stats
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {companies.map((company) => (
              <tr
                key={company.id}
                className="hover:bg-neutral-50 transition-colors"
              >
                {/* Entreprise */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-neutral-900 flex items-center justify-center text-white font-medium text-sm">
                      {company.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-neutral-900 truncate text-sm">
                        {company.name}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        {company.siret || "Pas de SIRET"}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Ville */}
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-sm text-neutral-700">
                    {company.city || (
                      <span className="text-neutral-400">Non renseignée</span>
                    )}
                  </span>
                </td>

                {/* Gérant */}
                <td className="px-4 py-3 hidden lg:table-cell">
                  {company.owner ? (
                    <div className="flex items-center gap-2">
                      <Crown className="h-3.5 w-3.5 text-neutral-400" />
                      <div className="min-w-0">
                        <p className="text-sm text-neutral-700 truncate max-w-[150px]">
                          {company.owner.name}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-neutral-400 text-sm">
                      Aucun gérant
                    </span>
                  )}
                </td>

                {/* Services */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {company.hasAmbulance && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-700">
                        <Truck className="h-3 w-3" />
                        <span className="hidden sm:inline">Ambulance</span>
                      </span>
                    )}
                    {company.hasVSL && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-700">
                        <Car className="h-3 w-3" />
                        <span className="hidden sm:inline">VSL</span>
                      </span>
                    )}
                    {!company.hasAmbulance && !company.hasVSL && (
                      <span className="text-neutral-400 text-xs">Aucun</span>
                    )}
                  </div>
                </td>

                {/* Stats */}
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="flex items-center gap-3 text-sm text-neutral-600">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-neutral-400" />
                      {company._count.users}
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck className="h-3.5 w-3.5 text-neutral-400" />
                      {company._count.transportRequests}
                    </span>
                  </div>
                </td>

                {/* Statut */}
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex px-2 py-0.5 rounded text-xs font-medium",
                      company.isActive
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-200 text-neutral-600"
                    )}
                  >
                    {company.isActive ? "Active" : "Inactive"}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <div className="relative inline-block">
                    <button
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === company.id ? null : company.id
                        )
                      }
                      className="p-1.5 rounded text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>

                    {openMenuId === company.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 mt-1 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-20 py-1">
                          <button
                            onClick={() => {
                              onViewDetails(company);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                          >
                            <Eye className="h-4 w-4" />
                            Voir détails
                          </button>
                          <a
                            href={`/${company.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                            onClick={() => setOpenMenuId(null)}
                          >
                            <ExternalLink className="h-4 w-4" />
                            Voir page publique
                          </a>
                          <button
                            onClick={() => {
                              onToggleActive(company);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                          >
                            <Power className="h-4 w-4" />
                            {company.isActive ? "Désactiver" : "Activer"}
                          </button>
                          <div className="border-t border-neutral-100 my-1" />
                          <button
                            onClick={() => {
                              onDelete(company);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Supprimer
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
