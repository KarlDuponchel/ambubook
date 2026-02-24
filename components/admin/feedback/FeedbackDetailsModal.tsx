"use client";

import { useState } from "react";
import {
  X,
  Bug,
  Lightbulb,
  HelpCircle,
  MoreHorizontal,
  Mail,
  Building2,
  Globe,
  Monitor,
  Calendar,
  Clock,
  ExternalLink,
  Image as ImageIcon,
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
import Image from "next/image";

interface FeedbackDetailsModalProps {
  feedback: AdminFeedback;
  onClose: () => void;
  onUpdateStatus: (feedbackId: string, status: AdminFeedbackStatus) => void;
  onUpdatePriority: (feedbackId: string, priority: AdminFeedbackPriority) => void;
  onUpdateNotes: (feedbackId: string, adminNotes: string) => void;
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

function getRoleLabel(role: string) {
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

export function FeedbackDetailsModal({
  feedback,
  onClose,
  onUpdateStatus,
  onUpdatePriority,
  onUpdateNotes,
}: FeedbackDetailsModalProps) {
  const [adminNotes, setAdminNotes] = useState(feedback.adminNotes || "");
  const [showScreenshot, setShowScreenshot] = useState(false);

  const handleSaveNotes = () => {
    onUpdateNotes(feedback.id, adminNotes);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between px-4 py-3 border-b border-neutral-200">
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-neutral-900 truncate pr-4">
                {feedback.subject}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {/* Type */}
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
                    getTypeColor(feedback.type)
                  )}
                >
                  {feedback.type === "BUG" && <Bug className="h-3 w-3" />}
                  {feedback.type === "IMPROVEMENT" && <Lightbulb className="h-3 w-3" />}
                  {feedback.type === "QUESTION" && <HelpCircle className="h-3 w-3" />}
                  {feedback.type === "OTHER" && <MoreHorizontal className="h-3 w-3" />}
                  {FEEDBACK_TYPE_LABELS[feedback.type]}
                </span>
                {/* Status */}
                <span
                  className={cn(
                    "inline-flex px-2 py-0.5 rounded text-xs font-medium",
                    getStatusStyles(feedback.status)
                  )}
                >
                  {FEEDBACK_STATUS_LABELS[feedback.status]}
                </span>
                {/* Priority */}
                <span
                  className={cn(
                    "inline-flex px-2 py-0.5 rounded text-xs font-medium",
                    getPriorityStyles(feedback.priority)
                  )}
                >
                  {FEEDBACK_PRIORITY_LABELS[feedback.priority]}
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
          <div className="flex-1 overflow-y-auto p-4">
            {/* Message */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-neutral-900 mb-2">Message</h3>
              <p className="text-sm text-neutral-700 whitespace-pre-wrap bg-neutral-50 p-3 rounded-lg">
                {feedback.message}
              </p>
            </div>

            {/* Screenshot */}
            {feedback.screenshot && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-neutral-900 mb-2">
                  Capture d&apos;écran
                </h3>
                <button
                  onClick={() => setShowScreenshot(true)}
                  className="relative group"
                >
                  <Image
                    src={feedback.screenshot}
                    alt="Capture d'écran du feedback"
                    className="max-w-full h-auto max-h-48 rounded-lg border border-neutral-200 object-cover"
                    width={500}
                    height={100}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <div className="flex items-center gap-2 text-white">
                      <ImageIcon className="h-5 w-5" />
                      <span className="text-sm font-medium">Agrandir</span>
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Utilisateur */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-neutral-900 mb-2">Utilisateur</h3>
              {feedback.user ? (
                <div className="bg-neutral-50 p-3 rounded-lg space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-neutral-900 flex items-center justify-center text-white font-bold">
                      {feedback.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{feedback.user.name}</p>
                      <p className="text-xs text-neutral-500">
                        {getRoleLabel(feedback.user.role)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Mail className="h-4 w-4 text-neutral-400" />
                    {feedback.user.email}
                  </div>
                  {feedback.user.company && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Building2 className="h-4 w-4 text-neutral-400" />
                      {feedback.user.company.name}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-neutral-400 text-sm">Utilisateur supprimé ou anonyme</p>
              )}
            </div>

            {/* Métadonnées */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-neutral-900 mb-2">Informations</h3>
              <div className="bg-neutral-50 p-3 rounded-lg space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Globe className="h-4 w-4 text-neutral-400 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <span className="text-neutral-500">Page : </span>
                    <a
                      href={feedback.pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-700 hover:underline break-all inline-flex items-center gap-1"
                    >
                      {feedback.pageUrl}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
                {feedback.userAgent && (
                  <div className="flex items-start gap-2">
                    <Monitor className="h-4 w-4 text-neutral-400 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <span className="text-neutral-500">Navigateur : </span>
                      <span className="text-neutral-700 break-all text-xs">
                        {feedback.userAgent}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-neutral-400" />
                  <span className="text-neutral-500">Créé le : </span>
                  <span className="text-neutral-700">{formatDate(feedback.createdAt)}</span>
                </div>
                {feedback.resolvedAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-neutral-400" />
                    <span className="text-neutral-500">Résolu le : </span>
                    <span className="text-neutral-700">{formatDate(feedback.resolvedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes admin */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-neutral-900 mb-2">Notes internes</h3>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Ajouter des notes internes..."
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                rows={3}
              />
              {adminNotes !== (feedback.adminNotes || "") && (
                <button
                  onClick={handleSaveNotes}
                  className="mt-2 px-3 py-1.5 bg-neutral-900 text-white rounded-md text-sm font-medium hover:bg-neutral-800 transition-colors"
                >
                  Enregistrer les notes
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Statut */}
              <div>
                <h3 className="text-sm font-medium text-neutral-900 mb-2">Statut</h3>
                <select
                  value={feedback.status}
                  onChange={(e) =>
                    onUpdateStatus(feedback.id, e.target.value as AdminFeedbackStatus)
                  }
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  {(Object.keys(FEEDBACK_STATUS_LABELS) as AdminFeedbackStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {FEEDBACK_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
              {/* Priorité */}
              <div>
                <h3 className="text-sm font-medium text-neutral-900 mb-2">Priorité</h3>
                <select
                  value={feedback.priority}
                  onChange={(e) =>
                    onUpdatePriority(feedback.id, e.target.value as AdminFeedbackPriority)
                  }
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  {(Object.keys(FEEDBACK_PRIORITY_LABELS) as AdminFeedbackPriority[]).map((p) => (
                    <option key={p} value={p}>
                      {FEEDBACK_PRIORITY_LABELS[p]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ID */}
            <div className="mt-6 pt-4 border-t border-neutral-100">
              <p className="text-xs text-neutral-400">ID: {feedback.id}</p>
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

      {/* Modal screenshot plein écran */}
      {showScreenshot && feedback.screenshot && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-60 p-4"
          onClick={() => setShowScreenshot(false)}
        >
          <button
            onClick={() => setShowScreenshot(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-1000"
          >
            <X className="h-6 w-6" />
          </button>
          <Image
            src={feedback.screenshot}
            alt="Capture d'écran du feedback"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
            fill
          />
        </div>
      )}
    </>
  );
}
