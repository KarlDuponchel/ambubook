"use client";

import Link from "next/link";
import { Input } from "@/components/ui";
import { PatientInfoStepProps } from "../types";

export function PatientInfoStep({
  formData,
  setFormData,
  errors,
  isLoggedIn,
  companySlug,
}: PatientInfoStepProps) {
  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  // Construire l'URL de redirection pour le login
  const loginRedirect = companySlug ? `/?company=${companySlug}` : "/";

  return (
    <div className="space-y-4">
      {/* Lien vers connexion si pas connecté */}
      {!isLoggedIn && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 text-sm">
          <p className="text-primary-800">
            <Link
              href={`/login?redirect=${encodeURIComponent(loginRedirect)}`}
              className="font-medium underline underline-offset-2 hover:text-primary-900"
            >
              Connectez-vous
            </Link>
            {" "}pour pré-remplir vos informations et retrouver vos réservations.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Prénom *"
          name="patientFirstName"
          value={formData.patientFirstName}
          onChange={(e) => handleChange("patientFirstName", e.target.value)}
          placeholder="Jean"
          error={errors.patientFirstName}
          autoComplete="given-name"
        />
        <Input
          label="Nom *"
          name="patientLastName"
          value={formData.patientLastName}
          onChange={(e) => handleChange("patientLastName", e.target.value)}
          placeholder="Dupont"
          error={errors.patientLastName}
          autoComplete="family-name"
        />
      </div>

      <Input
        label="Téléphone *"
        name="patientPhone"
        type="tel"
        value={formData.patientPhone}
        onChange={(e) => handleChange("patientPhone", e.target.value)}
        placeholder="06 12 34 56 78"
        error={errors.patientPhone}
        autoComplete="tel"
        icon={
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        }
      />

      <Input
        label="Email"
        name="patientEmail"
        type="email"
        value={formData.patientEmail}
        onChange={(e) => handleChange("patientEmail", e.target.value)}
        placeholder="jean.dupont@email.com"
        error={errors.patientEmail}
        autoComplete="email"
        icon={
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        }
      />

      <Input
        label="N° Sécurité sociale"
        name="patientSocialSecurityNumber"
        value={formData.patientSocialSecurityNumber}
        onChange={(e) => handleChange("patientSocialSecurityNumber", e.target.value)}
        placeholder="1 85 12 75 108 123 45"
        error={errors.patientSocialSecurityNumber}
      />

      <p className="text-sm text-neutral-500 mt-4">
        * Champs obligatoires
      </p>
    </div>
  );
}
