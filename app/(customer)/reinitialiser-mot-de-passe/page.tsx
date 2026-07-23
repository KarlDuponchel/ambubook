"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Check } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const inputClass =
  "w-full border border-line rounded-xl px-3.5 py-3 text-[15px] text-ink bg-surface placeholder:text-ink-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors";
const labelClass =
  "block text-xs font-bold uppercase tracking-wide text-ink-3 mb-1.5";

/** Ligne de critère (affichage dérivé de l'état du formulaire, sans logique métier). */
function Criterion({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-[13px]">
      <span
        className={`grid place-items-center w-4 h-4 rounded-full transition-colors ${
          ok ? "bg-vert text-white" : "bg-surface-3 text-ink-3"
        }`}
      >
        <Check className="w-3 h-3" strokeWidth={3} />
      </span>
      <span className={ok ? "text-ink-2" : "text-ink-3"}>{label}</span>
    </li>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Si pas de token, afficher un message d'erreur
  if (!token) {
    return (
      <div className="bg-surface border border-line rounded-2xl shadow-soft p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-rouge/12 text-rouge flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="serif text-2xl text-ink mb-2">Lien invalide</h1>
          <p className="text-ink-2 text-sm mb-6">
            Ce lien de réinitialisation est invalide ou a expiré.
          </p>
          <Link
            href="/mot-de-passe-oublie"
            className="inline-block bg-brand text-white font-bold py-3 px-5 rounded-xl hover:bg-brand-ink transition-colors"
          >
            Demander un nouveau lien
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.$fetch("/reset-password", {
        method: "POST",
        body: {
          newPassword: password,
          token,
        },
      });

      if (result.error) {
        const errorMsg = result.error.message || "";
        if (errorMsg.includes("INVALID_TOKEN") || errorMsg.includes("expired") || errorMsg.includes("invalid")) {
          setError("Ce lien a expiré ou est invalide. Veuillez demander un nouveau lien.");
        } else {
          setError(errorMsg || "Une erreur est survenue.");
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
      // Redirection après 3 secondes
      setTimeout(() => {
        router.push("/connexion?reset=success");
      }, 3000);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-surface border border-line rounded-2xl shadow-soft p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-vert/12 text-vert flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="serif text-2xl text-ink mb-2">Mot de passe modifié</h1>
          <p className="text-ink-2 text-sm mb-4">
            Votre mot de passe a été réinitialisé avec succès.
          </p>
          <p className="text-sm text-ink-3">Redirection vers la page de connexion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-line rounded-2xl shadow-soft p-8">
      <div className="mb-7">
        <h1 className="serif text-2xl text-ink">Nouveau mot de passe</h1>
        <p className="text-ink-2 text-sm mt-1">
          Choisissez un nouveau mot de passe sécurisé
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-rouge/10 border border-rouge/25 text-rouge p-3.5 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="password" className={labelClass}>
            Nouveau mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className={inputClass}
            placeholder="8 caractères minimum"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className={labelClass}>
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={inputClass}
            placeholder="Confirmez votre mot de passe"
          />
        </div>

        <ul className="space-y-1.5">
          <Criterion ok={password.length >= 8} label="Au moins 8 caractères" />
          <Criterion
            ok={password.length > 0 && password === confirmPassword}
            label="Les deux mots de passe correspondent"
          />
        </ul>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand text-white font-bold py-3 rounded-xl hover:bg-brand-ink disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Modification..." : "Réinitialiser le mot de passe"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-ink-2">
        <Link href="/connexion" className="font-semibold text-brand hover:text-brand-ink transition-colors">
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-surface border border-line rounded-2xl shadow-soft p-8 animate-pulse">
          <div className="h-8 bg-surface-3 rounded w-2/3 mb-4"></div>
          <div className="h-4 bg-surface-3 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-11 bg-surface-3 rounded-xl"></div>
            <div className="h-11 bg-surface-3 rounded-xl"></div>
            <div className="h-11 bg-surface-3 rounded-xl"></div>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
