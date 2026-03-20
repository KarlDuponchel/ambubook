"use client";

import {
  LogIn,
  LogOut,
  UserPlus,
  UserMinus,
  UserCog,
  Building2,
  Truck,
  Shield,
  ShieldX,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Key,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AuditLogEntry, AuditActionType } from "@/lib/types";

interface AuditLogsTableProps {
  logs: AuditLogEntry[];
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getActionConfig(action: AuditActionType): {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  label: string;
} {
  const configs: Record<
    AuditActionType,
    {
      icon: React.ComponentType<{ className?: string }>;
      color: string;
      bgColor: string;
      label: string;
    }
  > = {
    LOGIN: { icon: LogIn, color: "text-green-600", bgColor: "bg-green-100", label: "Connexion" },
    LOGOUT: { icon: LogOut, color: "text-neutral-600", bgColor: "bg-neutral-100", label: "Déconnexion" },
    LOGIN_FAILED: { icon: XCircle, color: "text-red-600", bgColor: "bg-red-100", label: "Connexion échouée" },
    ACCESS_DENIED: { icon: ShieldX, color: "text-red-600", bgColor: "bg-red-100", label: "Accès refusé" },
    PASSWORD_RESET: { icon: Key, color: "text-amber-600", bgColor: "bg-amber-100", label: "Reset mot de passe" },
    PASSWORD_CHANGED: { icon: Key, color: "text-blue-600", bgColor: "bg-blue-100", label: "Mot de passe changé" },
    USER_CREATED: { icon: UserPlus, color: "text-green-600", bgColor: "bg-green-100", label: "Utilisateur créé" },
    USER_UPDATED: { icon: UserCog, color: "text-blue-600", bgColor: "bg-blue-100", label: "Utilisateur modifié" },
    USER_DELETED: { icon: UserMinus, color: "text-red-600", bgColor: "bg-red-100", label: "Utilisateur supprimé" },
    USER_ACTIVATED: { icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100", label: "Compte activé" },
    USER_DEACTIVATED: { icon: XCircle, color: "text-amber-600", bgColor: "bg-amber-100", label: "Compte désactivé" },
    USER_ROLE_CHANGED: { icon: Shield, color: "text-purple-600", bgColor: "bg-purple-100", label: "Rôle modifié" },
    COMPANY_CREATED: { icon: Building2, color: "text-green-600", bgColor: "bg-green-100", label: "Entreprise créée" },
    COMPANY_UPDATED: { icon: Building2, color: "text-blue-600", bgColor: "bg-blue-100", label: "Entreprise modifiée" },
    COMPANY_DELETED: { icon: Building2, color: "text-red-600", bgColor: "bg-red-100", label: "Entreprise supprimée" },
    COMPANY_ACTIVATED: { icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100", label: "Entreprise activée" },
    COMPANY_DEACTIVATED: { icon: XCircle, color: "text-amber-600", bgColor: "bg-amber-100", label: "Entreprise désactivée" },
    COMPANY_OWNER_CHANGED: { icon: Crown, color: "text-purple-600", bgColor: "bg-purple-100", label: "Gérant modifié" },
    TRANSPORT_CREATED: { icon: Truck, color: "text-blue-600", bgColor: "bg-blue-100", label: "Transport créé" },
    TRANSPORT_ACCEPTED: { icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100", label: "Transport accepté" },
    TRANSPORT_REFUSED: { icon: XCircle, color: "text-red-600", bgColor: "bg-red-100", label: "Transport refusé" },
    TRANSPORT_CANCELLED: { icon: XCircle, color: "text-amber-600", bgColor: "bg-amber-100", label: "Transport annulé" },
    TRANSPORT_COMPLETED: { icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100", label: "Transport terminé" },
    ADMIN_ACTION: { icon: Shield, color: "text-purple-600", bgColor: "bg-purple-100", label: "Action admin" },
  };

  return configs[action] || { icon: AlertTriangle, color: "text-neutral-600", bgColor: "bg-neutral-100", label: action };
}

export function AuditLogsTable({ logs }: AuditLogsTableProps) {
  if (logs.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
        <p className="text-neutral-500">Aucun log trouvé</p>
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
                Action
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Détails
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider hidden md:table-cell">
                Utilisateur
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider hidden lg:table-cell">
                Cible
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {logs.map((log) => {
              const config = getActionConfig(log.action);
              const Icon = config.icon;

              return (
                <tr
                  key={log.id}
                  className="hover:bg-neutral-50 transition-colors"
                >
                  {/* Action */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("p-1.5 rounded", config.bgColor)}>
                        <Icon className={cn("h-4 w-4", config.color)} />
                      </div>
                      <span className="text-sm font-medium text-neutral-900">
                        {config.label}
                      </span>
                    </div>
                  </td>

                  {/* Détails */}
                  <td className="px-4 py-3">
                    <p className="text-sm text-neutral-700 truncate max-w-[300px]">
                      {log.details || "-"}
                    </p>
                  </td>

                  {/* Utilisateur */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    {log.user ? (
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-neutral-900 flex items-center justify-center text-white text-xs font-medium">
                          {log.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-neutral-900 truncate">
                            {log.user.name}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-neutral-400">Système</span>
                    )}
                  </td>

                  {/* Cible */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {log.targetType ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-700">
                        {log.targetType}
                        {log.targetId && (
                          <span className="text-neutral-400 truncate max-w-[80px]">
                            #{log.targetId.slice(-6)}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-neutral-400 text-sm">-</span>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-neutral-500">
                      {formatDate(log.createdAt)}
                    </span>
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
