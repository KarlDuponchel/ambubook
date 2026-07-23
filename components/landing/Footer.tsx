import Link from "next/link";
import { Container } from "@/components/ui";
import { Plus } from "lucide-react";

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

const socials = [
  {
    label: "Twitter",
    href: "https://twitter.com",
    path: "M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    path: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-line">
      <Container>
        <div className="py-12 lg:py-14">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
                <span className="grid place-items-center w-8 h-8 rounded-[9px] text-white" style={{ background: "linear-gradient(150deg, var(--brand), var(--teal))" }}>
                  <Plus className="w-[18px] h-[18px]" strokeWidth={2.5} />
                </span>
                <span className="text-xl font-extrabold tracking-tight text-ink">
                  Ambu<span className="serif italic font-semibold text-teal">Book</span>
                </span>
              </Link>
              <p className="text-sm text-ink-2 leading-relaxed max-w-[260px] mb-4">
                La réservation de transport sanitaire, simple et 100 % en ligne.
              </p>
              <div className="flex gap-2.5">
                {socials.map((s) => (
                  <Link
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-9 h-9 rounded-[10px] border border-line grid place-items-center text-ink-2 transition-colors hover:border-brand hover:text-brand"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d={s.path} />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.values(footerLinks).map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-ink mb-3.5">
                  {section.title}
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-ink-2 transition-colors hover:text-brand"
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
        <div className="py-5 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[13px] text-ink-3">
            &copy; {currentYear} AmbuBook. Tous droits réservés.
          </span>
          <span className="inline-flex items-center gap-2 text-[13px] font-bold text-vert">
            <span
              className="w-2 h-2 rounded-full bg-vert"
              style={{ boxShadow: "0 0 0 4px color-mix(in srgb, var(--vert) 22%, transparent)" }}
            />
            Disponible 24h/24, 7j/7
          </span>
        </div>
      </Container>
    </footer>
  );
}
