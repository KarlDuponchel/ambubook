import Image from "next/image";
import { Container } from "@/components/ui";
import { ShieldCheck, Clock4, FileText, Star } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Des professionnels certifiés",
    description:
      "Tous nos ambulanciers sont agréés ARS et respectent les normes sanitaires en vigueur.",
  },
  {
    icon: Clock4,
    title: "Disponibilité 7j/7",
    description:
      "Nos partenaires sont disponibles tous les jours pour répondre à vos besoins de transport.",
  },
  {
    icon: FileText,
    title: "Prise en charge simplifiée",
    description:
      "Bon de transport, tiers payant… nous facilitons toutes vos démarches administratives.",
  },
];

export function Reassurance() {
  return (
    <section className="py-16 lg:py-24 bg-surface border-t border-line overflow-hidden">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden border border-line">
              <Image
                src="/atypix.jpg"
                alt="Équipe d'ambulanciers professionnels AmbuBook"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Floating stat card */}
            <div className="absolute bottom-4 left-4 bg-surface border border-line rounded-2xl px-4 py-3 shadow-soft flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-ink leading-none">
                  4,8<span className="text-sm text-ink-3">/5</span>
                </span>
                <span className="flex gap-0.5 mt-1" style={{ color: "var(--ambre)" }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" strokeWidth={0} />
                  ))}
                </span>
              </div>
              <span className="text-xs text-ink-2 leading-tight max-w-[120px]">
                Note moyenne des patients
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2 min-w-0">
            <div className="text-center">
              <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-teal">
                Pourquoi nous choisir
              </span>
              <h2 className="serif text-3xl lg:text-[34px] text-ink mt-3 mb-4 leading-tight">
                La sérénité d&apos;un service pensé pour les patients
              </h2>
              <p className="text-ink-2 text-base leading-relaxed mb-8">
                Depuis notre création, nous connectons les patients avec des ambulanciers
                de confiance. Votre confort et votre sécurité sont notre priorité.
              </p>
            </div>
            {/* Arguments : carrousel horizontal sur mobile, liste verticale sur desktop */}
            <div className="flex lg:flex-col gap-4 lg:gap-5 overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none -mx-4 px-4 lg:mx-0 lg:px-0 scroll-pl-4 lg:scroll-pl-0 pb-3 lg:pb-0 carousel-scrollbar">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex flex-col lg:flex-row gap-3.5 lg:items-start shrink-0 lg:shrink w-[78%] sm:w-[45%] lg:w-auto snap-start bg-surface lg:bg-transparent border lg:border-0 border-line rounded-2xl lg:rounded-none p-5 lg:p-0"
                >
                  <span
                    className="shrink-0 grid place-items-center w-[42px] h-[42px] rounded-xl text-brand"
                    style={{ background: "color-mix(in srgb, var(--brand) 12%, var(--surface))" }}
                  >
                    <feature.icon className="w-5 h-5" strokeWidth={2} />
                  </span>
                  <div>
                    <h3 className="font-bold text-ink text-base">{feature.title}</h3>
                    <p className="text-ink-2 text-sm leading-relaxed mt-0.5">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
