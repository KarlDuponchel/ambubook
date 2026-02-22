"use client";

import { Input } from "@/components/ui";
import { OnboardingFormData } from "../types";
import { Building2, MapPin, Phone, Mail, FileText, Shield } from "lucide-react";

interface BasicInfoStepProps {
  data: OnboardingFormData;
  onChange: (data: Partial<OnboardingFormData>) => void;
  errors: Record<string, string>;
}

export function BasicInfoStep({ data, onChange, errors }: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Informations de votre entreprise
        </h2>
        <p className="text-neutral-600">
          Ces informations seront affichées sur votre page publique.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nom de l'entreprise */}
        <div className="md:col-span-2">
          <Input
            label="Nom de l'entreprise"
            placeholder="Ambulances Dupont"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            error={errors.name}
            icon={<Building2 className="w-4 h-4" />}
            required
          />
        </div>

        {/* Adresse */}
        <div className="md:col-span-2">
          <Input
            label="Adresse"
            placeholder="123 rue de la Santé"
            value={data.address}
            onChange={(e) => onChange({ address: e.target.value })}
            error={errors.address}
            icon={<MapPin className="w-4 h-4" />}
            required
          />
        </div>

        {/* Ville */}
        <div>
          <Input
            label="Ville"
            placeholder="Paris"
            value={data.city}
            onChange={(e) => onChange({ city: e.target.value })}
            error={errors.city}
            required
          />
        </div>

        {/* Code postal */}
        <div>
          <Input
            label="Code postal"
            placeholder="75001"
            value={data.postalCode}
            onChange={(e) => onChange({ postalCode: e.target.value })}
            error={errors.postalCode}
            maxLength={5}
            required
          />
        </div>

        {/* Téléphone */}
        <div>
          <Input
            label="Téléphone"
            placeholder="01 23 45 67 89"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            error={errors.phone}
            icon={<Phone className="w-4 h-4" />}
            required
          />
        </div>

        {/* Email */}
        <div>
          <Input
            label="Email de contact"
            type="email"
            placeholder="contact@ambulances-dupont.fr"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            error={errors.email}
            icon={<Mail className="w-4 h-4" />}
            required
          />
        </div>

        {/* SIRET */}
        <div>
          <Input
            label="Numéro SIRET"
            placeholder="123 456 789 00012"
            value={data.siret}
            onChange={(e) => onChange({ siret: e.target.value })}
            error={errors.siret}
            icon={<FileText className="w-4 h-4" />}
          />
          <p className="mt-1 text-xs text-neutral-500">14 chiffres</p>
        </div>

        {/* N° agrément ARS */}
        <div>
          <Input
            label="N° agrément ARS"
            placeholder="ARS-XX-XXXX"
            value={data.licenseNumber}
            onChange={(e) => onChange({ licenseNumber: e.target.value })}
            error={errors.licenseNumber}
            icon={<Shield className="w-4 h-4" />}
          />
          <p className="mt-1 text-xs text-neutral-500">Numéro d'agrément délivré par l'ARS</p>
        </div>
      </div>
    </div>
  );
}
