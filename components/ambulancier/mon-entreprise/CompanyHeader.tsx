"use client";

import { useState, useRef } from "react";
import { Camera, Building2, Loader2 } from "lucide-react";
import Image from "next/image";
import { CompanyFull } from "@/lib/types";

interface CompanyHeaderProps {
  company: CompanyFull;
  isOwner: boolean;
  onUpdate: () => void;
}

export function CompanyHeader({ company, isOwner, onUpdate }: CompanyHeaderProps) {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File, type: "logo" | "cover") => {
    const setUploading = type === "logo" ? setUploadingLogo : setUploadingCover;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/companies/me/images", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de l'upload");
      }

      onUpdate();
    } catch (error) {
      console.error("Erreur upload:", error);
      alert(error instanceof Error ? error.message : "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "cover") => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file, type);
    }
    e.target.value = "";
  };

  return (
    <div className="relative bg-card-bg rounded-xl border border-card-border overflow-hidden">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 bg-linear-to-br from-primary-100 to-primary-200">
        {company.coverImageUrl ? (
          <Image
            src={company.coverImageUrl}
            alt="Couverture"
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-primary-400">
              <Building2 className="h-16 w-16 mx-auto mb-2 opacity-50" />
              {isOwner && <p className="text-sm">Ajouter une image de couverture</p>}
            </div>
          </div>
        )}

        {isOwner && (
          <>
            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 bg-black/50 hover:bg-black/70 z-10 text-white text-sm rounded-lg backdrop-blur-sm transition-colors disabled:opacity-50"
            >
              {uploadingCover ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              {company.coverImageUrl ? "Modifier" : "Ajouter"}
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleFileChange(e, "cover")}
              className="hidden"
            />
          </>
        )}
      </div>

      {/* Logo + Company Name */}
      <div className="relative px-6 pb-6">
        {/* Logo */}
        <div className="relative -mt-16 mb-4 flex items-end gap-4">
          <div className="relative">
            <div className="h-32 w-32 rounded-2xl bg-white border-4 border-white shadow-lg overflow-hidden">
              {company.logoUrl ? (
                <Image
                  src={company.logoUrl}
                  alt="Logo"
                  fill
                  className="object-cover rounded-full"
                />
              ) : (
                <div className="h-full w-full bg-primary-100 flex items-center justify-center">
                  <Building2 className="h-12 w-12 text-primary-400" />
                </div>
              )}
            </div>

            {isOwner && (
              <>
                <button
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="absolute bottom-0 right-0 p-2 bg-white border border-neutral-200 rounded-full shadow-sm hover:bg-neutral-50 transition-colors disabled:opacity-50"
                >
                  {uploadingLogo ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                  ) : (
                    <Camera className="h-4 w-4 text-primary-600" />
                  )}
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFileChange(e, "logo")}
                  className="hidden"
                />
              </>
            )}
          </div>

          <div className="pb-2">
            <h1 className="text-2xl font-bold text-neutral-900">{company.name}</h1>
            {company.city && (
              <p className="text-neutral-500">{company.city}</p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {company.hasAmbulance && (
            <span className="px-3 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
              Ambulance
            </span>
          )}
          {company.hasVSL && (
            <span className="px-3 py-1 text-xs font-medium bg-success-100 text-success-700 rounded-full">
              VSL
            </span>
          )}
          {company.acceptsOnlineBooking && (
            <span className="px-3 py-1 text-xs font-medium bg-info-100 text-info-700 rounded-full">
              Réservation en ligne
            </span>
          )}
          {isOwner && (
            <span className="px-3 py-1 text-xs font-medium bg-warning-100 text-warning-700 rounded-full">
              Gérant
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
