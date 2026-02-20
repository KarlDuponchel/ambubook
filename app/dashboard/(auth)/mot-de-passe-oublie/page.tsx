"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

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
          redirectTo: "/dashboard/reinitialiser-mot-de-passe",
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
      <div className="w-full max-w-md px-4">
        <div className="bg-white rounded-xl shadow-md p-8 border border-neutral-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-success-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              Vérifiez votre boîte mail
            </h1>
            <p className="text-neutral-600 mb-6">
              Si un compte existe avec l&apos;adresse <strong>{email}</strong>,
              vous recevrez un email avec un lien pour réinitialiser votre mot de
              passe.
            </p>
            <p className="text-sm text-neutral-500 mb-6">
              Le lien expire dans 1 heure. Pensez à vérifier vos spams.
            </p>
            <Link
              href="/dashboard/connexion"
              className="text-primary-600 hover:underline font-medium"
            >
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md px-4">
      <div className="bg-white rounded-xl shadow-md p-8 border border-neutral-200">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">
            Mot de passe oublié
          </h1>
          <p className="text-neutral-600 mt-2">
            Entrez votre adresse email pour recevoir un lien de réinitialisation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-danger-50 text-danger-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-input-border rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-neutral-900"
              placeholder="votre@email.fr"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2.5 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? "Envoi en cours..." : "Envoyer le lien"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-neutral-600">
          <Link
            href="/dashboard/connexion"
            className="text-primary-600 hover:underline font-medium"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
