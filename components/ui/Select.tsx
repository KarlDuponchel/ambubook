import { SelectHTMLAttributes, forwardRef } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  error?: string;
  options: Option[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = "", id, ...props }, ref) => {
    const selectId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-neutral-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full rounded-lg border bg-white
              px-4 py-3 pr-10
              text-neutral-900
              transition-all duration-200
              focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500
              disabled:bg-neutral-100 disabled:cursor-not-allowed
              appearance-none cursor-pointer
              ${error
                ? "border-danger-500 focus:ring-danger-500 focus:border-danger-500"
                : "border-neutral-300 hover:border-neutral-400"
              }
              ${!props.value && placeholder ? "text-neutral-400" : ""}
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-danger-600">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
