import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { MapPin, ArrowRight, Ambulance, Car, Search, Building2 } from "lucide-react";
import { Container } from "@/components/ui";
import { Header, Footer } from "@/components/landing";
import { prisma } from "@/lib/prisma";
import { getRegionBySlug, getAllRegionSlugs, getCitiesByRegion, regions } from "@/lib/seo-data";

interface PageProps {
  params: Promise<{ region: string }>;
}

// Génération statique pour les régions connues
export async function generateStaticParams() {
  return getAllRegionSlugs().map((region) => ({ region }));
}

// Metadata SEO dynamique
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { region: regionSlug } = await params;
  const region = getRegionBySlug(regionSlug);

  if (!region) {
    return { title: "Région non trouvée | Ambubook" };
  }

  const title = `Ambulances en ${region.name} - Transport sanitaire | Ambubook`;
  const description = `Trouvez un ambulancier en ${region.name}. Liste des sociétés d'ambulances et VSL dans les départements : ${region.departments.slice(0, 4).join(", ")}. Réservation en ligne 24h/24.`;

  return {
    title,
    description,
    keywords: [
      `ambulance ${region.name}`,
      `VSL ${region.name}`,
      `transport sanitaire ${region.name}`,
      `ambulancier ${region.name}`,
      ...region.departments.map((d) => `ambulance ${d}`),
    ],
    openGraph: {
      title,
      description,
      url: `https://ambubook.fr/region/${region.slug}`,
      siteName: "Ambubook",
      type: "website",
      locale: "fr_FR",
    },
    twitter: {
      card: "summary",
      title: `Ambulances ${region.name} | Ambubook`,
      description,
    },
    alternates: {
      canonical: `https://ambubook.fr/region/${region.slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Préfixes de codes postaux par région
const regionPostalPrefixes: Record<string, string[]> = {
  "ile-de-france": ["75", "77", "78", "91", "92", "93", "94", "95"],
  "provence-alpes-cote-d-azur": ["04", "05", "06", "13", "83", "84"],
  "auvergne-rhone-alpes": ["01", "03", "07", "15", "26", "38", "42", "43", "63", "69", "73", "74"],
  "occitanie": ["09", "11", "12", "30", "31", "32", "34", "46", "48", "65", "66", "81", "82"],
  "nouvelle-aquitaine": ["16", "17", "19", "23", "24", "33", "40", "47", "64", "79", "86", "87"],
  "hauts-de-france": ["02", "59", "60", "62", "80"],
  "grand-est": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"],
  "bretagne": ["22", "29", "35", "56"],
  "pays-de-la-loire": ["44", "49", "53", "72", "85"],
  "normandie": ["14", "27", "50", "61", "76"],
  "bourgogne-franche-comte": ["21", "25", "39", "58", "70", "71", "89", "90"],
  "centre-val-de-loire": ["18", "28", "36", "37", "41", "45"],
  "corse": ["20", "2A", "2B"],
};

// Récupérer les entreprises de la région
async function getCompaniesByRegion(regionSlug: string) {
  const prefixes = regionPostalPrefixes[regionSlug] || [];

  if (prefixes.length === 0) return [];

  return prisma.company.findMany({
    where: {
      isActive: true,
      OR: prefixes.map((prefix) => ({
        postalCode: { startsWith: prefix },
      })),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      postalCode: true,
      hasAmbulance: true,
      hasVSL: true,
    },
    take: 50,
    orderBy: { name: "asc" },
  });
}

// Grouper les entreprises par département
function groupCompaniesByCity(
  companies: { city: string | null; postalCode: string | null }[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  companies.forEach((c) => {
    const city = c.city || "Autre";
    counts[city] = (counts[city] || 0) + 1;
  });
  return counts;
}

// Schema.org pour la page région
function generateRegionSchema(regionName: string, cities: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Ambulances en ${regionName}`,
    description: `Transport sanitaire et ambulances en ${regionName}`,
    url: `https://ambubook.fr/region/${regionName.toLowerCase().replace(/ /g, "-")}`,
    mainEntity: {
      "@type": "Place",
      name: regionName,
      address: {
        "@type": "PostalAddress",
        addressRegion: regionName,
        addressCountry: "FR",
      },
    },
    mentions: cities.map((city) => ({
      "@type": "City",
      name: city,
    })),
  };
}

export default async function RegionPage({ params }: PageProps) {
  const { region: regionSlug } = await params;
  const region = getRegionBySlug(regionSlug);

  if (!region) {
    notFound();
  }

  const companies = await getCompaniesByRegion(regionSlug);
  const cityCounts = groupCompaniesByCity(companies);
  const citiesInRegion = getCitiesByRegion(region.name);
  const otherRegions = regions.filter((r) => r.slug !== regionSlug).slice(0, 6);

  return (
    <>
      <Script
        id="region-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateRegionSchema(region.name, region.mainCities)),
        }}
      />

      <div className="min-h-screen flex flex-col bg-neutral-50">
        <Header />

        <main className="flex-1 pt-24 lg:pt-28 pb-12">
          <Container>
            {/* Fil d'ariane */}
            <nav className="mb-6">
              <ol className="flex items-center gap-2 text-sm text-neutral-500">
                <li>
                  <Link href="/" className="hover:text-primary-600 transition-colors">
                    Accueil
                  </Link>
                </li>
                <li><ChevronIcon /></li>
                <li>
                  <Link href="/recherche" className="hover:text-primary-600 transition-colors">
                    Recherche
                  </Link>
                </li>
                <li><ChevronIcon /></li>
                <li className="text-neutral-900 font-medium">{region.name}</li>
              </ol>
            </nav>

            {/* En-tête */}
            <header className="mb-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                  <MapPin className="h-3.5 w-3.5" />
                  Région
                </span>
                <span className="text-sm text-neutral-500">
                  {region.departments.length} départements
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
                Ambulances en <span className="text-primary-600">{region.name}</span>
              </h1>
              <p className="text-lg text-neutral-600 max-w-3xl">
                Trouvez un ambulancier en {region.name}. Transport sanitaire disponible dans les
                départements : {region.departments.slice(0, 5).join(", ")}
                {region.departments.length > 5 && ` et ${region.departments.length - 5} autres`}.
              </p>
            </header>

            {/* Stats rapides */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <StatCard
                icon={<Building2 className="h-5 w-5" />}
                value={companies.length}
                label="Ambulanciers"
                color="primary"
              />
              <StatCard
                icon={<MapPin className="h-5 w-5" />}
                value={Object.keys(cityCounts).length}
                label="Villes couvertes"
                color="success"
              />
              <StatCard
                icon={<Ambulance className="h-5 w-5" />}
                value={companies.filter((c) => c.hasAmbulance).length}
                label="Avec ambulance"
                color="accent"
              />
              <StatCard
                icon={<Car className="h-5 w-5" />}
                value={companies.filter((c) => c.hasVSL).length}
                label="Avec VSL"
                color="warning"
              />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Villes principales */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-bold text-neutral-900 mb-6">
                  Principales villes en {region.name}
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {citiesInRegion.slice(0, 12).map((city) => (
                    <Link
                      key={city.slug}
                      href={`/ambulances/${city.slug}`}
                      className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md hover:border-primary-200 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                            Ambulances {city.name}
                          </h3>
                          <p className="text-sm text-neutral-500 mt-0.5">
                            {city.department} ({city.postalCode})
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-neutral-400 group-hover:text-primary-600 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>

                {citiesInRegion.length > 12 && (
                  <div className="mt-6 text-center">
                    <Link
                      href={`/recherche?q=${encodeURIComponent(region.name)}`}
                      className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <Search className="h-4 w-4" />
                      Voir toutes les villes de {region.name}
                    </Link>
                  </div>
                )}

                {/* Liste des entreprises */}
                {companies.length > 0 && (
                  <section className="mt-12">
                    <h2 className="text-xl font-bold text-neutral-900 mb-6">
                      Ambulanciers en {region.name}
                    </h2>
                    <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
                      {companies.slice(0, 15).map((company) => (
                        <Link
                          key={company.id}
                          href={`/${company.slug}`}
                          className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-neutral-900 truncate">
                              {company.name}
                            </p>
                            <p className="text-sm text-neutral-500">
                              {company.city} ({company.postalCode})
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-4">
                            {company.hasAmbulance && (
                              <span className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded text-xs font-medium">
                                Ambulance
                              </span>
                            )}
                            {company.hasVSL && (
                              <span className="px-2 py-0.5 bg-success-50 text-success-700 rounded text-xs font-medium">
                                VSL
                              </span>
                            )}
                            <ArrowRight className="h-4 w-4 text-neutral-400" />
                          </div>
                        </Link>
                      ))}
                    </div>
                    {companies.length > 15 && (
                      <p className="mt-4 text-center text-sm text-neutral-500">
                        Et {companies.length - 15} autres ambulanciers en {region.name}
                      </p>
                    )}
                  </section>
                )}
              </div>

              {/* Sidebar */}
              <aside className="space-y-6">
                {/* Départements */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                  <h3 className="font-bold text-neutral-900 mb-4">
                    Départements de {region.name}
                  </h3>
                  <ul className="space-y-2">
                    {region.departments.map((dept) => (
                      <li key={dept}>
                        <Link
                          href={`/recherche?q=${encodeURIComponent(dept)}`}
                          className="text-sm text-neutral-600 hover:text-primary-600 transition-colors"
                        >
                          {dept}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Autres régions */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                  <h3 className="font-bold text-neutral-900 mb-4">
                    Autres régions
                  </h3>
                  <ul className="space-y-2">
                    {otherRegions.map((r) => (
                      <li key={r.slug}>
                        <Link
                          href={`/region/${r.slug}`}
                          className="flex items-center justify-between text-sm text-neutral-600 hover:text-primary-600 transition-colors py-1"
                        >
                          <span>{r.name}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
                  <h3 className="font-bold mb-2">Vous êtes ambulancier ?</h3>
                  <p className="text-primary-100 text-sm mb-4">
                    Rejoignez Ambubook et développez votre activité en {region.name}.
                  </p>
                  <Link
                    href="/dashboard/inscription"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary-700 rounded-lg text-sm font-semibold hover:bg-primary-50 transition-colors"
                  >
                    Créer mon compte pro
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </aside>
            </div>

            {/* Contenu SEO */}
            <section className="mt-16">
              <div className="bg-white rounded-2xl border border-neutral-200 p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                  Transport sanitaire en {region.name}
                </h2>
                <div className="prose prose-neutral max-w-none">
                  <p>
                    La région {region.name} compte {region.departments.length} départements et de
                    nombreuses villes où Ambubook vous permet de trouver un <strong>ambulancier</strong>.
                    Que vous ayez besoin d&apos;une <strong>ambulance</strong> pour un transport médicalisé
                    ou d&apos;un <strong>VSL</strong> pour vos consultations, notre réseau de partenaires
                    agréés couvre l&apos;ensemble de la région.
                  </p>
                  <h3>Villes principales pour le transport sanitaire</h3>
                  <p>
                    Les principales villes de {region.name} disposent de nombreux ambulanciers :
                    {region.mainCities.map((city, i) => (
                      <span key={city}>
                        {i > 0 && ", "}
                        <strong>{city}</strong>
                      </span>
                    ))}
                    . Utilisez notre moteur de recherche pour trouver un ambulancier près de chez vous.
                  </p>
                  <h3>Réserver un transport sanitaire en {region.name}</h3>
                  <p>
                    Avec Ambubook, réservez votre transport sanitaire en quelques clics. Nos partenaires
                    ambulanciers en {region.name} sont disponibles 24h/24 et 7j/7 pour répondre à vos
                    besoins : consultations médicales, hospitalisations, dialyse, radiothérapie,
                    kinésithérapie, ou tout autre rendez-vous médical.
                  </p>
                </div>
              </div>
            </section>
          </Container>
        </main>

        <Footer />
      </div>
    </>
  );
}

// Composant stat
function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: "primary" | "success" | "accent" | "warning";
}) {
  const colors = {
    primary: "bg-primary-50 text-primary-600",
    success: "bg-success-50 text-success-600",
    accent: "bg-accent-50 text-accent-600",
    warning: "bg-warning-50 text-warning-600",
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4">
      <div className={`inline-flex p-2 rounded-lg ${colors[color]} mb-2`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      <p className="text-sm text-neutral-500">{label}</p>
    </div>
  );
}

// Icône chevron
function ChevronIcon() {
  return (
    <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
