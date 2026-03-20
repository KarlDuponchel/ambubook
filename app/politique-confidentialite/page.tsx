import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Politique de confidentialité - AmbuBook",
  description: "Politique de confidentialité et protection des données personnelles d'AmbuBook.",
  robots: "noindex, follow",
};

export default function PolitiqueConfidentialitePage() {
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
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">Politique de confidentialité</h1>

        <div className="prose prose-neutral max-w-none">
          {/* Introduction */}
          <section className="mb-10">
            <p className="text-neutral-700 leading-relaxed">
              La présente politique de confidentialité décrit comment <strong>AmbuBook</strong> collecte,
              utilise et protège vos données personnelles conformément au Règlement Général sur la
              Protection des Données (RGPD) et à la loi Informatique et Libertés.
            </p>
          </section>

          {/* Responsable du traitement */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">1. Responsable du traitement</h2>
            <p className="text-neutral-700 leading-relaxed">
              Le responsable du traitement des données est :
            </p>
            <ul className="mt-4 space-y-2 text-neutral-700">
              <li><strong>Nom :</strong> Karl DUPONCHEL</li>
              <li><strong>Adresse :</strong> 15 rue Paul Cezanne, 76120 Le Grand-Quevilly</li>
              <li><strong>Email :</strong> contact@ambubook.fr</li>
            </ul>
          </section>

          {/* Données collectées */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">2. Données collectées</h2>
            <p className="text-neutral-700 leading-relaxed">
              Nous collectons les données suivantes :
            </p>

            <h3 className="text-lg font-medium text-neutral-800 mt-6 mb-3">Pour les patients</h3>
            <ul className="space-y-1 text-neutral-700 list-disc list-inside">
              <li>Nom et prénom</li>
              <li>Adresse email</li>
              <li>Numéro de téléphone</li>
              <li>Adresses de prise en charge et de destination</li>
              <li>Informations de mobilité (fauteuil roulant, brancard)</li>
              <li>Documents joints (bon de transport, ordonnance, carte vitale)</li>
            </ul>

            <h3 className="text-lg font-medium text-neutral-800 mt-6 mb-3">Pour les ambulanciers</h3>
            <ul className="space-y-1 text-neutral-700 list-disc list-inside">
              <li>Nom et prénom</li>
              <li>Adresse email professionnelle</li>
              <li>Numéro de téléphone</li>
              <li>Informations sur l&apos;entreprise (SIRET, agrément ARS)</li>
              <li>Logo et photos de l&apos;entreprise</li>
            </ul>

            <h3 className="text-lg font-medium text-neutral-800 mt-6 mb-3">Données techniques</h3>
            <ul className="space-y-1 text-neutral-700 list-disc list-inside">
              <li>Adresse IP</li>
              <li>Type de navigateur et appareil</li>
              <li>Pages consultées et actions effectuées</li>
              <li>Cookies de session</li>
            </ul>
          </section>

          {/* Finalités */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">3. Finalités du traitement</h2>
            <p className="text-neutral-700 leading-relaxed">
              Vos données sont utilisées pour :
            </p>
            <ul className="mt-4 space-y-2 text-neutral-700 list-disc list-inside">
              <li>Permettre la mise en relation entre patients et sociétés d&apos;ambulances</li>
              <li>Gérer les demandes de transport médical</li>
              <li>Envoyer des notifications (email, SMS) relatives à vos transports</li>
              <li>Assurer le bon fonctionnement et la sécurité de la plateforme</li>
              <li>Améliorer nos services et l&apos;expérience utilisateur</li>
              <li>Répondre à vos demandes de support</li>
              <li>Respecter nos obligations légales</li>
            </ul>
          </section>

          {/* Base légale */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">4. Base légale du traitement</h2>
            <p className="text-neutral-700 leading-relaxed">
              Le traitement de vos données repose sur :
            </p>
            <ul className="mt-4 space-y-2 text-neutral-700 list-disc list-inside">
              <li><strong>L&apos;exécution du contrat</strong> : pour fournir nos services de mise en relation</li>
              <li><strong>Le consentement</strong> : pour l&apos;envoi de communications marketing</li>
              <li><strong>L&apos;intérêt légitime</strong> : pour la sécurité et l&apos;amélioration de nos services</li>
              <li><strong>L&apos;obligation légale</strong> : pour la conservation des données de facturation</li>
            </ul>
          </section>

          {/* Durée de conservation */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">5. Durée de conservation</h2>
            <p className="text-neutral-700 leading-relaxed">
              Vos données sont conservées pendant les durées suivantes :
            </p>
            <ul className="mt-4 space-y-2 text-neutral-700 list-disc list-inside">
              <li><strong>Données de compte</strong> : pendant toute la durée de votre inscription, puis 3 ans après la dernière activité</li>
              <li><strong>Données de transport</strong> : 5 ans (obligations légales du secteur médical)</li>
              <li><strong>Logs de connexion</strong> : 1 an</li>
              <li><strong>Cookies</strong> : 13 mois maximum</li>
            </ul>
          </section>

          {/* Destinataires */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">6. Destinataires des données</h2>
            <p className="text-neutral-700 leading-relaxed">
              Vos données peuvent être partagées avec :
            </p>
            <ul className="mt-4 space-y-2 text-neutral-700 list-disc list-inside">
              <li>Les sociétés d&apos;ambulances auxquelles vous faites appel</li>
              <li>Nos sous-traitants techniques (hébergement, envoi d&apos;emails/SMS)</li>
              <li>Les autorités compétentes en cas d&apos;obligation légale</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed mt-4">
              Nous ne vendons jamais vos données personnelles à des tiers.
            </p>
          </section>

          {/* Sous-traitants */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">7. Sous-traitants</h2>
            <p className="text-neutral-700 leading-relaxed">
              Nous faisons appel aux sous-traitants suivants :
            </p>
            <ul className="mt-4 space-y-2 text-neutral-700 list-disc list-inside">
              <li><strong>Hostinger</strong> (Chypre) : hébergement de l&apos;application</li>
              <li><strong>Scaleway</strong> (France) : stockage des fichiers (S3)</li>
              <li><strong>Resend</strong> (USA) : envoi d&apos;emails transactionnels</li>
              <li><strong>Axeptio</strong> (France) : gestion du consentement cookies</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed mt-4">
              Ces sous-traitants sont soumis à des obligations contractuelles garantissant la protection de vos données.
            </p>
          </section>

          {/* Transferts hors UE */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">8. Transferts hors Union Européenne</h2>
            <p className="text-neutral-700 leading-relaxed">
              Certains de nos sous-traitants sont situés aux États-Unis. Ces transferts sont encadrés par
              les Clauses Contractuelles Types de la Commission Européenne ou par le Data Privacy Framework.
            </p>
          </section>

          {/* Droits */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">9. Vos droits</h2>
            <p className="text-neutral-700 leading-relaxed">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="mt-4 space-y-2 text-neutral-700 list-disc list-inside">
              <li><strong>Droit d&apos;accès</strong> : obtenir une copie de vos données</li>
              <li><strong>Droit de rectification</strong> : corriger vos données inexactes</li>
              <li><strong>Droit à l&apos;effacement</strong> : demander la suppression de vos données</li>
              <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
              <li><strong>Droit d&apos;opposition</strong> : vous opposer au traitement de vos données</li>
              <li><strong>Droit à la limitation</strong> : limiter le traitement de vos données</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed mt-4">
              Pour exercer ces droits, contactez-nous à : <strong>contact@ambubook.fr</strong>
            </p>
            <p className="text-neutral-700 leading-relaxed mt-4">
              Vous pouvez également exporter vos données depuis votre espace &quot;Mon compte&quot; ou
              nous contacter pour demander la suppression de votre compte.
            </p>
          </section>

          {/* Sécurité */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">10. Sécurité des données</h2>
            <p className="text-neutral-700 leading-relaxed">
              Nous mettons en oeuvre des mesures techniques et organisationnelles appropriées pour protéger
              vos données :
            </p>
            <ul className="mt-4 space-y-2 text-neutral-700 list-disc list-inside">
              <li>Chiffrement des communications (HTTPS/TLS)</li>
              <li>Hashage des mots de passe (bcrypt)</li>
              <li>Contrôle d&apos;accès strict aux données</li>
              <li>Surveillance et journalisation des accès</li>
              <li>Sauvegardes régulières</li>
            </ul>
          </section>

          {/* Cookies */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">11. Cookies</h2>
            <p className="text-neutral-700 leading-relaxed">
              Notre site utilise des cookies pour son fonctionnement. Vous pouvez gérer vos préférences
              via notre bandeau de consentement (Axeptio).
            </p>
            <h3 className="text-lg font-medium text-neutral-800 mt-6 mb-3">Cookies essentiels</h3>
            <p className="text-neutral-700 leading-relaxed">
              Nécessaires au fonctionnement du site (authentification, sécurité). Ne peuvent être désactivés.
            </p>
            <h3 className="text-lg font-medium text-neutral-800 mt-6 mb-3">Cookies analytiques</h3>
            <p className="text-neutral-700 leading-relaxed">
              Permettent de mesurer l&apos;audience et d&apos;améliorer nos services. Soumis à votre consentement.
            </p>
          </section>

          {/* Réclamation */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">12. Réclamation</h2>
            <p className="text-neutral-700 leading-relaxed">
              Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation
              auprès de la CNIL :
            </p>
            <ul className="mt-4 space-y-2 text-neutral-700">
              <li><strong>Site web :</strong> <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-neutral-900 underline hover:no-underline">www.cnil.fr</a></li>
              <li><strong>Adresse :</strong> 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07</li>
            </ul>
          </section>

          {/* Modifications */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">13. Modifications</h2>
            <p className="text-neutral-700 leading-relaxed">
              Nous pouvons mettre à jour cette politique de confidentialité. En cas de modification
              substantielle, vous serez informé par email ou via une notification sur le site.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">14. Contact</h2>
            <p className="text-neutral-700 leading-relaxed">
              Pour toute question concernant cette politique ou vos données personnelles :
            </p>
            <ul className="mt-4 space-y-2 text-neutral-700">
              <li><strong>Email :</strong> contact@ambubook.fr</li>
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
