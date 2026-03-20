import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Mentions légales - AmbuBook",
  description: "Mentions légales du site AmbuBook, plateforme de réservation de transport médical.",
  robots: "noindex, follow",
};

export default function MentionsLegalesPage() {
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
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">Mentions légales</h1>

        <div className="prose prose-neutral max-w-none">
          {/* Éditeur */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">1. Éditeur du site</h2>
            <p className="text-neutral-700 leading-relaxed">
              Le site <strong>AmbuBook</strong> est édité par :
            </p>
            <ul className="mt-4 space-y-2 text-neutral-700">
              <li><strong>Raison sociale :</strong> Karl DUPONCHEL</li>
              <li><strong>Forme juridique :</strong> Micro entreprise</li>
              <li><strong>Siège social :</strong> 15 rue Paul Cezanne, 76120 Le Grand-Quevilly</li>
              <li><strong>SIRET :</strong> 99189937800012</li>
            </ul>
          </section>

          {/* Directeur de publication */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">2. Directeur de la publication</h2>
            <ul className="space-y-2 text-neutral-700">
              <li><strong>Nom :</strong> Karl DUPONCHEL</li>
              <li><strong>Qualité :</strong> Président</li>
              <li><strong>Email :</strong> contact@ambubook.fr</li>
            </ul>
          </section>

          {/* Hébergeur */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">3. Hébergement</h2>
            <p className="text-neutral-700 leading-relaxed">
              Le site est hébergé par :
            </p>
            <ul className="mt-4 space-y-2 text-neutral-700">
              <li><strong>Raison sociale :</strong> HOSTINGER INTERNATIONAL LTD</li>
              <li><strong>Adresse :</strong> 61 Lordou Vironos Street, 6023 Larnaca, Chypre</li>
              <li><strong>Site web :</strong> <a href="https://hostinger.com/" target="_blank" rel="noopener noreferrer" className="text-neutral-900 underline hover:no-underline">hostinger.com</a></li>
            </ul>
          </section>

          {/* Propriété intellectuelle */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">4. Propriété intellectuelle</h2>
            <p className="text-neutral-700 leading-relaxed">
              L&apos;ensemble des contenus présents sur le site AmbuBook (textes, images, logos, icônes,
              vidéos, sons, logiciels, bases de données, mise en page, etc.) sont protégés par le droit
              d&apos;auteur, le droit des marques et le droit des bases de données.
            </p>
            <p className="text-neutral-700 leading-relaxed mt-4">
              Toute reproduction, représentation, modification, publication, adaptation de tout ou partie
              des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf
              autorisation écrite préalable de l&apos;éditeur.
            </p>
          </section>

          {/* Données personnelles */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">5. Protection des données personnelles</h2>
            <p className="text-neutral-700 leading-relaxed">
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi
              Informatique et Libertés, vous disposez d&apos;un droit d&apos;accès, de rectification, de
              suppression et d&apos;opposition concernant vos données personnelles.
            </p>
            <p className="text-neutral-700 leading-relaxed mt-4">
              Pour exercer ces droits ou pour toute question relative à vos données personnelles,
              vous pouvez nous contacter :
            </p>
            <ul className="mt-4 space-y-2 text-neutral-700">
              <li><strong>Par email :</strong> contact@ambubook.fr</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed mt-4">
              Pour plus d&apos;informations, consultez notre{" "}
              <Link href="/politique-confidentialite" className="text-neutral-900 underline hover:no-underline">
                Politique de confidentialité
              </Link>.
            </p>
          </section>

          {/* Cookies */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">6. Cookies</h2>
            <p className="text-neutral-700 leading-relaxed">
              Le site AmbuBook utilise des cookies pour assurer son bon fonctionnement et améliorer
              l&apos;expérience utilisateur. Vous pouvez à tout moment modifier vos préférences en
              matière de cookies dans les paramètres de votre navigateur.
            </p>
            <p className="text-neutral-700 leading-relaxed mt-4">
              <strong>Cookies utilisés :</strong>
            </p>
            <ul className="mt-2 space-y-1 text-neutral-700 list-disc list-inside">
              <li>Cookies de session (authentification)</li>
              <li>Cookies de préférences (langue, thème)</li>
              <li>Cookies analytiques (mesure d&apos;audience) - optionnels</li>
            </ul>
          </section>

          {/* Responsabilité */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">7. Limitation de responsabilité</h2>
            <p className="text-neutral-700 leading-relaxed">
              L&apos;éditeur s&apos;efforce d&apos;assurer au mieux de ses possibilités l&apos;exactitude et la mise à
              jour des informations diffusées sur ce site. Toutefois, il ne peut garantir l&apos;exactitude,
              la précision ou l&apos;exhaustivité des informations mises à disposition.
            </p>
            <p className="text-neutral-700 leading-relaxed mt-4">
              AmbuBook est une plateforme de mise en relation entre patients et sociétés de transport
              médical. L&apos;éditeur ne peut être tenu responsable des services fournis par les entreprises
              de transport partenaires.
            </p>
          </section>

          {/* Liens hypertextes */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">8. Liens hypertextes</h2>
            <p className="text-neutral-700 leading-relaxed">
              Le site peut contenir des liens vers d&apos;autres sites internet. L&apos;éditeur n&apos;exerce aucun
              contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
            </p>
          </section>

          {/* Droit applicable */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">9. Droit applicable</h2>
            <p className="text-neutral-700 leading-relaxed">
              Les présentes mentions légales sont régies par le droit français. En cas de litige,
              les tribunaux français seront seuls compétents.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">10. Contact</h2>
            <p className="text-neutral-700 leading-relaxed">
              Pour toute question concernant ces mentions légales, vous pouvez nous contacter :
            </p>
            <ul className="mt-4 space-y-2 text-neutral-700">
              <li><strong>Email :</strong> contact@ambubook.fr</li>
            </ul>
          </section>

          {/* Date de mise à jour */}
          <div className="mt-12 pt-8 border-t border-neutral-200">
            <p className="text-sm text-neutral-500">
              Dernière mise à jour : 05/03/2026
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
