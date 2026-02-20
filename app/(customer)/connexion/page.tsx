"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const redirect = searchParams.get("redirect");
  const reset = searchParams.get("reset");
  const linkedCount = searchParams.get("linked");

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

      // Redirection vers la page demandée ou l'accueil
      if (redirect) {
        router.push(redirect);
      } else {
        router.push("/");
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>
        <p className="text-gray-600 mt-2">Accédez à votre espace patient</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {registered && (
          <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">
            <strong>Compte créé avec succès !</strong>
            <br />
            Vous pouvez maintenant vous connecter.
            {linkedCount && parseInt(linkedCount) > 0 && (
              <>
                <br />
                <span className="text-green-600">
                  {parseInt(linkedCount) === 1
                    ? "1 demande de transport précédente a été ajoutée à votre compte."
                    : `${linkedCount} demandes de transport précédentes ont été ajoutées à votre compte.`}
                </span>
              </>
            )}
          </div>
        )}

        {reset === "success" && (
          <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">
            <strong>Mot de passe modifié !</strong>
            <br />
            Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-black focus:ring-primary-500 focus:border-transparent"
            placeholder="votre@email.fr"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-black focus:ring-primary-500 focus:border-transparent"
            placeholder="Votre mot de passe"
          />
          <div className="text-right mt-1">
            <Link
              href="/mot-de-passe-oublie"
              className="text-sm text-primary-600 hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        <p>
          Pas encore de compte ?{" "}
          <Link
            href={redirect ? `/inscription?redirect=${encodeURIComponent(redirect)}` : "/inscription"}
            className="text-primary-600 hover:underline"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={
      <div className="bg-white rounded-lg shadow-md p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-8"></div>
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
