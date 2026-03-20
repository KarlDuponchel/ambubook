import { Container } from "@/components/ui";
import { Search, CalendarCheck, CheckCircle2 } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Recherchez",
    description:
      "Entrez votre ville ou le nom de votre ambulancier pour trouver un transporteur disponible près de chez vous.",
    Icon: Search,
  },
  {
    step: "02",
    title: "Réservez",
    description:
      "Remplissez le formulaire avec vos informations : date, heure, adresses de départ et d'arrivée, type de transport.",
    Icon: CalendarCheck,
  },
  {
    step: "03",
    title: "Confirmé",
    description:
      "Recevez la confirmation par SMS et email. Suivez l'état de votre demande en temps réel jusqu'au jour J.",
    Icon: CheckCircle2,
  },
];

export function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="py-20 lg:py-28 bg-primary-900 overflow-hidden">
      {/* Ambient decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-700/20 rounded-full blur-3xl -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent-700/15 rounded-full blur-3xl translate-x-1/2" />
      </div>

      <Container className="relative">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block px-4 py-1.5 bg-white/10 text-primary-300 text-sm font-semibold rounded-full mb-4 tracking-wide">
            Simple et efficace
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Comment ça marche ?
          </h2>
          <p className="mt-4 text-lg text-primary-300/80">
            Réserver votre transport médical n&apos;a jamais été aussi simple.
            En 3 étapes, c&apos;est fait.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <div key={step.step} className="relative h-full">
              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[calc(50%+4rem)] right-0 h-px bg-linear-to-r from-primary-700 to-transparent z-0" />
              )}

              <div className="relative h-full flex flex-col bg-white/6 border border-white/10 backdrop-blur-sm rounded-2xl p-7 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
                {/* Step badge */}
                <div className="absolute -top-3 left-6 px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-full tracking-widest">
                  {step.step}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-primary-800/60 text-primary-300 flex items-center justify-center mb-5 group-hover:bg-primary-700/60 transition-colors">
                  <step.Icon className="w-6 h-6" strokeWidth={1.75} />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-primary-300/80 leading-relaxed text-sm flex-1">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
