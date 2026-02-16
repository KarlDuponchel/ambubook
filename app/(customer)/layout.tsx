import Link from "next/link";

export default function CustomerAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header simple */}
      <header className="py-4 px-6 border-b border-gray-200 bg-white">
        <Link href="/" className="text-xl font-bold text-primary-600">
          AmbuBook
        </Link>
      </header>

      {/* Contenu centré */}
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md p-8">
          {children}
        </div>
      </main>

      {/* Footer simple */}
      <footer className="py-4 text-center text-sm text-gray-500">
        <p>
          Vous êtes ambulancier ?{" "}
          <Link href="/dashboard/connexion" className="text-primary-600 hover:underline">
            Accédez à votre espace pro
          </Link>
        </p>
      </footer>
    </div>
  );
}
