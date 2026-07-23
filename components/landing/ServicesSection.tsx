import Link from "next/link";
import { Container } from "@/components/ui";
import {
  Ambulance,
  Armchair,
  Clock,
  BadgeCheck,
  ShieldPlus,
  Map,
  Search,
  Check,
} from "lucide-react";

const services = [
  {
    icon: Ambulance,
    color: "var(--bleu)",
    title: "Transport en ambulance",
    description:
      "Pour les patients nécessitant une position allongée, une surveillance médicale ou un équipement spécifique (oxygène, monitoring). Deux ambulanciers diplômés à bord.",
    features: ["Position allongée", "Surveillance continue", "Équipements médicaux"],
  },
  {
    icon: Armchair,
    color: "var(--vert)",
    title: "Transport en VSL",
    description:
      "Véhicule Sanitaire Léger pour les patients autonomes pouvant voyager en position assise. Idéal pour les consultations, examens et soins réguliers.",
    features: ["Position assise", "Confort optimal", "Tarif avantageux"],
  },
  {
    icon: Clock,
    color: "var(--ambre)",
    title: "Disponibilité 24h/24",
    description:
      "Nos partenaires ambulanciers sont disponibles 7 jours sur 7, de jour comme de nuit, pour répondre à vos besoins de transport médical.",
    features: ["Réservation en ligne", "Réponse rapide", "Urgences"],
  },
  {
    icon: BadgeCheck,
    color: "var(--teal)",
    title: "Ambulanciers agréés",
    description:
      "Tous nos partenaires sont des professionnels certifiés, titulaires de l'agrément ARS et respectant les normes sanitaires en vigueur.",
    features: ["Agrément ARS", "Formation DEA", "Véhicules conformes"],
  },
  {
    icon: ShieldPlus,
    color: "var(--violet)",
    title: "Prise en charge Sécu",
    description:
      "Vos transports sanitaires peuvent être pris en charge par l'Assurance Maladie avec une prescription médicale (bon de transport).",
    features: ["Remboursement 65%", "100% en ALD", "Tiers payant"],
  },
  {
    icon: Map,
    color: "var(--rouge)",
    title: "Partout en France",
    description:
      "Un réseau de sociétés d'ambulances dans toute la France. Trouvez un transporteur près de chez vous en quelques secondes.",
    features: ["Couverture nationale", "Proximité", "Transports longue distance"],
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="py-16 lg:py-24 bg-page">
      <Container>
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-teal">
            Nos services
          </span>
          <h2 className="serif text-3xl lg:text-4xl text-ink mt-3 mb-3">
            Un transport adapté à chaque situation
          </h2>
          <p className="text-ink-2 text-base leading-relaxed">
            Six piliers pour couvrir tous vos besoins de transport sanitaire, en
            ambulance comme en VSL.
          </p>
        </div>

        {/* Services : carrousel horizontal sur mobile, grille sur desktop */}
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none -mx-4 px-4 md:mx-0 md:px-0 scroll-pl-4 md:scroll-pl-0 pb-3 md:pb-0 carousel-scrollbar">
          {services.map((service) => (
            <article
              key={service.title}
              className="group bg-surface border border-line rounded-2xl p-6 transition-all duration-300 hover:shadow-soft hover:-translate-y-0.5 shrink-0 md:shrink w-[82%] sm:w-[46%] md:w-auto snap-start"
              style={{ borderTop: `3px solid ${service.color}` }}
            >
              <div className="flex items-center gap-3 mb-3.5">
                <span
                  className="shrink-0 grid place-items-center w-11 h-11 rounded-xl"
                  style={{
                    background: `color-mix(in srgb, ${service.color} 14%, var(--surface))`,
                    color: service.color,
                  }}
                >
                  <service.icon className="w-[23px] h-[23px]" strokeWidth={2} />
                </span>
                <h3 className="text-lg font-extrabold text-ink leading-snug">
                  {service.title}
                </h3>
              </div>

              <p className="text-ink-2 text-sm leading-relaxed mb-4">
                {service.description}
              </p>

              <ul className="flex flex-col gap-2.5 border-t border-line pt-3.5">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-[13px] text-ink-2">
                    <Check
                      className="w-4 h-4 shrink-0"
                      strokeWidth={2.5}
                      style={{ color: service.color }}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            href="/recherche"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand text-white font-bold text-[15px] rounded-xl transition-colors hover:bg-brand-ink"
          >
            <Search className="w-4 h-4" strokeWidth={2} />
            Trouver un ambulancier
          </Link>
        </div>
      </Container>
    </section>
  );
}
