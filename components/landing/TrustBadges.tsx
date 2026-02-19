import { Container } from "@/components/ui";
import { Zap, Shield, CheckCircle, PhoneOff } from "lucide-react";

const badges = [
  {
    icon: Zap,
    title: "Rapide",
    description: "Réservation en moins de 2 minutes",
  },
  {
    icon: Shield,
    title: "Sécurisé",
    description: "Vos données de santé sont protégées",
  },
  {
    icon: CheckCircle,
    title: "Confirmé",
    description: "Notification SMS et email immédiate",
  },
  {
    icon: PhoneOff,
    title: "Sans appel",
    description: "Plus besoin de téléphoner",
  },
];

export function TrustBadges() {
  return (
    <section className="py-10 bg-white border-b border-neutral-100">
      <Container>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-100 rounded-2xl overflow-hidden shadow-sm border border-neutral-100">
          {badges.map((badge, i) => (
            <div
              key={badge.title}
              className={`flex items-center gap-4 px-6 py-5 bg-white ${
                i < badges.length - 1 ? "" : ""
              }`}
            >
              <div className="shrink-0 w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <badge.icon className="w-5 h-5 text-primary-600" strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-semibold text-neutral-900 text-sm">{badge.title}</p>
                <p className="text-xs text-neutral-500 mt-0.5 leading-snug">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
