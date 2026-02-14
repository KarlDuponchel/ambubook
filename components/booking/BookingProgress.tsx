"use client";

import { BookingStep, STEP_TITLES } from "./types";

interface BookingProgressProps {
  currentStep: BookingStep;
  onStepClick?: (step: BookingStep) => void;
}

export function BookingProgress({ currentStep, onStepClick }: BookingProgressProps) {
  const steps: BookingStep[] = [1, 2, 3, 4];

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;
        const isClickable = onStepClick && step < currentStep;

        return (
          <div key={step} className="flex items-center flex-1">
            {/* Cercle de l'étape */}
            <button
              type="button"
              onClick={() => isClickable && onStepClick(step)}
              disabled={!isClickable}
              className={`
                relative flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                transition-all duration-200
                ${isCompleted
                  ? "bg-primary-600 text-white cursor-pointer hover:bg-primary-700"
                  : isCurrent
                    ? "bg-primary-600 text-white"
                    : "bg-neutral-200 text-neutral-500"
                }
                ${!isClickable && !isCurrent ? "cursor-default" : ""}
              `}
            >
              {isCompleted ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                step
              )}
            </button>

            {/* Label de l'étape (visible sur desktop) */}
            <span
              className={`
                hidden sm:block ml-2 text-sm font-medium truncate
                ${isCurrent ? "text-primary-600" : isCompleted ? "text-neutral-700" : "text-neutral-400"}
              `}
            >
              {STEP_TITLES[step]}
            </span>

            {/* Ligne de connexion */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-3 sm:mx-4">
                <div
                  className={`
                    h-0.5 rounded-full transition-colors duration-200
                    ${isCompleted ? "bg-primary-600" : "bg-neutral-200"}
                  `}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
