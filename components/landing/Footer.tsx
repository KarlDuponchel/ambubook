import Link from "next/link";
import { Container } from "@/components/ui";

const footerLinks = {
  services: {
    title: "Services",
    links: [
      { label: "Transport en ambulance", href: "/services/ambulance" },
      { label: "Transport en VSL", href: "/services/vsl" },
      { label: "Transport médical", href: "/services/transport-medical" },
      { label: "Tous les services", href: "/services" },
    ],
  },
  patients: {
    title: "Patients",
    links: [
      { label: "Rechercher un ambulancier", href: "/recherche" },
      { label: "Comment ça marche", href: "/#comment-ca-marche" },
      { label: "FAQ", href: "/#faq" },
      { label: "Créer un compte", href: "/inscription" },
    ],
  },
  professionnels: {
    title: "Professionnels",
    links: [
      { label: "Créer un compte pro", href: "/dashboard/inscription" },
      { label: "Se connecter", href: "/dashboard/connexion" },
      { label: "Tableau de bord", href: "/dashboard" },
    ],
  },
  legal: {
    title: "Informations",
    links: [
      { label: "Mentions légales", href: "/mentions-legales" },
      { label: "CGU", href: "/cgu" },
      { label: "Confidentialité", href: "/politique-confidentialite" },
      { label: "Plan du site", href: "/plan-du-site" },
    ],
  },
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-950 text-neutral-400">
      {/* Top accent line */}
      <div className="h-px bg-linear-to-r from-transparent via-primary-700/60 to-transparent" />

      <Container>
        <div className="py-14 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
                <div className="w-9 h-9 bg-linear-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-900/50 group-hover:shadow-primary-700/40 transition-shadow">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">
                  Ambu<span className="text-primary-400">Book</span>
                </span>
              </Link>
              <p className="text-sm text-neutral-500 leading-relaxed max-w-48">
                La solution simple pour réserver votre transport médical en ligne.
              </p>

              {/* Social */}
              <div className="mt-5 flex items-center gap-3">
                <Link
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/15 rounded-lg flex items-center justify-center text-neutral-500 hover:text-white transition-all"
                  aria-label="Twitter"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Link>
                <Link
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/15 rounded-lg flex items-center justify-center text-neutral-500 hover:text-white transition-all"
                  aria-label="LinkedIn"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Links */}
            {Object.values(footerLinks).map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-neutral-500 hover:text-neutral-200 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="py-5 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-neutral-600">
            &copy; {currentYear} AmbuBook. Tous droits réservés.
          </p>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            <span className="text-xs text-neutral-600">Disponible 24h/24, 7j/7</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
