"use client";

import { Container, Accordion, FAQItem } from "../ui";
import { HelpCircle, MessageCircleQuestion } from "lucide-react";
import Script from "next/script";

const faqItems: FAQItem[] = [
  {
    question: "Qu'est-ce qu'un transport sanitaire et quand en ai-je besoin ?",
    answer: (
      <>
        <p>
          Un <strong>transport sanitaire</strong> est un service de transport médicalisé destiné
          aux personnes dont l&apos;état de santé nécessite un accompagnement adapté. Il existe deux types
          principaux :
        </p>
        <ul className="mt-3 space-y-2">
          <li>
            <strong>L&apos;ambulance</strong> : pour les patients allongés, sous surveillance médicale,
            ou nécessitant un équipement spécifique (oxygène, monitoring...)
          </li>
          <li>
            <strong>Le VSL (Véhicule Sanitaire Léger)</strong> : pour les patients pouvant voyager
            assis mais nécessitant une assistance
          </li>
        </ul>
        <p className="mt-3">
          Vous pouvez avoir besoin d&apos;un transport sanitaire pour vos rendez-vous médicaux,
          hospitalisations, séances de dialyse, radiothérapie, ou tout autre soin nécessitant
          un déplacement adapté à votre état de santé.
        </p>
      </>
    ),
  },
  {
    question: "Comment réserver un transport sanitaire sur Ambubook ?",
    answer: (
      <>
        <p>
          Réserver un transport sanitaire sur Ambubook est <strong>simple et rapide</strong> :
        </p>
        <ol className="mt-3 space-y-2 list-decimal list-inside">
          <li>
            <strong>Recherchez</strong> une société d&apos;ambulances près de chez vous en entrant
            votre ville ou code postal
          </li>
          <li>
            <strong>Sélectionnez</strong> l&apos;ambulancier de votre choix parmi les résultats
          </li>
          <li>
            <strong>Remplissez</strong> le formulaire de réservation avec vos informations
            (date, heure, adresses, type de transport)
          </li>
          <li>
            <strong>Validez</strong> votre demande - l&apos;ambulancier vous contactera pour confirmer
          </li>
        </ol>
        <p className="mt-3">
          Vous pouvez réserver <strong>24h/24</strong>, même sans créer de compte.
          Créez un compte pour suivre vos demandes et conserver votre historique.
        </p>
      </>
    ),
  },
  {
    question: "Le transport sanitaire est-il remboursé par la Sécurité sociale ?",
    answer: (
      <>
        <p>
          Oui, le transport sanitaire peut être <strong>pris en charge à 65%</strong> par
          l&apos;Assurance Maladie, et jusqu&apos;à <strong>100%</strong> dans certains cas :
        </p>
        <ul className="mt-3 space-y-2">
          <li>
            <strong>ALD (Affection Longue Durée)</strong> : prise en charge à 100% pour les
            transports liés à votre ALD
          </li>
          <li>
            <strong>Accident du travail</strong> : prise en charge intégrale
          </li>
          <li>
            <strong>Hospitalisation</strong> : selon votre situation et prescription
          </li>
        </ul>
        <p className="mt-3">
          Pour bénéficier du remboursement, vous devez disposer d&apos;une <strong>prescription
          médicale de transport</strong> (bon de transport) délivrée par votre médecin
          <em>avant</em> le transport. Pensez à la demander lors de votre consultation !
        </p>
      </>
    ),
  },
  {
    question: "Quelle est la différence entre une ambulance et un VSL ?",
    answer: (
      <>
        <p>
          Le choix entre ambulance et VSL dépend de votre <strong>état de santé</strong> et
          des <strong>recommandations médicales</strong> :
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="p-4 bg-primary-50 rounded-xl">
            <h4 className="font-semibold text-primary-700 mb-2">Ambulance</h4>
            <ul className="text-sm space-y-1">
              <li>Position allongée ou semi-assise</li>
              <li>Surveillance médicale continue</li>
              <li>Équipements médicaux (oxygène, monitoring)</li>
              <li>Deux ambulanciers à bord</li>
              <li>Urgences et transports médicalisés</li>
            </ul>
          </div>
          <div className="p-4 bg-success-50 rounded-xl">
            <h4 className="font-semibold text-success-700 mb-2">VSL</h4>
            <ul className="text-sm space-y-1">
              <li>Position assise uniquement</li>
              <li>Patient autonome ou peu dépendant</li>
              <li>Confort d&apos;un véhicule adapté</li>
              <li>Un ambulancier conducteur</li>
              <li>Consultations et soins réguliers</li>
            </ul>
          </div>
        </div>
        <p className="mt-4">
          Votre médecin indiquera sur la prescription le mode de transport adapté à votre situation.
        </p>
      </>
    ),
  },
  {
    question: "Puis-je être accompagné lors du transport ?",
    answer: (
      <>
        <p>
          <strong>Oui, dans la plupart des cas</strong>, vous pouvez être accompagné d&apos;un proche
          lors de votre transport sanitaire :
        </p>
        <ul className="mt-3 space-y-2">
          <li>
            <strong>En VSL</strong> : un accompagnant peut généralement prendre place à l&apos;avant
            du véhicule
          </li>
          <li>
            <strong>En ambulance</strong> : un accompagnant peut être présent selon l&apos;espace
            disponible et l&apos;état du patient
          </li>
          <li>
            <strong>Pour les enfants mineurs</strong> : la présence d&apos;un parent ou tuteur légal
            est souvent requise
          </li>
        </ul>
        <p className="mt-3">
          Lors de votre réservation sur Ambubook, <strong>indiquez simplement</strong> que vous
          souhaitez être accompagné. L&apos;ambulancier confirmera la possibilité et les modalités.
        </p>
      </>
    ),
  },
  {
    question: "Combien de temps à l'avance dois-je réserver ?",
    answer: (
      <>
        <p>
          Pour un transport sanitaire programmé, nous recommandons de réserver :
        </p>
        <ul className="mt-3 space-y-2">
          <li>
            <strong>48 à 72 heures à l&apos;avance</strong> : idéal pour garantir la disponibilité
            à l&apos;heure souhaitée
          </li>
          <li>
            <strong>24 heures minimum</strong> : délai raisonnable pour la plupart des transports
          </li>
          <li>
            <strong>Le jour même</strong> : possible selon les disponibilités, mais non garanti
          </li>
        </ul>
        <p className="mt-3">
          Pour les <strong>transports réguliers</strong> (dialyse, chimiothérapie...), vous pouvez
          organiser vos réservations à l&apos;avance avec votre ambulancier pour sécuriser vos créneaux.
        </p>
        <p className="mt-2 text-sm text-neutral-500">
          Note : En cas d&apos;urgence médicale, appelez le 15 (SAMU) ou le 112.
        </p>
      </>
    ),
  },
  {
    question: "Que dois-je préparer pour le jour du transport ?",
    answer: (
      <>
        <p>
          Pour que votre transport se déroule dans les meilleures conditions, pensez à préparer :
        </p>
        <ul className="mt-3 space-y-2">
          <li>
            <strong>Votre bon de transport</strong> (prescription médicale) si vous en avez un
          </li>
          <li>
            <strong>Votre carte Vitale</strong> et attestation de mutuelle
          </li>
          <li>
            <strong>Une pièce d&apos;identité</strong>
          </li>
          <li>
            <strong>Vos documents médicaux</strong> nécessaires au rendez-vous (ordonnances,
            résultats d&apos;examens...)
          </li>
          <li>
            <strong>Vos effets personnels</strong> (lunettes, appareil auditif, téléphone...)
          </li>
        </ul>
        <p className="mt-3">
          <strong>Soyez prêt(e) 10 minutes avant</strong> l&apos;heure convenue. L&apos;ambulancier
          vous appellera à son arrivée et vous aidera si nécessaire.
        </p>
      </>
    ),
  },
  {
    question: "Ambubook est-il gratuit pour les patients ?",
    answer: (
      <>
        <p>
          <strong>Oui, Ambubook est 100% gratuit</strong> pour les patients !
        </p>
        <ul className="mt-3 space-y-2">
          <li>Recherche d&apos;ambulanciers : <strong>gratuite</strong></li>
          <li>Réservation en ligne : <strong>gratuite</strong></li>
          <li>Création de compte : <strong>gratuite</strong></li>
          <li>Suivi de vos demandes : <strong>gratuit</strong></li>
        </ul>
        <p className="mt-3">
          Le coût du transport lui-même est défini par un <strong>tarif conventionné</strong>
          fixé par l&apos;Assurance Maladie, identique chez tous les ambulanciers agréés.
          Avec une prescription médicale, vous bénéficiez de la prise en charge par la Sécurité sociale.
        </p>
      </>
    ),
  },
];

// Schéma JSON-LD pour le SEO (FAQPage)
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: typeof item.answer === "string"
        ? item.answer
        : "Consultez notre site pour plus de détails.",
    },
  })),
};

export function AccordionSection() {
  return (
    <>
      {/* Schema.org FAQPage pour le SEO */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section
        id="faq"
        className="py-20 lg:py-28 bg-gradient-to-br from-white via-secondary-50/30 to-primary-50/20 overflow-hidden"
      >
        <Container>
          {/* Header */}
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
              <MessageCircleQuestion className="h-4 w-4" />
              Foire aux questions
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              Questions fréquentes
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Tout ce que vous devez savoir sur le transport sanitaire et la réservation
              d&apos;ambulances en ligne
            </p>
          </div>

          {/* Accordion */}
          <div className="max-w-3xl mx-auto">
            <Accordion items={faqItems} />
          </div>

          {/* CTA sous l'accordéon */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-neutral-200 shadow-sm">
              <HelpCircle className="h-6 w-6 text-primary-500" />
              <div className="text-left">
                <p className="text-sm text-neutral-500">Vous avez d&apos;autres questions ?</p>
                <p className="font-medium text-neutral-900">
                  Contactez directement l&apos;ambulancier de votre choix
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
