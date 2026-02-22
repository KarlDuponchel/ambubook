"use client";

import { useState } from "react";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Bug,
  XCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ErrorLogEntry, ErrorSeverityType } from "@/lib/types";

interface ErrorLogsTableProps {
  errors: ErrorLogEntry[];
  onMarkResolved: (ids: string[], resolved: boolean) => void;
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

function getSeverityConfig(severity: ErrorSeverityType): {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  label: string;
} {
  const configs: Record<
    ErrorSeverityType,
    {
      icon: React.ComponentType<{ className?: string }>;
      color: string;
      bgColor: string;
      label: string;
    }
  > = {
    DEBUG: { icon: Bug, color: "text-neutral-600", bgColor: "bg-neutral-100", label: "Debug" },
    INFO: { icon: Info, color: "text-blue-600", bgColor: "bg-blue-100", label: "Info" },
    WARNING: { icon: AlertTriangle, color: "text-amber-600", bgColor: "bg-amber-100", label: "Warning" },
    ERROR: { icon: AlertCircle, color: "text-red-600", bgColor: "bg-red-100", label: "Error" },
    CRITICAL: { icon: XCircle, color: "text-red-700", bgColor: "bg-red-200", label: "Critical" },
  };

  return configs[severity];
}

export function ErrorLogsTable({ errors, onMarkResolved }: ErrorLogsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === errors.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(errors.map((e) => e.id)));
    }
  };

  const handleMarkResolved = (resolved: boolean) => {
    onMarkResolved(Array.from(selectedIds), resolved);
    setSelectedIds(new Set());
  };

  if (errors.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <p className="text-neutral-500">Aucune erreur trouvée</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions groupées */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
          <span className="text-sm text-neutral-600">
            {selectedIds.size} sélectionnée(s)
          </span>
          <button
            onClick={() => handleMarkResolved(true)}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            Marquer résolue(s)
          </button>
          <button
            onClick={() => handleMarkResolved(false)}
            className="px-3 py-1 text-sm bg-neutral-200 text-neutral-700 rounded hover:bg-neutral-300"
          >
            Marquer non résolue(s)
          </button>
        </div>
      )}

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === errors.length && errors.length > 0}
                    onChange={selectAll}
                    className="rounded border-neutral-300"
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Sévérité
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider hidden md:table-cell">
                  Path
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {errors.map((error) => {
                const config = getSeverityConfig(error.severity);
                const Icon = config.icon;
                const isExpanded = expandedId === error.id;

                return (
                  <>
                    <tr
                      key={error.id}
                      className={cn(
                        "hover:bg-neutral-50 transition-colors",
                        isExpanded && "bg-neutral-50"
                      )}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(error.id)}
                          onChange={() => toggleSelect(error.id)}
                          className="rounded border-neutral-300"
                        />
                      </td>

                      {/* Sévérité */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={cn("p-1.5 rounded", config.bgColor)}>
                            <Icon className={cn("h-4 w-4", config.color)} />
                          </div>
                          <span className={cn("text-sm font-medium", config.color)}>
                            {config.label}
                          </span>
                        </div>
                      </td>

                      {/* Message */}
                      <td className="px-4 py-3">
                        <p className="text-sm text-neutral-700 truncate max-w-[300px]">
                          {error.message}
                        </p>
                      </td>

                      {/* Path */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        {error.path ? (
                          <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-600">
                            {error.method && `${error.method} `}
                            {error.path}
                          </code>
                        ) : (
                          <span className="text-neutral-400 text-sm">-</span>
                        )}
                      </td>

                      {/* Statut */}
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex px-2 py-0.5 rounded text-xs font-medium",
                            error.resolved
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          )}
                        >
                          {error.resolved ? "Résolu" : "Non résolu"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3">
                        <span className="text-sm text-neutral-500">
                          {formatDate(error.createdAt)}
                        </span>
                      </td>

                      {/* Expand */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleExpand(error.id)}
                          className="p-1 rounded text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Stack trace expanded */}
                    {isExpanded && (
                      <tr key={`${error.id}-details`}>
                        <td colSpan={7} className="px-4 py-4 bg-neutral-50">
                          <div className="space-y-3">
                            <div>
                              <h4 className="text-xs font-medium text-neutral-500 uppercase mb-1">
                                Message complet
                              </h4>
                              <p className="text-sm text-neutral-700">
                                {error.message}
                              </p>
                            </div>

                            {error.stack && (
                              <div>
                                <h4 className="text-xs font-medium text-neutral-500 uppercase mb-1">
                                  Stack trace
                                </h4>
                                <pre className="text-xs bg-neutral-900 text-neutral-100 p-3 rounded overflow-x-auto max-h-48">
                                  {error.stack}
                                </pre>
                              </div>
                            )}

                            {error.user && (
                              <div>
                                <h4 className="text-xs font-medium text-neutral-500 uppercase mb-1">
                                  Utilisateur
                                </h4>
                                <p className="text-sm text-neutral-700">
                                  {error.user.name} ({error.user.email})
                                </p>
                              </div>
                            )}

                            {error.ipAddress && (
                              <div>
                                <h4 className="text-xs font-medium text-neutral-500 uppercase mb-1">
                                  IP / User-Agent
                                </h4>
                                <p className="text-sm text-neutral-700">
                                  {error.ipAddress}
                                  {error.userAgent && (
                                    <span className="block text-xs text-neutral-500 mt-1">
                                      {error.userAgent}
                                    </span>
                                  )}
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
