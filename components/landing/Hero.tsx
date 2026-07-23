"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Wifi } from "lucide-react";
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
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "radial-gradient(130% 100% at 90% -10%, color-mix(in srgb, var(--teal) 12%, transparent), transparent 55%), var(--page-bg)",
        }}
      >
        <Container className="relative z-10 pt-28 lg:pt-36 pb-16 lg:pb-24">
          <div className="max-w-3xl">
            {/* Badge statut */}
            <span
              className="inline-flex items-center gap-2 text-xs font-bold rounded-full px-3 py-1.5 text-vert"
              style={{
                background: "color-mix(in srgb, var(--vert) 13%, var(--surface))",
                border: "1px solid color-mix(in srgb, var(--vert) 30%, transparent)",
              }}
            >
              <Wifi className="w-3.5 h-3.5" strokeWidth={2} />
              100&nbsp;% en ligne, sans appel
            </span>

            {/* H1 */}
            <h1 className="serif text-4xl sm:text-5xl lg:text-[52px] leading-[1.05] text-ink mt-5 mb-4">
              Réservez votre transport médical en quelques clics.
            </h1>

            <p className="text-lg text-ink-2 leading-relaxed max-w-xl mb-7">
              Ambulance ou VSL, un transporteur agréé près de chez vous,
              disponible <span className="text-teal font-semibold">24h/24</span>.
            </p>

            {/* Barre de recherche */}
            <div className="flex flex-col sm:flex-row gap-2 max-w-xl bg-surface border border-line rounded-2xl p-2 shadow-soft">
              <Autocomplete
                placeholder="Ville ou nom d'ambulancier"
                onSubmit={handleSearch}
                onBookClick={handleBookClick}
                className="flex-1"
                size="large"
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.querySelector<HTMLInputElement>(
                    'input[placeholder="Ville ou nom d\'ambulancier"]'
                  );
                  if (input?.value.trim()) {
                    handleSearch(input.value.trim());
                  }
                }}
                className="px-6 py-3.5 bg-brand text-white font-bold rounded-xl hover:bg-brand-ink transition-colors whitespace-nowrap"
              >
                Rechercher
              </button>
            </div>

            {/* Lien alternatif */}
            <button
              type="button"
              className="mt-4 text-brand hover:text-brand-ink font-semibold text-sm cursor-pointer transition-colors"
              onClick={openModal}
            >
              J&apos;ai déjà un lien de mon ambulancier →
            </button>
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
          <p className="text-ink-2 mb-4">
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
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            }
          />
          <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">Accéder</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
