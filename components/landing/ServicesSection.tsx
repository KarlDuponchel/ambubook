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
    color: "primary",
  },
  {
    icon: Car,
    title: "Transport en VSL",
    description:
      "Véhicule Sanitaire Léger pour les patients autonomes pouvant voyager en position assise. Idéal pour les consultations, examens et soins réguliers.",
    features: ["Position assise", "Confort optimal", "Tarif avantageux"],
    color: "success",
  },
  {
    icon: Clock,
    title: "Disponibilité 24h/24",
    description:
      "Nos partenaires ambulanciers sont disponibles 7 jours sur 7, de jour comme de nuit, pour répondre à vos besoins de transport médical.",
    features: ["Réservation en ligne", "Réponse rapide", "Urgences"],
    color: "info",
  },
  {
    icon: Shield,
    title: "Ambulanciers agréés",
    description:
      "Tous nos partenaires sont des professionnels certifiés, titulaires de l'agrément ARS et respectant les normes sanitaires en vigueur.",
    features: ["Agrément ARS", "Formation DEA", "Véhicules conformes"],
    color: "warning",
  },
  {
    icon: Heart,
    title: "Prise en charge Sécu",
    description:
      "Vos transports sanitaires peuvent être pris en charge par l'Assurance Maladie avec une prescription médicale (bon de transport).",
    features: ["Remboursement 65%", "100% en ALD", "Tiers payant"],
    color: "danger",
  },
  {
    icon: MapPin,
    title: "Partout en France",
    description:
      "Un réseau de sociétés d'ambulances dans toute la France. Trouvez un transporteur près de chez vous en quelques secondes.",
    features: ["Couverture nationale", "Proximité", "Transports longue distance"],
    color: "secondary",
  },
];

const colorClasses: Record<string, { bg: string; text: string; light: string }> = {
  primary: { bg: "bg-primary-100", text: "text-primary-600", light: "bg-primary-50" },
  success: { bg: "bg-success-100", text: "text-success-600", light: "bg-success-50" },
  info: { bg: "bg-info-100", text: "text-info-600", light: "bg-info-50" },
  warning: { bg: "bg-warning-100", text: "text-warning-600", light: "bg-warning-50" },
  danger: { bg: "bg-danger-100", text: "text-danger-600", light: "bg-danger-50" },
  secondary: { bg: "bg-secondary-100", text: "text-secondary-600", light: "bg-secondary-50" },
};

export function ServicesSection() {
  return (
    <section id="services" className="py-20 lg:py-28 bg-white">
      <Container>
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
            Nos services
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            Transport sanitaire adapté à vos besoins
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Que vous ayez besoin d&apos;une ambulance médicalisée ou d&apos;un VSL,
            trouvez le transport adapté à votre situation de santé.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const colors = colorClasses[service.color];
            return (
              <article
                key={service.title}
                className="group p-6 bg-white rounded-2xl border border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all"
              >
                <div className={`inline-flex p-3 rounded-xl ${colors.bg} mb-4`}>
                  <service.icon className={`h-6 w-6 ${colors.text}`} />
                </div>

                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  {service.title}
                </h3>

                <p className="text-neutral-600 mb-4 leading-relaxed">
                  {service.description}
                </p>

                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-neutral-500"
                    >
                      <svg
                        className={`h-4 w-4 ${colors.text}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
          >
            Trouver un ambulancier
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </Container>
    </section>
  );
}
