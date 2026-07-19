import Link from "next/link";

/**
 * Barre de liens légaux (RGPD / mentions).
 * Utilisée dans les espaces dashboard/admin qui n'ont pas de footer complet.
 */
export function LegalLinks({ className = "" }: { className?: string }) {
  return (
    <nav
      className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-neutral-400 ${className}`}
      aria-label="Liens légaux"
    >
      <Link href="/mentions-legales" className="hover:text-neutral-600 transition-colors">
        Mentions légales
      </Link>
      <span aria-hidden="true">·</span>
      <Link href="/politique-confidentialite" className="hover:text-neutral-600 transition-colors">
        Confidentialité
      </Link>
      <span aria-hidden="true">·</span>
      <Link href="/cgu" className="hover:text-neutral-600 transition-colors">
        CGU
      </Link>
    </nav>
  );
}
