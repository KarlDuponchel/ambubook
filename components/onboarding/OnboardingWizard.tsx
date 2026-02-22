"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  OnboardingStep,
  OnboardingFormData,
  DEFAULT_ONBOARDING_DATA,
  DEFAULT_HOURS,
} from "./types";
import { OnboardingProgress } from "./OnboardingProgress";
import { OnboardingSuccess } from "./OnboardingSuccess";
import {
  BasicInfoStep,
  ServicesStep,
  BrandingStep,
  DescriptionStep,
  HoursStep,
  FinalStep,
} from "./steps";
import { Button, LoadingSpinner } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { ArrowLeft, ArrowRight, Check, SkipForward, Loader2 } from "lucide-react";

interface OnboardingWizardProps {
  initialStep?: number;
  initialData?: Partial<OnboardingFormData>;
  companyId: string;
}

export function OnboardingWizard({
  initialStep = 1,
  initialData,
  companyId,
}: OnboardingWizardProps) {
  const router = useRouter();
  const toast = useToast();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>(
    (initialStep > 0 && initialStep <= 6 ? initialStep : 1) as OnboardingStep
  );
  const [formData, setFormData] = useState<OnboardingFormData>({
    ...DEFAULT_ONBOARDING_DATA,
    ...initialData,
    hours: initialData?.hours?.length ? initialData.hours : DEFAULT_HOURS,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Mettre à jour les données du formulaire
  const handleChange = (data: Partial<OnboardingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    // Effacer les erreurs des champs modifiés
    const newErrors = { ...errors };
    Object.keys(data).forEach((key) => {
      delete newErrors[key];
    });
    setErrors(newErrors);
  };

  // Validation par étape
  const validateStep = (step: OnboardingStep): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Informations de base
        if (!formData.name?.trim()) {
          newErrors.name = "Le nom de l'entreprise est requis";
        }
        if (!formData.address?.trim()) {
          newErrors.address = "L'adresse est requise";
        }
        if (!formData.city?.trim()) {
          newErrors.city = "La ville est requise";
        }
        if (!formData.postalCode?.trim()) {
          newErrors.postalCode = "Le code postal est requis";
        } else if (!/^\d{5}$/.test(formData.postalCode)) {
          newErrors.postalCode = "Le code postal doit contenir 5 chiffres";
        }
        if (!formData.phone?.trim()) {
          newErrors.phone = "Le téléphone est requis";
        }
        if (!formData.email?.trim()) {
          newErrors.email = "L'email est requis";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "L'email n'est pas valide";
        }
        break;

      case 2: // Services
        if (!formData.hasAmbulance && !formData.hasVSL) {
          newErrors.vehicleType = "Sélectionnez au moins un type de véhicule";
        }
        break;

      case 3: // Branding - optionnel
      case 4: // Description - optionnel
        // Pas de validation obligatoire
        break;

      case 5: // Horaires
        // Vérifier qu'au moins un jour est ouvert
        const hasOpenDay = formData.hours.some((h) => !h.isClosed);
        if (!hasOpenDay) {
          newErrors.hours = "Au moins un jour doit être ouvert";
        }
        break;

      case 6: // Finalisation - pas de validation
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Sauvegarder l'étape
  const saveStep = async (step: OnboardingStep, completed = false) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step,
          data: formData,
          completed,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la sauvegarde");
      }

      return true;
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la sauvegarde"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Passer à l'étape suivante
  const handleNext = async () => {
    // Valider l'étape actuelle
    if (!validateStep(currentStep)) {
      toast.error("Veuillez corriger les erreurs");
      return;
    }

    // Sauvegarder
    const saved = await saveStep(currentStep);
    if (!saved) return;

    if (currentStep < 6) {
      setCurrentStep((prev) => (prev + 1) as OnboardingStep);
    } else {
      // Dernière étape - marquer comme terminé
      const completed = await saveStep(currentStep, true);
      if (completed) {
        setIsCompleted(true);
      }
    }
  };

  // Revenir à l'étape précédente
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as OnboardingStep);
    }
  };

  // Passer une étape optionnelle
  const handleSkip = async () => {
    const saved = await saveStep(currentStep);
    if (saved && currentStep < 6) {
      setCurrentStep((prev) => (prev + 1) as OnboardingStep);
    }
  };

  // Cliquer sur une étape dans la barre de progression
  const handleStepClick = (step: OnboardingStep) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  // Déterminer si l'étape actuelle est optionnelle
  const isOptionalStep = currentStep === 3 || currentStep === 4;

  // Afficher l'écran de succès
  if (isCompleted) {
    return <OnboardingSuccess companyName={formData.name} />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Barre de progression */}
      <div className="mb-8">
        <OnboardingProgress
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />
      </div>

      {/* Contenu de l'étape */}
      <div className="bg-neutral-50 rounded-2xl p-6 md:p-8 mb-8">
        {currentStep === 1 && (
          <BasicInfoStep
            data={formData}
            onChange={handleChange}
            errors={errors}
          />
        )}
        {currentStep === 2 && (
          <ServicesStep
            data={formData}
            onChange={handleChange}
            errors={errors}
          />
        )}
        {currentStep === 3 && (
          <BrandingStep
            data={formData}
            onChange={handleChange}
            errors={errors}
          />
        )}
        {currentStep === 4 && (
          <DescriptionStep
            data={formData}
            onChange={handleChange}
            errors={errors}
          />
        )}
        {currentStep === 5 && (
          <HoursStep
            data={formData}
            onChange={handleChange}
            errors={errors}
          />
        )}
        {currentStep === 6 && (
          <FinalStep
            data={formData}
            onChange={handleChange}
            errors={errors}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1 || isLoading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Précédent
        </Button>

        <div className="flex items-center gap-3">
          {isOptionalStep && (
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={isLoading}
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Passer cette étape
            </Button>
          )}

          <Button onClick={handleNext} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : currentStep === 6 ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <ArrowRight className="w-4 h-4 mr-2" />
            )}
            {currentStep === 6 ? "Terminer" : "Suivant"}
          </Button>
        </div>
      </div>
    </div>
  );
}
