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
                relative flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                transition-colors duration-200
                ${isCompleted
                  ? "bg-brand text-white cursor-pointer hover:bg-brand-ink"
                  : isCurrent
                    ? "bg-brand text-white"
                    : "bg-surface-3 text-ink-3"
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
                hidden sm:block ml-2 text-sm font-semibold truncate
                ${isCurrent ? "text-brand" : isCompleted ? "text-ink-2" : "text-ink-3"}
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
                    ${isCompleted ? "bg-brand" : "bg-line"}
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
