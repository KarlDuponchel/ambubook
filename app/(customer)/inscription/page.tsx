"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    emailNotifications: true,
    smsNotifications: true,
    newsletter: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/customer-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          emailEnabled: formData.emailNotifications,
          smsEnabled: formData.smsNotifications,
          marketing: formData.newsletter,
        }),
      });

      const data = await response.json() as {
        success?: boolean;
        error?: string;
        linkedTransportsCount?: number;
      };

      if (!response.ok) {
        setError(data.error || "Une erreur est survenue");
        setLoading(false);
        return;
      }

      // Redirection vers login avec message de succès
      const params = new URLSearchParams({ registered: "true" });
      if (redirect) params.set("redirect", redirect);
      if (data.linkedTransportsCount && data.linkedTransportsCount > 0) {
        params.set("linked", data.linkedTransportsCount.toString());
      }
      router.push(`/connexion?${params.toString()}`);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  };
  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
        <p className="text-gray-600 mt-2">
          Réservez vos transports médicaux en quelques clics
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Prénom *
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-black focus:ring-primary-500 focus:border-transparent"
              placeholder="Jean"
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nom *
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-black focus:ring-primary-500 focus:border-transparent"
              placeholder="Dupont"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-black focus:ring-primary-500 focus:border-transparent"
            placeholder="votre@email.fr"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Téléphone *
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-black focus:ring-primary-500 focus:border-transparent"
            placeholder="06 12 34 56 78"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Mot de passe *
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-black focus:ring-primary-500 focus:border-transparent"
            placeholder="Minimum 8 caractères"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Confirmer le mot de passe *
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-black focus:ring-primary-500 focus:border-transparent"
            placeholder="Répétez le mot de passe"
          />
        </div>
        {/* Section Notifications */}
        <div className="border-t border-gray-200 pt-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Préférences de notification</h3>
            <p className="text-xs text-gray-500 mt-1">
              Restez informé de l&apos;avancement de vos transports : confirmations, rappels la veille, et mises à jour importantes.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Notifications par email</p>
                <p className="text-xs text-gray-500">Confirmations et rappels par email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.emailNotifications}
                  disabled={loading}
                  onChange={(e) => setFormData((prev) => ({ ...prev, emailNotifications: e.target.checked }))}
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 peer-disabled:opacity-50" />
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Notifications par SMS</p>
                <p className="text-xs text-gray-500">Rappels et alertes urgentes par SMS</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.smsNotifications}
                  disabled={loading}
                  onChange={(e) => setFormData((prev) => ({ ...prev, smsNotifications: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 peer-disabled:opacity-50" />
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Newsletter AmbuBook</p>
                <p className="text-xs text-gray-500">Actualités et conseils santé (facultatif)</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.newsletter}
                  disabled={loading}
                  onChange={(e) => setFormData((prev) => ({ ...prev, newsletter: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 peer-disabled:opacity-50" />
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Création en cours..." : "Créer mon compte"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        <p>
          Déjà un compte ?{" "}
          <Link
            href={redirect ? `/connexion?redirect=${encodeURIComponent(redirect)}` : "/connexion"}
            className="text-primary-600 hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function CustomerSignUpPage() {
  return (
    <Suspense fallback={
      <div className="bg-white rounded-lg shadow-md p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-8"></div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <SignUpForm />
    </Suspense>
  );
}
