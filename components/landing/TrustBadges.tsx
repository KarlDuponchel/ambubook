import { Container } from "@/components/ui";

const badges = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Rapide",
    description: "Réservation en moins de 2 minutes",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: "Sécurisé",
    description: "Vos données sont protégées",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Confirmé",
    description: "Notification SMS et email",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    title: "Sans appel",
    description: "Plus besoin de téléphoner",
  },
];

export function TrustBadges() {
  return (
    <section className="py-12 bg-white border-y border-neutral-100">
      <Container>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {badges.map((badge) => (
            <div
              key={badge.title}
              className="flex flex-col items-center text-center p-4"
            >
              <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mb-3">
                {badge.icon}
              </div>
              <h3 className="font-semibold text-neutral-900">{badge.title}</h3>
              <p className="mt-1 text-sm text-neutral-500">{badge.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
