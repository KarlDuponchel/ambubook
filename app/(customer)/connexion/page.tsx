"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";

const inputClass =
  "w-full border border-line rounded-xl px-3.5 py-3 text-[15px] text-ink bg-surface placeholder:text-ink-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors";
const labelClass =
  "block text-xs font-bold uppercase tracking-wide text-ink-3 mb-1.5";

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
        if (result.error.status === 429) {
          setError(
            "Trop de tentatives de connexion. Veuillez patienter une minute avant de réessayer."
          );
        } else if (result.error.status === 403) {
          setError(
            "Votre adresse email n'est pas encore confirmée. Consultez votre boîte mail pour activer votre compte."
          );
        } else {
          setError(result.error.message || "Identifiants incorrects");
        }
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
    <div className="bg-surface border border-line rounded-2xl shadow-soft p-8">
      <div className="mb-7">
        <h1 className="serif text-2xl text-ink">Connexion</h1>
        <p className="text-ink-2 text-sm mt-1">Accédez à votre espace patient</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {registered && (
          <div className="bg-vert/10 border border-vert/25 text-ink-2 p-3.5 rounded-xl text-sm leading-relaxed">
            <strong className="text-vert">Compte créé avec succès !</strong>
            <br />
            Un email de confirmation vous a été envoyé. Cliquez sur le lien qu&apos;il
            contient pour activer votre compte, puis connectez-vous.
            {linkedCount && parseInt(linkedCount) > 0 && (
              <>
                <br />
                <span className="text-ink-2">
                  {parseInt(linkedCount) === 1
                    ? "1 demande de transport précédente a été ajoutée à votre compte."
                    : `${linkedCount} demandes de transport précédentes ont été ajoutées à votre compte.`}
                </span>
              </>
            )}
          </div>
        )}

        {reset === "success" && (
          <div className="bg-vert/10 border border-vert/25 text-ink-2 p-3.5 rounded-xl text-sm leading-relaxed">
            <strong className="text-vert">Mot de passe modifié !</strong>
            <br />
            Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </div>
        )}

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

        <div>
          <label htmlFor="password" className={labelClass}>
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={inputClass}
            placeholder="Votre mot de passe"
          />
          <div className="text-right mt-2">
            <Link
              href="/mot-de-passe-oublie"
              className="text-sm font-semibold text-brand hover:text-brand-ink transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand text-white font-bold py-3 rounded-xl hover:bg-brand-ink disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-ink-2">
        <p>
          Pas encore de compte ?{" "}
          <Link
            href={redirect ? `/inscription?redirect=${encodeURIComponent(redirect)}` : "/inscription"}
            className="font-semibold text-brand hover:text-brand-ink transition-colors"
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
    <Suspense
      fallback={
        <div className="bg-surface border border-line rounded-2xl shadow-soft p-8 animate-pulse">
          <div className="h-8 bg-surface-3 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-surface-3 rounded w-2/3 mb-8"></div>
          <div className="space-y-4">
            <div className="h-11 bg-surface-3 rounded-xl"></div>
            <div className="h-11 bg-surface-3 rounded-xl"></div>
            <div className="h-11 bg-surface-3 rounded-xl"></div>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
