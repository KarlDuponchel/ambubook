"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, signOut } from "@/lib/auth-client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const joined = searchParams.get("joined");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Identifiants incorrects");
        setLoading(false);
        return;
      }

      // Vérifier si le compte est actif
      const statusResponse = await fetch("/api/auth/check-status");
      const statusData = await statusResponse.json();

      if (!statusData.isActive) {
        // Déconnecter l'utilisateur si le compte n'est pas actif
        await signOut();
        setError("Votre compte est en attente de validation par notre équipe. Vous recevrez un email dès qu'il sera activé.");
        setLoading(false);
        return;
      }

      // Redirection selon le rôle
      if (statusData.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-4">
      <div className="bg-white rounded-xl shadow-md p-8 border border-neutral-200">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">Connexion Pro</h1>
          <p className="text-neutral-600 mt-2">Connectez-vous à votre espace ambulancier</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {registered && (
            <div className="bg-warning-50 text-warning-700 p-3 rounded-lg text-sm">
              <strong>Compte créé avec succès !</strong>
              <br />
              Votre demande est en cours de vérification. Vous recevrez un email dès que votre compte sera activé.
            </div>
          )}

          {joined && (
            <div className="bg-success-50 text-success-700 p-3 rounded-lg text-sm">
              <strong>Bienvenue dans l&apos;équipe !</strong>
              <br />
              Votre compte est actif, vous pouvez vous connecter.
            </div>
          )}

          {error && (
            <div className="bg-danger-50 text-danger-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
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

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-input-border rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-neutral-900"
              placeholder="Votre mot de passe"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2.5 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-neutral-600">
          <p>
            Pas encore de compte ?{" "}
            <Link href="/dashboard/inscription" className="text-primary-600 hover:underline font-medium">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md px-4">
          <div className="bg-white rounded-xl shadow-md p-8 border border-neutral-200 animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-4 bg-neutral-200 rounded w-2/3 mx-auto mb-8"></div>
            <div className="space-y-4">
              <div className="h-10 bg-neutral-200 rounded"></div>
              <div className="h-10 bg-neutral-200 rounded"></div>
              <div className="h-10 bg-neutral-200 rounded"></div>
            </div>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
