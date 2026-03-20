import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation - AmbuBook",
  description: "Conditions générales d'utilisation de la plateforme AmbuBook.",
  robots: "noindex, follow",
};

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>

      {/* Contenu */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">Conditions Générales d&apos;Utilisation</h1>

        <div className="prose prose-neutral max-w-none">
          {/* Préambule */}
          <section className="mb-10">
            <p className="text-neutral-700 leading-relaxed">
              Les présentes Conditions Générales d&apos;Utilisation (ci-après &quot;CGU&quot;) régissent l&apos;utilisation
              de la plateforme <strong>AmbuBook</strong>, accessible à l&apos;adresse{" "}
              <a href="https://ambubook.fr" className="text-neutral-900 underline hover:no-underline">ambubook.fr</a>.
            </p>
            <p className="text-neutral-700 leading-relaxed mt-4">
              En utilisant AmbuBook, vous acceptez sans réserve les présentes CGU.
            </p>
          </section>

          {/* Article 1 - Définitions */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Article 1 - Définitions</h2>
            <ul className="space-y-2 text-neutral-700">
              <li><strong>Plateforme</strong> : le site web AmbuBook et ses services associés</li>
              <li><strong>Utilisateur</strong> : toute personne utilisant la Plateforme</li>
              <li><strong>Patient</strong> : utilisateur cherchant à réserver un transport médical</li>
              <li><strong>Ambulancier</strong> : professionnel du transport sanitaire inscrit sur la Plateforme</li>
              <li><strong>Transport</strong> : service de transport médical (ambulance ou VSL)</li>
              <li><strong>Éditeur</strong> : Karl DUPONCHEL, exploitant de la Plateforme</li>
            </ul>
          </section>

          {/* Article 2 - Objet */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Article 2 - Objet de la Plateforme</h2>
            <p className="text-neutral-700 leading-relaxed">
              AmbuBook est une plateforme de mise en relation entre :
            </p>
            <ul className="mt-4 space-y-2 text-neutral-700 list-disc list-inside">
              <li>Les patients ayant besoin d&apos;un transport médical</li>
              <li>Les sociétés d&apos;ambulances et de VSL agréées</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed mt-4">
              <strong>Important :</strong> AmbuBook n&apos;est pas une société d&apos;ambulances. Nous facilitons
              uniquement la mise en relation. Le contrat de transport est conclu directement entre le
              patient et la société d&apos;ambulances.
            </p>
          </section>

          {/* Article 3 - Inscription */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Article 3 - Inscription et compte</h2>

            <h3 className="text-lg font-medium text-neutral-800 mt-6 mb-3">3.1 Inscription des patients</h3>
            <p className="text-neutral-700 leading-relaxed">
              L&apos;inscription est gratuite et ouverte à toute personne physique majeure. Vous devez fournir
              des informations exactes et les maintenir à jour.
            </p>

            <h3 className="text-lg font-medium text-neutral-800 mt-6 mb-3">3.2 Inscription des ambulanciers</h3>
            <p className="text-neutral-700 leading-relaxed">
              L&apos;inscription des professionnels est soumise à validation. Vous devez justifier :
            </p>
            <ul className="mt-2 space-y-1 text-neutral-700 list-disc list-inside">
              <li>D&apos;un numéro SIRET valide</li>
              <li>D&apos;un agrément ARS en cours de validité</li>
              <li>Des assurances professionnelles requises</li>
            </ul>

            <h3 className="text-lg font-medium text-neutral-800 mt-6 mb-3">3.3 Sécurité du compte</h3>
            <p className="text-neutral-700 leading-relaxed">
              Vous êtes responsable de la confidentialité de vos identifiants. En cas d&apos;utilisation
              non autorisée de votre compte, prévenez-nous immédiatement à contact@ambubook.fr.
            </p>
          </section>

          {/* Article 4 - Utilisation */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Article 4 - Utilisation de la Plateforme</h2>

            <h3 className="text-lg font-medium text-neutral-800 mt-6 mb-3">4.1 Engagements de l&apos;utilisateur</h3>
            <p className="text-neutral-700 leading-relaxed">
              En utilisant AmbuBook, vous vous engagez à :
            </p>
            <ul className="mt-2 space-y-1 text-neutral-700 list-disc list-inside">
              <li>Fournir des informations exactes et complètes</li>
              <li>Ne pas usurper l&apos;identité d&apos;un tiers</li>
              <li>Ne pas utiliser la Plateforme à des fins illicites</li>
              <li>Respecter les autres utilisateurs</li>
              <li>Ne pas tenter de contourner les mesures de sécurité</li>
            </ul>

            <h3 className="text-lg font-medium text-neutral-800 mt-6 mb-3">4.2 Engagements des ambulanciers</h3>
            <p className="text-neutral-700 leading-relaxed">
              Les professionnels s&apos;engagent également à :
            </p>
            <ul className="mt-2 space-y-1 text-neutral-700 list-disc list-inside">
              <li>Maintenir leurs agréments à jour</li>
              <li>Répondre aux demandes dans un délai raisonnable</li>
              <li>Honorer les transports acceptés</li>
              <li>Respecter la réglementation du transport sanitaire</li>
            </ul>
          </section>

          {/* Article 5 - Demandes de transport */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Article 5 - Demandes de transport</h2>

            <h3 className="text-lg font-medium text-neutral-800 mt-6 mb-3">5.1 Création d&apos;une demande</h3>
            <p className="text-neutral-700 leading-relaxed">
              Le patient peut créer une demande de transport en renseignant les informations nécessaires
              (dates, adresses, type de transport). La demande est transmise à l&apos;ambulancier choisi.
            </p>

            <h3 className="text-lg font-medium text-neutral-800 mt-6 mb-3">5.2 Réponse de l&apos;ambulancier</h3>
            <p className="text-neutral-700 leading-relaxed">
              L&apos;ambulancier peut accepter, refuser ou proposer un autre créneau. Le patient est notifié
              de la réponse par email et/ou SMS.
            </p>

            <h3 className="text-lg font-medium text-neutral-800 mt-6 mb-3">5.3 Annulation</h3>
            <p className="text-neutral-700 leading-relaxed">
              Le patient peut annuler une demande à tout moment avant le transport. Nous recommandons
              de prévenir l&apos;ambulancier dans les meilleurs délais.
            </p>
          </section>

          {/* Article 6 - Tarifs */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Article 6 - Tarifs et paiement</h2>
            <p className="text-neutral-700 leading-relaxed">
              L&apos;utilisation de la Plateforme est <strong>gratuite</strong> pour les patients.
            </p>
            <p className="text-neutral-700 leading-relaxed mt-4">
              Le prix du transport est fixé par la société d&apos;ambulances selon la réglementation en
              vigueur (tarifs conventionnés Sécurité sociale). Le paiement s&apos;effectue directement
              entre le patient et l&apos;ambulancier, en dehors de la Plateforme.
            </p>
            <p className="text-neutral-700 leading-relaxed mt-4">
              AmbuBook ne perçoit aucune commission sur les transports.
            </p>
          </section>

          {/* Article 7 - Responsabilité */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Article 7 - Responsabilité</h2>

            <h3 className="text-lg font-medium text-neutral-800 mt-6 mb-3">7.1 Rôle d&apos;AmbuBook</h3>
            <p className="text-neutral-700 leading-relaxed">
              AmbuBook agit uniquement comme intermédiaire technique. Nous ne sommes pas partie au
              contrat de transport et ne pouvons être tenus responsables :
            </p>
            <ul className="mt-2 space-y-1 text-neutral-700 list-disc list-inside">
              <li>De la qualité des services fournis par les ambulanciers</li>
              <li>Des retards ou annulations de transport</li>
              <li>Des litiges entre patients et ambulanciers</li>
              <li>Des dommages survenus lors du transport</li>
            </ul>

            <h3 className="text-lg font-medium text-neutral-800 mt-6 mb-3">7.2 Disponibilité</h3>
            <p className="text-neutral-700 leading-relaxed">
              Nous nous efforçons d&apos;assurer la disponibilité de la Plateforme 24h/24, mais ne pouvons
              garantir une absence totale d&apos;interruptions (maintenance, incidents techniques).
            </p>
          </section>

          {/* Article 8 - Données personnelles */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Article 8 - Données personnelles</h2>
            <p className="text-neutral-700 leading-relaxed">
              Le traitement de vos données personnelles est régi par notre{" "}
              <Link href="/politique-confidentialite" className="text-neutral-900 underline hover:no-underline">
                Politique de confidentialité
              </Link>.
            </p>
          </section>

          {/* Article 9 - Propriété intellectuelle */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Article 9 - Propriété intellectuelle</h2>
            <p className="text-neutral-700 leading-relaxed">
              L&apos;ensemble des éléments de la Plateforme (logo, textes, design, code source) sont protégés
              par le droit de la propriété intellectuelle et restent la propriété exclusive de l&apos;Éditeur.
            </p>
            <p className="text-neutral-700 leading-relaxed mt-4">
              Toute reproduction ou utilisation non autorisée est interdite.
            </p>
          </section>

          {/* Article 10 - Suppression de compte */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Article 10 - Suppression de compte</h2>
            <p className="text-neutral-700 leading-relaxed">
              Vous pouvez demander la suppression de votre compte à tout moment en nous contactant
              à <strong>contact@ambubook.fr</strong>.
            </p>
            <p className="text-neutral-700 leading-relaxed mt-4">
              La suppression entraîne l&apos;anonymisation de vos données personnelles. L&apos;historique des
              transports peut être conservé de manière anonyme pour des raisons légales.
            </p>
            <p className="text-neutral-700 leading-relaxed mt-4">
              Nous nous réservons le droit de suspendre ou supprimer un compte en cas de violation
              des présentes CGU.
            </p>
          </section>

          {/* Article 11 - Modification des CGU */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Article 11 - Modification des CGU</h2>
            <p className="text-neutral-700 leading-relaxed">
              Nous pouvons modifier les présentes CGU à tout moment. Les modifications prennent effet
              dès leur publication sur la Plateforme. En cas de modification substantielle, vous serez
              informé par email.
            </p>
            <p className="text-neutral-700 leading-relaxed mt-4">
              La poursuite de l&apos;utilisation de la Plateforme après modification vaut acceptation des
              nouvelles CGU.
            </p>
          </section>

          {/* Article 12 - Droit applicable */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Article 12 - Droit applicable et litiges</h2>
            <p className="text-neutral-700 leading-relaxed">
              Les présentes CGU sont régies par le droit français.
            </p>
            <p className="text-neutral-700 leading-relaxed mt-4">
              En cas de litige, nous vous invitons à nous contacter pour trouver une solution amiable.
              À défaut, les tribunaux français seront seuls compétents.
            </p>
            <p className="text-neutral-700 leading-relaxed mt-4">
              Conformément à l&apos;article L.612-1 du Code de la consommation, vous pouvez recourir
              gratuitement au service de médiation de la consommation.
            </p>
          </section>

          {/* Article 13 - Contact */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Article 13 - Contact</h2>
            <p className="text-neutral-700 leading-relaxed">
              Pour toute question concernant ces CGU :
            </p>
            <ul className="mt-4 space-y-2 text-neutral-700">
              <li><strong>Email :</strong> contact@ambubook.fr</li>
              <li><strong>Adresse :</strong> 15 rue Paul Cezanne, 76120 Le Grand-Quevilly</li>
            </ul>
          </section>

          {/* Date de mise à jour */}
          <div className="mt-12 pt-8 border-t border-neutral-200">
            <p className="text-sm text-neutral-500">
              Dernière mise à jour : 20 mars 2026
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
