"use client";

import { useState, useRef } from "react";
import { OnboardingFormData } from "../types";
import { Upload, Image as ImageIcon, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import Image from "next/image";

interface BrandingStepProps {
  data: OnboardingFormData;
  onChange: (data: Partial<OnboardingFormData>) => void;
  errors: Record<string, string>;
}

export function BrandingStep({ data, onChange, errors }: BrandingStepProps) {
  const toast = useToast();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File, type: "logo" | "cover") => {
    const isLogo = type === "logo";
    const setUploading = isLogo ? setUploadingLogo : setUploadingCover;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/companies/me/images", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de l'upload");
      }

      const result = await response.json();

      if (isLogo) {
        onChange({ logoUrl: result.url });
      } else {
        onChange({ coverImageUrl: result.url });
      }

      toast.success("Image téléchargée avec succès");
    } catch (error) {
      console.error("Erreur upload:", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'upload"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "cover"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation du type
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    // Validation de la taille (5 Mo max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 Mo");
      return;
    }

    handleUpload(file, type);
  };

  const handleRemove = async (type: "logo" | "cover") => {
    try {
      const response = await fetch(`/api/companies/me/images?type=${type}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      if (type === "logo") {
        onChange({ logoUrl: null });
      } else {
        onChange({ coverImageUrl: null });
      }

      toast.success("Image supprimée");
    } catch (error) {
      console.error("Erreur suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Identité visuelle
        </h2>
        <p className="text-neutral-600">
          Ajoutez votre logo et une image de couverture pour personnaliser votre page.
        </p>
        <p className="text-sm text-neutral-500 mt-1">
          Cette étape est optionnelle, vous pouvez la compléter plus tard.
        </p>
      </div>

      {/* Logo */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">Logo</h3>
        <p className="text-sm text-neutral-500 mb-4">
          Format carré recommandé (min. 200x200 pixels)
        </p>

        <div className="flex items-start gap-6">
          {/* Aperçu */}
          <div className="shrink-0">
            <div className="w-32 h-32 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 flex items-center justify-center overflow-hidden">
              {data.logoUrl ? (
                <Image
                  src={data.logoUrl}
                  alt="Logo"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="w-12 h-12 text-neutral-300" />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, "logo")}
            />

            <Button
              variant="outline"
              onClick={() => logoInputRef.current?.click()}
              disabled={uploadingLogo}
            >
              {uploadingLogo ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {data.logoUrl ? "Changer le logo" : "Télécharger un logo"}
            </Button>

            {data.logoUrl && (
              <Button
                variant="ghost"
                className="text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                onClick={() => handleRemove("logo")}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            )}

            <p className="text-xs text-neutral-400">
              PNG, JPG ou WEBP. Max 5 Mo.
            </p>
          </div>
        </div>
        {errors.logoUrl && (
          <p className="text-sm text-danger-600 mt-2">{errors.logoUrl}</p>
        )}
      </div>

      {/* Image de couverture */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Image de couverture
        </h3>
        <p className="text-sm text-neutral-500 mb-4">
          Format paysage recommandé (min. 1200x400 pixels)
        </p>

        {/* Aperçu couverture */}
        <div className="relative w-full h-48 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 flex items-center justify-center overflow-hidden mb-4">
          {data.coverImageUrl ? (
            <Image
              src={data.coverImageUrl}
              alt="Couverture"
              fill
              className="object-cover"
            />
          ) : (
            <div className="text-center">
              <ImageIcon className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm text-neutral-400">Aucune image</p>
            </div>
          )}
        </div>

        {/* Actions couverture */}
        <div className="flex items-center gap-3">
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e, "cover")}
          />

          <Button
            variant="outline"
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
          >
            {uploadingCover ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {data.coverImageUrl ? "Changer l'image" : "Télécharger une image"}
          </Button>

          {data.coverImageUrl && (
            <Button
              variant="ghost"
              className="text-danger-600 hover:text-danger-700 hover:bg-danger-50"
              onClick={() => handleRemove("cover")}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          )}
        </div>
        {errors.coverImageUrl && (
          <p className="text-sm text-danger-600 mt-2">{errors.coverImageUrl}</p>
        )}
      </div>

      {/* Conseil */}
      <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
        <p className="text-sm text-primary-800">
          <strong>Conseil :</strong> Une page avec un logo et une photo de couverture
          attire davantage l'attention des patients et inspire confiance.
        </p>
      </div>
    </div>
  );
}
