import { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Car, ArrowRight, Check, AlertCircle, FileText, Euro, Clock, Users } from "lucide-react";
import { Container } from "@/components/ui";
import { Header, Footer } from "@/components/landing";

export const metadata: Metadata = {
  title: "Transport en VSL (Véhicule Sanitaire Léger) - Tarifs | Ambubook",
  description:
    "Tout savoir sur le VSL : indications, tarifs, remboursement Sécurité sociale. Le VSL est idéal pour les patients autonomes. Réservation en ligne.",
  keywords: [
    "VSL",
    "véhicule sanitaire léger",
    "transport VSL",
    "tarif VSL",
    "remboursement VSL",
    "transport assis",
    "transport médical",
  ],
  openGraph: {
    title: "Transport en VSL | Ambubook",
    description: "Tout savoir sur le VSL et la prise en charge Sécurité sociale.",
    url: "https://ambubook.fr/services/vsl",
    siteName: "Ambubook",
    type: "website",
    locale: "fr_FR",
  },
  alternates: {
    canonical: "https://ambubook.fr/services/vsl",
  },
};

const vslSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Transport en VSL",
  description: "Service de transport sanitaire en Véhicule Sanitaire Léger pour patients autonomes",
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
      name: "Qu'est-ce qu'un VSL ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Le VSL (Véhicule Sanitaire Léger) est un véhicule aménagé pour le transport assis de patients autonomes. Il est conduit par un ambulancier diplômé et peut accueillir jusqu'à 3 patients simultanément.",
      },
    },
    {
      "@type": "Question",
      name: "Quel est le tarif d'un VSL ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Le tarif d'un VSL comprend un forfait de prise en charge (environ 15€) plus un tarif kilométrique (environ 0,90€/km). C'est moins cher qu'une ambulance car il n'y a qu'un seul professionnel et le véhicule est plus léger.",
      },
    },
    {
      "@type": "Question",
      name: "Le VSL est-il remboursé ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, avec une prescription médicale de transport, le VSL est remboursé à 65% par l'Assurance Maladie. Le taux peut atteindre 100% pour les patients en ALD ou les transports liés à une hospitalisation.",
      },
    },
  ],
};

const indications = [
  "Patient autonome pouvant voyager assis",
  "Consultations médicales régulières",
  "Séances de dialyse",
  "Radiothérapie ou chimiothérapie",
  "Kinésithérapie, rééducation",
  "Examens médicaux (scanner, IRM...)",
];

const features = [
  { name: "Véhicule confortable", desc: "Climatisation, sièges ergonomiques" },
  { name: "Adaptation PMR", desc: "Certains VSL sont équipés pour les fauteuils roulants" },
  { name: "Transport partagé", desc: "Possibilité de covoiturage médical (jusqu'à 3 patients)" },
  { name: "Accompagnant", desc: "Un proche peut vous accompagner gratuitement" },
  { name: "Ponctualité", desc: "Respect des horaires de rendez-vous" },
  { name: "Aide à la marche", desc: "L'ambulancier vous accompagne jusqu'à l'accueil" },
];

const pricing = [
  { label: "Forfait prise en charge", value: "~15 €", note: "Forfait de base" },
  { label: "Tarif kilométrique", value: "~0,90 €/km", note: "À partir du lieu de prise en charge" },
  { label: "Majoration nuit/dimanche", value: "+50%", note: "De 20h à 8h et jours fériés" },
  { label: "Transport partagé", value: "-20%", note: "Réduction si covoiturage médical" },
];

const vsAmbulance = [
  { feature: "Position de voyage", vsl: "Assis", ambulance: "Allongé ou assis" },
  { feature: "Personnel", vsl: "1 ambulancier", ambulance: "2 ambulanciers" },
  { feature: "Équipement médical", vsl: "Non", ambulance: "Oui (oxygène, monitoring)" },
  { feature: "Surveillance médicale", vsl: "Non", ambulance: "Oui" },
  { feature: "Tarif", vsl: "Plus économique", ambulance: "Plus élevé" },
  { feature: "Covoiturage", vsl: "Possible (3 patients)", ambulance: "Non" },
];

export default function VSLPage() {
  return (
    <>
      <Script
        id="vsl-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(vslSchema) }}
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
                <li className="text-neutral-900 font-medium">VSL</li>
              </ol>
            </nav>

            {/* En-tête */}
            <header className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-success-100 rounded-xl">
                  <Car className="h-8 w-8 text-success-600" />
                </div>
                <span className="px-3 py-1 bg-success-50 text-success-700 rounded-full text-sm font-medium">
                  Transport assis
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
                Transport en <span className="text-success-600">VSL</span>
              </h1>
              <p className="text-lg text-neutral-600 max-w-3xl">
                Le VSL (Véhicule Sanitaire Léger) est la solution économique pour les patients
                autonomes pouvant voyager en position assise. Idéal pour vos consultations,
                examens et soins réguliers.
              </p>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Contenu principal */}
              <div className="lg:col-span-2 space-y-10">
                {/* Indications */}
                <section className="bg-white rounded-2xl border border-neutral-200 p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-success-600" />
                    Quand prendre un VSL ?
                  </h2>
                  <p className="text-neutral-600 mb-6">
                    Le transport en VSL est adapté aux situations suivantes :
                  </p>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {indications.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-success-600 shrink-0 mt-0.5" />
                        <span className="text-neutral-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Caractéristiques */}
                <section className="bg-white rounded-2xl border border-neutral-200 p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-neutral-900 mb-6">
                    Caractéristiques du VSL
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {features.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl"
                      >
                        <div className="w-2 h-2 rounded-full bg-success-500 mt-2 shrink-0" />
                        <div>
                          <p className="font-medium text-neutral-900">{item.name}</p>
                          <p className="text-sm text-neutral-600">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Comparaison */}
                <section className="bg-white rounded-2xl border border-neutral-200 p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-neutral-900 mb-6">
                    VSL vs Ambulance : quelle différence ?
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-500">
                            Critère
                          </th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-success-600">
                            VSL
                          </th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-primary-600">
                            Ambulance
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {vsAmbulance.map((row) => (
                          <tr key={row.feature} className="border-b border-neutral-100">
                            <td className="py-3 px-4 text-sm text-neutral-700 font-medium">
                              {row.feature}
                            </td>
                            <td className="py-3 px-4 text-sm text-neutral-600 text-center">
                              {row.vsl}
                            </td>
                            <td className="py-3 px-4 text-sm text-neutral-600 text-center">
                              {row.ambulance}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Tarifs */}
                <section className="bg-white rounded-2xl border border-neutral-200 p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                    <Euro className="h-5 w-5 text-success-600" />
                    Tarifs VSL
                  </h2>
                  <p className="text-neutral-600 mb-6">
                    Les tarifs des VSL sont conventionnés et plus économiques que l&apos;ambulance.
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
                        <p className="font-bold text-success-600">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-success-50 rounded-xl">
                    <p className="text-success-800 text-sm">
                      <strong>Bon à savoir :</strong> Le transport partagé (covoiturage médical)
                      permet de réduire le coût de 20% tout en restant remboursé par la Sécurité sociale.
                    </p>
                  </div>
                </section>

                {/* Prise en charge */}
                <section className="bg-white rounded-2xl border border-neutral-200 p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-success-600" />
                    Remboursement du VSL
                  </h2>
                  <div className="space-y-4 text-neutral-600">
                    <p>
                      Le VSL est remboursé dans les mêmes conditions que l&apos;ambulance,
                      avec une <strong className="text-neutral-900">prescription médicale de transport</strong>.
                    </p>
                    <div className="bg-success-50 rounded-xl p-4">
                      <p className="font-semibold text-success-900 mb-2">Taux de remboursement :</p>
                      <ul className="space-y-1 text-success-800">
                        <li>• <strong>65%</strong> pour les transports liés aux soins</li>
                        <li>• <strong>100%</strong> pour les ALD (Affection Longue Durée)</li>
                        <li>• <strong>100%</strong> pour les accidents du travail</li>
                        <li>• <strong>100%</strong> pour les hospitalisations</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* FAQ */}
                <section className="bg-white rounded-2xl border border-neutral-200 p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-neutral-900 mb-6">
                    Questions fréquentes sur le VSL
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-2">
                        Puis-je être accompagné dans un VSL ?
                      </h3>
                      <p className="text-neutral-600">
                        Oui, un accompagnant peut voyager gratuitement avec vous dans le VSL.
                        C&apos;est particulièrement utile pour les personnes âgées ou les patients
                        ayant besoin d&apos;aide administrative à l&apos;hôpital.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-2">
                        Le VSL peut-il transporter un fauteuil roulant ?
                      </h3>
                      <p className="text-neutral-600">
                        Certains VSL sont équipés pour transporter des patients en fauteuil roulant.
                        Précisez votre besoin lors de la réservation pour qu&apos;on vous attribue
                        un véhicule adapté.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-2">
                        Qu&apos;est-ce que le transport partagé ?
                      </h3>
                      <p className="text-neutral-600">
                        Le transport partagé (ou covoiturage médical) permet de transporter
                        jusqu&apos;à 3 patients dans le même VSL vers des destinations proches.
                        Cela réduit le coût de 20% et reste remboursé par l&apos;Assurance Maladie.
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Sidebar */}
              <aside className="space-y-6">
                {/* CTA */}
                <div className="bg-linear-to-br from-success-600 to-success-700 rounded-2xl p-6 text-white">
                  <h3 className="font-bold text-lg mb-2">Besoin d&apos;un VSL ?</h3>
                  <p className="text-success-100 text-sm mb-4">
                    Trouvez un ambulancier proposant le VSL près de chez vous.
                  </p>
                  <Link
                    href="/recherche"
                    className="inline-flex items-center gap-2 w-full justify-center px-4 py-3 bg-white text-success-700 rounded-xl font-semibold hover:bg-success-50 transition-colors"
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
                      <Clock className="h-5 w-5 text-success-600 shrink-0" />
                      <span className="text-sm text-neutral-600">Disponible 7j/7</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Car className="h-5 w-5 text-success-600 shrink-0" />
                      <span className="text-sm text-neutral-600">1 ambulancier diplômé</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-success-600 shrink-0" />
                      <span className="text-sm text-neutral-600">Jusqu&apos;à 3 patients</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Euro className="h-5 w-5 text-success-600 shrink-0" />
                      <span className="text-sm text-neutral-600">Plus économique que l&apos;ambulance</span>
                    </li>
                  </ul>
                </div>

                {/* Autres services */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                  <h3 className="font-bold text-neutral-900 mb-4">Autres services</h3>
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
