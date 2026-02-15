import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullPage?: boolean;
}

const sizeStyles = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-10 w-10",
};

const textSizeStyles = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function LoadingSpinner({ size = "md", text, fullPage = false }: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`animate-spin text-primary-600 ${sizeStyles[size]}`} />
      {text && (
        <p className={`text-neutral-500 ${textSizeStyles[size]}`}>{text}</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
