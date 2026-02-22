"use client";

import { OnboardingFormData } from "../types";
import { Checkbox, Input, Select } from "@/components/ui";
import { Ambulance, Car, Globe, MapPin, Truck } from "lucide-react";

interface ServicesStepProps {
  data: OnboardingFormData;
  onChange: (data: Partial<OnboardingFormData>) => void;
  errors: Record<string, string>;
}

export function ServicesStep({ data, onChange, errors }: ServicesStepProps) {
  const radiusOptions = [
    { value: "10", label: "10 km" },
    { value: "20", label: "20 km" },
    { value: "30", label: "30 km" },
    { value: "50", label: "50 km" },
    { value: "100", label: "100 km" },
    { value: "150", label: "150 km et plus" },
  ];

  const fleetSizeOptions = [
    { value: "", label: "Non précisé" },
    { value: "1", label: "1 véhicule" },
    { value: "2", label: "2 véhicules" },
    { value: "3", label: "3 véhicules" },
    { value: "4", label: "4 véhicules" },
    { value: "5", label: "5 véhicules" },
    { value: "6", label: "6 à 10 véhicules" },
    { value: "11", label: "Plus de 10 véhicules" },
  ];

  // Générer les années depuis 1950 jusqu'à l'année actuelle
  const currentYear = new Date().getFullYear();
  const yearOptions = [
    { value: "", label: "Non précisé" },
    ...Array.from({ length: currentYear - 1949 }, (_, i) => ({
      value: String(currentYear - i),
      label: String(currentYear - i),
    })),
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Vos services
        </h2>
        <p className="text-neutral-600">
          Indiquez les types de transport que vous proposez.
        </p>
      </div>

      {/* Types de véhicules */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-primary-600" />
          Types de véhicules
        </h3>
        <p className="text-sm text-neutral-500 mb-4">
          Sélectionnez au moins un type de véhicule.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ambulance */}
          <label
            className={`
              flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
              ${data.hasAmbulance
                ? "border-primary-500 bg-primary-50"
                : "border-neutral-200 hover:border-neutral-300"
              }
            `}
          >
            <input
              type="checkbox"
              checked={data.hasAmbulance}
              onChange={(e) => onChange({ hasAmbulance: e.target.checked })}
              className="sr-only"
            />
            <div className={`
              w-12 h-12 rounded-lg flex items-center justify-center
              ${data.hasAmbulance ? "bg-primary-600 text-white" : "bg-neutral-100 text-neutral-500"}
            `}>
              <Ambulance className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-neutral-900">Ambulance</p>
              <p className="text-sm text-neutral-500">
                Transport médicalisé allongé
              </p>
            </div>
          </label>

          {/* VSL */}
          <label
            className={`
              flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
              ${data.hasVSL
                ? "border-primary-500 bg-primary-50"
                : "border-neutral-200 hover:border-neutral-300"
              }
            `}
          >
            <input
              type="checkbox"
              checked={data.hasVSL}
              onChange={(e) => onChange({ hasVSL: e.target.checked })}
              className="sr-only"
            />
            <div className={`
              w-12 h-12 rounded-lg flex items-center justify-center
              ${data.hasVSL ? "bg-primary-600 text-white" : "bg-neutral-100 text-neutral-500"}
            `}>
              <Car className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-neutral-900">VSL</p>
              <p className="text-sm text-neutral-500">
                Véhicule Sanitaire Léger
              </p>
            </div>
          </label>
        </div>
        {errors.vehicleType && (
          <p className="text-sm text-danger-600 mt-2">{errors.vehicleType}</p>
        )}
      </div>

      {/* Réservation en ligne */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary-600" />
          Réservation en ligne
        </h3>

        <Checkbox
          id="acceptsOnlineBooking"
          label="Accepter les réservations en ligne"
          description="Les patients pourront réserver directement depuis votre page"
          checked={data.acceptsOnlineBooking}
          onChange={(checked) => onChange({ acceptsOnlineBooking: checked })}
        />
      </div>

      {/* Zone de couverture */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary-600" />
          Zone d'intervention
        </h3>

        <div>
          <Select
            label="Rayon de couverture"
            value={String(data.coverageRadius || 30)}
            onChange={(e) => onChange({ coverageRadius: parseInt(e.target.value) })}
            options={radiusOptions}
          />
          <p className="mt-1 text-xs text-neutral-500">Distance maximale autour de votre base</p>
        </div>
      </div>

      {/* Informations complémentaires */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Informations complémentaires
        </h3>
        <p className="text-sm text-neutral-500 mb-4">
          Ces informations sont optionnelles mais aident les patients à mieux vous connaître.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Taille de la flotte"
            value={String(data.fleetSize || "")}
            onChange={(e) => onChange({ fleetSize: e.target.value ? parseInt(e.target.value) : null })}
            options={fleetSizeOptions}
          />

          <Select
            label="Année de création"
            value={String(data.foundedYear || "")}
            onChange={(e) => onChange({ foundedYear: e.target.value ? parseInt(e.target.value) : null })}
            options={yearOptions}
          />
        </div>
      </div>
    </div>
  );
}
