import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

interface CardHeaderProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  action?: ReactNode;
  className?: string;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-xl border border-card-border bg-card-bg ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ icon: Icon, title, action, className = "" }: CardHeaderProps) {
  return (
    <div className={`flex items-center justify-between border-b border-card-border px-6 py-4 ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-5 w-5 text-primary-600" />}
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardContent({ children, className = "", noPadding = false }: CardContentProps) {
  return (
    <div className={`${noPadding ? "" : "p-6"} ${className}`}>
      {children}
    </div>
  );
}
