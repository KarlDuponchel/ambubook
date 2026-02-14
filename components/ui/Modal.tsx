"use client";

import { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (overlayRef.current === e.target) onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";

      // Focus trap
      modalRef.current?.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape, handleClickOutside]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`
          w-full ${sizeStyles[size]}
          bg-white rounded-2xl shadow-2xl
          animate-in zoom-in-95 slide-in-from-bottom-4 duration-300
          focus:outline-none
        `}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
            <h2
              id="modal-title"
              className="text-lg font-semibold text-neutral-900"
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 -mr-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <span className="sr-only">Fermer</span>
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className={title ? "" : "pt-6"}>{children}</div>
      </div>
    </div>
  );

  // Render in portal to escape any overflow:hidden ancestors
  if (typeof window !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return null;
}
