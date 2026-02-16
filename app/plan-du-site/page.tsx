import { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@/components/landing";
import { Container } from "@/components/ui";
import { Home, Search, Users, FileText, Shield, Map } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Plan du site | Ambubook",
  description:
    "Plan du site Ambubook : accédez facilement à toutes les pages de notre plateforme de réservation de transport médical.",
  robots: {
    index: true,
    follow: true,
  },
};

// Récupérer les entreprises actives pour le sitemap
async function getActiveCompanies() {
  const companies = await prisma.company.findMany({
    where: { isActive: true },
    select: {
      name: true,
      slug: true,
      city: true,
    },
    orderBy: { name: "asc" },
    take: 50, // Limiter pour la page visible
  });
  return companies;
}

const mainPages = [
  {
    title: "Accueil",
    href: "/",
    description: "Page d'accueil - Recherchez et réservez votre transport médical",
    icon: Home,
  },
  {
    title: "Recherche d'ambulanciers",
    href: "/recherche",
    description: "Trouvez un ambulancier près de chez vous",
    icon: Search,
  },
];

const patientPages = [
  {
    title: "Créer un compte patient",
    href: "/inscription",
    description: "Inscrivez-vous pour suivre vos demandes de transport",
  },
  {
    title: "Connexion patient",
    href: "/connexion",
    description: "Accédez à votre espace patient",
  },
];

const proPages = [
  {
    title: "Inscription ambulancier",
    href: "/dashboard/inscription",
    description: "Créez votre compte professionnel",
  },
  {
    title: "Connexion ambulancier",
    href: "/dashboard/connexion",
    description: "Accédez à votre tableau de bord",
  },
];

const legalPages = [
  {
    title: "Mentions légales",
    href: "/mentions-legales",
    description: "Informations légales sur Ambubook",
  },
  {
    title: "Conditions Générales d'Utilisation",
    href: "/cgu",
    description: "CGU de la plateforme",
  },
  {
    title: "Politique de confidentialité",
    href: "/confidentialite",
    description: "Protection de vos données personnelles",
  },
];

export default async function PlanDuSitePage() {
  const companies = await getActiveCompanies();

  return (
    <>
      <Header />

      <main className="min-h-screen bg-neutral-50 pt-24 lg:pt-28 pb-12 lg:pb-20">
        <Container>
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
              <Map className="h-4 w-4" />
              Navigation
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              Plan du site
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Retrouvez facilement toutes les pages de la plateforme Ambubook
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Pages principales */}
            <section className="bg-white rounded-2xl border border-neutral-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Home className="h-5 w-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">
                  Pages principales
                </h2>
              </div>
              <ul className="space-y-4">
                {mainPages.map((page) => (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      className="block p-3 rounded-lg hover:bg-primary-50 transition-colors group"
                    >
                      <span className="font-medium text-neutral-900 group-hover:text-primary-600">
                        {page.title}
                      </span>
                      <p className="text-sm text-neutral-500 mt-1">
                        {page.description}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {/* Espace Patient */}
            <section className="bg-white rounded-2xl border border-neutral-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-success-100 rounded-lg">
                  <Users className="h-5 w-5 text-success-600" />
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">
                  Espace Patient
                </h2>
              </div>
              <ul className="space-y-4">
                {patientPages.map((page) => (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      className="block p-3 rounded-lg hover:bg-success-50 transition-colors group"
                    >
                      <span className="font-medium text-neutral-900 group-hover:text-success-600">
                        {page.title}
                      </span>
                      <p className="text-sm text-neutral-500 mt-1">
                        {page.description}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {/* Espace Professionnel */}
            <section className="bg-white rounded-2xl border border-neutral-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-info-100 rounded-lg">
                  <FileText className="h-5 w-5 text-info-600" />
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">
                  Espace Professionnel
                </h2>
              </div>
              <ul className="space-y-4">
                {proPages.map((page) => (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      className="block p-3 rounded-lg hover:bg-info-50 transition-colors group"
                    >
                      <span className="font-medium text-neutral-900 group-hover:text-info-600">
                        {page.title}
                      </span>
                      <p className="text-sm text-neutral-500 mt-1">
                        {page.description}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {/* Pages légales */}
            <section className="bg-white rounded-2xl border border-neutral-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-warning-100 rounded-lg">
                  <Shield className="h-5 w-5 text-warning-600" />
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">
                  Informations légales
                </h2>
              </div>
              <ul className="space-y-4">
                {legalPages.map((page) => (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      className="block p-3 rounded-lg hover:bg-warning-50 transition-colors group"
                    >
                      <span className="font-medium text-neutral-900 group-hover:text-warning-600">
                        {page.title}
                      </span>
                      <p className="text-sm text-neutral-500 mt-1">
                        {page.description}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Entreprises */}
          {companies.length > 0 && (
            <section className="mt-12 max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-secondary-100 rounded-lg">
                    <Search className="h-5 w-5 text-secondary-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-neutral-900">
                    Sociétés d&apos;ambulances ({companies.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {companies.map((company) => (
                    <Link
                      key={company.slug}
                      href={`/${company.slug}`}
                      className="p-3 rounded-lg hover:bg-secondary-50 transition-colors group"
                    >
                      <span className="font-medium text-neutral-900 group-hover:text-secondary-600">
                        {company.name}
                      </span>
                      {company.city && (
                        <p className="text-sm text-neutral-500">{company.city}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}
        </Container>
      </main>

      <Footer />
    </>
  );
}
