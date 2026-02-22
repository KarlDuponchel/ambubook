"use client";

import { OnboardingStep, ONBOARDING_STEP_TITLES } from "./types";
import { Check } from "lucide-react";

interface OnboardingProgressProps {
  currentStep: OnboardingStep;
  onStepClick?: (step: OnboardingStep) => void;
}

export function OnboardingProgress({ currentStep, onStepClick }: OnboardingProgressProps) {
  const steps: OnboardingStep[] = [1, 2, 3, 4, 5, 6];

  return (
    <div className="w-full">
      {/* Version desktop */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          const isClickable = onStepClick && step < currentStep;

          return (
            <div key={step} className="flex items-center flex-1">
              {/* Cercle de l'étape */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(step)}
                  disabled={!isClickable}
                  className={`
                    relative flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold
                    transition-all duration-200
                    ${isCompleted
                      ? "bg-primary-600 text-white cursor-pointer hover:bg-primary-700"
                      : isCurrent
                        ? "bg-primary-600 text-white ring-4 ring-primary-100"
                        : "bg-neutral-200 text-neutral-500"
                    }
                    ${!isClickable && !isCurrent ? "cursor-default" : ""}
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" strokeWidth={3} />
                  ) : (
                    step
                  )}
                </button>
                {/* Label de l'étape */}
                <span
                  className={`
                    mt-2 text-xs font-medium text-center max-w-20
                    ${isCurrent ? "text-primary-600" : isCompleted ? "text-neutral-700" : "text-neutral-400"}
                  `}
                >
                  {ONBOARDING_STEP_TITLES[step]}
                </span>
              </div>

              {/* Ligne de connexion */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2">
                  <div
                    className={`
                      h-1 rounded-full transition-colors duration-200
                      ${isCompleted ? "bg-primary-600" : "bg-neutral-200"}
                    `}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Version mobile - Barre de progression simplifiée */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-900">
            Étape {currentStep} sur 6
          </span>
          <span className="text-sm font-medium text-primary-600">
            {ONBOARDING_STEP_TITLES[currentStep]}
          </span>
        </div>
        <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 transition-all duration-300"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
