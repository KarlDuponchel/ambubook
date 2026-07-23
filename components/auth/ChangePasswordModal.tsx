"use client";

import { useState } from "react";
import { X, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ChangePasswordModal({ isOpen, onClose, onSuccess }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validations
    if (newPassword.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("Le nouveau mot de passe doit être différent de l'ancien.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await authClient.$fetch("/change-password", {
        method: "POST",
        body: {
          currentPassword,
          newPassword,
          revokeOtherSessions: false,
        },
      });

      if (result.error) {
        const errorMsg = result.error.message || "";
        if (errorMsg.includes("INVALID_PASSWORD") || errorMsg.includes("incorrect")) {
          setError("Le mot de passe actuel est incorrect.");
        } else {
          setError(errorMsg || "Une erreur est survenue.");
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 2000);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const fieldClass =
    "w-full px-4 py-2.5 pr-12 border border-line rounded-xl text-[15px] text-ink bg-surface placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors";
  const eyeBtnClass =
    "absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-3 hover:text-ink transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-surface border border-line rounded-2xl shadow-soft">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center w-10 h-10 bg-brand/12 text-brand rounded-xl">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="serif text-lg text-ink">
              Changer le mot de passe
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="grid place-items-center w-9 h-9 text-ink-3 hover:bg-surface-2 hover:text-ink rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Message de succès */}
          {success && (
            <div className="flex items-center gap-3 p-4 bg-vert/10 border border-vert/25 text-vert rounded-xl">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm font-semibold">
                Mot de passe modifié avec succès !
              </p>
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-rouge/10 border border-rouge/25 text-rouge rounded-xl">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!success && (
            <>
              {/* Mot de passe actuel */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-ink-3 mb-1.5">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className={fieldClass}
                    placeholder="Entrez votre mot de passe actuel"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className={eyeBtnClass}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Nouveau mot de passe */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-ink-3 mb-1.5">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className={fieldClass}
                    placeholder="8 caractères minimum"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className={eyeBtnClass}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmer le mot de passe */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-ink-3 mb-1.5">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={fieldClass}
                    placeholder="Confirmez votre nouveau mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={eyeBtnClass}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </form>

        {/* Footer */}
        {!success && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-line">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2.5 font-bold text-ink bg-surface-2 border border-line rounded-xl hover:border-brand transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white font-bold rounded-xl hover:bg-brand-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Modification...
                </>
              ) : (
                "Modifier le mot de passe"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
