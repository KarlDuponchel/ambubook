import Link from "next/link";
import { Container } from "@/components/ui";

const popularCities = [
  { name: "Paris", slug: "paris" },
  { name: "Marseille", slug: "marseille" },
  { name: "Lyon", slug: "lyon" },
  { name: "Toulouse", slug: "toulouse" },
  { name: "Nice", slug: "nice" },
  { name: "Nantes", slug: "nantes" },
  { name: "Strasbourg", slug: "strasbourg" },
  { name: "Montpellier", slug: "montpellier" },
  { name: "Bordeaux", slug: "bordeaux" },
  { name: "Lille", slug: "lille" },
  { name: "Rennes", slug: "rennes" },
  { name: "Reims", slug: "reims" },
  { name: "Le Havre", slug: "le-havre" },
  { name: "Saint-Étienne", slug: "saint-etienne" },
  { name: "Toulon", slug: "toulon" },
  { name: "Grenoble", slug: "grenoble" },
  { name: "Dijon", slug: "dijon" },
  { name: "Angers", slug: "angers" },
  { name: "Nîmes", slug: "nimes" },
  { name: "Clermont-Ferrand", slug: "clermont-ferrand" },
];

const regions = [
  { name: "Île-de-France", slug: "ile-de-france" },
  { name: "Provence-Alpes-Côte d'Azur", slug: "provence-alpes-cote-d-azur" },
  { name: "Auvergne-Rhône-Alpes", slug: "auvergne-rhone-alpes" },
  { name: "Occitanie", slug: "occitanie" },
  { name: "Nouvelle-Aquitaine", slug: "nouvelle-aquitaine" },
  { name: "Hauts-de-France", slug: "hauts-de-france" },
  { name: "Grand Est", slug: "grand-est" },
  { name: "Bretagne", slug: "bretagne" },
  { name: "Pays de la Loire", slug: "pays-de-la-loire" },
  { name: "Normandie", slug: "normandie" },
];

export function CitiesSection() {
  return (
    <section className="py-16 lg:py-24 bg-surface border-t border-line">
      <Container>
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-teal">
            Partout en France
          </span>
          <h2 className="serif text-3xl lg:text-4xl text-ink mt-3 mb-3">
            Un ambulancier près de chez vous
          </h2>
          <p className="text-ink-2 text-[15px] leading-relaxed">
            AmbuBook référence des sociétés d&apos;ambulances et de VSL agréées dans les
            principales villes et régions françaises, pour un transport de proximité comme
            sur longue distance.
          </p>
        </div>

        {/* Grandes villes */}
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-ink-3 mb-3">
          Grandes villes
        </p>
        <div className="flex flex-wrap gap-2.5 mb-7 max-h-60 overflow-y-auto">
          {popularCities.map((city) => (
            <Link
              key={city.slug}
              href={`/ambulances/${city.slug}`}
              className="whitespace-nowrap text-[13px] max-w-full font-semibold text-ink-2 bg-surface-2 border border-line rounded-full px-3.5 py-2 transition-colors hover:border-brand hover:text-brand"
            >
              Ambulance {city.name}
            </Link>
          ))}
        </div>

        {/* Régions */}
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-ink-3 mb-3">
          Régions
        </p>
        <div className="flex flex-wrap gap-2.5 max-h-60 overflow-y-auto">
          {regions.map((region) => (
            <Link
              key={region.slug}
              href={`/region/${region.slug}`}
              className="whitespace-nowrap text-[13px] font-semibold text-ink-2 border border-line rounded-full px-3.5 py-2 transition-colors hover:border-teal hover:text-teal"
            >
              {region.name}
            </Link>
          ))}
        </div>

        {/* SEO text */}
        <p className="mt-10 max-w-4xl mx-auto text-ink-3 text-sm leading-relaxed text-center">
          <strong className="text-ink-2">Ambubook</strong> vous permet de trouver et réserver
          un transport sanitaire partout en France. Que vous recherchiez une{" "}
          <strong className="text-ink-2">ambulance à Paris</strong>, un{" "}
          <strong className="text-ink-2">VSL à Lyon</strong>, ou un transport médical dans
          n&apos;importe quelle ville française, notre plateforme vous met en relation avec des
          professionnels agréés près de chez vous. Consultations médicales, hospitalisations,
          dialyse, radiothérapie : réservez votre transport en ligne en quelques clics.
        </p>
      </Container>
    </section>
  );
}
