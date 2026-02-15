import { ReactNode } from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-neutral-100 p-4">
        <Icon className="h-8 w-8 text-neutral-400" />
      </div>
      {title && <h3 className="mb-2 text-lg font-semibold text-neutral-900">{title}</h3>}
      <p className="max-w-sm text-neutral-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
