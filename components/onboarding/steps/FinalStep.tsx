"use client";

import { useState, useRef } from "react";
import { OnboardingFormData, OnboardingPhoto, ONBOARDING_DAY_LABELS } from "../types";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Ambulance,
  Car,
  Globe,
  Upload,
  Trash2,
  Loader2,
  Image as ImageIcon,
  GripVertical,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import Image from "next/image";

interface FinalStepProps {
  data: OnboardingFormData;
  onChange: (data: Partial<OnboardingFormData>) => void;
  errors: Record<string, string>;
}

// Ordre d'affichage des jours
const DAYS_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function FinalStep({ data, onChange, errors }: FinalStepProps) {
  const toast = useToast();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleUploadPhoto = async (file: File) => {
    try {
      setUploadingPhoto(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("caption", "");

      const response = await fetch("/api/companies/me/photos", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de l'upload");
      }

      const result = await response.json();

      // Ajouter la nouvelle photo
      const newPhoto: OnboardingPhoto = {
        id: result.id,
        fileKey: result.fileKey,
        url: result.url,
        caption: null,
        order: data.photos.length,
      };

      onChange({ photos: [...data.photos, newPhoto] });
      toast.success("Photo ajoutée");
    } catch (error) {
      console.error("Erreur upload photo:", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'upload"
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 Mo");
      return;
    }

    handleUploadPhoto(file);
    e.target.value = ""; // Reset input
  };

  const handleDeletePhoto = async (photo: OnboardingPhoto) => {
    try {
      if (photo.id) {
        const response = await fetch(`/api/companies/me/photos?id=${photo.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression");
        }
      }

      onChange({ photos: data.photos.filter((p) => p.fileKey !== photo.fileKey) });
      toast.success("Photo supprimée");
    } catch (error) {
      console.error("Erreur suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  // Formater les horaires pour l'affichage
  const formatHours = () => {
    return DAYS_ORDER.map((dayOfWeek) => {
      const hour = data.hours.find((h) => h.dayOfWeek === dayOfWeek);
      if (!hour) return null;

      return {
        day: ONBOARDING_DAY_LABELS[dayOfWeek],
        hours: hour.isClosed
          ? "Fermé"
          : `${hour.openTime || "08:00"} - ${hour.closeTime || "18:00"}`,
        isClosed: hour.isClosed,
      };
    }).filter(Boolean);
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Finalisation
        </h2>
        <p className="text-neutral-600">
          Vérifiez vos informations et ajoutez des photos de votre flotte (optionnel).
        </p>
      </div>

      {/* Galerie photos */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">
              Galerie photos
            </h3>
            <p className="text-sm text-neutral-500">
              Ajoutez des photos de vos véhicules, locaux, équipe... (optionnel)
            </p>
          </div>

          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <Button
            variant="outline"
            onClick={() => photoInputRef.current?.click()}
            disabled={uploadingPhoto || data.photos.length >= 10}
          >
            {uploadingPhoto ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Ajouter
          </Button>
        </div>

        {data.photos.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-neutral-200 rounded-xl">
            <ImageIcon className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
            <p className="text-neutral-500">Aucune photo ajoutée</p>
            <p className="text-sm text-neutral-400">
              Vous pourrez en ajouter plus tard depuis votre dashboard
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.photos.map((photo, index) => (
              <div key={photo.fileKey} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-neutral-100">
                  <Image
                    src={photo.url}
                    alt={`Photo ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(photo)}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4 text-danger-600" />
                </button>
                <div className="absolute top-2 left-2 p-1.5 bg-white/90 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
                  <GripVertical className="w-4 h-4 text-neutral-400" />
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-neutral-400 mt-4">
          Maximum 10 photos. PNG, JPG ou WEBP. Max 5 Mo par image.
        </p>
      </div>

      {/* Récapitulatif */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="p-4 bg-neutral-50 border-b border-neutral-200">
          <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success-600" />
            Récapitulatif
          </h3>
        </div>

        <div className="p-6 space-y-6">
          {/* Infos entreprise */}
          <div>
            <h4 className="text-sm font-medium text-neutral-500 mb-3 uppercase tracking-wide">
              Informations
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-primary-600 mt-0.5" />
                <div>
                  <p className="font-medium text-neutral-900">{data.name || "-"}</p>
                  {data.siret && (
                    <p className="text-sm text-neutral-500">SIRET: {data.siret}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-600 mt-0.5" />
                <div>
                  <p className="text-neutral-900">
                    {data.address || "-"}
                  </p>
                  <p className="text-neutral-900">
                    {data.postalCode} {data.city}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-600" />
                <p className="text-neutral-900">{data.phone || "-"}</p>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-600" />
                <p className="text-neutral-900">{data.email || "-"}</p>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-medium text-neutral-500 mb-3 uppercase tracking-wide">
              Services
            </h4>
            <div className="flex flex-wrap gap-3">
              {data.hasAmbulance && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                  <Ambulance className="w-4 h-4" />
                  Ambulance
                </span>
              )}
              {data.hasVSL && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                  <Car className="w-4 h-4" />
                  VSL
                </span>
              )}
              {data.acceptsOnlineBooking && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-success-50 text-success-700 rounded-full text-sm font-medium">
                  <Globe className="w-4 h-4" />
                  Réservation en ligne
                </span>
              )}
              {data.coverageRadius && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-full text-sm font-medium">
                  <MapPin className="w-4 h-4" />
                  Rayon {data.coverageRadius} km
                </span>
              )}
            </div>
          </div>

          {/* Horaires */}
          <div>
            <h4 className="text-sm font-medium text-neutral-500 mb-3 uppercase tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Horaires
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {formatHours().map((item) => (
                item && (
                  <div
                    key={item.day}
                    className={`p-2 rounded-lg text-center ${
                      item.isClosed ? "bg-neutral-50" : "bg-primary-50"
                    }`}
                  >
                    <p className="text-xs font-medium text-neutral-500">
                      {item.day}
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        item.isClosed ? "text-neutral-400" : "text-primary-700"
                      }`}
                    >
                      {item.hours}
                    </p>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Description */}
          {data.description && (
            <div>
              <h4 className="text-sm font-medium text-neutral-500 mb-3 uppercase tracking-wide">
                Description
              </h4>
              <p className="text-neutral-700 whitespace-pre-line line-clamp-3">
                {data.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Message final */}
      <div className="bg-success-50 rounded-xl p-4 border border-success-100 text-center">
        <p className="text-success-800">
          <strong>Tout est prêt !</strong> Cliquez sur &quot;Terminer&quot; pour
          activer votre page entreprise.
        </p>
      </div>
    </div>
  );
}
