"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const inputClass =
  "w-full border border-line rounded-xl px-3.5 py-3 text-[15px] text-ink bg-surface placeholder:text-ink-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors";
const labelClass =
  "block text-xs font-bold uppercase tracking-wide text-ink-3 mb-1.5";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Appeler directement l'endpoint de Better Auth
      const response = await authClient.$fetch("/request-password-reset", {
        method: "POST",
        body: {
          email,
          redirectTo: "/reinitialiser-mot-de-passe",
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Une erreur est survenue");
      }

      // Toujours afficher le message de succès (même si l'email n'existe pas)
      // pour éviter l'énumération d'utilisateurs
      setSubmitted(true);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-surface border border-line rounded-2xl shadow-soft p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-vert/12 text-vert flex items-center justify-center mx-auto mb-5">
            <Mail className="w-8 h-8" />
          </div>
          <h1 className="serif text-2xl text-ink mb-2">Vérifiez votre boîte mail</h1>
          <p className="text-ink-2 text-sm leading-relaxed mb-4">
            Si un compte existe avec l&apos;adresse <strong className="text-ink">{email}</strong>,
            vous recevrez un email avec un lien pour réinitialiser votre mot de passe.
          </p>
          <p className="text-sm text-ink-3 mb-6">
            Le lien expire dans 1 heure. Pensez à vérifier vos spams.
          </p>
          <Link
            href="/connexion"
            className="text-brand hover:text-brand-ink font-semibold transition-colors"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-line rounded-2xl shadow-soft p-8">
      <div className="mb-7">
        <h1 className="serif text-2xl text-ink">Mot de passe oublié</h1>
        <p className="text-ink-2 text-sm mt-1">
          Entrez votre adresse email pour recevoir un lien de réinitialisation
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-rouge/10 border border-rouge/25 text-rouge p-3.5 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
            placeholder="votre@email.fr"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand text-white font-bold py-3 rounded-xl hover:bg-brand-ink disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Envoi en cours..." : "Envoyer le lien"}
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
