import Link from "next/link";

export default function DashboardAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Header simple */}
      <header className="py-4 px-6 border-b border-neutral-200 bg-white">
        <Link href="/" className="text-xl font-bold text-primary-600">
          AmbuBook Pro
        </Link>
      </header>

      {/* Contenu centré */}
      <main className="flex-1 flex items-center justify-center py-8">
        {children}
      </main>

      {/* Footer simple */}
      <footer className="py-4 text-center text-sm text-neutral-500">
        <p>
          Vous êtes patient ?{" "}
          <Link href="/login" className="text-primary-600 hover:underline">
            Accédez à votre espace patient
          </Link>
        </p>
      </footer>
    </div>
  );
}
