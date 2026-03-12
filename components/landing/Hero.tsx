"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Autocomplete, Container, Modal, Button, Input } from "@/components/ui";
import { BookingModal, Company } from "@/components/booking";

export function Hero() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [directLink, setDirectLink] = useState("");
  const [linkError, setLinkError] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const companyFromUrlProcessed = useRef(false);

  // Effet pour ouvrir automatiquement le modal si ?company=slug est présent
  useEffect(() => {
    const companySlug = searchParams.get("company");

    if (companySlug && !selectedCompany && !companyFromUrlProcessed.current) {
      companyFromUrlProcessed.current = true;

      // Fetch la company par son slug
      fetch(`/api/companies/${companySlug}`)
        .then((res) => {
          if (!res.ok) throw new Error("Company not found");
          return res.json();
        })
        .then((company) => {
          setSelectedCompany({
            id: company.id,
            name: company.name,
            slug: company.slug,
            city: company.city,
            hasAmbulance: company.hasAmbulance,
            hasVSL: company.hasVSL,
          });
          setIsBookingModalOpen(true);
        })
        .catch((error) => {
          console.error("Erreur chargement company:", error);
          // Nettoyer l'URL si la company n'existe pas
          const url = new URL(window.location.href);
          url.searchParams.delete("company");
          window.history.replaceState({}, "", url);
        });
    }
  }, [searchParams, selectedCompany]);

  const handleSearch = (query: string) => {
    if (query) {
      router.push(`/recherche?q=${encodeURIComponent(query)}`);
    }
  };

  const handleBookClick = (company: { id: string; name: string; slug: string; city: string | null; hasAmbulance?: boolean; hasVSL?: boolean }) => {
    setSelectedCompany({
      id: company.id,
      name: company.name,
      slug: company.slug,
      city: company.city,
      hasAmbulance: company.hasAmbulance,
      hasVSL: company.hasVSL,
    });
    setIsBookingModalOpen(true);
  };

  const handleDirectAccess = (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError("");

    if (!directLink.trim()) {
      setLinkError("Veuillez entrer un lien");
      return;
    }

    const trimmedLink = directLink.trim();

    if (trimmedLink.startsWith("http://") || trimmedLink.startsWith("https://")) {
      try {
        const url = new URL(trimmedLink);
        if (
          url.hostname === "localhost" ||
          url.hostname.includes("ambubook")
        ) {
          window.location.href = trimmedLink;
        } else {
          setLinkError("Ce lien ne semble pas provenir d'AmbuBook");
        }
      } catch {
        setLinkError("Lien invalide");
      }
      return;
    }

    // Si c'est juste un slug (ex: ambulances-dupont)
    if (/^[a-z0-9-]+$/i.test(trimmedLink)) {
      router.push(`/${trimmedLink}`);
      setIsModalOpen(false);
      return;
    }

    setLinkError("Format de lien non reconnu");
  };

  const openModal = () => {
    setDirectLink("");
    setLinkError("");
    setIsModalOpen(true);
  };

  return (
    <>
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background gradient - Deep medical blue to dark */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(135deg,
                #001429 0%,
                #002952 25%,
                #003d7a 50%,
                #0052a3 75%,
                #0066cc 100%
              )
            `,
          }}
        />

        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Primary blue glow - top left */}
          <div
            className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-40 animate-pulse"
            style={{
              background: "radial-gradient(circle, rgba(0, 102, 204, 0.6) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
          {/* Teal accent - bottom right */}
          <div
            className="absolute -bottom-48 -right-48 w-[700px] h-[700px] rounded-full opacity-30"
            style={{
              background: "radial-gradient(circle, rgba(20, 184, 166, 0.5) 0%, transparent 70%)",
              filter: "blur(100px)",
            }}
          />
          {/* Success green hint - center */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-20"
            style={{
              background: "radial-gradient(ellipse, rgba(16, 185, 129, 0.3) 0%, transparent 60%)",
              filter: "blur(120px)",
            }}
          />
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-[10%] w-2 h-2 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: "0s", animationDuration: "3s" }} />
          <div className="absolute top-40 left-[25%] w-1.5 h-1.5 bg-secondary-400/30 rounded-full animate-bounce" style={{ animationDelay: "0.5s", animationDuration: "4s" }} />
          <div className="absolute top-32 right-[20%] w-2.5 h-2.5 bg-primary-300/25 rounded-full animate-bounce" style={{ animationDelay: "1s", animationDuration: "3.5s" }} />
          <div className="absolute bottom-40 left-[15%] w-1.5 h-1.5 bg-white/15 rounded-full animate-bounce" style={{ animationDelay: "1.5s", animationDuration: "4.5s" }} />
          <div className="absolute bottom-32 right-[30%] w-2 h-2 bg-secondary-300/20 rounded-full animate-bounce" style={{ animationDelay: "2s", animationDuration: "3s" }} />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Radial vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, transparent 0%, rgba(0, 20, 41, 0.4) 100%)",
          }}
        />

        <Container className="relative z-10 py-20 lg:py-28">
          <div className="max-w-4xl mx-auto text-center">
            {/* Status badge */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-10 shadow-lg shadow-black/10">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary-400"></span>
              </span>
              <span className="text-white/90 text-sm font-medium tracking-wide">
                Réservation 100&nbsp;% en ligne — sans appel téléphonique
              </span>
            </div>

            {/* H1 with gradient text */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
              <span className="text-white">Votre </span>
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg, #60a5fa 0%, #2dd4bf 50%, #4ade80 100%)",
                }}
              >
                transport médical
              </span>
              <br />
              <span className="text-white">réservé en quelques clics</span>
            </h1>

            <p className="mt-8 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Ambulance ou VSL — trouvez un transporteur agréé près de chez vous
              et réservez en ligne, <span className="text-secondary-400 font-medium">24h/24</span>.
            </p>

            {/* Search card - Glassmorphism */}
            <div className="mt-12 bg-white/95 backdrop-blur-xl rounded-2xl p-2.5 shadow-2xl shadow-black/20 max-w-xl mx-auto ring-1 ring-white/20">
              <div className="flex flex-col sm:flex-row gap-2">
                <Autocomplete
                  placeholder="Ville ou nom d'ambulancier..."
                  onSubmit={handleSearch}
                  onBookClick={handleBookClick}
                  className="flex-1"
                  size="large"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.querySelector<HTMLInputElement>(
                      'input[placeholder="Ville ou nom d\'ambulancier..."]'
                    );
                    if (input?.value.trim()) {
                      handleSearch(input.value.trim());
                    }
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-400 hover:to-primary-500 active:from-primary-600 active:to-primary-700 transition-all duration-200 shadow-lg shadow-primary-500/30 whitespace-nowrap"
                >
                  Rechercher
                </button>
              </div>
            </div>

            {/* Alternative link */}
            <p className="mt-6 text-white/50 text-sm">
              Vous avez déjà un lien de votre ambulancier ?{" "}
              <button
                type="button"
                className="text-secondary-400 hover:text-secondary-300 font-medium underline underline-offset-2 cursor-pointer transition-colors"
                onClick={openModal}
              >
                Accédez directement
              </button>
            </p>
          </div>

          {/* Stats strip */}
          <div className="mt-20 pt-12 border-t border-white/10 max-w-3xl mx-auto">
            <div className="grid grid-cols-3 gap-8 text-center">
              {[
                { value: "500+", label: "Ambulanciers partenaires" },
                { value: "15 000+", label: "Transports réservés" },
                { value: "4.8 / 5", label: "Satisfaction patients" },
              ].map((stat) => (
                <div key={stat.label} className="group">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tabular-nums group-hover:scale-105 transition-transform">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Container>

        {/* Bottom fade to white */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)",
          }}
        />
      </section>

      {/* Modal de réservation */}
      {selectedCompany && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedCompany(null);
            // Nettoyer l'URL si elle contient le paramètre company
            const url = new URL(window.location.href);
            if (url.searchParams.has("company")) {
              url.searchParams.delete("company");
              window.history.replaceState({}, "", url);
            }
          }}
          company={selectedCompany}
        />
      )}

      {/* Modal d'accès direct */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Accéder à votre ambulancier"
        size="md"
      >
        <form onSubmit={handleDirectAccess} className="px-6 pb-6">
          <p className="text-neutral-600 mb-4">
            Collez le lien reçu de votre ambulancier ou entrez directement son identifiant.
          </p>

          <Input
            type="text"
            value={directLink}
            onChange={(e) => {
              setDirectLink(e.target.value);
              setLinkError("");
            }}
            placeholder="Ex: ambulances-dupont ou https://ambubook.fr/ambulances-dupont"
            error={linkError}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            }
          />

          <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit">
              Accéder
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
