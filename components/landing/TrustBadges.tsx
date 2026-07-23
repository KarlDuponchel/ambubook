import { Container } from "@/components/ui";
import { Zap, Lock, Bell, PhoneOff } from "lucide-react";

const badges = [
  { icon: Zap, title: "Rapide", description: "Réservation en moins de 2 minutes." },
  { icon: Lock, title: "Sécurisé", description: "Vos données de santé protégées." },
  { icon: Bell, title: "Confirmé", description: "Notification par SMS et email." },
  { icon: PhoneOff, title: "Sans appel", description: "Plus besoin de téléphoner." },
];

export function TrustBadges() {
  return (
    <section className="bg-surface border-y border-line">
      <Container className="py-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
          {badges.map((badge) => (
            <div key={badge.title} className="flex items-start gap-3">
              <span
                className="shrink-0 grid place-items-center w-10 h-10 rounded-xl text-brand"
                style={{ background: "color-mix(in srgb, var(--brand) 11%, var(--surface))" }}
              >
                <badge.icon className="w-5 h-5" strokeWidth={2} />
              </span>
              <div>
                <p className="font-bold text-[15px] text-ink leading-tight">{badge.title}</p>
                <p className="text-[13px] text-ink-2 leading-snug mt-0.5">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
