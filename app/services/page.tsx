import { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Ambulance, Car, HeartPulse, ArrowRight, Shield, Clock, MapPin, Euro } from "lucide-react";
import { Container } from "@/components/ui";
import { Header, Footer } from "@/components/landing";

export const metadata: Metadata = {
  title: "Services de transport sanitaire - Ambulance, VSL | Ambubook",
  description:
    "Découvrez nos services de transport sanitaire : ambulance médicalisée, VSL, transport assis. Prise en charge Sécurité sociale. Réservation en ligne 24h/24.",
  keywords: [
    "transport sanitaire",
    "ambulance",
    "VSL",
    "transport médical",
    "transport assis",
    "ambulancier",
    "prise en charge sécurité sociale",
  ],
  openGraph: {
    title: "Services de transport sanitaire | Ambubook",
    description: "Ambulance, VSL, transport médical. Réservation en ligne.",
    url: "https://ambubook.fr/services",
    siteName: "Ambubook",
    type: "website",
    locale: "fr_FR",
  },
  alternates: {
    canonical: "https://ambubook.fr/services",
  },
};

const servicesSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Services de transport sanitaire",
  description: "Découvrez les différents types de transport sanitaire disponibles sur Ambubook",
  url: "https://ambubook.fr/services",
  mainEntity: {
    "@type": "ItemList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: {
          "@type": "Service",
          name: "Transport en ambulance",
          url: "https://ambubook.fr/services/ambulance",
        },
      },
      {
        "@type": "ListItem",
        position: 2,
        item: {
          "@type": "Service",
          name: "Transport en VSL",
          url: "https://ambubook.fr/services/vsl",
        },
      },
      {
        "@type": "ListItem",
        position: 3,
        item: {
          "@type": "Service",
          name: "Transport médical",
          url: "https://ambubook.fr/services/transport-medical",
        },
      },
    ],
  },
};

const services = [
  {
    id: "ambulance",
    icon: Ambulance,
    title: "Transport en ambulance",
    description:
      "Pour les patients nécessitant une position allongée, une surveillance médicale ou un équipement spécifique. Deux ambulanciers diplômés à bord.",
    features: [
      "Position allongée obligatoire",
      "Surveillance médicale continue",
      "Équipements : oxygène, monitoring, brancard",
      "Deux professionnels à bord (DEA)",
    ],
    useCases: [
      "Sorties d'hospitalisation",
      "Urgences médicales programmées",
      "Patients sous oxygène",
      "Transferts inter-hospitaliers",
    ],
    href: "/services/ambulance",
    color: "primary",
  },
  {
    id: "vsl",
    icon: Car,
    title: "Transport en VSL",
    description:
      "Véhicule Sanitaire Léger pour les patients autonomes pouvant voyager en position assise. Solution économique pour les consultations régulières.",
    features: [
      "Position assise confortable",
      "Véhicule adapté PMR possible",
      "Un ambulancier diplômé",
      "Tarif plus avantageux",
    ],
    useCases: [
      "Consultations médicales",
      "Séances de dialyse",
      "Radiothérapie / chimiothérapie",
      "Kinésithérapie",
    ],
    href: "/services/vsl",
    color: "success",
  },
  {
    id: "transport-medical",
    icon: HeartPulse,
    title: "Transport médical général",
    description:
      "Tous vos besoins de transport sanitaire, quel que soit le motif. Nos partenaires s'adaptent à votre situation médicale.",
    features: [
      "Évaluation personnalisée",
      "Choix ambulance ou VSL",
      "Accompagnement possible",
      "Transport longue distance",
    ],
    useCases: [
      "Rendez-vous médicaux",
      "Hospitalisations",
      "Retours à domicile",
      "Transports réguliers",
    ],
    href: "/services/transport-medical",
    color: "accent",
  },
];

const advantages = [
  {
    icon: Shield,
    title: "Professionnels agréés",
    description: "Tous nos partenaires sont titulaires de l'agrément ARS et respectent les normes sanitaires.",
  },
  {
    icon: Clock,
    title: "Disponible 24h/24",
    description: "Réservez votre transport à tout moment, nos ambulanciers sont disponibles jour et nuit.",
  },
  {
    icon: Euro,
    title: "Prise en charge Sécu",
    description: "Vos transports peuvent être remboursés jusqu'à 100% avec une prescription médicale.",
  },
  {
    icon: MapPin,
    title: "Partout en France",
    description: "Un réseau national d'ambulanciers pour vous accompagner où que vous soyez.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <Script
        id="services-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }}
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
                <li>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </li>
                <li className="text-neutral-900 font-medium">Services</li>
              </ol>
            </nav>

            {/* En-tête */}
            <header className="text-center mb-14">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
                <HeartPulse className="h-4 w-4" />
                Transport sanitaire
              </span>
              <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
                Nos services de <span className="text-primary-600">transport médical</span>
              </h1>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Ambulance, VSL, transport assis... Découvrez les différentes solutions de transport
                sanitaire adaptées à votre situation médicale.
              </p>
            </header>

            {/* Services */}
            <section className="mb-20">
              <div className="grid lg:grid-cols-3 gap-6">
                {services.map((service) => {
                  const colors = {
                    primary: {
                      border: "border-t-primary-500",
                      icon: "bg-primary-50 text-primary-600",
                      button: "bg-primary-600 hover:bg-primary-700",
                    },
                    success: {
                      border: "border-t-success-500",
                      icon: "bg-success-50 text-success-600",
                      button: "bg-success-600 hover:bg-success-700",
                    },
                    accent: {
                      border: "border-t-accent-500",
                      icon: "bg-accent-50 text-accent-600",
                      button: "bg-accent-600 hover:bg-accent-700",
                    },
                  };
                  const c = colors[service.color as keyof typeof colors];

                  return (
                    <article
                      key={service.id}
                      className={`bg-white rounded-2xl border-t-4 ${c.border} border border-neutral-200 p-6 flex flex-col`}
                    >
                      <div className={`inline-flex p-3 rounded-xl ${c.icon} mb-4 w-fit`}>
                        <service.icon className="h-6 w-6" strokeWidth={1.75} />
                      </div>

                      <h2 className="text-xl font-bold text-neutral-900 mb-3">
                        {service.title}
                      </h2>

                      <p className="text-neutral-600 mb-5 leading-relaxed">
                        {service.description}
                      </p>

                      <div className="mb-5">
                        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">
                          Caractéristiques
                        </p>
                        <ul className="space-y-1.5">
                          {service.features.map((feature) => (
                            <li key={feature} className="flex items-center gap-2 text-sm text-neutral-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mb-6">
                        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">
                          Cas d&apos;usage
                        </p>
                        <ul className="space-y-1.5">
                          {service.useCases.map((useCase) => (
                            <li key={useCase} className="flex items-center gap-2 text-sm text-neutral-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                              {useCase}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-auto">
                        <Link
                          href={service.href}
                          className={`flex items-center justify-center gap-2 w-full py-3 ${c.button} text-white rounded-xl font-semibold transition-colors`}
                        >
                          En savoir plus
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* Avantages */}
            <section className="mb-20">
              <div className="text-center mb-10">
                <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-3">
                  Pourquoi choisir Ambubook ?
                </h2>
                <p className="text-neutral-600 max-w-xl mx-auto">
                  Une plateforme simple et fiable pour tous vos besoins de transport sanitaire.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {advantages.map((adv) => (
                  <div
                    key={adv.title}
                    className="bg-white rounded-xl border border-neutral-200 p-5 text-center"
                  >
                    <div className="inline-flex p-3 rounded-xl bg-primary-50 text-primary-600 mb-4">
                      <adv.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-neutral-900 mb-2">{adv.title}</h3>
                    <p className="text-sm text-neutral-600">{adv.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA */}
            <section className="bg-linear-to-br from-primary-600 to-primary-700 rounded-2xl p-8 lg:p-12 text-center text-white">
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                Besoin d&apos;un transport sanitaire ?
              </h2>
              <p className="text-primary-100 max-w-xl mx-auto mb-8">
                Trouvez un ambulancier près de chez vous et réservez votre transport en quelques clics.
              </p>
              <Link
                href="/recherche"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 rounded-xl font-bold text-lg hover:bg-primary-50 transition-colors"
              >
                Rechercher un ambulancier
                <ArrowRight className="h-5 w-5" />
              </Link>
            </section>
          </Container>
        </main>

        <Footer />
      </div>
    </>
  );
}
