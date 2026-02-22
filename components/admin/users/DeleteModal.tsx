"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { AdminUser } from "@/lib/types";

interface DeleteModalProps {
  user: AdminUser;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteModal({ user, onClose, onConfirm }: DeleteModalProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
          <h2 className="font-semibold text-neutral-900">
            Confirmer la suppression
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-neutral-600 mb-1 text-sm">
            Êtes-vous sûr de vouloir supprimer
          </p>
          <p className="text-neutral-900 font-semibold mb-1">{user.name}</p>
          <p className="text-neutral-500 text-sm">
            Cette action est irréversible.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-neutral-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-md hover:bg-neutral-200 transition-colors font-medium text-sm"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors font-medium text-sm"
          >
            {loading ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
}
