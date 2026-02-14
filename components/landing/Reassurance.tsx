import Image from "next/image";
import { Container } from "@/components/ui";

const features = [
  {
    title: "Des professionnels certifiés",
    description:
      "Tous nos ambulanciers sont agréés et respectent les normes sanitaires en vigueur.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
  {
    title: "Disponibilité 7j/7",
    description:
      "Nos partenaires sont disponibles tous les jours pour répondre à vos besoins de transport.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    title: "Prise en charge simplifiée",
    description:
      "Bon de transport, tiers payant... nous facilitons toutes vos démarches administratives.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
];

export function Reassurance() {
  return (
    <section className="py-20 lg:py-28 bg-linear-to-br from-white to-secondary-50 overflow-hidden">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/atypix.jpg"
                alt="Équipe d'ambulanciers professionnels"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-linear-to-t from-secondary-900/20 to-transparent" />
            </div>

            {/* Floating card */}
            <div className="absolute -bottom-6 -right-6 lg:-right-8 bg-white rounded-xl shadow-xl p-4 max-w-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-secondary-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-900">98%</div>
                  <div className="text-sm text-neutral-500">Satisfaction</div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-accent-200 rounded-full opacity-60 blur-2xl" />
            <div className="absolute -bottom-8 left-1/4 w-32 h-32 bg-secondary-200 rounded-full opacity-50 blur-2xl" />
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <span className="inline-block px-4 py-1.5 bg-secondary-100 text-secondary-700 text-sm font-medium rounded-full mb-4">
              Pourquoi nous choisir
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight">
              Votre santé mérite{" "}
              <span className="text-secondary-600">le meilleur</span> transport
            </h2>
            <p className="mt-4 text-lg text-neutral-600 leading-relaxed">
              Depuis notre création, nous mettons un point d&apos;honneur à connecter
              les patients avec des ambulanciers de confiance. Votre confort et
              votre sécurité sont notre priorité absolue.
            </p>

            {/* Features list */}
            <div className="mt-8 space-y-6">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-linear-to-br from-secondary-100 to-accent-100 text-secondary-600 flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-neutral-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust indicators */}
            <div className="mt-10 pt-8 border-t border-neutral-200">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-linear-to-br from-secondary-400 to-accent-400 border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-neutral-600">
                    +500 ambulanciers partenaires
                  </span>
                </div>
                <div className="flex items-center gap-2 text-secondary-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-medium">4.8/5 sur 2 000+ avis</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
