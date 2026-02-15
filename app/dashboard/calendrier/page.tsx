"use client";

import { PageHeader } from "@/components/ui";
import { Calendar } from "./components/Calendar";

export default function CalendrierPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendrier"
        subtitle="Visualisez vos transports programmés"
      />

      <Calendar defaultView="month" />

      {/* Légende */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-500">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-warning-500" />
          <span>En attente</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-success-500" />
          <span>Acceptée</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-danger-500" />
          <span>Refusée</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-accent-500" />
          <span>Contre-proposition</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary-500" />
          <span>Terminée</span>
        </div>
      </div>
    </div>
  );
}
