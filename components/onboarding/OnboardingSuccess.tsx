"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, ArrowRight, Building2, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui";
import confetti from "canvas-confetti";

interface OnboardingSuccessProps {
  companyName: string;
}

export function OnboardingSuccess({ companyName }: OnboardingSuccessProps) {
  const router = useRouter();
  const hasConfetti = useRef(false);

  useEffect(() => {
    // Lancer les confettis une seule fois
    if (!hasConfetti.current) {
      hasConfetti.current = true;

      // Premier burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10B981", "#059669", "#34D399", "#6EE7B7"],
      });

      // Deuxième burst après un délai
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 100,
          origin: { y: 0.7, x: 0.3 },
        });
        confetti({
          particleCount: 50,
          spread: 100,
          origin: { y: 0.7, x: 0.7 },
        });
      }, 300);
    }

    // Redirection automatique après 8 secondes
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 8000);

    return () => clearTimeout(timer);
  }, [router]);

  const features = [
    {
      icon: Building2,
      title: "Page entreprise active",
      description: "Votre page est maintenant visible par les patients",
    },
    {
      icon: Users,
      title: "Recevez des réservations",
      description: "Les patients peuvent vous contacter et réserver en ligne",
    },
    {
      icon: Calendar,
      title: "Gérez votre planning",
      description: "Suivez et gérez toutes vos demandes de transport",
    },
  ];

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      {/* Icône de succès animée */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-success-100 rounded-full animate-ping opacity-75" />
        <div className="relative bg-success-100 p-6 rounded-full">
          <CheckCircle className="w-16 h-16 text-success-600" strokeWidth={1.5} />
        </div>
      </div>

      {/* Message principal */}
      <h1 className="text-3xl font-bold text-neutral-900 mb-3">
        Félicitations !
      </h1>
      <p className="text-xl text-neutral-600 mb-2">
        La configuration de <span className="font-semibold text-primary-600">{companyName}</span> est terminée.
      </p>
      <p className="text-neutral-500 mb-8">
        Votre entreprise est maintenant prête à recevoir des réservations.
      </p>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mb-10">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="bg-white rounded-xl p-5 shadow-sm border border-neutral-100"
            >
              <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-3 mx-auto">
                <Icon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-neutral-500">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-3">
        <Button
          onClick={() => router.push("/dashboard")}
          className="px-8"
        >
          Accéder à mon tableau de bord
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <p className="text-sm text-neutral-400">
          Redirection automatique dans quelques secondes...
        </p>
      </div>
    </div>
  );
}
