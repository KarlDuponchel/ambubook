type StatusVariant =
  | "pending"
  | "accepted"
  | "refused"
  | "counter_proposal"
  | "cancelled"
  | "completed"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

interface StatusBadgeProps {
  variant: StatusVariant;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  size?: "sm" | "md";
}

const variantStyles: Record<StatusVariant, string> = {
  pending: "bg-warning-50 text-warning-700 border-warning-200",
  accepted: "bg-success-50 text-success-700 border-success-200",
  refused: "bg-danger-50 text-danger-700 border-danger-200",
  counter_proposal: "bg-accent-50 text-accent-700 border-accent-200",
  cancelled: "bg-neutral-100 text-neutral-600 border-neutral-200",
  completed: "bg-primary-50 text-primary-700 border-primary-200",
  success: "bg-success-50 text-success-700 border-success-200",
  warning: "bg-warning-50 text-warning-700 border-warning-200",
  danger: "bg-danger-50 text-danger-700 border-danger-200",
  info: "bg-accent-50 text-accent-700 border-accent-200",
  neutral: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-xs gap-1",
  md: "px-3 py-1 text-sm gap-1.5",
};

export function StatusBadge({ variant, label, icon: Icon, size = "md" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {Icon && <Icon className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />}
      {label}
    </span>
  );
}
