import { Container } from "@/components/ui";

const steps = [
  {
    step: "01",
    title: "Recherchez",
    description:
      "Entrez votre ville ou le nom de votre ambulancier pour trouver un transporteur disponible près de chez vous.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
  },
  {
    step: "02",
    title: "Réservez",
    description:
      "Remplissez le formulaire avec vos informations : date, heure, adresses de départ et d'arrivée, type de transport.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Confirmez",
    description:
      "Recevez la confirmation par SMS et email. Suivez l'état de votre demande en temps réel jusqu'au jour J.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="bg-neutral-50">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-medium rounded-full mb-4">
            Simple et efficace
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">
            Comment ça marche ?
          </h2>
          <p className="mt-4 text-lg text-neutral-600">
            Réserver votre transport médical n&apos;a jamais été aussi simple.
            En 3 étapes, c&apos;est fait.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={step.step} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary-200 to-primary-100" />
              )}

              <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-neutral-100 hover:shadow-md hover:border-primary-100 transition-all duration-300">
                {/* Step number */}
                <div className="absolute -top-4 left-8 px-3 py-1 bg-primary-600 text-white text-sm font-bold rounded-full">
                  {step.step}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600 flex items-center justify-center mb-6">
                  {step.icon}
                </div>

                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
