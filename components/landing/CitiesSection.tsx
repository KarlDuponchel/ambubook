import Link from "next/link";
import { Container } from "@/components/ui";
import { MapPin } from "lucide-react";

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
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4 tracking-wide">
            <MapPin className="h-3.5 w-3.5" />
            Couverture nationale
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            Ambulanciers dans{" "}
            <span className="text-primary-600">toute la France</span>
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Trouvez une société d&apos;ambulances près de chez vous. Notre réseau de partenaires
            couvre l&apos;ensemble du territoire français.
          </p>
        </div>

        {/* Villes populaires */}
        <div className="mb-10">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest text-center mb-5">
            Villes les plus recherchées
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {popularCities.map((city) => (
              <Link
                key={city.name}
                href={`/recherche?q=${encodeURIComponent(city.name)}`}
                className="px-4 py-2 bg-white border border-neutral-200 rounded-full text-neutral-700 hover:border-primary-400 hover:text-primary-700 hover:bg-primary-50 hover:shadow-sm transition-all duration-200 text-sm font-medium"
              >
                Ambulance {city.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Régions */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 lg:p-8">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest text-center mb-6">
            Transport sanitaire par région
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {regions.map((region) => (
              <Link
                key={region}
                href={`/recherche?q=${encodeURIComponent(region)}`}
                className="text-center px-3 py-2.5 rounded-xl border border-neutral-100 hover:border-primary-200 hover:bg-primary-50 transition-all duration-200 group"
              >
                <span className="text-neutral-600 group-hover:text-primary-700 text-sm font-medium leading-snug block">
                  {region}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* SEO Text */}
        <div className="mt-10 max-w-4xl mx-auto">
          <p className="text-neutral-500 text-sm leading-relaxed text-center">
            <strong className="text-neutral-600">Ambubook</strong> vous permet de trouver et réserver un transport sanitaire
            partout en France. Que vous recherchiez une <strong className="text-neutral-600">ambulance à Paris</strong>,
            un <strong className="text-neutral-600">VSL à Lyon</strong>, ou un transport médical dans n&apos;importe quelle
            ville française, notre plateforme vous met en relation avec des professionnels
            agréés près de chez vous. Consultations médicales, hospitalisations, dialyse,
            radiothérapie : réservez votre transport en ligne en quelques clics.
          </p>
        </div>
      </Container>
    </section>
  );
}
