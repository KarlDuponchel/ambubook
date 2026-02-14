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

  const handleBookClick = (company: { id: string; name: string; slug: string; city: string | null }) => {
    setSelectedCompany({
      id: company.id,
      name: company.name,
      slug: company.slug,
      city: company.city,
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
      <section className="relative bg-linear-to-b from-primary-50 to-white">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full opacity-50 blur-3xl" />
          <div className="absolute top-20 -left-20 w-60 h-60 bg-secondary-100 rounded-full opacity-40 blur-3xl" />
        </div>

        <Container className="relative">
          <div className="py-16 lg:py-24">
            {/* Main content */}
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 tracking-tight">
                Réservez votre{" "}
                <span className="text-primary-600">transport médical</span>
                <br />
                en quelques clics
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto">
                Besoin d&apos;une ambulance ou d&apos;un VSL ? Trouvez un transporteur disponible
                près de chez vous et réservez en ligne, sans appel téléphonique.
              </p>

              {/* Search form */}
              <div className="mt-10">
                <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
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
                    className="px-8 py-4 bg-primary-600 text-white font-semibold text-lg rounded-xl hover:bg-primary-700 active:bg-primary-800 transition-colors shadow-lg shadow-primary-500/25"
                  >
                    Rechercher
                  </button>
                </div>
              </div>

              {/* Alternative link */}
              <p className="mt-6 text-neutral-500">
                Vous avez déjà un lien de votre ambulancier ?{" "}
                <button
                  type="button"
                  className="text-primary-600 hover:text-primary-700 font-medium underline underline-offset-2 cursor-pointer"
                  onClick={openModal}
                >
                  Accédez directement
                </button>
              </p>
            </div>

            {/* Stats */}
            {/* <div className="mt-16 pt-10 border-t border-neutral-200">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
                <Stat value="500+" label="Ambulanciers" />
                <Stat value="15 000+" label="Transports réservés" />
                <Stat value="4.8/5" label="Satisfaction" />
                <Stat value="24h/24" label="Disponibilité" />
              </div>
            </div> */}
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

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl sm:text-3xl font-bold text-neutral-900">{value}</div>
      <div className="mt-1 text-sm text-neutral-500">{label}</div>
    </div>
  );
}
