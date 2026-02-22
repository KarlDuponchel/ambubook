"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Crown,
  Power,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminUser, UserRole } from "@/lib/types";

interface UsersTableProps {
  users: AdminUser[];
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
  onToggleActive: (user: AdminUser) => void;
  onSetOwner: (user: AdminUser) => void;
  onViewDetails: (user: AdminUser) => void;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getRoleLabel(role: UserRole) {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "AMBULANCIER":
      return "Ambulancier";
    case "CUSTOMER":
      return "Client";
    default:
      return role;
  }
}

export function UsersTable({
  users,
  onEdit,
  onDelete,
  onToggleActive,
  onSetOwner,
  onViewDetails,
}: UsersTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  if (users.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
        <p className="text-neutral-500">Aucun utilisateur trouvé</p>
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
                Utilisateur
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Rôle
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider hidden md:table-cell">
                Entreprise
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider hidden lg:table-cell">
                Inscription
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
            {users.map((user) => {
              const isOwner = user.isCompanyOwner;
              const canBeOwner = user.companyId && !isOwner && user.role === "AMBULANCIER";

              return (
                <tr
                  key={user.id}
                  className="hover:bg-neutral-50 transition-colors"
                >
                  {/* Utilisateur */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-neutral-900 flex items-center justify-center text-white font-medium text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-900 truncate text-sm">
                          {user.name}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Rôle */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-neutral-700">
                      {getRoleLabel(user.role)}
                    </span>
                  </td>

                  {/* Entreprise */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    {user.company ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-700 truncate max-w-[150px]">
                          {user.company.name}
                        </span>
                        {isOwner && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-700">
                            <Crown className="h-3 w-3" />
                            Gérant
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-neutral-400 text-sm">—</span>
                    )}
                  </td>

                  {/* Inscription */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-neutral-500 text-sm">
                      {formatDate(user.createdAt)}
                    </span>
                  </td>

                  {/* Statut */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex px-2 py-0.5 rounded text-xs font-medium",
                        user.isActive
                          ? "bg-neutral-900 text-white"
                          : "bg-neutral-200 text-neutral-600"
                      )}
                    >
                      {user.isActive ? "Actif" : "En attente"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === user.id ? null : user.id)
                        }
                        className="p-1.5 rounded text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {openMenuId === user.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 mt-1 w-44 bg-white border border-neutral-200 rounded-lg shadow-lg z-20 py-1">
                            <button
                              onClick={() => {
                                onViewDetails(user);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                            >
                              <Eye className="h-4 w-4" />
                              Voir détails
                            </button>
                            <button
                              onClick={() => {
                                onEdit(user);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                            >
                              <Pencil className="h-4 w-4" />
                              Modifier
                            </button>
                            <button
                              onClick={() => {
                                onToggleActive(user);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                            >
                              <Power className="h-4 w-4" />
                              {user.isActive ? "Désactiver" : "Activer"}
                            </button>
                            {canBeOwner && (
                              <button
                                onClick={() => {
                                  onSetOwner(user);
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                              >
                                <Crown className="h-4 w-4" />
                                Définir gérant
                              </button>
                            )}
                            <div className="border-t border-neutral-100 my-1" />
                            <button
                              onClick={() => {
                                onDelete(user);
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
