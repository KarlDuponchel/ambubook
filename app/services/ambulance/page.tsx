import { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Ambulance, ArrowRight, Check, AlertCircle, FileText, Euro, Clock } from "lucide-react";
import { Container } from "@/components/ui";
import { Header, Footer } from "@/components/landing";

export const metadata: Metadata = {
  title: "Transport en ambulance - Tarifs, prise en charge | Ambubook",
  description:
    "Tout savoir sur le transport en ambulance : indications, équipements, tarifs, remboursement Sécurité sociale. Réservez une ambulance en ligne 24h/24.",
  keywords: [
    "ambulance",
    "transport ambulance",
    "ambulance médicalisée",
    "tarif ambulance",
    "remboursement ambulance",
    "prescription médicale ambulance",
    "bon de transport",
  ],
  openGraph: {
    title: "Transport en ambulance | Ambubook",
    description: "Tout savoir sur le transport en ambulance et la prise en charge.",
    url: "https://ambubook.fr/services/ambulance",
    siteName: "Ambubook",
    type: "website",
    locale: "fr_FR",
  },
  alternates: {
    canonical: "https://ambubook.fr/services/ambulance",
  },
};

const ambulanceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Transport en ambulance",
  description: "Service de transport sanitaire en ambulance avec surveillance médicale",
  provider: {
    "@type": "Organization",
    name: "Ambubook",
    url: "https://ambubook.fr",
  },
  serviceType: "Transport sanitaire",
  areaServed: {
    "@type": "Country",
    name: "France",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Quand faut-il prendre une ambulance plutôt qu'un VSL ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "L'ambulance est nécessaire si vous devez voyager en position allongée, si vous avez besoin d'oxygène ou d'une surveillance médicale, ou si votre état de santé ne permet pas de voyager assis.",
      },
    },
    {
      "@type": "Question",
      name: "Quel est le tarif d'un transport en ambulance ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Le tarif d'une ambulance comprend un forfait de prise en charge (environ 60€) plus un tarif kilométrique (environ 2,30€/km). Ces tarifs sont conventionnés et remboursés par l'Assurance Maladie avec une prescription.",
      },
    },
    {
      "@type": "Question",
      name: "L'ambulance est-elle remboursée par la Sécurité sociale ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, avec une prescription médicale de transport, l'ambulance est remboursée à 65% par l'Assurance Maladie. Le remboursement peut atteindre 100% pour les patients en ALD, les femmes enceintes (à partir du 6e mois), ou les accidents du travail.",
      },
    },
  ],
};

const indications = [
  "Position allongée ou semi-assise obligatoire",
  "Surveillance médicale nécessaire pendant le transport",
  "Besoin d'oxygénothérapie ou d'appareillage",
  "Risque d'aggravation de l'état de santé",
  "Transport de patient en fin de vie",
  "Déficience motrice importante (brancard)",
];

const equipment = [
  { name: "Brancard", desc: "Pour les patients ne pouvant pas s'asseoir" },
  { name: "Oxygène", desc: "Bouteilles et matériel d'oxygénothérapie" },
  { name: "Monitoring", desc: "Surveillance des constantes vitales" },
  { name: "Défibrillateur", desc: "DSA pour les urgences cardiaques" },
  { name: "Matériel d'aspiration", desc: "Pour les voies aériennes" },
  { name: "Matériel d'immobilisation", desc: "Attelles, colliers cervicaux" },
];

const pricing = [
  { label: "Forfait prise en charge", value: "~60 €", note: "Forfait de base" },
  { label: "Tarif kilométrique", value: "~2,30 €/km", note: "À partir du lieu de prise en charge" },
  { label: "Majoration nuit/dimanche", value: "+50%", note: "De 20h à 8h et jours fériés" },
  { label: "Majoration péage", value: "Variable", note: "Selon le trajet" },
];

export default function AmbulancePage() {
  return (
    <>
      <Script
        id="ambulance-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ambulanceSchema) }}
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
                <li className="text-neutral-900 font-medium">Ambulance</li>
              </ol>
            </nav>

            {/* En-tête */}
            <header className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary-100 rounded-xl">
                  <Ambulance className="h-8 w-8 text-primary-600" />
                </div>
                <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                  Transport sanitaire
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
                Transport en <span className="text-primary-600">ambulance</span>
              </h1>
              <p className="text-lg text-neutral-600 max-w-3xl">
                L&apos;ambulance est un véhicule sanitaire agréé permettant le transport de patients
                nécessitant une position allongée ou une surveillance médicale. Deux ambulanciers
                diplômés (DEA) sont présents à bord.
              </p>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Contenu principal */}
              <div className="lg:col-span-2 space-y-10">
                {/* Indications */}
                <section className="bg-white rounded-2xl border border-neutral-200 p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary-600" />
                    Quand prendre une ambulance ?
                  </h2>
                  <p className="text-neutral-600 mb-6">
                    Le transport en ambulance est indiqué dans les situations suivantes :
                  </p>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {indications.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />
                        <span className="text-neutral-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Équipements */}
                <section className="bg-white rounded-2xl border border-neutral-200 p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-neutral-900 mb-6">
                    Équipements à bord
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {equipment.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl"
                      >
                        <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 shrink-0" />
                        <div>
                          <p className="font-medium text-neutral-900">{item.name}</p>
                          <p className="text-sm text-neutral-600">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Tarifs */}
                <section className="bg-white rounded-2xl border border-neutral-200 p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                    <Euro className="h-5 w-5 text-primary-600" />
                    Tarifs indicatifs
                  </h2>
                  <p className="text-neutral-600 mb-6">
                    Les tarifs des ambulances sont réglementés et fixés par convention avec l&apos;Assurance Maladie.
                  </p>
                  <div className="space-y-3">
                    {pricing.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl"
                      >
                        <div>
                          <p className="font-medium text-neutral-900">{item.label}</p>
                          <p className="text-sm text-neutral-500">{item.note}</p>
                        </div>
                        <p className="font-bold text-primary-600">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-neutral-500">
                    * Tarifs conventionnels 2024. Les prix peuvent varier selon les départements et les majorations applicables.
                  </p>
                </section>

                {/* Prise en charge */}
                <section className="bg-white rounded-2xl border border-neutral-200 p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary-600" />
                    Prise en charge et remboursement
                  </h2>
                  <div className="space-y-4 text-neutral-600">
                    <p>
                      Pour être remboursé par l&apos;Assurance Maladie, vous devez disposer d&apos;une
                      <strong className="text-neutral-900"> prescription médicale de transport</strong> (bon de transport)
                      établie par votre médecin avant le transport.
                    </p>
                    <div className="bg-primary-50 rounded-xl p-4">
                      <p className="font-semibold text-primary-900 mb-2">Taux de remboursement :</p>
                      <ul className="space-y-1 text-primary-800">
                        <li>• <strong>65%</strong> pour les transports liés aux soins</li>
                        <li>• <strong>100%</strong> pour les ALD (Affection Longue Durée)</li>
                        <li>• <strong>100%</strong> pour les accidents du travail</li>
                        <li>• <strong>100%</strong> pour les femmes enceintes (6e mois et après)</li>
                      </ul>
                    </div>
                    <p>
                      La part non remboursée (ticket modérateur) peut être prise en charge par votre mutuelle.
                      De nombreux ambulanciers pratiquent le tiers payant.
                    </p>
                  </div>
                </section>

                {/* FAQ */}
                <section className="bg-white rounded-2xl border border-neutral-200 p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-neutral-900 mb-6">
                    Questions fréquentes
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-2">
                        Quand faut-il prendre une ambulance plutôt qu&apos;un VSL ?
                      </h3>
                      <p className="text-neutral-600">
                        L&apos;ambulance est nécessaire si vous devez voyager en position allongée,
                        si vous avez besoin d&apos;oxygène ou d&apos;une surveillance médicale,
                        ou si votre état de santé ne permet pas de voyager assis.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-2">
                        Puis-je être accompagné dans l&apos;ambulance ?
                      </h3>
                      <p className="text-neutral-600">
                        Oui, un accompagnant peut généralement voyager à l&apos;avant du véhicule,
                        sauf si l&apos;état du patient nécessite la présence des deux ambulanciers
                        à l&apos;arrière.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-2">
                        Comment obtenir un bon de transport pour l&apos;ambulance ?
                      </h3>
                      <p className="text-neutral-600">
                        Demandez à votre médecin (généraliste ou hospitalier) de vous établir
                        une prescription médicale de transport (cerfa S3138). Ce document est
                        obligatoire pour le remboursement.
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Sidebar */}
              <aside className="space-y-6">
                {/* CTA */}
                <div className="bg-linear-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
                  <h3 className="font-bold text-lg mb-2">Besoin d&apos;une ambulance ?</h3>
                  <p className="text-primary-100 text-sm mb-4">
                    Trouvez un ambulancier près de chez vous et réservez en quelques clics.
                  </p>
                  <Link
                    href="/recherche"
                    className="inline-flex items-center gap-2 w-full justify-center px-4 py-3 bg-white text-primary-700 rounded-xl font-semibold hover:bg-primary-50 transition-colors"
                  >
                    Rechercher
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Infos rapides */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                  <h3 className="font-bold text-neutral-900 mb-4">En bref</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary-600 shrink-0" />
                      <span className="text-sm text-neutral-600">Disponible 24h/24, 7j/7</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Ambulance className="h-5 w-5 text-primary-600 shrink-0" />
                      <span className="text-sm text-neutral-600">2 ambulanciers diplômés (DEA)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Euro className="h-5 w-5 text-primary-600 shrink-0" />
                      <span className="text-sm text-neutral-600">Remboursé jusqu&apos;à 100%</span>
                    </li>
                  </ul>
                </div>

                {/* Autres services */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                  <h3 className="font-bold text-neutral-900 mb-4">Autres services</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        href="/services/vsl"
                        className="flex items-center justify-between text-sm text-neutral-600 hover:text-primary-600 py-2"
                      >
                        Transport en VSL
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/services/transport-medical"
                        className="flex items-center justify-between text-sm text-neutral-600 hover:text-primary-600 py-2"
                      >
                        Transport médical
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
