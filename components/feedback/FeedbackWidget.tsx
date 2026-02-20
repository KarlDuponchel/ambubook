"use client";

import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { FeedbackModal } from "./FeedbackModal";

interface FeedbackWidgetProps {
  /** Position du widget */
  position?: "bottom-right" | "bottom-left";
}

export function FeedbackWidget({ position = "bottom-right" }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    "bottom-right": "right-4 sm:right-6",
    "bottom-left": "left-4 sm:left-6",
  };

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          fixed bottom-4 sm:bottom-6 ${positionClasses[position]} z-40
          flex items-center gap-2 px-4 py-3
          bg-primary-600 text-white
          rounded-full shadow-lg shadow-primary-600/25
          hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-600/30
          hover:scale-105
          active:scale-95
          transition-all duration-200
          group
        `}
        aria-label="Signaler un problème ou une suggestion"
      >
        <MessageSquarePlus className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">Feedback</span>
      </button>

      {/* Modal */}
      <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
