import Link from "next/link";
import { Container } from "@/components/ui";
import {
  BriefcaseMedical,
  LayoutDashboard,
  BellRing,
  FolderCheck,
  PhoneOff,
} from "lucide-react";

const benefits = [
  {
    icon: LayoutDashboard,
    title: "Tableau de bord simple",
    desc: "Toutes vos demandes au même endroit.",
  },
  {
    icon: BellRing,
    title: "Notifications automatiques",
    desc: "Vos patients informés en temps réel.",
  },
  {
    icon: FolderCheck,
    title: "Gestion des documents",
    desc: "Bons de transport et pièces centralisés.",
  },
  {
    icon: PhoneOff,
    title: "Moins d'appels",
    desc: "Fini le téléphone qui sonne sans arrêt.",
  },
];

export function CTAPro() {
  return (
    <section id="professionnels" className="pt-4 pb-16 lg:pb-24 bg-page">
      <Container>
        <div
          className="rounded-3xl p-8 lg:p-12 text-white grid lg:grid-cols-2 gap-10 items-center"
          style={{ background: "linear-gradient(155deg, var(--brand), var(--brand-ink) 65%, #12355f)" }}
        >
          {/* Content */}
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold rounded-full px-3 py-1.5 border border-white/20 bg-white/10">
              <BriefcaseMedical className="w-3.5 h-3.5" strokeWidth={2} />
              Espace professionnel
            </span>
            <h2 className="serif text-3xl lg:text-[34px] leading-tight mt-4 mb-3">
              Vous êtes ambulancier ou taxi conventionné ?
            </h2>
            <p className="text-white/80 text-base leading-relaxed mb-6">
              Recevez des demandes de transport qualifiées et gérez votre activité,
              sans les appels à répétition.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard/inscription"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-white text-brand-ink font-extrabold text-[15px] rounded-xl transition-colors hover:bg-white/90"
              >
                Créer mon espace gratuit
              </Link>
              <Link
                href="/dashboard/connexion"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-white/10 text-white font-bold text-[15px] rounded-xl border border-white/25 transition-colors hover:bg-white/20"
              >
                Se connecter
              </Link>
            </div>
          </div>

          {/* Benefits grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl p-4.5 border border-white/15 bg-white/8 hover:-translate-y-0.5 duration-300 transition-all hover:bg-white/10 hover:shadow-soft"
              >
                <b.icon className="w-6 h-6 text-teal" strokeWidth={2} />
                <div className="font-bold text-[15px] mt-2.5 mb-1">{b.title}</div>
                <div className="text-white/70 text-[13px] leading-snug">{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
