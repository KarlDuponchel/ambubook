"use client";

import { OnboardingFormData } from "../types";
import { Textarea } from "@/components/ui";
import { Lightbulb, FileText } from "lucide-react";

interface DescriptionStepProps {
  data: OnboardingFormData;
  onChange: (data: Partial<OnboardingFormData>) => void;
  errors: Record<string, string>;
}

const DESCRIPTION_SUGGESTIONS = [
  "Présentez votre entreprise et votre équipe",
  "Mentionnez vos années d'expérience",
  "Décrivez vos spécialités (dialyse, chimiothérapie, transports longue distance...)",
  "Parlez de vos équipements et véhicules",
  "Indiquez vos zones d'intervention principales",
];

const EXAMPLE_DESCRIPTION = `Notre entreprise d'ambulances, créée en 2005, met son savoir-faire au service des patients de la région parisienne.

Notre équipe de 8 ambulanciers diplômés assure tous types de transports sanitaires : consultations médicales, hospitalisations, séances de dialyse et chimiothérapie.

Nous disposons de 4 véhicules modernes et régulièrement entretenus pour garantir votre confort et votre sécurité. Notre centrale de réservation est disponible 7j/7 pour répondre à vos demandes.`;

export function DescriptionStep({ data, onChange, errors }: DescriptionStepProps) {
  const characterCount = data.description?.length || 0;
  const maxCharacters = 1500;

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Description de votre entreprise
        </h2>
        <p className="text-neutral-600">
          Présentez votre entreprise aux patients qui visitent votre page.
        </p>
        <p className="text-sm text-neutral-500 mt-1">
          Cette étape est optionnelle, vous pouvez la compléter plus tard.
        </p>
      </div>

      {/* Textarea principale */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-neutral-900">
            Votre présentation
          </h3>
        </div>

        <Textarea
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Décrivez votre entreprise, vos services, votre équipe..."
          rows={8}
          maxLength={maxCharacters}
          error={errors.description}
        />

        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-neutral-400">
            Conseils : soyez clair, précis et mettez en avant vos points forts.
          </p>
          <p
            className={`text-xs ${
              characterCount > maxCharacters * 0.9
                ? "text-warning-600"
                : "text-neutral-400"
            }`}
          >
            {characterCount} / {maxCharacters}
          </p>
        </div>
      </div>

      {/* Suggestions */}
      <div className="bg-primary-50 rounded-xl p-6 border border-primary-100">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-primary-900">
            Que mentionner dans votre description ?
          </h3>
        </div>

        <ul className="space-y-2">
          {DESCRIPTION_SUGGESTIONS.map((suggestion, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-primary-800">
              <span className="text-primary-600 mt-0.5">•</span>
              {suggestion}
            </li>
          ))}
        </ul>
      </div>

      {/* Exemple */}
      <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-neutral-900">
            Exemple de description
          </h3>
          <button
            type="button"
            onClick={() => onChange({ description: EXAMPLE_DESCRIPTION })}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Utiliser cet exemple
          </button>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <p className="text-sm text-neutral-600 whitespace-pre-line">
            {EXAMPLE_DESCRIPTION}
          </p>
        </div>
      </div>
    </div>
  );
}
