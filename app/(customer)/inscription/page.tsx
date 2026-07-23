"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { isValidFrenchPhone } from "@/lib/validators";

const inputClass =
  "w-full border border-line rounded-xl px-3.5 py-3 text-[15px] text-ink bg-surface placeholder:text-ink-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors";
const labelClass =
  "block text-xs font-bold uppercase tracking-wide text-ink-3 mb-1.5";

/** Interrupteur éditorial (piste + pastille), pilotée par un checkbox masqué. */
function ToggleRow({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-bold text-ink">{title}</p>
        <p className="text-[13px] text-ink-2">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer shrink-0">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-12 h-7 bg-surface-3 peer-focus:ring-4 peer-focus:ring-brand/20 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-6 after:w-6 after:shadow-sm after:transition-all peer-checked:bg-brand peer-disabled:opacity-50 transition-colors" />
      </label>
    </div>
  );
}

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
  const [phoneError, setPhoneError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "phone") setPhoneError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPhoneError("");

    // Validation
    if (!isValidFrenchPhone(formData.phone)) {
      setPhoneError("Format de téléphone invalide (ex : 06 12 34 56 78)");
      return;
    }

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
    <div className="bg-surface border border-line rounded-2xl shadow-soft p-8">
      <div className="mb-6">
        <h1 className="serif text-2xl text-ink">Créer un compte</h1>
        <p className="text-ink-2 text-sm mt-1">
          Réservez vos transports médicaux en quelques clics
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-rouge/10 border border-rouge/25 text-rouge p-3.5 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className={labelClass}>
              Prénom *
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="Jean"
            />
          </div>

          <div>
            <label htmlFor="lastName" className={labelClass}>
              Nom *
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="Dupont"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="votre@email.fr"
          />
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            Téléphone *
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
            className={`${inputClass} ${
              phoneError ? "border-rouge focus:border-rouge focus:ring-rouge/20" : ""
            }`}
            placeholder="06 12 34 56 78"
          />
          {phoneError && <p className="mt-1.5 text-sm text-rouge">{phoneError}</p>}
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>
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
            className={inputClass}
            placeholder="Minimum 8 caractères"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className={labelClass}>
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
            className={inputClass}
            placeholder="Répétez le mot de passe"
          />
        </div>
        {/* Section Notifications */}
        <div className="border-t border-line pt-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-ink">Préférences de notification</h3>
            <p className="text-xs text-ink-3 mt-1">
              Restez informé de l&apos;avancement de vos transports : confirmations, rappels la veille, et mises à jour importantes.
            </p>
          </div>

          <div className="space-y-4">
            <ToggleRow
              title="Notifications par email"
              description="Confirmations et rappels par email"
              checked={formData.emailNotifications}
              disabled={loading}
              onChange={(v) => setFormData((prev) => ({ ...prev, emailNotifications: v }))}
            />
            <ToggleRow
              title="Notifications par SMS"
              description="Rappels et alertes urgentes par SMS"
              checked={formData.smsNotifications}
              disabled={loading}
              onChange={(v) => setFormData((prev) => ({ ...prev, smsNotifications: v }))}
            />
            <ToggleRow
              title="Newsletter AmbuBook"
              description="Actualités et conseils santé (facultatif)"
              checked={formData.newsletter}
              disabled={loading}
              onChange={(v) => setFormData((prev) => ({ ...prev, newsletter: v }))}
            />
          </div>
        </div>

        <p className="text-xs text-ink-3 text-center leading-relaxed">
          En créant un compte, vous acceptez nos{" "}
          <Link href="/cgu" className="text-brand hover:text-brand-ink font-semibold">
            CGU
          </Link>{" "}
          et notre{" "}
          <Link
            href="/politique-confidentialite"
            className="text-brand hover:text-brand-ink font-semibold"
          >
            politique de confidentialité
          </Link>
          . Vos données personnelles sont traitées conformément au RGPD.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand text-white font-bold py-3 rounded-xl hover:bg-brand-ink disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Création en cours..." : "Créer mon compte"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-ink-2">
        <p>
          Déjà un compte ?{" "}
          <Link
            href={redirect ? `/connexion?redirect=${encodeURIComponent(redirect)}` : "/connexion"}
            className="font-semibold text-brand hover:text-brand-ink transition-colors"
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
    <Suspense
      fallback={
        <div className="bg-surface border border-line rounded-2xl shadow-soft p-8 animate-pulse">
          <div className="h-8 bg-surface-3 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-surface-3 rounded w-2/3 mb-8"></div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-11 bg-surface-3 rounded-xl"></div>
              <div className="h-11 bg-surface-3 rounded-xl"></div>
            </div>
            <div className="h-11 bg-surface-3 rounded-xl"></div>
            <div className="h-11 bg-surface-3 rounded-xl"></div>
            <div className="h-11 bg-surface-3 rounded-xl"></div>
            <div className="h-11 bg-surface-3 rounded-xl"></div>
          </div>
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
