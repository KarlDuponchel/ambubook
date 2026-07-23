"use client";

import { ReactNode } from "react";

/**
 * Kit de champs éditoriaux local au module de réservation.
 * Évite de toucher aux composants ui partagés (Input/Checkbox/Textarea) tout
 * en gardant une cohérence visuelle avec la DA éditoriale (tokens theme-aware).
 */

const labelClass =
  "block text-xs font-bold uppercase tracking-wide text-ink-3 mb-1.5";
const baseInput =
  "w-full border rounded-xl text-[15px] text-ink bg-surface placeholder:text-ink-3 outline-none transition-colors focus:ring-2 focus:ring-brand/20";

interface FieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export function Field({ label, error, icon, id, name, ...props }: FieldProps) {
  const inputId = id || name;
  return (
    <div>
      {label && (
        <label htmlFor={inputId} className={labelClass}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-3">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          name={name}
          className={`${baseInput} py-3 ${icon ? "pl-11 pr-3.5" : "px-3.5"} ${
            error ? "border-rouge focus:border-rouge focus:ring-rouge/20" : "border-line focus:border-brand"
          }`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-rouge">{error}</p>}
    </div>
  );
}

interface FieldAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  label?: string;
  error?: string;
}

export function FieldArea({ label, error, id, name, ...props }: FieldAreaProps) {
  const inputId = id || name;
  return (
    <div>
      {label && (
        <label htmlFor={inputId} className={labelClass}>
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        name={name}
        className={`${baseInput} px-3.5 py-3 resize-y ${
          error ? "border-rouge focus:border-rouge focus:ring-rouge/20" : "border-line focus:border-brand"
        }`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-rouge">{error}</p>}
    </div>
  );
}

interface CheckRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

/** Case à cocher éditoriale (carrée, coche brand). */
export function CheckRow({ label, description, checked, onChange, disabled }: CheckRowProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <span className="relative flex items-center shrink-0 mt-0.5">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="grid place-items-center w-5 h-5 rounded-md border border-line bg-surface peer-checked:bg-brand peer-checked:border-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand/30 peer-checked:[&>svg]:opacity-100 transition-colors">
          <svg
            className="w-3 h-3 text-white opacity-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      </span>
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {description && (
          <span className="block text-[13px] text-ink-2">{description}</span>
        )}
      </span>
    </label>
  );
}
