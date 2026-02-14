"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, checked, onChange, className = "", id, disabled, ...props }, ref) => {
    const checkboxId = id || props.name || `checkbox-${label.toLowerCase().replace(/\s/g, "-")}`;

    return (
      <label
        htmlFor={checkboxId}
        className={`
          flex items-start gap-3 cursor-pointer group
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${className}
        `}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <div
            className={`
              w-5 h-5 rounded border-2 transition-all duration-200
              flex items-center justify-center
              ${checked
                ? "bg-primary-600 border-primary-600"
                : "bg-white border-neutral-300 group-hover:border-neutral-400"
              }
              ${disabled ? "" : "peer-focus:ring-2 peer-focus:ring-primary-500/30"}
            `}
          >
            {checked && (
              <svg
                className="w-3 h-3 text-white"
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
            )}
          </div>
        </div>
        <div className="flex-1">
          <span className="text-sm font-medium text-neutral-700">{label}</span>
          {description && (
            <p className="text-sm text-neutral-500 mt-0.5">{description}</p>
          )}
        </div>
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
