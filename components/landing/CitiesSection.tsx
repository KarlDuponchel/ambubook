import Link from "next/link";
import { Container } from "@/components/ui";
import { MapPin } from "lucide-react";

// Grandes villes françaises pour le maillage SEO
const popularCities = [
  { name: "Paris", postalCode: "75000" },
  { name: "Marseille", postalCode: "13000" },
  { name: "Lyon", postalCode: "69000" },
  { name: "Toulouse", postalCode: "31000" },
  { name: "Nice", postalCode: "06000" },
  { name: "Nantes", postalCode: "44000" },
  { name: "Strasbourg", postalCode: "67000" },
  { name: "Montpellier", postalCode: "34000" },
  { name: "Bordeaux", postalCode: "33000" },
  { name: "Lille", postalCode: "59000" },
  { name: "Rennes", postalCode: "35000" },
  { name: "Reims", postalCode: "51100" },
  { name: "Le Havre", postalCode: "76600" },
  { name: "Saint-Étienne", postalCode: "42000" },
  { name: "Toulon", postalCode: "83000" },
  { name: "Grenoble", postalCode: "38000" },
  { name: "Dijon", postalCode: "21000" },
  { name: "Angers", postalCode: "49000" },
  { name: "Nîmes", postalCode: "30000" },
  { name: "Clermont-Ferrand", postalCode: "63000" },
];

// Régions pour SEO
const regions = [
  "Île-de-France",
  "Provence-Alpes-Côte d'Azur",
  "Auvergne-Rhône-Alpes",
  "Occitanie",
  "Nouvelle-Aquitaine",
  "Hauts-de-France",
  "Grand Est",
  "Bretagne",
  "Pays de la Loire",
  "Normandie",
];

export function CitiesSection() {
  return (
    <section className="py-20 lg:py-28 bg-neutral-50">
      <Container>
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-100 text-secondary-700 rounded-full text-sm font-medium mb-4">
            <MapPin className="h-4 w-4" />
            Couverture nationale
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            Ambulanciers dans toute la France
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Trouvez une société d&apos;ambulances près de chez vous. Notre réseau de partenaires
            couvre l&apos;ensemble du territoire français.
          </p>
        </div>

        {/* Villes populaires */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-neutral-900 mb-6 text-center">
            Villes les plus recherchées
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {popularCities.map((city) => (
              <Link
                key={city.name}
                href={`/recherche?q=${encodeURIComponent(city.name)}`}
                className="px-4 py-2 bg-white border border-neutral-200 rounded-full text-neutral-700 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-all text-sm font-medium"
              >
                Ambulance {city.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Régions */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-8">
          <h3 className="text-lg font-semibold text-neutral-900 mb-6 text-center">
            Transport sanitaire par région
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {regions.map((region) => (
              <Link
                key={region}
                href={`/recherche?q=${encodeURIComponent(region)}`}
                className="text-center p-3 rounded-xl hover:bg-primary-50 transition-colors group"
              >
                <span className="text-neutral-600 group-hover:text-primary-600 text-sm">
                  {region}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* SEO Text */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="prose prose-neutral prose-sm max-w-none text-center">
            <p className="text-neutral-500 leading-relaxed">
              <strong>Ambubook</strong> vous permet de trouver et réserver un transport sanitaire
              partout en France. Que vous recherchiez une <strong>ambulance à Paris</strong>,
              un <strong>VSL à Lyon</strong>, ou un transport médical dans n&apos;importe quelle
              ville française, notre plateforme vous met en relation avec des professionnels
              agréés près de chez vous. Consultations médicales, hospitalisations, dialyse,
              radiothérapie : réservez votre transport en ligne en quelques clics.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
