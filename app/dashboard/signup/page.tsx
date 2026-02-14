"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type SignupMode = "new" | "invite";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get("code");

  const [mode, setMode] = useState<SignupMode>(codeFromUrl ? "invite" : "new");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    companyName: "",
    companySiret: "",
    inviteCode: codeFromUrl || "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validation du code d'invitation
  const [validatingCode, setValidatingCode] = useState(false);
  const [codeValid, setCodeValid] = useState<boolean | null>(null);
  const [invitedCompanyName, setInvitedCompanyName] = useState("");

  // Valider le code quand il change
  useEffect(() => {
    const validateCode = async () => {
      if (mode !== "invite" || !formData.inviteCode || formData.inviteCode.length < 6) {
        setCodeValid(null);
        setInvitedCompanyName("");
        return;
      }

      setValidatingCode(true);
      try {
        const response = await fetch(`/api/invitations/${formData.inviteCode}`);
        const data = await response.json();

        if (data.valid) {
          setCodeValid(true);
          setInvitedCompanyName(data.companyName);
        } else {
          setCodeValid(false);
          setInvitedCompanyName("");
        }
      } catch {
        setCodeValid(false);
      }
      setValidatingCode(false);
    };

    const debounce = setTimeout(validateCode, 500);
    return () => clearTimeout(debounce);
  }, [formData.inviteCode, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Préparer les données selon le mode
    const submitData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      ...(mode === "invite"
        ? { inviteCode: formData.inviteCode }
        : { companyName: formData.companyName, companySiret: formData.companySiret }),
    };

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Une erreur est survenue");
        setLoading(false);
        return;
      }

      // Si compte actif (invitation), rediriger vers login sans message d'attente
      if (data.isActive) {
        router.push("/dashboard/login?joined=true");
      } else {
        router.push("/dashboard/login?registered=true");
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <div className="w-full max-w-md p-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">AmbuBook Pro</h1>
            <p className="text-gray-600 mt-2">Créez votre compte ambulancier</p>
          </div>

          {/* Sélecteur de mode */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode("invite")}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                mode === "invite"
                  ? "bg-white text-gray-900 shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Rejoindre une société
            </button>
            <button
              type="button"
              onClick={() => setMode("new")}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                mode === "new"
                  ? "bg-white text-gray-900 shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Créer une société
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Code d'invitation (mode invite) */}
            {mode === "invite" && (
              <div className="space-y-4 pb-4 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Code d'invitation
                </h2>

                <div>
                  <label
                    htmlFor="inviteCode"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Code reçu de votre collègue *
                  </label>
                  <input
                    id="inviteCode"
                    name="inviteCode"
                    type="text"
                    value={formData.inviteCode}
                    onChange={handleChange}
                    required
                    maxLength={6}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-black font-mono text-lg tracking-widest uppercase ${
                      codeValid === true
                        ? "border-green-500 focus:ring-green-500"
                        : codeValid === false
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                    }`}
                    placeholder="ABC123"
                  />
                  {validatingCode && (
                    <p className="mt-1 text-sm text-gray-500">Vérification...</p>
                  )}
                  {codeValid === true && (
                    <p className="mt-1 text-sm text-green-600">
                      Vous rejoindrez <strong>{invitedCompanyName}</strong>
                    </p>
                  )}
                  {codeValid === false && formData.inviteCode.length >= 6 && (
                    <p className="mt-1 text-sm text-red-600">
                      Code invalide ou expiré
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Informations personnelles */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Informations personnelles
              </h2>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nom complet *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-black focus:ring-blue-500 focus:border-transparent"
                  placeholder="Jean Dupont"
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-black focus:ring-blue-500 focus:border-transparent"
                  placeholder="votre@email.fr"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-black focus:ring-blue-500 focus:border-transparent"
                  placeholder="Minimum 8 caractères"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Téléphone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-black focus:ring-blue-500 focus:border-transparent"
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>

            {/* Société (mode new) */}
            {mode === "new" && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Votre société d'ambulance
                </h2>

                <div>
                  <label
                    htmlFor="companyName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nom de la société *
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-black focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ambulances Dupont"
                  />
                </div>

                <div>
                  <label
                    htmlFor="companySiret"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    SIRET
                  </label>
                  <input
                    id="companySiret"
                    name="companySiret"
                    type="text"
                    value={formData.companySiret}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-black focus:ring-blue-500 focus:border-transparent"
                    placeholder="123 456 789 00012"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (mode === "invite" && codeValid !== true)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Création en cours..." : "Créer mon compte"}
            </button>

            {mode === "new" && (
              <p className="text-xs text-center text-gray-500">
                Votre compte sera activé après vérification par notre équipe
              </p>
            )}
            {mode === "invite" && codeValid && (
              <p className="text-xs text-center text-green-600">
                Votre compte sera immédiatement actif
              </p>
            )}
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Déjà un compte ?{" "}
              <Link href="/dashboard/login" className="text-blue-600 hover:underline">
                Se connecter
              </Link>
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>
              Vous êtes patient ?{" "}
              <Link href="/signup" className="text-blue-600 hover:underline">
                Créez un compte patient
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardSignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
        <div className="w-full max-w-md p-8">
          <div className="bg-white rounded-lg shadow-md p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-8"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <SignUpForm />
    </Suspense>
  );
}
