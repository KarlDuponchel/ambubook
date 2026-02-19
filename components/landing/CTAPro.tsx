import Link from "next/link";
import { Container } from "@/components/ui";
import { CheckCircle2, Bell, LayoutDashboard, FileText, Truck } from "lucide-react";

const benefits = [
  { icon: LayoutDashboard, text: "Tableau de bord simple et intuitif" },
  { icon: Bell, text: "Notifications automatiques aux patients" },
  { icon: FileText, text: "Gestion des documents et pièces jointes" },
  { icon: Truck, text: "Réduisez les appels téléphoniques" },
];

export function CTAPro() {
  return (
    <section id="professionnels" className="py-20 lg:py-28 bg-neutral-50">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-neutral-950">
          {/* Background layers */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-primary-900/40 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-accent-900/20 rounded-full blur-3xl" />
            {/* Subtle grid */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          <div className="relative px-8 py-14 lg:px-16 lg:py-20">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Content */}
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-500/15 border border-primary-500/20 text-primary-400 text-sm font-semibold rounded-full mb-6 tracking-wide">
                  <Truck className="w-3.5 h-3.5" />
                  Espace professionnel
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  Vous êtes ambulancier ou taxi conventionné ?
                </h2>
                <p className="mt-5 text-lg text-neutral-400 leading-relaxed">
                  Simplifiez la gestion de vos demandes de transport.
                  Recevez les réservations en ligne et gagnez du temps au quotidien.
                </p>

                <ul className="mt-8 space-y-3.5">
                  {benefits.map((b) => (
                    <li key={b.text} className="flex items-center gap-3 text-neutral-300">
                      <div className="shrink-0 w-6 h-6 rounded-full bg-primary-600/20 border border-primary-500/30 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary-400" />
                      </div>
                      <span className="text-sm">{b.text}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-10 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/dashboard/inscription"
                    className="inline-flex items-center justify-center px-7 py-3.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary-900/50"
                  >
                    Créer mon espace gratuit
                  </Link>
                  <Link
                    href="/dashboard/connexion"
                    className="inline-flex items-center justify-center px-7 py-3.5 bg-white/6 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200"
                  >
                    Se connecter
                  </Link>
                </div>
              </div>

              {/* Mock dashboard */}
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="bg-neutral-900 rounded-2xl border border-white/8 p-5 shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
                    {/* Window controls */}
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-3 h-3 rounded-full bg-neutral-700" />
                      <div className="w-3 h-3 rounded-full bg-neutral-700" />
                      <div className="w-3 h-3 rounded-full bg-neutral-700" />
                      <div className="flex-1 h-5 bg-neutral-800 rounded ml-2" />
                    </div>

                    <div className="space-y-3">
                      {[
                        { initials: "JD", name: "Jean Dupont", time: "Aujourd'hui, 14h30", status: "Nouvelle", statusColor: "bg-secondary-500/15 text-secondary-400 border border-secondary-500/20" },
                        { initials: "ML", name: "Marie Lambert", time: "Demain, 09h00", status: "Confirmée", statusColor: "bg-primary-500/15 text-primary-400 border border-primary-500/20" },
                        { initials: "PB", name: "Pierre Bernard", time: "Hier, 16h00", status: "Terminée", statusColor: "bg-neutral-700 text-neutral-400 border border-neutral-600" },
                      ].map((row, i) => (
                        <div
                          key={i}
                          className={`flex items-center justify-between p-3.5 bg-white/4 rounded-xl ${i === 2 ? "opacity-50" : ""}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary-800/60 flex items-center justify-center text-primary-300 font-bold text-xs">
                              {row.initials}
                            </div>
                            <div>
                              <div className="font-medium text-white text-sm">{row.name}</div>
                              <div className="text-xs text-neutral-500">{row.time}</div>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${row.statusColor}`}>
                            {row.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notification bubble */}
                  <div className="absolute -top-3 -right-3 px-3.5 py-1.5 bg-danger-500 text-white text-xs font-bold rounded-full shadow-lg shadow-danger-500/30 animate-bounce">
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
