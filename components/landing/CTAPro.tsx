import Link from "next/link";
import { Container } from "@/components/ui";

const benefits = [
  "Réduisez les appels téléphoniques",
  "Gérez vos demandes en un seul endroit",
  "Notifications automatiques aux patients",
  "Tableau de bord simple et intuitif",
];

export function CTAPro() {
  return (
    <section id="professionnels" className="py-20 lg:py-28 bg-white">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary-600 via-primary-700 to-primary-800">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-primary-400/20 rounded-full blur-3xl" />
            <svg
              className="absolute bottom-0 right-0 w-1/3 h-auto text-primary-500/20"
              viewBox="0 0 200 200"
              fill="currentColor"
            >
              <path d="M100 0C44.8 0 0 44.8 0 100s44.8 100 100 100 100-44.8 100-100S155.2 0 100 0zm0 180c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z" />
            </svg>
          </div>

          <div className="relative px-8 py-16 lg:px-16 lg:py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div>
                <span className="inline-block px-4 py-1.5 bg-white/20 text-white text-sm font-medium rounded-full mb-6">
                  Espace professionnel
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  Vous êtes ambulancier ou taxi conventionné ?
                </h2>
                <p className="mt-6 text-lg text-primary-100 leading-relaxed">
                  Simplifiez la gestion de vos demandes de transport.
                  Recevez les réservations en ligne et gagnez du temps au quotidien.
                </p>

                <ul className="mt-8 space-y-4">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3 text-white">
                      <div className="shrink-0 w-6 h-6 rounded-full bg-secondary-500 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-700 font-semibold text-lg rounded-xl hover:bg-primary-50 transition-colors shadow-lg"
                  >
                    Créer mon espace gratuit
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-semibold text-lg rounded-xl border-2 border-white/30 hover:bg-white/10 transition-colors"
                  >
                    Se connecter
                  </Link>
                </div>
              </div>

              {/* Visual */}
              <div className="hidden lg:block">
                <div className="relative">
                  {/* Mock dashboard */}
                  <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-3 h-3 rounded-full bg-danger-400" />
                      <div className="w-3 h-3 rounded-full bg-warning-400" />
                      <div className="w-3 h-3 rounded-full bg-success-400" />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                            JD
                          </div>
                          <div>
                            <div className="font-medium text-neutral-900">Jean Dupont</div>
                            <div className="text-sm text-neutral-500">Aujourd&apos;hui, 14h30</div>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-warning-100 text-warning-700 text-sm font-medium rounded-full">
                          Nouvelle
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-600 font-bold">
                            ML
                          </div>
                          <div>
                            <div className="font-medium text-neutral-900">Marie Lambert</div>
                            <div className="text-sm text-neutral-500">Demain, 09h00</div>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-success-100 text-success-700 text-sm font-medium rounded-full">
                          Confirmée
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl opacity-60">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500 font-bold">
                            PB
                          </div>
                          <div>
                            <div className="font-medium text-neutral-900">Pierre Bernard</div>
                            <div className="text-sm text-neutral-500">Hier, 16h00</div>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-neutral-200 text-neutral-600 text-sm font-medium rounded-full">
                          Terminée
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notification bubble */}
                  <div className="absolute -top-4 -right-4 px-4 py-2 bg-danger-500 text-white text-sm font-bold rounded-full shadow-lg animate-bounce">
                    3 nouvelles demandes
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
