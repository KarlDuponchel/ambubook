"use client";

import { useEffect, useMemo } from "react";
import { Input, Checkbox } from "@/components/ui";
import { TransportStepProps, BookingFormData } from "../types";

type TransportType = BookingFormData["transportType"];
type TripType = BookingFormData["tripType"];
type MobilityType = BookingFormData["mobilityType"];

const ALL_TRANSPORT_OPTIONS: { value: TransportType; label: string; description: string; icon: string }[] = [
  {
    value: "VSL",
    label: "VSL",
    description: "Véhicule Sanitaire Léger",
    icon: "🚗",
  },
  {
    value: "AMBULANCE",
    label: "Ambulance",
    description: "Transport médicalisé",
    icon: "🚑",
  },
];

const TRIP_OPTIONS: { value: TripType; label: string }[] = [
  { value: "ONE_WAY", label: "Aller simple" },
  { value: "ROUND_TRIP", label: "Aller-retour" },
];

const MOBILITY_OPTIONS: { value: MobilityType; label: string; description: string }[] = [
  { value: "WALKING", label: "Valide", description: "Peut marcher" },
  { value: "WHEELCHAIR", label: "Fauteuil", description: "Fauteuil roulant" },
  { value: "STRETCHER", label: "Brancard", description: "Allongé" },
];

export function TransportStep({ formData, setFormData, errors, company }: TransportStepProps) {
  const handleChange = <K extends keyof BookingFormData>(
    field: K,
    value: BookingFormData[K]
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  // Filtrer les options selon les services de l'entreprise
  const transportOptions = useMemo(() => {
    return ALL_TRANSPORT_OPTIONS.filter((option) => {
      if (option.value === "AMBULANCE") {
        return company.hasAmbulance !== false; // true par défaut si non défini
      }
      if (option.value === "VSL") {
        return company.hasVSL !== false; // true par défaut si non défini
      }
      return true;
    });
  }, [company.hasAmbulance, company.hasVSL]);

  // Si le type sélectionné n'est plus disponible, sélectionner le premier disponible
  useEffect(() => {
    if (transportOptions.length > 0) {
      const isCurrentTypeAvailable = transportOptions.some(
        (opt) => opt.value === formData.transportType
      );
      if (!isCurrentTypeAvailable) {
        handleChange("transportType", transportOptions[0].value);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transportOptions]);

  return (
    <div className="space-y-6">
      {/* Type de véhicule */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Type de véhicule
        </label>
        <div className={`grid gap-3 ${transportOptions.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {transportOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleChange("transportType", option.value)}
              className={`
                p-4 rounded-xl border-2 text-left transition-all
                ${formData.transportType === option.value
                  ? "border-primary-500 bg-primary-50"
                  : "border-neutral-200 hover:border-neutral-300 bg-white"
                }
              `}
            >
              <span className="text-2xl">{option.icon}</span>
              <p className="font-medium text-neutral-900 mt-2">{option.label}</p>
              <p className="text-sm text-neutral-500">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Type de trajet */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Type de trajet
        </label>
        <div className="flex gap-3">
          {TRIP_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleChange("tripType", option.value)}
              className={`
                flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all
                ${formData.tripType === option.value
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-neutral-200 hover:border-neutral-300 text-neutral-700"
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobilité */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Mobilité du patient
        </label>
        <div className="grid grid-cols-3 gap-3">
          {MOBILITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleChange("mobilityType", option.value)}
              className={`
                py-3 px-4 rounded-lg border-2 text-center transition-all
                ${formData.mobilityType === option.value
                  ? "border-primary-500 bg-primary-50"
                  : "border-neutral-200 hover:border-neutral-300"
                }
              `}
            >
              <p className="font-medium text-neutral-900">{option.label}</p>
              <p className="text-xs text-neutral-500">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Accompagnant */}
      <div className="space-y-3">
        <Checkbox
          label="Besoin d'un accompagnant"
          checked={formData.needsAccompanist}
          onChange={(checked) => handleChange("needsAccompanist", checked)}
        />

        {formData.needsAccompanist && (
          <Input
            label="Nom de l'accompagnant"
            name="accompanistName"
            value={formData.accompanistName}
            onChange={(e) => handleChange("accompanistName", e.target.value)}
            placeholder="Nom et prénom de l'accompagnant"
            error={errors.accompanistName}
          />
        )}
      </div>
    </div>
  );
}
