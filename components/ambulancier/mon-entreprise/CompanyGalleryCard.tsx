"use client";

import { useState, useRef } from "react";
import { Images, Plus, Trash2, Loader2, X } from "lucide-react";
import Image from "next/image";
import { CompanyPhoto } from "@/lib/types";
import { Card, CardHeader, CardContent, useToast } from "@/components/ui";

interface CompanyGalleryCardProps {
  photos: CompanyPhoto[];
  isOwner: boolean;
  onUpdate: () => void;
}

export function CompanyGalleryCard({ photos, isOwner, onUpdate }: CompanyGalleryCardProps) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<CompanyPhoto | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/companies/me/photos", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de l'upload");
      }

      onUpdate();
      toast.success("Photo ajoutée");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm("Supprimer cette photo ?")) return;

    setDeleting(photoId);
    try {
      const response = await fetch(`/api/companies/me/photos?id=${photoId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la suppression");
      }

      onUpdate();
      toast.success("Photo supprimée");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression");
    } finally {
      setDeleting(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
    e.target.value = "";
  };

  return (
    <>
      <Card>
        <CardHeader
          icon={Images}
          title={`Galerie photos${photos.length > 0 ? ` (${photos.length})` : ""}`}
          action={
            isOwner && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Ajouter
              </button>
            )
          }
        />
        <CardContent>
          {photos.length === 0 ? (
            <div className="text-center py-8">
              <Images className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500">
                {isOwner
                  ? "Ajoutez des photos pour présenter votre entreprise"
                  : "Aucune photo disponible"}
              </p>
              {isOwner && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Ajouter une photo
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-neutral-100 cursor-pointer"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <Image
                    src={photo.url}
                    alt={photo.caption || "Photo"}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  {isOwner && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(photo.id);
                      }}
                      disabled={deleting === photo.id}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-danger-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    >
                      {deleting === photo.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  )}
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                      <p className="text-white text-sm truncate">{photo.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Input caché pour l'upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Modal de visualisation */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <div
            className="relative max-w-4xl max-h-[80vh] w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedPhoto.url}
              alt={selectedPhoto.caption || "Photo"}
              fill
              className="object-contain"
            />
          </div>
          {selectedPhoto.caption && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 text-white rounded-lg">
              {selectedPhoto.caption}
            </div>
          )}
        </div>
      )}
    </>
  );
}
