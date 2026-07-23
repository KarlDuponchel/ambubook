"use client";

import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import { Field } from "../fields";
import { PatientInfoStepProps } from "../types";

export function PatientInfoStep({
  formData,
  setFormData,
  errors,
  isLoggedIn,
  companySlug,
  hideLoginSuggestion,
}: PatientInfoStepProps) {
  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  // Construire l'URL de redirection pour le login
  const loginRedirect = companySlug ? `/?company=${companySlug}` : "/";

  // Retire tous les espaces (pour stocker la valeur brute)
  const unformatSSN = (value: string) => value.replace(/\s/g, "");

  // Formate selon le masque : 1 85 12 75 108 123 45
  const formatSSN = (value: string) => {
    const v = value.replace(/\s/g, "").slice(0, 15);
    const parts = [
      v.slice(0, 1),   // 1
      v.slice(1, 3),   // 85
      v.slice(3, 5),   // 12
      v.slice(5, 7),   // 75
      v.slice(7, 10),  // 108
      v.slice(10, 13), // 123
    ];
    return parts.filter(Boolean).join(" ");
  };

  return (
    <div className="space-y-4">
      {/* Lien vers connexion si pas connecté */}
      {!isLoggedIn && !hideLoginSuggestion && (
        <div className="bg-brand/8 border border-brand/25 rounded-xl p-3.5 text-sm">
          <p className="text-ink-2">
            <Link
              href={`/connexion?redirect=${encodeURIComponent(loginRedirect)}`}
              className="font-bold text-brand underline underline-offset-2 hover:text-brand-ink"
            >
              Connectez-vous
            </Link>
            {" "}pour pré-remplir vos informations et retrouver vos réservations.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Prénom *"
          name="patientFirstName"
          value={formData.patientFirstName}
          onChange={(e) => handleChange("patientFirstName", e.target.value)}
          placeholder="Jean"
          error={errors.patientFirstName}
          autoComplete="given-name"
        />
        <Field
          label="Nom *"
          name="patientLastName"
          value={formData.patientLastName}
          onChange={(e) => handleChange("patientLastName", e.target.value)}
          placeholder="Dupont"
          error={errors.patientLastName}
          autoComplete="family-name"
        />
      </div>

      <Field
        label="Téléphone *"
        name="patientPhone"
        type="tel"
        value={formData.patientPhone}
        onChange={(e) => handleChange("patientPhone", e.target.value)}
        placeholder="06 12 34 56 78"
        error={errors.patientPhone}
        autoComplete="tel"
        icon={<Phone className="w-5 h-5" />}
      />

      <Field
        label="Email"
        name="patientEmail"
        type="email"
        value={formData.patientEmail}
        onChange={(e) => handleChange("patientEmail", e.target.value)}
        placeholder="jean.dupont@email.com"
        error={errors.patientEmail}
        autoComplete="email"
        icon={<Mail className="w-5 h-5" />}
      />

      <Field
        label="N° Sécurité sociale"
        name="patientSocialSecurityNumber"
        value={formatSSN(formData.patientSocialSecurityNumber)}
        onChange={(e) => handleChange("patientSocialSecurityNumber", unformatSSN(e.target.value))}
        placeholder="1 85 12 75 108 123 45"
        error={errors.patientSocialSecurityNumber}
      />

      <p className="text-sm text-ink-3 mt-4">* Champs obligatoires</p>
    </div>
  );
}
