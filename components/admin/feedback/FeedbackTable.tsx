"use client";

import { useState, useRef, useEffect } from "react";
import {
  MoreHorizontal,
  Eye,
  Bug,
  Lightbulb,
  HelpCircle,
  ArrowRight,
  Check,
  X,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AdminFeedback,
  AdminFeedbackType,
  AdminFeedbackStatus,
  AdminFeedbackPriority,
  FEEDBACK_TYPE_LABELS,
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_PRIORITY_LABELS,
} from "@/lib/types";

interface FeedbackTableProps {
  feedbacks: AdminFeedback[];
  onViewDetails: (feedback: AdminFeedback) => void;
  onUpdateStatus: (feedbackId: string, status: AdminFeedbackStatus) => void;
  onUpdatePriority: (feedbackId: string, priority: AdminFeedbackPriority) => void;
}

interface DropdownPosition {
  top: number;
  left: number;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getTypeIcon(type: AdminFeedbackType) {
  switch (type) {
    case "BUG":
      return Bug;
    case "IMPROVEMENT":
      return Lightbulb;
    case "QUESTION":
      return HelpCircle;
    default:
      return MoreHorizontal;
  }
}

function getTypeColor(type: AdminFeedbackType) {
  switch (type) {
    case "BUG":
      return "bg-red-100 text-red-700";
    case "IMPROVEMENT":
      return "bg-orange-100 text-orange-700";
    case "QUESTION":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-neutral-100 text-neutral-600";
  }
}

function getStatusStyles(status: AdminFeedbackStatus) {
  switch (status) {
    case "NEW":
      return "bg-neutral-900 text-white";
    case "IN_PROGRESS":
      return "bg-neutral-200 text-neutral-700";
    case "RESOLVED":
      return "bg-neutral-100 text-neutral-500";
    case "WONT_FIX":
      return "bg-neutral-100 text-neutral-400";
  }
}

function getPriorityStyles(priority: AdminFeedbackPriority) {
  switch (priority) {
    case "CRITICAL":
      return "bg-red-100 text-red-700";
    case "HIGH":
      return "bg-orange-100 text-orange-700";
    case "MEDIUM":
      return "bg-neutral-200 text-neutral-700";
    case "LOW":
      return "bg-neutral-100 text-neutral-500";
  }
}

export function FeedbackTable({
  feedbacks,
  onViewDetails,
  onUpdateStatus,
  onUpdatePriority,
}: FeedbackTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition | null>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const closeMenu = () => {
    setOpenMenuId(null);
    setDropdownPosition(null);
  };

  const handleOpenMenu = (feedbackId: string) => {
    if (openMenuId === feedbackId) {
      closeMenu();
      return;
    }

    const button = buttonRefs.current.get(feedbackId);
    if (button) {
      const rect = button.getBoundingClientRect();
      // Positionner en dessous du bouton, aligné à droite
      setDropdownPosition({
        top: rect.bottom + 4, // 4px en dessous du bouton
        left: rect.right - 208, // 208px = w-52 (13rem)
      });
    }
    setOpenMenuId(feedbackId);
  };

  // Fermer le dropdown quand on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (openMenuId) {
        closeMenu();
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [openMenuId]);

  if (feedbacks.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
        <p className="text-neutral-500">Aucun feedback trouvé</p>
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
                Date
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Utilisateur
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Type
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Sujet
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider hidden sm:table-cell">
                Statut
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider hidden md:table-cell">
                Priorité
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {feedbacks.map((feedback) => {
              const TypeIcon = getTypeIcon(feedback.type);

              return (
                <tr
                  key={feedback.id}
                  className="hover:bg-neutral-50 transition-colors"
                >
                  {/* Date */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-neutral-500">
                      {formatDate(feedback.createdAt)}
                    </span>
                  </td>

                  {/* Utilisateur */}
                  <td className="px-4 py-3">
                    {feedback.user ? (
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-neutral-900 flex items-center justify-center text-white font-medium text-sm">
                          {feedback.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-neutral-900 truncate text-sm">
                            {feedback.user.name}
                          </p>
                          <p className="text-xs text-neutral-500 truncate">
                            {feedback.user.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-neutral-400 text-sm">Anonyme</span>
                    )}
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
                        getTypeColor(feedback.type)
                      )}
                    >
                      <TypeIcon className="h-3 w-3" />
                      {FEEDBACK_TYPE_LABELS[feedback.type]}
                    </span>
                  </td>

                  {/* Sujet */}
                  <td className="px-4 py-3">
                    <p className="text-sm text-neutral-900 truncate max-w-50">
                      {feedback.subject}
                    </p>
                  </td>

                  {/* Statut */}
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span
                      className={cn(
                        "inline-flex px-2 py-0.5 rounded text-xs font-medium",
                        getStatusStyles(feedback.status)
                      )}
                    >
                      {FEEDBACK_STATUS_LABELS[feedback.status]}
                    </span>
                  </td>

                  {/* Priorité */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span
                      className={cn(
                        "inline-flex px-2 py-0.5 rounded text-xs font-medium",
                        getPriorityStyles(feedback.priority)
                      )}
                    >
                      {FEEDBACK_PRIORITY_LABELS[feedback.priority]}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-block">
                      <button
                        ref={(el) => {
                          if (el) buttonRefs.current.set(feedback.id, el);
                        }}
                        onClick={() => handleOpenMenu(feedback.id)}
                        className="p-1.5 rounded text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {openMenuId === feedback.id && dropdownPosition && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={closeMenu}
                          />
                          <div
                            className="fixed w-52 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 py-1 max-h-80 overflow-y-auto"
                            style={{
                              top: dropdownPosition.top,
                              left: dropdownPosition.left,
                            }}
                          >
                            {/* Voir détails */}
                            <button
                              onClick={() => {
                                onViewDetails(feedback);
                                closeMenu();
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                            >
                              <Eye className="h-4 w-4" />
                              Voir détails
                            </button>

                            <div className="border-t border-neutral-100 my-1" />

                            {/* Changer statut */}
                            <div className="px-3 py-1.5 text-xs text-neutral-500 font-medium">
                              Changer le statut
                            </div>
                            {feedback.status !== "IN_PROGRESS" && (
                              <button
                                onClick={() => {
                                  onUpdateStatus(feedback.id, "IN_PROGRESS");
                                  closeMenu();
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                              >
                                <Clock className="h-4 w-4" />
                                En cours
                              </button>
                            )}
                            {feedback.status !== "RESOLVED" && (
                              <button
                                onClick={() => {
                                  onUpdateStatus(feedback.id, "RESOLVED");
                                  closeMenu();
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                              >
                                <Check className="h-4 w-4" />
                                Résolu
                              </button>
                            )}
                            {feedback.status !== "WONT_FIX" && (
                              <button
                                onClick={() => {
                                  onUpdateStatus(feedback.id, "WONT_FIX");
                                  closeMenu();
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                              >
                                <X className="h-4 w-4" />
                                Ne sera pas corrigé
                              </button>
                            )}

                            <div className="border-t border-neutral-100 my-1" />

                            {/* Changer priorité */}
                            <div className="px-3 py-1.5 text-xs text-neutral-500 font-medium">
                              Changer la priorité
                            </div>
                            {feedback.priority !== "CRITICAL" && (
                              <button
                                onClick={() => {
                                  onUpdatePriority(feedback.id, "CRITICAL");
                                  closeMenu();
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <AlertTriangle className="h-4 w-4" />
                                Critique
                              </button>
                            )}
                            {feedback.priority !== "HIGH" && (
                              <button
                                onClick={() => {
                                  onUpdatePriority(feedback.id, "HIGH");
                                  closeMenu();
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-orange-600 hover:bg-orange-50"
                              >
                                <ArrowRight className="h-4 w-4" />
                                Haute
                              </button>
                            )}
                            {feedback.priority !== "MEDIUM" && (
                              <button
                                onClick={() => {
                                  onUpdatePriority(feedback.id, "MEDIUM");
                                  closeMenu();
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                              >
                                <ArrowRight className="h-4 w-4" />
                                Moyenne
                              </button>
                            )}
                            {feedback.priority !== "LOW" && (
                              <button
                                onClick={() => {
                                  onUpdatePriority(feedback.id, "LOW");
                                  closeMenu();
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-500 hover:bg-neutral-50"
                              >
                                <ArrowRight className="h-4 w-4" />
                                Basse
                              </button>
                            )}
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
