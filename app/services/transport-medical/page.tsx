import { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import {
  HeartPulse,
  ArrowRight,
  Check,
  FileText,
  Euro,
  Clock,
  MapPin,
  Ambulance,
  Car,
  Stethoscope,
  Building2,
} from "lucide-react";
import { Container } from "@/components/ui";
import { Header, Footer } from "@/components/landing";

export const metadata: Metadata = {
  title: "Transport médical - Guide complet du transport sanitaire | Ambubook",
  description:
    "Tout savoir sur le transport médical : types de transport, remboursement, bon de transport. Guide complet pour organiser votre transport sanitaire.",
  keywords: [
    "transport médical",
    "transport sanitaire",
    "bon de transport",
    "prescription médicale transport",
    "remboursement transport",
    "taxi conventionné",
    "ambulance",
    "VSL",
  ],
  openGraph: {
    title: "Transport médical - Guide complet | Ambubook",
    description: "Tout savoir pour organiser votre transport sanitaire.",
    url: "https://ambubook.fr/services/transport-medical",
    siteName: "Ambubook",
    type: "website",
    locale: "fr_FR",
  },
  alternates: {
    canonical: "https://ambubook.fr/services/transport-medical",
  },
};

const transportSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Transport médical : guide complet du transport sanitaire",
  description: "Tout savoir sur le transport médical en France : types de transport, tarifs et remboursement",
  author: {
    "@type": "Organization",
    name: "Ambubook",
  },
  publisher: {
    "@type": "Organization",
    name: "Ambubook",
    url: "https://ambubook.fr",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Comment obtenir un bon de transport ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Le bon de transport (prescription médicale de transport) est délivré par votre médecin. Il doit être établi avant le transport et préciser le mode de transport recommandé (ambulance, VSL ou taxi). Ce document est obligatoire pour le remboursement.",
      },
    },
    {
      "@type": "Question",
      name: "Quels transports sont remboursés par la Sécurité sociale ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sont remboursés les transports liés à une hospitalisation, aux soins dans un établissement de santé, aux consultations liées à une ALD, aux convocations médicales de la Sécurité sociale, et à certains examens médicaux prescrits.",
      },
    },
    {
      "@type": "Question",
      name: "Comment choisir entre ambulance, VSL et taxi ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Le choix dépend de votre état de santé. L'ambulance est pour les patients nécessitant une position allongée ou une surveillance. Le VSL est pour les patients autonomes assis. Le taxi conventionné est pour les patients totalement autonomes. Votre médecin indique le mode adapté sur la prescription.",
      },
    },
  ],
};

const transportTypes = [
  {
    icon: Ambulance,
    name: "Ambulance",
    description: "Pour les patients nécessitant une position allongée ou une surveillance médicale.",
    indications: ["Position allongée", "Oxygène", "Surveillance"],
    href: "/services/ambulance",
    color: "primary",
  },
  {
    icon: Car,
    name: "VSL",
    description: "Véhicule Sanitaire Léger pour les patients autonomes en position assise.",
    indications: ["Position assise", "Patient autonome", "Économique"],
    href: "/services/vsl",
    color: "success",
  },
  {
    icon: Car,
    name: "Taxi conventionné",
    description: "Pour les patients totalement autonomes, sans besoin d'assistance.",
    indications: ["Autonomie totale", "Sans aide", "Transport simple"],
    href: "#",
    color: "accent",
  },
];

const situations = [
  {
    title: "Hospitalisation",
    description: "Entrée, sortie ou transfert entre établissements",
    icon: Building2,
  },
  {
    title: "Consultations",
    description: "Rendez-vous médicaux réguliers",
    icon: Stethoscope,
  },
  {
    title: "Soins réguliers",
    description: "Dialyse, radiothérapie, chimiothérapie",
    icon: HeartPulse,
  },
  {
    title: "Examens",
    description: "Scanner, IRM, prises de sang",
    icon: FileText,
  },
];

const steps = [
  {
    number: 1,
    title: "Obtenez une prescription",
    description:
      "Demandez à votre médecin une prescription médicale de transport (bon de transport). Ce document est obligatoire pour le remboursement.",
  },
  {
    number: 2,
    title: "Réservez votre transport",
    description:
      "Utilisez Ambubook pour trouver un ambulancier près de chez vous. Indiquez le type de transport prescrit et vos dates de rendez-vous.",
  },
  {
    number: 3,
    title: "Le jour du transport",
    description:
      "L'ambulancier vient vous chercher à l'heure convenue. Présentez votre carte vitale et votre bon de transport.",
  },
  {
    number: 4,
    title: "Remboursement automatique",
    description:
      "Grâce au tiers payant, vous n'avancez pas les frais. Le remboursement est envoyé directement à l'ambulancier.",
  },
];

const coverage = [
  { situation: "Soins liés à une hospitalisation", rate: "100%", condition: "Entrée, sortie, transfert" },
  { situation: "Affection Longue Durée (ALD)", rate: "100%", condition: "Soins liés à l'ALD" },
  { situation: "Accident du travail", rate: "100%", condition: "Soins liés à l'accident" },
  { situation: "Grossesse (6e mois et après)", rate: "100%", condition: "Examens obligatoires" },
  { situation: "Soins courants", rate: "65%", condition: "Avec prescription médicale" },
];

export default function TransportMedicalPage() {
  return (
    <>
      <Script
        id="transport-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(transportSchema) }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="min-h-screen flex flex-col bg-neutral-50">
        <Header />

        <main className="flex-1 pt-24 lg:pt-28 pb-12">
          <Container>
            {/* Fil d'ariane */}
            <nav className="mb-6">
              <ol className="flex items-center gap-2 text-sm text-neutral-500">
                <li>
                  <Link href="/" className="hover:text-primary-600 transition-colors">Accueil</Link>
                </li>
                <li><ChevronIcon /></li>
                <li>
                  <Link href="/services" className="hover:text-primary-600 transition-colors">Services</Link>
                </li>
                <li><ChevronIcon /></li>
                <li className="text-neutral-900 font-medium">Transport médical</li>
              </ol>
            </nav>

            {/* En-tête */}
            <header className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-accent-100 rounded-xl">
                  <HeartPulse className="h-8 w-8 text-accent-600" />
                </div>
                <span className="px-3 py-1 bg-accent-50 text-accent-700 rounded-full text-sm font-medium">
                  Guide complet
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
                <span className="text-accent-600">Transport médical</span> : tout savoir
              </h1>
              <p className="text-lg text-neutral-600 max-w-3xl">
                Découvrez comment organiser votre transport sanitaire, obtenir votre bon de transport,
                et être remboursé par l&apos;Assurance Maladie. Guide pratique pour patients et familles.
              </p>
            </header>

            {/* Types de transport */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                Les différents types de transport médical
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {transportTypes.map((type) => {
                  const colors = {
                    primary: "border-t-primary-500 bg-primary-50 text-primary-600",
                    success: "border-t-success-500 bg-success-50 text-success-600",
                    accent: "border-t-accent-500 bg-accent-50 text-accent-600",
                  };
                  const [border, bg] = colors[type.color as keyof typeof colors].split(" ");

                  return (
                    <article
                      key={type.name}
                      className={`bg-white rounded-2xl border-t-4 ${border} border border-neutral-200 p-6`}
                    >
                      <div className={`inline-flex p-3 rounded-xl ${bg} mb-4`}>
                        <type.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-bold text-neutral-900 mb-2">{type.name}</h3>
                      <p className="text-neutral-600 text-sm mb-4">{type.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {type.indications.map((ind) => (
                          <span
                            key={ind}
                            className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded text-xs"
                          >
                            {ind}
                          </span>
                        ))}
                      </div>
                      {type.href !== "#" && (
                        <Link
                          href={type.href}
                          className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          En savoir plus
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>

            {/* Situations courantes */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                Quand utiliser un transport médical ?
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {situations.map((sit) => (
                  <div
                    key={sit.title}
                    className="bg-white rounded-xl border border-neutral-200 p-5"
                  >
                    <div className="inline-flex p-2 rounded-lg bg-primary-50 text-primary-600 mb-3">
                      <sit.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-neutral-900 mb-1">{sit.title}</h3>
                    <p className="text-sm text-neutral-600">{sit.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Étapes */}
            <section className="mb-16">
              <div className="bg-white rounded-2xl border border-neutral-200 p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-8 text-center">
                  Comment organiser votre transport ?
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {steps.map((step) => (
                    <div key={step.number} className="text-center">
                      <div className="w-12 h-12 mx-auto mb-4 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                        {step.number}
                      </div>
                      <h3 className="font-semibold text-neutral-900 mb-2">{step.title}</h3>
                      <p className="text-sm text-neutral-600">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Contenu principal */}
              <div className="lg:col-span-2 space-y-10">
                {/* Bon de transport */}
                <section className="bg-white rounded-2xl border border-neutral-200 p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-accent-600" />
                    Le bon de transport (prescription médicale)
                  </h2>
                  <div className="space-y-4 text-neutral-600">
                    <p>
                      Le <strong className="text-neutral-900">bon de transport</strong> (formulaire Cerfa S3138)
                      est une prescription médicale indispensable pour le remboursement de votre transport.
                    </p>
                    <div className="bg-accent-50 rounded-xl p-4">
                      <p className="font-semibold text-accent-900 mb-2">Le bon de transport doit indiquer :</p>
                      <ul className="space-y-1 text-accent-800">
                        <li>• Le mode de transport prescrit (ambulance, VSL, taxi...)</li>
                        <li>• Le motif médical du transport</li>
                        <li>• La date du rendez-vous médical</li>
                        <li>• L&apos;adresse de destination</li>
                      </ul>
                    </div>
                    <p>
                      <strong>Important :</strong> Le bon de transport doit être établi
                      <strong className="text-neutral-900"> avant le transport</strong>, sauf en cas d&apos;urgence.
                      Demandez-le à votre médecin traitant ou au médecin de l&apos;hôpital.
                    </p>
                  </div>
                </section>

                {/* Prise en charge */}
                <section className="bg-white rounded-2xl border border-neutral-200 p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                    <Euro className="h-5 w-5 text-accent-600" />
                    Prise en charge et remboursement
                  </h2>
                  <p className="text-neutral-600 mb-6">
                    Le taux de remboursement dépend de votre situation médicale :
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-500">
                            Situation
                          </th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-neutral-500">
                            Taux
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-500">
                            Condition
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {coverage.map((row) => (
                          <tr key={row.situation} className="border-b border-neutral-100">
                            <td className="py-3 px-4 text-sm text-neutral-700 font-medium">
                              {row.situation}
                            </td>
                            <td className="py-3 px-4 text-sm text-center">
                              <span className={`font-bold ${row.rate === "100%" ? "text-success-600" : "text-primary-600"}`}>
                                {row.rate}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-neutral-600">
                              {row.condition}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-4 text-sm text-neutral-500">
                    * La part non remboursée (ticket modérateur) peut être prise en charge par votre mutuelle.
                  </p>
                </section>

                {/* FAQ */}
                <section className="bg-white rounded-2xl border border-neutral-200 p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-neutral-900 mb-6">
                    Questions fréquentes
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-2">
                        Comment obtenir un bon de transport ?
                      </h3>
                      <p className="text-neutral-600">
                        Demandez à votre médecin (généraliste ou hospitalier) une prescription médicale
                        de transport. Il évaluera votre état de santé et indiquera le mode de transport
                        adapté sur le formulaire Cerfa S3138.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-2">
                        Puis-je choisir mon ambulancier ?
                      </h3>
                      <p className="text-neutral-600">
                        Oui, vous avez le libre choix de votre transporteur sanitaire.
                        Utilisez Ambubook pour comparer les ambulanciers de votre zone et réserver
                        celui qui vous convient.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-2">
                        Dois-je avancer les frais de transport ?
                      </h3>
                      <p className="text-neutral-600">
                        Non, la plupart des ambulanciers pratiquent le tiers payant. Vous n&apos;avez
                        rien à payer : le remboursement est versé directement au transporteur par
                        l&apos;Assurance Maladie.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-2">
                        Que faire en cas d&apos;urgence ?
                      </h3>
                      <p className="text-neutral-600">
                        En cas d&apos;urgence vitale, appelez le 15 (SAMU). Pour les urgences non vitales,
                        vous pouvez contacter directement un ambulancier. Le bon de transport peut être
                        établi après le transport dans ce cas.
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Sidebar */}
              <aside className="space-y-6">
                {/* CTA */}
                <div className="bg-linear-to-br from-accent-600 to-accent-700 rounded-2xl p-6 text-white">
                  <h3 className="font-bold text-lg mb-2">Besoin d&apos;un transport ?</h3>
                  <p className="text-accent-100 text-sm mb-4">
                    Trouvez un ambulancier et réservez votre transport en quelques clics.
                  </p>
                  <Link
                    href="/recherche"
                    className="inline-flex items-center gap-2 w-full justify-center px-4 py-3 bg-white text-accent-700 rounded-xl font-semibold hover:bg-accent-50 transition-colors"
                  >
                    Rechercher
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Rappels */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                  <h3 className="font-bold text-neutral-900 mb-4">Points essentiels</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-success-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-neutral-600">
                        Bon de transport obligatoire pour le remboursement
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-success-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-neutral-600">
                        Libre choix du transporteur
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-success-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-neutral-600">
                        Tiers payant : pas d&apos;avance de frais
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-success-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-neutral-600">
                        Jusqu&apos;à 100% de remboursement
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Numéros utiles */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                  <h3 className="font-bold text-neutral-900 mb-4">Numéros utiles</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">SAMU (urgences)</span>
                      <span className="font-bold text-primary-600">15</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Pompiers</span>
                      <span className="font-bold text-primary-600">18</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Urgences européen</span>
                      <span className="font-bold text-primary-600">112</span>
                    </li>
                  </ul>
                </div>

                {/* Autres services */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                  <h3 className="font-bold text-neutral-900 mb-4">Nos services</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        href="/services/ambulance"
                        className="flex items-center justify-between text-sm text-neutral-600 hover:text-primary-600 py-2"
                      >
                        Transport en ambulance
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/services/vsl"
                        className="flex items-center justify-between text-sm text-neutral-600 hover:text-primary-600 py-2"
                      >
                        Transport en VSL
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </li>
                  </ul>
                </div>
              </aside>
            </div>
          </Container>
        </main>

        <Footer />
      </div>
    </>
  );
}

function ChevronIcon() {
  return (
    <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
