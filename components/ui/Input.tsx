import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full rounded-lg border bg-white
              px-4 py-3
              text-neutral-900 placeholder:text-neutral-400
              transition-all duration-200
              focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500
              disabled:bg-neutral-100 disabled:cursor-not-allowed
              ${icon ? "pl-11" : ""}
              ${error
                ? "border-danger-500 focus:ring-danger-500 focus:border-danger-500"
                : "border-neutral-300 hover:border-neutral-400"
              }
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-danger-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
