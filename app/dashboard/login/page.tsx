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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">AmbuBook Pro</h1>
            <p className="text-gray-600 mt-2">Connectez-vous à votre espace ambulancier</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {registered && (
              <div className="bg-amber-50 text-amber-700 p-3 rounded-md text-sm">
                <strong>Compte créé avec succès !</strong>
                <br />
                Votre demande est en cours de vérification. Vous recevrez un email dès que votre compte sera activé.
              </div>
            )}

            {joined && (
              <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">
                <strong>Bienvenue dans l'équipe !</strong>
                <br />
                Votre compte est actif, vous pouvez vous connecter.
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-black focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-black focus:ring-blue-500 focus:border-transparent"
                placeholder="Votre mot de passe"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Pas encore de compte ?{" "}
              <Link href="/dashboard/signup" className="text-blue-600 hover:underline">
                Créer un compte
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Comptes de test :</p>
            <p className="mt-1">
              <code className="bg-gray-100 px-1 rounded">admin@ambubook.fr</code> / admin123
            </p>
            <p>
              <code className="bg-gray-100 px-1 rounded">ambulancier@ambulances-dupont.fr</code> / ambulancier123
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>
              Vous êtes patient ?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Accédez à votre espace patient
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8">
          <div className="bg-white rounded-lg shadow-md p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-8"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
