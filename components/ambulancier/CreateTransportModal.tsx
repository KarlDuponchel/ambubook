"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button, useToast } from "@/components/ui";
import { BookingProgress } from "@/components/booking/BookingProgress";
import { PatientInfoStep } from "@/components/booking/steps/PatientInfoStep";
import { TransportStep } from "@/components/booking/steps/TransportStep";
import { AddressStep } from "@/components/booking/steps/AddressStep";
import { ScheduleStep } from "@/components/booking/steps/ScheduleStep";
import {
  Company,
  BookingFormData,
  initialFormData,
  BookingStep,
  STEP_TITLES,
} from "@/components/booking/types";

interface CreateTransportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (id: string) => void;
}

export function CreateTransportModal({ isOpen, onClose, onSuccess }: CreateTransportModalProps) {
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [formData, setFormData] = useState<BookingFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  // Récupérer les infos de la company de l'ambulancier
  useEffect(() => {
    if (isOpen) {
      fetch("/api/ambulancier/company")
        .then((res) => res.json())
        .then((data) => {
          if (data.company) {
            setCompany({
              id: data.company.id,
              name: data.company.name,
              slug: data.company.slug,
              hasAmbulance: data.company.hasAmbulance,
              hasVSL: data.company.hasVSL,
            });
          }
        })
        .catch(() => {
          toast.error("Erreur lors du chargement des informations");
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, toast]);

  const validateStep = useCallback((step: BookingStep): boolean => {
    const newErrors: Partial<Record<keyof BookingFormData, string>> = {};

    if (step === 1) {
      if (!formData.patientFirstName.trim() || formData.patientFirstName.length < 2) {
        newErrors.patientFirstName = "Le prénom doit contenir au moins 2 caractères";
      }
      if (!formData.patientLastName.trim() || formData.patientLastName.length < 2) {
        newErrors.patientLastName = "Le nom doit contenir au moins 2 caractères";
      }
      if (!formData.patientPhone.trim()) {
        newErrors.patientPhone = "Le téléphone est requis";
      } else if (!/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/.test(formData.patientPhone.replace(/\s/g, ""))) {
        newErrors.patientPhone = "Format de téléphone invalide";
      }
      if (formData.patientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.patientEmail)) {
        newErrors.patientEmail = "Format d'email invalide";
      }
      if (formData.patientSocialSecurityNumber && !/^\d{13}$/.test(formData.patientSocialSecurityNumber)) {
        newErrors.patientSocialSecurityNumber = "Le numéro de sécurité sociale doit contenir exactement 13 chiffres";
      }
    }

    if (step === 3) {
      if (!formData.pickupAddress.trim()) {
        newErrors.pickupAddress = "L'adresse de départ est requise";
      }
      if (!formData.pickupCity.trim()) {
        newErrors.pickupCity = "La ville de départ est requise";
      }
      if (!formData.pickupPostalCode.trim()) {
        newErrors.pickupPostalCode = "Le code postal de départ est requis";
      }
      if (!formData.destinationAddress.trim()) {
        newErrors.destinationAddress = "L'adresse d'arrivée est requise";
      }
      if (!formData.destinationCity.trim()) {
        newErrors.destinationCity = "La ville d'arrivée est requise";
      }
      if (!formData.destinationPostalCode.trim()) {
        newErrors.destinationPostalCode = "Le code postal d'arrivée est requis";
      }
    }

    if (step === 4) {
      if (!formData.requestedDate) {
        newErrors.requestedDate = "La date est requise";
      }
      if (!formData.requestedTime) {
        newErrors.requestedTime = "L'heure est requise";
      }
      if (formData.tripType === "ROUND_TRIP") {
        if (!formData.returnDate) {
          newErrors.returnDate = "La date de retour est requise";
        }
        if (!formData.returnTime) {
          newErrors.returnTime = "L'heure de retour est requise";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep((prev) => (prev + 1) as BookingStep);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as BookingStep);
    }
  };

  const handleStepClick = (step: BookingStep) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/ambulancier/demandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Demande de transport créée !");
        handleClose();
        onSuccess?.(data.id);
      } else {
        const errorMsg = data.error || "Une erreur est survenue";
        setErrors({ notes: errorMsg });
        toast.error(errorMsg);
      }
    } catch {
      toast.error("Une erreur est survenue lors de la création");
      setErrors({ notes: "Une erreur est survenue lors de la création" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData(initialFormData);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">
                Nouvelle demande de transport
              </h2>
              <p className="text-sm text-neutral-500">
                Créer une demande pour un patient
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 -mr-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <span className="sr-only">Fermer</span>
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Progress indicator */}
          <BookingProgress
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
          ) : !company ? (
            <div className="text-center py-12">
              <p className="text-neutral-600">Impossible de charger les informations de votre entreprise.</p>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-medium text-neutral-900 mb-4">
                {STEP_TITLES[currentStep]}
              </h3>

              {currentStep === 1 && (
                <PatientInfoStep
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  isLoggedIn={true}
                  hideLoginSuggestion={true}
                />
              )}
              {currentStep === 2 && (
                <TransportStep
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  company={company}
                />
              )}
              {currentStep === 3 && (
                <AddressStep
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                />
              )}
              {currentStep === 4 && (
                <ScheduleStep
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  company={company}
                />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && company && (
          <div className="px-6 py-4 border-t border-neutral-200 shrink-0">
            <div className="flex justify-between gap-3">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handlePrevious}
                  disabled={isSubmitting}
                >
                  Précédent
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
              )}

              {currentStep < 4 ? (
                <Button type="button" onClick={handleNext}>
                  Suivant
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Création..." : "Créer la demande"}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (typeof window !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return null;
}
