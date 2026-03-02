"use client";

import { useState, useRef } from "react";
import {
  Paperclip,
  Upload,
  FileText,
  Image,
  Trash2,
  Download,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Card, CardHeader, CardContent, useToast } from "@/components/ui";
import type { RequestAttachment, AttachmentType } from "@/lib/types";

type UserContext = "ambulancier" | "customer";

interface RequestAttachmentsProps {
  /** ID interne de la demande (pour ambulanciers) */
  requestId?: string;
  /** TrackingId public de la demande (pour clients) */
  trackingId?: string;
  attachments: RequestAttachment[];
  context?: UserContext;
  onAttachmentAdded?: (attachment: RequestAttachment) => void;
  onAttachmentDeleted?: (attachmentId: string) => void;
  canDelete?: boolean;
  currentUserId?: string;
}

const ATTACHMENT_TYPE_LABELS: Record<AttachmentType, string> = {
  TRANSPORT_VOUCHER: "Bon de transport",
  INVOICE: "Facture",
  PRESCRIPTION: "Ordonnance",
  ID_DOCUMENT: "Pièce d'identité",
  MUTUELLE: "Carte mutuelle",
  SOCIAL_SECURITY: "Carte vitale",
  OTHER: "Autre",
};

// Options pour les ambulanciers (tous les types)
const AMBULANCIER_TYPE_OPTIONS: { value: AttachmentType; label: string }[] = [
  { value: "TRANSPORT_VOUCHER", label: "Bon de transport" },
  { value: "INVOICE", label: "Facture" },
  { value: "PRESCRIPTION", label: "Ordonnance" },
  { value: "ID_DOCUMENT", label: "Pièce d'identité" },
  { value: "MUTUELLE", label: "Carte mutuelle" },
  { value: "SOCIAL_SECURITY", label: "Carte vitale" },
  { value: "OTHER", label: "Autre" },
];

// Options pour les clients (types limités)
const CUSTOMER_TYPE_OPTIONS: { value: AttachmentType; label: string }[] = [
  { value: "ID_DOCUMENT", label: "Pièce d'identité" },
  { value: "MUTUELLE", label: "Carte mutuelle" },
  { value: "SOCIAL_SECURITY", label: "Carte vitale" },
  { value: "PRESCRIPTION", label: "Ordonnance" },
  { value: "TRANSPORT_VOUCHER", label: "Bon de transport" },
  { value: "OTHER", label: "Autre" },
];

function formatFileSize(sizeKb: number): string {
  if (sizeKb < 1024) {
    return `${sizeKb} Ko`;
  }
  return `${(sizeKb / 1024).toFixed(1)} Mo`;
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) {
    return Image;
  }
  return FileText;
}

function getApiPath(context: UserContext, identifier: string): string {
  return context === "customer"
    ? `/api/customer/transports/${identifier}/attachments`
    : `/api/ambulancier/demandes/${identifier}/attachments`;
}

export function RequestAttachments({
  requestId,
  trackingId,
  attachments,
  context = "ambulancier",
  onAttachmentAdded,
  onAttachmentDeleted,
  canDelete = true,
  currentUserId,
}: RequestAttachmentsProps) {
  const toast = useToast();
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<AttachmentType>(
    context === "customer" ? "ID_DOCUMENT" : "TRANSPORT_VOUCHER"
  );
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Utiliser trackingId pour les clients, requestId pour les ambulanciers
  const identifier = context === "customer" ? trackingId : requestId;
  const apiPath = identifier ? getApiPath(context, identifier) : "";
  const typeOptions = context === "customer" ? CUSTOMER_TYPE_OPTIONS : AMBULANCIER_TYPE_OPTIONS;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading || !apiPath) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("fileType", fileType);

      const response = await fetch(apiPath, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const newAttachment = await response.json();
        onAttachmentAdded?.(newAttachment);
        setSelectedFile(null);
        setShowUpload(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        toast.success("Fichier envoyé avec succès");
      } else {
        const data = await response.json();
        const errorMsg = data.error || "Erreur lors de l'upload";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch {
      setError("Erreur lors de l'upload");
      toast.error("Erreur lors de l'upload du fichier");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (deletingId || !apiPath) return;

    setDeletingId(attachmentId);
    try {
      const response = await fetch(
        `${apiPath}?attachmentId=${attachmentId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        onAttachmentDeleted?.(attachmentId);
        toast.success("Fichier supprimé");
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch {
      toast.error("Erreur lors de la suppression du fichier");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (attachment: RequestAttachment) => {
    // Pour les URLs S3 signées (externes), ouvrir dans un nouvel onglet
    // Pour les URLs base64 (data:), utiliser le download natif
    if (attachment.fileUrl.startsWith("data:")) {
      const link = document.createElement("a");
      link.href = attachment.fileUrl;
      link.download = attachment.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // URL externe (S3) - ouvrir dans un nouvel onglet
      window.open(attachment.fileUrl, "_blank");
    }
  };

  // Déterminer si l'utilisateur peut supprimer une pièce jointe
  const canDeleteAttachment = (attachment: RequestAttachment): boolean => {
    if (!canDelete) return false;
    // Les ambulanciers peuvent tout supprimer
    if (context === "ambulancier") return true;
    // Les clients ne peuvent supprimer que leurs propres fichiers
    // Les fichiers uploadés par des visiteurs (uploadedBy === null) ne peuvent pas être supprimés par les clients
    return currentUserId != null && attachment.uploadedBy != null && currentUserId === attachment.uploadedBy.id;
  };

  return (
    <Card>
      <CardHeader
        icon={Paperclip}
        title="Pièces jointes"
        action={
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Upload className="h-4 w-4" />
            Ajouter
          </button>
        }
      />
      <CardContent noPadding>
        {/* Formulaire d'upload */}
        {showUpload && (
          <div className="p-4 border-b border-card-border bg-neutral-50">
            <div className="space-y-3">
              {/* Sélection du fichier */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*,.pdf"
                  capture="environment"
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-colors"
                >
                  {selectedFile ? (
                    <span className="text-sm text-neutral-700 truncate">
                      {selectedFile.name}
                    </span>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-neutral-400" />
                      <span className="text-sm text-neutral-500">
                        Cliquer pour sélectionner un fichier
                      </span>
                    </>
                  )}
                </label>
                <p className="text-xs text-neutral-500 mt-1">
                  PDF, JPEG, PNG, WebP - Max 10 Mo
                </p>
              </div>

              {/* Type de fichier */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Type de document
                </label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value as AttachmentType)}
                  className="w-full px-3 py-2 border border-input-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Erreur */}
              {error && (
                <p className="text-sm text-danger-600">{error}</p>
              )}

              {/* Boutons */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowUpload(false);
                    setSelectedFile(null);
                    setError(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Upload...
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" />
                      Envoyer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liste des pièces jointes */}
        {attachments.length === 0 ? (
          <div className="p-6 text-center text-neutral-500 text-sm">
            Aucune pièce jointe
          </div>
        ) : (
          <div className="divide-y divide-card-border">
            {attachments.map((attachment) => {
              const FileIcon = getFileIcon(attachment.mimeType);
              const isDeleting = deletingId === attachment.id;
              const canDeleteThis = canDeleteAttachment(attachment);
              const isExternalUrl = !attachment.fileUrl.startsWith("data:");

              return (
                <div
                  key={attachment.id}
                  className="p-4 flex items-center gap-3 hover:bg-neutral-50 transition-colors"
                >
                  {/* Icône */}
                  <div className="shrink-0 p-2 rounded-lg bg-neutral-100">
                    <FileIcon className="h-5 w-5 text-neutral-600" />
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-neutral-900 truncate">
                      {attachment.fileName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5 flex-wrap">
                      <span className="px-1.5 py-0.5 bg-neutral-100 rounded">
                        {ATTACHMENT_TYPE_LABELS[attachment.fileType]}
                      </span>
                      <span>{formatFileSize(attachment.fileSizeKb)}</span>
                      <span>par {attachment.uploadedBy?.name || "Visiteur"}</span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {formatDateTime(attachment.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleDownload(attachment)}
                      className="p-2 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title={isExternalUrl ? "Ouvrir" : "Télécharger"}
                    >
                      {isExternalUrl ? (
                        <ExternalLink className="h-4 w-4" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </button>
                    {canDeleteThis && (
                      <button
                        onClick={() => handleDelete(attachment.id)}
                        disabled={isDeleting}
                        className="p-2 text-neutral-500 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Supprimer"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
