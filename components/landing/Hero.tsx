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
  <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#F7F9FC]">
 
    {/* ── Fond : blanc médical avec micro-texture noise ── */}
    <div
      className="absolute inset-0"
      style={{
        background: "linear-gradient(160deg, #EEF3FA 0%, #F7F9FC 55%, #EAF2FF 100%)",
      }}
    />
 
    {/* Grain SVG ultra-subtil (donne du caractère sans agresser) */}
    <svg className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
 
    {/* ── Accent géométrique gauche : grand arc de cercle fin ── */}
    <svg
      className="absolute left-0 top-0 h-full pointer-events-none"
      style={{ width: "420px", opacity: 0.07 }}
      viewBox="0 0 420 900"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="-60" cy="450" r="380" stroke="#1B5EA6" strokeWidth="1.5" />
      <circle cx="-60" cy="450" r="280" stroke="#1B5EA6" strokeWidth="1" />
      <circle cx="-60" cy="450" r="180" stroke="#1B5EA6" strokeWidth="0.5" />
    </svg>
 
    {/* ── Accent géométrique droit : croix médicale stylisée ── */}
    <svg
      className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none"
      style={{ width: "260px", height: "260px", opacity: 0.055 }}
      viewBox="0 0 260 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Croix */}
      <rect x="105" y="20" width="50" height="220" rx="8" fill="#1B5EA6" />
      <rect x="20" y="105" width="220" height="50" rx="8" fill="#1B5EA6" />
      {/* Cercle extérieur */}
      <circle cx="130" cy="130" r="120" stroke="#1B5EA6" strokeWidth="1.5" />
    </svg>
 
    {/* ── Ligne horizontale décorative subtile ── */}
    <div
      className="absolute left-0 right-0 pointer-events-none"
      style={{ top: "18%", height: "1px", background: "linear-gradient(90deg, transparent, #1B5EA615, #1B5EA630, #1B5EA615, transparent)" }}
    />
    <div
      className="absolute left-0 right-0 pointer-events-none"
      style={{ bottom: "22%", height: "1px", background: "linear-gradient(90deg, transparent, #1B5EA610, #1B5EA620, #1B5EA610, transparent)" }}
    />
 
    {/* ── Contenu ── */}
    <Container className="relative z-10 py-20 lg:py-28">
      <div className="max-w-4xl mx-auto text-center">
 
        {/* Badge statut */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white border border-[#1B5EA6]/15 rounded-full mb-10 shadow-sm shadow-[#1B5EA6]/08">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
          </span>
          <span className="text-[#1B5EA6]/80 text-sm font-medium tracking-wide">
            Réservation 100&nbsp;% en ligne — sans appel téléphonique
          </span>
        </div>
 
        {/* H1 */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-[#0D2E5C]">
          Votre{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, #1B5EA6 0%, #0EA5C9 60%, #14B8A6 100%)" }}
          >
            transport médical
          </span>
          <br />
          réservé en quelques clics
        </h1>
 
        <p className="mt-8 text-lg sm:text-xl text-[#4A6580] max-w-2xl mx-auto leading-relaxed">
          Ambulance ou VSL — trouvez un transporteur agréé près de chez vous
          et réservez en ligne,{" "}
          <span className="text-teal-600 font-semibold">24h/24</span>.
        </p>
 
        {/* Barre de recherche */}
        <div className="mt-12 bg-white rounded-2xl p-2.5 shadow-lg shadow-[#1B5EA6]/10 max-w-xl mx-auto ring-1 ring-[#1B5EA6]/12">
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
              className="px-8 py-4 bg-[#1B5EA6] text-white font-semibold rounded-xl hover:bg-[#154d8a] active:bg-[#0f3d6e] transition-colors duration-150 shadow-md shadow-[#1B5EA6]/25 whitespace-nowrap"
            >
              Rechercher
            </button>
          </div>
        </div>
 
        {/* Lien alternatif */}
        <p className="mt-6 text-[#4A6580]/70 text-sm">
          Vous avez déjà un lien de votre ambulancier ?{" "}
          <button
            type="button"
            className="text-teal-600 hover:text-teal-700 font-medium underline underline-offset-2 cursor-pointer transition-colors"
            onClick={openModal}
          >
            Accédez directement
          </button>
        </p>
      </div>
 
      {/* Bande de stats */}
      <div className="mt-20 pt-12 border-t border-[#1B5EA6]/10 max-w-3xl mx-auto">
        <div className="grid grid-cols-3 gap-8 text-center">
          {[
            { value: "500+", label: "Ambulanciers partenaires" },
            { value: "15 000+", label: "Transports réservés" },
            { value: "4.8 / 5", label: "Satisfaction patients" },
          ].map((stat) => (
            <div key={stat.label} className="group">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B5EA6] tabular-nums group-hover:scale-105 transition-transform">
                {stat.value}
              </div>
              <div className="mt-2 text-sm text-[#4A6580]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </Container>
 
    {/* Fondu bas vers blanc */}
    <div
      className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
      style={{ background: "linear-gradient(to top, #F7F9FC 0%, transparent 100%)" }}
    />
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
