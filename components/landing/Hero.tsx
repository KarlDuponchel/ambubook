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
      <section className="relative bg-primary-950 overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28">
        {/* Ambient gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-600/25 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent-600/15 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 -right-20 w-72 h-72 bg-secondary-500/10 rounded-full blur-3xl" />
        </div>

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        <Container className="relative">
          <div className="max-w-3xl mx-auto text-center">
            {/* Status badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/8 backdrop-blur-sm border border-white/12 rounded-full mb-8">
              <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
              <span className="text-primary-300 text-sm font-medium tracking-wide">
                Réservation 100&nbsp;% en ligne — sans appel téléphonique
              </span>
            </div>

            {/* H1 */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.08] tracking-tight">
              Votre{" "}
              <span className="text-primary-400">transport médical</span>
              <br />
              réservé en quelques clics
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-primary-200/80 max-w-2xl mx-auto leading-relaxed">
              Ambulance ou VSL — trouvez un transporteur agréé près de chez vous
              et réservez en ligne, 24h/24.
            </p>

            {/* Search card */}
            <div className="mt-10 bg-white rounded-2xl p-2 shadow-2xl shadow-primary-950/60 max-w-xl mx-auto">
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
                  className="px-7 py-3.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-500 active:bg-primary-700 transition-all duration-200 shadow-lg shadow-primary-600/30 whitespace-nowrap"
                >
                  Rechercher
                </button>
              </div>
            </div>

            {/* Alternative link */}
            <p className="mt-5 text-primary-400/70 text-sm">
              Vous avez déjà un lien de votre ambulancier ?{" "}
              <button
                type="button"
                className="text-primary-300 hover:text-white font-medium underline underline-offset-2 cursor-pointer transition-colors"
                onClick={openModal}
              >
                Accédez directement
              </button>
            </p>
          </div>

          {/* Stats strip */}
          <div className="mt-16 pt-10 border-t border-white/10 max-w-2xl mx-auto">
            <div className="grid grid-cols-3 gap-6 text-center">
              {[
                { value: "500+", label: "Ambulanciers partenaires" },
                { value: "15 000+", label: "Transports réservés" },
                { value: "4.8 / 5", label: "Satisfaction patients" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl sm:text-4xl font-bold text-white tabular-nums">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-primary-400/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Container>
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
