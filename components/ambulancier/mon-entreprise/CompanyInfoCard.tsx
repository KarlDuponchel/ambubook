"use client";

import { useState } from "react";
import { Building2, MapPin, Phone, Mail, FileText, Shield, Save, X, Pencil } from "lucide-react";
import { CompanyFull } from "@/lib/types";
import { Card, CardHeader, CardContent } from "@/components/ui";
import { isValidFrenchPhone, isValidSiret, isValidArsLicense } from "@/lib/validators";

interface CompanyInfoCardProps {
  company: CompanyFull;
  isOwner: boolean;
  onUpdate: (data: Partial<CompanyFull>) => Promise<void>;
}

export function CompanyInfoCard({ company, isOwner, onUpdate }: CompanyInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: company.name,
    address: company.address || "",
    city: company.city || "",
    postalCode: company.postalCode || "",
    phone: company.phone || "",
    email: company.email || "",
    siret: company.siret || "",
    licenseNumber: company.licenseNumber || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Met à jour un champ et efface son erreur
  const setField = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSave = async () => {
    // Validation de format (blocage UI). Champs facultatifs : validés si renseignés.
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = "Le nom doit contenir au moins 2 caractères";
    }
    if (formData.siret.trim() && !isValidSiret(formData.siret)) {
      newErrors.siret = "Le SIRET doit contenir 14 chiffres";
    }
    if (formData.licenseNumber.trim() && !isValidArsLicense(formData.licenseNumber)) {
      newErrors.licenseNumber = "Numéro d'agrément invalide (5 à 30 caractères)";
    }
    if (formData.postalCode.trim() && !/^\d{5}$/.test(formData.postalCode)) {
      newErrors.postalCode = "Le code postal doit contenir 5 chiffres";
    }
    if (formData.phone.trim() && !isValidFrenchPhone(formData.phone)) {
      newErrors.phone = "Format de téléphone invalide (ex : 06 12 34 56 78)";
    }
    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Format d'email invalide";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      await onUpdate({
        name: formData.name,
        address: formData.address || null,
        city: formData.city || null,
        postalCode: formData.postalCode || null,
        phone: formData.phone || null,
        email: formData.email || null,
        siret: formData.siret || null,
        licenseNumber: formData.licenseNumber || null,
      });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: company.name,
      address: company.address || "",
      city: company.city || "",
      postalCode: company.postalCode || "",
      phone: company.phone || "",
      email: company.email || "",
      siret: company.siret || "",
      licenseNumber: company.licenseNumber || "",
    });
    setErrors({});
    setIsEditing(false);
  };

  // Classe d'input avec bordure d'erreur conditionnelle
  const inputClass = (field: string, extra = "") =>
    `${extra} px-4 py-2.5 border rounded-lg bg-input-bg focus:outline-none focus:ring-2 disabled:bg-neutral-50 disabled:text-neutral-500 ${
      errors[field]
        ? "border-danger-500 focus:ring-danger-500"
        : "border-input-border focus:ring-primary-500"
    }`;

  return (
    <Card>
      <CardHeader
        icon={Building2}
        title="Informations générales"
        action={
          isOwner && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Pencil className="h-4 w-4" />
              Modifier
            </button>
          )
        }
      />
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Nom de l&apos;entreprise
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setField("name", e.target.value)}
              disabled={!isEditing}
              className={inputClass("name", "w-full")}
            />
            {errors.name && <p className="mt-1 text-sm text-danger-600">{errors.name}</p>}
          </div>

          {/* SIRET */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              SIRET
            </label>
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-neutral-400 shrink-0" />
              <input
                type="text"
                value={formData.siret}
                onChange={(e) => setField("siret", e.target.value)}
                disabled={!isEditing}
                inputMode="numeric"
                className={inputClass("siret", "flex-1 w-full")}
                placeholder="Non renseigné"
              />
            </div>
            {errors.siret && <p className="mt-1 text-sm text-danger-600">{errors.siret}</p>}
          </div>

          {/* N° agrément ARS */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              N° agrément ARS
            </label>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-neutral-400 shrink-0" />
              <input
                type="text"
                value={formData.licenseNumber}
                onChange={(e) => setField("licenseNumber", e.target.value)}
                disabled={!isEditing}
                className={inputClass("licenseNumber", "flex-1 w-full")}
                placeholder="Non renseigné"
              />
            </div>
            {errors.licenseNumber && (
              <p className="mt-1 text-sm text-danger-600">{errors.licenseNumber}</p>
            )}
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Adresse
            </label>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-neutral-400 shrink-0" />
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={!isEditing}
                className="flex-1 px-4 py-2.5 w-full border border-input-border rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-50 disabled:text-neutral-500"
                placeholder="Non renseignée"
              />
            </div>
          </div>

          {/* Ville + CP */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Ville
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-2.5 border border-input-border rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-50 disabled:text-neutral-500"
                placeholder="Non renseignée"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Code postal
              </label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setField("postalCode", e.target.value)}
                disabled={!isEditing}
                maxLength={5}
                inputMode="numeric"
                className={inputClass("postalCode", "w-full")}
                placeholder="Non renseigné"
              />
              {errors.postalCode && (
                <p className="mt-1 text-sm text-danger-600">{errors.postalCode}</p>
              )}
            </div>
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Téléphone
            </label>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-neutral-400 shrink-0" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setField("phone", e.target.value)}
                disabled={!isEditing}
                className={inputClass("phone", "flex-1 w-full")}
                placeholder="Non renseigné"
              />
            </div>
            {errors.phone && <p className="mt-1 text-sm text-danger-600">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Email
            </label>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-neutral-400 shrink-0" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setField("email", e.target.value)}
                disabled={!isEditing}
                className={inputClass("email", "flex-1 w-full")}
                placeholder="Non renseigné"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-danger-600">{errors.email}</p>}
          </div>
        </div>
      </CardContent>

      {isEditing && (
        <div className="px-6 py-4 border-t border-card-border flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      )}
    </Card>
  );
}
