import Link from "next/link";
import { Container } from "@/components/ui";
import { Ambulance, Car, Clock, Shield, Heart, MapPin } from "lucide-react";

const services = [
  {
    icon: Ambulance,
    title: "Transport en ambulance",
    description:
      "Pour les patients nécessitant une position allongée, une surveillance médicale ou un équipement spécifique (oxygène, monitoring). Deux ambulanciers diplômés à bord.",
    features: ["Position allongée", "Surveillance continue", "Équipements médicaux"],
    accent: "primary",
  },
  {
    icon: Car,
    title: "Transport en VSL",
    description:
      "Véhicule Sanitaire Léger pour les patients autonomes pouvant voyager en position assise. Idéal pour les consultations, examens et soins réguliers.",
    features: ["Position assise", "Confort optimal", "Tarif avantageux"],
    accent: "success",
  },
  {
    icon: Clock,
    title: "Disponibilité 24h/24",
    description:
      "Nos partenaires ambulanciers sont disponibles 7 jours sur 7, de jour comme de nuit, pour répondre à vos besoins de transport médical.",
    features: ["Réservation en ligne", "Réponse rapide", "Urgences"],
    accent: "accent",
  },
  {
    icon: Shield,
    title: "Ambulanciers agréés",
    description:
      "Tous nos partenaires sont des professionnels certifiés, titulaires de l'agrément ARS et respectant les normes sanitaires en vigueur.",
    features: ["Agrément ARS", "Formation DEA", "Véhicules conformes"],
    accent: "secondary",
  },
  {
    icon: Heart,
    title: "Prise en charge Sécu",
    description:
      "Vos transports sanitaires peuvent être pris en charge par l'Assurance Maladie avec une prescription médicale (bon de transport).",
    features: ["Remboursement 65%", "100% en ALD", "Tiers payant"],
    accent: "danger",
  },
  {
    icon: MapPin,
    title: "Partout en France",
    description:
      "Un réseau de sociétés d'ambulances dans toute la France. Trouvez un transporteur près de chez vous en quelques secondes.",
    features: ["Couverture nationale", "Proximité", "Transports longue distance"],
    accent: "warning",
  },
];

const accentMap: Record<string, { border: string; icon: string; dot: string; pill: string }> = {
  primary: {
    border: "border-t-primary-500",
    icon: "bg-primary-50 text-primary-600",
    dot: "bg-primary-400",
    pill: "bg-primary-50 text-primary-700",
  },
  success: {
    border: "border-t-success-500",
    icon: "bg-success-50 text-success-600",
    dot: "bg-success-400",
    pill: "bg-success-50 text-success-700",
  },
  accent: {
    border: "border-t-accent-500",
    icon: "bg-accent-50 text-accent-600",
    dot: "bg-accent-400",
    pill: "bg-accent-50 text-accent-700",
  },
  secondary: {
    border: "border-t-secondary-500",
    icon: "bg-secondary-50 text-secondary-700",
    dot: "bg-secondary-400",
    pill: "bg-secondary-50 text-secondary-700",
  },
  danger: {
    border: "border-t-danger-500",
    icon: "bg-danger-50 text-danger-600",
    dot: "bg-danger-400",
    pill: "bg-danger-50 text-danger-700",
  },
  warning: {
    border: "border-t-warning-500",
    icon: "bg-warning-50 text-warning-700",
    dot: "bg-warning-400",
    pill: "bg-warning-50 text-warning-700",
  },
};

export function ServicesSection() {
  return (
    <section id="services" className="py-20 lg:py-28 bg-neutral-50">
      <Container>
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4 tracking-wide">
            Nos services
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 leading-tight">
            Transport sanitaire adapté à{" "}
            <span className="text-primary-600">vos besoins</span>
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Que vous ayez besoin d&apos;une ambulance médicalisée ou d&apos;un VSL,
            trouvez le transport adapté à votre situation de santé.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const a = accentMap[service.accent];
            return (
              <article
                key={service.title}
                className={`group bg-white rounded-2xl border-t-4 ${a.border} border border-neutral-200 border-t-4 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}
              >
                <div className={`inline-flex p-3 rounded-xl ${a.icon} mb-4`}>
                  <service.icon className="h-6 w-6" strokeWidth={1.75} />
                </div>

                <h3 className="text-lg font-bold text-neutral-900 mb-2 leading-snug">
                  {service.title}
                </h3>

                <p className="text-neutral-600 mb-5 leading-relaxed text-sm">
                  {service.description}
                </p>

                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2.5 text-sm text-neutral-600"
                    >
                      <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${a.dot}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/recherche"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 active:bg-primary-800 transition-all duration-200 shadow-md shadow-primary-600/20"
          >
            Trouver un ambulancier
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </Container>
    </section>
  );
}
