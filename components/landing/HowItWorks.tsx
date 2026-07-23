import { Container } from "@/components/ui";
import { Search, CalendarPlus, CheckCircle2 } from "lucide-react";

const steps = [
  {
    n: "1",
    title: "Recherchez",
    description:
      "Trouvez un ambulancier agréé près de chez vous, ou accédez directement au vôtre via son lien.",
    Icon: Search,
  },
  {
    n: "2",
    title: "Réservez",
    description:
      "Renseignez votre trajet, vos horaires et le type de transport en quelques clics.",
    Icon: CalendarPlus,
  },
  {
    n: "3",
    title: "Confirmé",
    description:
      "Recevez la confirmation par SMS et email, et suivez votre demande en temps réel — sans appel.",
    Icon: CheckCircle2,
  },
];

export function HowItWorks() {
  return (
    <section
      id="comment-ca-marche"
      className="py-16 lg:py-24 text-white"
      style={{ background: "linear-gradient(165deg, #0f2338, #0b1a2b)" }}
    >
      <Container>
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-teal">
            En 3 étapes
          </span>
          <h2 className="serif text-3xl lg:text-4xl text-white mt-3">
            Comment ça marche
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {steps.map((step) => (
            <div
              key={step.n}
              className="rounded-2xl p-7 border border-white/10 bg-white/5 backdrop-blur-sm hover:-translate-y-0.5 duration-300 transition-all hover:shadow-soft hover:bg-white/10"
            >
              <div className="flex items-center gap-3 mb-3.5">
                <span className="serif text-[34px] leading-none text-teal font-semibold">
                  {step.n}
                </span>
                <span className="grid place-items-center w-10.5 h-10.5 rounded-xl bg-white/10 text-white">
                  <step.Icon className="w-5.25 h-5.25" strokeWidth={2} />
                </span>
              </div>
              <h3 className="font-extrabold text-lg mb-1.5">{step.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
