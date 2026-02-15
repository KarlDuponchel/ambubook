import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string | ReactNode;
  actions?: ReactNode;
  backLink?: string;
}

export function PageHeader({ badge, title, subtitle, actions, backLink }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {backLink && (
        <Link
          href={backLink}
          className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
      )}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          {badge && (
            <div className="mb-2 inline-flex items-center rounded-lg bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
              {badge}
            </div>
          )}
          <h1 className="text-3xl font-bold text-neutral-900">{title}</h1>
          {subtitle && (
            <div className="mt-2 text-neutral-500">
              {typeof subtitle === "string" ? <p>{subtitle}</p> : subtitle}
            </div>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
