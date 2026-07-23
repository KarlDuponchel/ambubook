import Link from "next/link";
import { Plus } from "lucide-react";

export default function CustomerAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-page">
      {/* Header simple — wordmark éditorial */}
      <header className="py-4 px-5 sm:px-8 border-b border-line bg-surface/85 backdrop-blur-md">
        <Link
          href="/"
          aria-label="Accueil AmbuBook"
          className="inline-flex items-center gap-2.5"
        >
          <span
            className="grid place-items-center w-9 h-9 rounded-[11px] text-white"
            style={{ background: "linear-gradient(150deg, var(--brand), var(--teal))" }}
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-ink">
            Ambu<span className="serif italic font-semibold text-teal">Book</span>
          </span>
        </Link>
      </header>

      {/* Contenu centré */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer simple */}
      <footer className="py-5 text-center text-sm text-ink-3">
        <p>
          Vous êtes ambulancier ?{" "}
          <Link
            href="/dashboard/connexion"
            className="font-semibold text-brand hover:text-brand-ink transition-colors"
          >
            Accédez à votre espace pro
          </Link>
        </p>
      </footer>
    </div>
  );
}
