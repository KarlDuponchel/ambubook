import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const textareaId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-neutral-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full rounded-lg border bg-white
            px-4 py-3
            text-neutral-900 placeholder:text-neutral-400
            transition-all duration-200
            focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500
            disabled:bg-neutral-100 disabled:cursor-not-allowed
            resize-none
            ${error
              ? "border-danger-500 focus:ring-danger-500 focus:border-danger-500"
              : "border-neutral-300 hover:border-neutral-400"
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-danger-600">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
