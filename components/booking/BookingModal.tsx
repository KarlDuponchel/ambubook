"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useToast } from "@/components/ui";
import { BookingProgress } from "./BookingProgress";
import { PatientInfoStep } from "./steps/PatientInfoStep";
import { TransportStep } from "./steps/TransportStep";
import { AddressStep } from "./steps/AddressStep";
import { ScheduleStep } from "./steps/ScheduleStep";
import { useSession } from "@/lib/auth-client";
import { isValidFrenchPhone, isValidNir } from "@/lib/validators";
import {
  Company,
  BookingFormData,
  initialFormData,
  BookingStep,
  STEP_TITLES,
} from "./types";
import Link from "next/link";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company;
}

export function BookingModal({ isOpen, onClose, company }: BookingModalProps) {
  const { data: session } = useSession();
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [formData, setFormData] = useState<BookingFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [hasPrefilledFromSession, setHasPrefilledFromSession] = useState(false);

  // Pré-remplir le formulaire avec les données du customer connecté
  useEffect(() => {
    if (session?.user && !hasPrefilledFromSession && isOpen) {
      const user = session.user;

      // Parser le nom complet en prénom/nom
      const nameParts = (user.name || "").split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      setFormData((prev) => ({
        ...prev,
        patientFirstName: firstName || prev.patientFirstName,
        patientLastName: lastName || prev.patientLastName,
        patientEmail: user.email || prev.patientEmail,
        patientPhone: user.phone || prev.patientPhone,
      }));
      setHasPrefilledFromSession(true);
    }
  }, [session, hasPrefilledFromSession, isOpen]);

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
      } else if (!isValidFrenchPhone(formData.patientPhone)) {
        newErrors.patientPhone = "Format de téléphone invalide";
      }
      if (formData.patientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.patientEmail)) {
        newErrors.patientEmail = "Format d'email invalide";
      }
      if (formData.patientSocialSecurityNumber && !isValidNir(formData.patientSocialSecurityNumber)) {
        newErrors.patientSocialSecurityNumber = "Numéro de sécurité sociale invalide (13 chiffres)";
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
      if (!formData.consentGiven) {
        newErrors.consentGiven =
          "Vous devez accepter le traitement de vos données pour envoyer la demande.";
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
      const { transportVoucherFile, ...jsonData } = formData;

      let response: Response;

      // Si un fichier est présent, envoyer en FormData
      if (transportVoucherFile) {
        const submitFormData = new FormData();
        submitFormData.append("data", JSON.stringify({
          ...jsonData,
          companyId: company.id,
        }));
        submitFormData.append("transportVoucherFile", transportVoucherFile);

        response = await fetch("/api/customer/transports", {
          method: "POST",
          body: submitFormData,
        });
      } else {
        // Sinon, envoyer en JSON classique
        response = await fetch("/api/customer/transports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...jsonData,
            companyId: company.id,
          }),
        });
      }

      const data = await response.json();

      if (response.ok && data.trackingId) {
        setTrackingId(data.trackingId);
        toast.success("Demande de transport envoyée !");
      } else {
        const errorMsg = data.error || "Une erreur est survenue";
        setErrors({ notes: errorMsg });
        toast.error(errorMsg);
      }
    } catch {
      toast.error("Une erreur est survenue lors de l'envoi");
      setErrors({ notes: "Une erreur est survenue lors de l'envoi" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData(initialFormData);
    setErrors({});
    setTrackingId(null);
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="w-full max-w-2xl max-h-[90vh] bg-surface border border-line rounded-2xl shadow-soft animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-line shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="serif text-xl text-ink">
                {trackingId ? "Demande envoyée !" : "Réserver un transport"}
              </h2>
              <p className="text-sm text-ink-2">{company.name}</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="grid place-items-center w-9 h-9 -mr-2 text-ink-3 hover:text-ink hover:bg-surface-2 rounded-lg transition-colors"
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
          {!trackingId && (
            <BookingProgress
              currentStep={currentStep}
              onStepClick={handleStepClick}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {trackingId ? (
            <SuccessView trackingId={trackingId} onClose={handleClose} isLoggedIn={!!session?.user} />
          ) : (
            <>
              <h3 className="font-bold text-ink mb-4">
                {STEP_TITLES[currentStep]}
              </h3>

              {currentStep === 1 && (
                <PatientInfoStep
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  isLoggedIn={!!session?.user}
                  companySlug={company.slug}
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
        {!trackingId && (
          <div className="px-6 py-4 border-t border-line shrink-0">
            <div className="flex justify-between gap-3">
              <button
                type="button"
                onClick={currentStep > 1 ? handlePrevious : handleClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 font-bold text-ink-2 hover:bg-surface-2 rounded-xl disabled:opacity-50 transition-colors"
              >
                {currentStep > 1 ? "Précédent" : "Annuler"}
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 font-bold text-white bg-brand hover:bg-brand-ink rounded-xl transition-colors"
                >
                  Suivant
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 font-bold text-white bg-brand hover:bg-brand-ink rounded-xl disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? "Envoi..." : "Envoyer la demande"}
                </button>
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

function SuccessView({
  trackingId,
  onClose,
  isLoggedIn,
}: {
  trackingId: string;
  onClose: () => void;
  isLoggedIn: boolean;
}) {
  const trackingUrl = isLoggedIn
    ? `/mes-transports/${trackingId}`
    : `/suivi/${trackingId}`;

  return (
    <div className="text-center py-6">
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-vert/12 text-vert flex items-center justify-center">
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h3 className="serif text-xl text-ink mb-2">
        Demande envoyée avec succès !
      </h3>
      <p className="text-ink-2 mb-6">
        Votre demande de transport a été transmise à l&apos;ambulancier.
        <br />
        Vous serez contacté prochainement pour confirmation.
      </p>

      <div className="bg-surface-2 border border-line rounded-xl p-4 mb-6">
        <p className="text-sm text-ink-3 mb-1">Numéro de suivi</p>
        <p className="text-lg font-mono font-bold text-ink">
          {trackingId.slice(0, 8).toUpperCase()}
        </p>
      </div>

      <div className="flex justify-center gap-2">
        <Link
          href={trackingUrl}
          className="inline-flex items-center justify-center px-5 py-2.5 font-bold text-white bg-brand hover:bg-brand-ink rounded-xl transition-colors"
        >
          Suivre ma demande
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 font-bold text-ink bg-surface-2 border border-line rounded-xl hover:border-brand transition-colors"
        >
          Fermer
        </button>
      </div>

      {!isLoggedIn && (
        <div className="mt-6 pt-6 border-t border-line">
          <p className="text-sm text-ink-2 mb-3">
            Créez un compte pour retrouver toutes vos demandes au même endroit.
          </p>
          <Link
            href="/inscription"
            className="text-sm text-brand hover:text-brand-ink font-semibold hover:underline"
          >
            Créer un compte gratuit
          </Link>
        </div>
      )}
    </div>
  );
}
