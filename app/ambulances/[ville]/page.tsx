import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { MapPin, Phone, ArrowRight, Ambulance, Car, Search } from "lucide-react";
import { Container } from "@/components/ui";
import { Header, Footer } from "@/components/landing";
import { prisma } from "@/lib/prisma";
import { getCityBySlug, getAllCitySlugs, getCitiesByRegion, regions } from "@/lib/seo-data";

interface PageProps {
  params: Promise<{ ville: string }>;
}

// Génération statique pour les villes connues
export async function generateStaticParams() {
  return getAllCitySlugs().map((ville) => ({ ville }));
}

// Metadata SEO dynamique
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ville } = await params;
  const city = getCityBySlug(ville);

  if (!city) {
    return { title: "Ville non trouvée | Ambubook" };
  }

  const title = `Ambulances à ${city.name} (${city.postalCode}) - Transport sanitaire | Ambubook`;
  const description = `Trouvez et réservez un transport sanitaire à ${city.name}. Ambulances et VSL disponibles 24h/24. Professionnels agréés dans le ${city.department}. Réservation en ligne gratuite.`;

  return {
    title,
    description,
    keywords: [
      `ambulance ${city.name}`,
      `VSL ${city.name}`,
      `transport sanitaire ${city.name}`,
      `ambulancier ${city.name}`,
      `transport médical ${city.postalCode}`,
      `ambulance ${city.department}`,
    ],
    openGraph: {
      title,
      description,
      url: `https://ambubook.fr/ambulances/${city.slug}`,
      siteName: "Ambubook",
      type: "website",
      locale: "fr_FR",
    },
    twitter: {
      card: "summary",
      title: `Ambulances ${city.name} | Ambubook`,
      description,
    },
    alternates: {
      canonical: `https://ambubook.fr/ambulances/${city.slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Récupérer les entreprises de la ville
async function getCompaniesByCity(cityName: string, postalCode: string) {
  const postalPrefix = postalCode.slice(0, 2);

  return prisma.company.findMany({
    where: {
      isActive: true,
      OR: [
        { city: { contains: cityName, mode: "insensitive" } },
        { postalCode: { startsWith: postalPrefix } },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      address: true,
      city: true,
      postalCode: true,
      phone: true,
      hasAmbulance: true,
      hasVSL: true,
      acceptsOnlineBooking: true,
    },
    take: 20,
    orderBy: { name: "asc" },
  });
}

// Schema.org pour la page ville
function generateCitySchema(cityName: string, companies: { name: string; slug: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Ambulances à ${cityName}`,
    description: `Liste des sociétés d'ambulances et de transport sanitaire à ${cityName}`,
    url: `https://ambubook.fr/ambulances/${cityName.toLowerCase()}`,
    mainEntity: {
      "@type": "ItemList",
      name: `Ambulanciers à ${cityName}`,
      numberOfItems: companies.length,
      itemListElement: companies.map((company, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "LocalBusiness",
          name: company.name,
          url: `https://ambubook.fr/${company.slug}`,
        },
      })),
    },
  };
}

export default async function CityPage({ params }: PageProps) {
  const { ville } = await params;
  const city = getCityBySlug(ville);

  if (!city) {
    notFound();
  }

  const companies = await getCompaniesByCity(city.name, city.postalCode);
  const region = regions.find((r) => r.name === city.region);
  const nearbyCities = getCitiesByRegion(city.region)
    .filter((c) => c.slug !== city.slug)
    .slice(0, 8);

  return (
    <>
      <Script
        id="city-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateCitySchema(city.name, companies)) }}
      />

      <div className="min-h-screen flex flex-col bg-neutral-50">
        <Header />

        <main className="flex-1 pt-24 lg:pt-28 pb-12">
          <Container>
            {/* Fil d'ariane */}
            <nav className="mb-6">
              <ol className="flex items-center gap-2 text-sm text-neutral-500 flex-wrap">
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
                {region && (
                  <>
                    <li><ChevronIcon /></li>
                    <li>
                      <Link href={`/region/${region.slug}`} className="hover:text-primary-600 transition-colors">
                        {region.name}
                      </Link>
                    </li>
                  </>
                )}
                <li><ChevronIcon /></li>
                <li className="text-neutral-900 font-medium">{city.name}</li>
              </ol>
            </nav>

            {/* En-tête */}
            <header className="mb-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                  <MapPin className="h-3.5 w-3.5" />
                  {city.department}
                </span>
                <span className="text-sm text-neutral-500">{city.postalCode}</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
                Ambulances à <span className="text-primary-600">{city.name}</span>
              </h1>
              <p className="text-lg text-neutral-600 max-w-3xl">
                Trouvez une société d&apos;ambulances ou un VSL à {city.name} et ses environs.
                Réservez votre transport sanitaire en ligne, 24h/24 et 7j/7.
              </p>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Liste des entreprises */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-neutral-900">
                    {companies.length > 0
                      ? `${companies.length} ambulancier${companies.length > 1 ? "s" : ""} à ${city.name}`
                      : "Aucun ambulancier trouvé"}
                  </h2>
                  <Link
                    href={`/recherche?q=${encodeURIComponent(city.name)}`}
                    className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <Search className="h-4 w-4" />
                    Recherche avancée
                  </Link>
                </div>

                {companies.length > 0 ? (
                  <div className="space-y-4">
                    {companies.map((company) => (
                      <CompanyCard key={company.id} company={company} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
                      <Search className="h-8 w-8 text-neutral-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      Pas encore d&apos;ambulancier référencé
                    </h3>
                    <p className="text-neutral-600 mb-6">
                      Nous n&apos;avons pas encore de partenaire à {city.name}.
                      Essayez une recherche plus large.
                    </p>
                    <Link
                      href={`/recherche?q=${encodeURIComponent(city.region)}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                    >
                      Rechercher en {city.region}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <aside className="space-y-6">
                {/* Infos pratiques */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                  <h3 className="font-bold text-neutral-900 mb-4">
                    Transport sanitaire à {city.name}
                  </h3>
                  <div className="space-y-4 text-sm text-neutral-600">
                    <p>
                      <strong className="text-neutral-900">Ambulance</strong> : pour les patients nécessitant
                      une position allongée ou une surveillance médicale.
                    </p>
                    <p>
                      <strong className="text-neutral-900">VSL</strong> : véhicule sanitaire léger pour les
                      patients autonomes pouvant voyager assis.
                    </p>
                    <p>
                      Tous les ambulanciers référencés sur Ambubook à {city.name} sont
                      des professionnels agréés par l&apos;ARS.
                    </p>
                  </div>
                </div>

                {/* Villes proches */}
                {nearbyCities.length > 0 && (
                  <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                    <h3 className="font-bold text-neutral-900 mb-4">
                      Ambulances dans les villes proches
                    </h3>
                    <ul className="space-y-2">
                      {nearbyCities.map((nearbyCity) => (
                        <li key={nearbyCity.slug}>
                          <Link
                            href={`/ambulances/${nearbyCity.slug}`}
                            className="flex items-center justify-between text-sm text-neutral-600 hover:text-primary-600 transition-colors py-1"
                          >
                            <span>{nearbyCity.name}</span>
                            <span className="text-neutral-400">{nearbyCity.postalCode}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {region && (
                      <Link
                        href={`/region/${region.slug}`}
                        className="mt-4 flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Voir toute la région {region.name}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                )}

                {/* CTA */}
                <div className="bg-linear-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
                  <h3 className="font-bold mb-2">Vous êtes ambulancier à {city.name} ?</h3>
                  <p className="text-primary-100 text-sm mb-4">
                    Rejoignez Ambubook et recevez des demandes de transport de votre zone.
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
                  Transport médical à {city.name}
                </h2>
                <div className="prose prose-neutral max-w-none">
                  <p>
                    {city.name} est une ville du département {city.department} en région {city.region}.
                    Ambubook vous permet de trouver facilement un <strong>ambulancier à {city.name}</strong> pour
                    tous vos besoins de transport sanitaire : consultations médicales, hospitalisations,
                    dialyse, radiothérapie, kinésithérapie, ou tout autre rendez-vous médical.
                  </p>
                  <h3>Types de transport sanitaire à {city.name}</h3>
                  <ul>
                    <li>
                      <strong>Ambulance à {city.name}</strong> : transport médicalisé pour les patients
                      nécessitant une surveillance ou une position allongée. Équipée de matériel médical
                      (oxygène, monitoring, brancard).
                    </li>
                    <li>
                      <strong>VSL à {city.name}</strong> : véhicule sanitaire léger pour les patients
                      autonomes. Solution économique pour les transports réguliers.
                    </li>
                  </ul>
                  <h3>Prise en charge et remboursement</h3>
                  <p>
                    Les transports sanitaires à {city.name} peuvent être pris en charge par l&apos;Assurance
                    Maladie avec une prescription médicale (bon de transport). Le remboursement est de 65%
                    en général, et jusqu&apos;à 100% pour les patients en ALD ou les transports liés à une
                    hospitalisation.
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

// Composant carte entreprise
function CompanyCard({
  company,
}: {
  company: {
    id: string;
    name: string;
    slug: string;
    address: string | null;
    city: string | null;
    postalCode: string | null;
    phone: string | null;
    hasAmbulance: boolean;
    hasVSL: boolean;
    acceptsOnlineBooking: boolean;
  };
}) {
  return (
    <article className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md hover:border-neutral-300 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <Link href={`/${company.slug}`}>
            <h3 className="font-semibold text-neutral-900 hover:text-primary-600 transition-colors truncate">
              {company.name}
            </h3>
          </Link>
          {company.address && (
            <p className="text-sm text-neutral-500 mt-1 truncate">
              {company.address}, {company.postalCode} {company.city}
            </p>
          )}
          <div className="flex items-center gap-3 mt-3">
            {company.hasAmbulance && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-medium">
                <Ambulance className="h-3 w-3" />
                Ambulance
              </span>
            )}
            {company.hasVSL && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-success-50 text-success-700 rounded text-xs font-medium">
                <Car className="h-3 w-3" />
                VSL
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {company.phone && (
            <a
              href={`tel:${company.phone}`}
              className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-primary-600"
            >
              <Phone className="h-4 w-4" />
              {company.phone}
            </a>
          )}
          <Link
            href={`/${company.slug}`}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Voir la fiche
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
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
