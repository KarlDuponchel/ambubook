import Image from "next/image";
import { Container } from "@/components/ui";
import { ShieldCheck, Clock4, FileText } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Des professionnels certifiés",
    description:
      "Tous nos ambulanciers sont agréés et respectent les normes sanitaires en vigueur.",
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
      "Bon de transport, tiers payant... nous facilitons toutes vos démarches administratives.",
  },
];

export function Reassurance() {
  return (
    <section className="py-20 lg:py-28 bg-white overflow-hidden">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="relative order-2 lg:order-1">
            {/* Decorative background shape */}
            <div className="absolute -inset-4 bg-primary-50 rounded-3xl -z-10" />

            <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/atypix.jpg"
                alt="Équipe d'ambulanciers professionnels AmbuBook"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-primary-900/30 to-transparent" />
            </div>

            {/* Floating stat card */}
            <div className="absolute -bottom-5 -right-5 lg:-right-8 bg-white rounded-2xl shadow-xl border border-neutral-100 p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div>
                <div className="text-xl font-bold text-neutral-900 leading-none">4.8 / 5</div>
                <div className="text-xs text-neutral-500 mt-0.5">2 000+ avis patients</div>
              </div>
            </div>

            {/* Decorative blurs */}
            <div className="absolute -top-6 -left-6 w-20 h-20 bg-accent-200 rounded-full opacity-70 blur-2xl" />
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-5 tracking-wide">
              Pourquoi nous choisir
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight">
              Votre santé mérite{" "}
              <span className="text-primary-600">le meilleur</span> transport
            </h2>
            <p className="mt-4 text-lg text-neutral-600 leading-relaxed">
              Depuis notre création, nous mettons un point d&apos;honneur à connecter
              les patients avec des ambulanciers de confiance. Votre confort et
              votre sécurité sont notre priorité absolue.
            </p>

            {/* Features list */}
            <div className="mt-8 space-y-5">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4 group">
                  <div className="shrink-0 w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                    <feature.icon className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">{feature.title}</h3>
                    <p className="mt-0.5 text-neutral-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust indicators */}
            {/* <div className="mt-8 pt-7 border-t border-neutral-100 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {["EP", "ML", "JD", "AB"].map((initials, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-linear-to-br from-primary-400 to-primary-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-neutral-600 font-medium">
                  +500 ambulanciers partenaires
                </span>
              </div>
            </div> */}
          </div>
        </div>
      </Container>
    </section>
  );
}
