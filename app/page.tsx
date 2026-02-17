import { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import {
  Header,
  Hero,
  TrustBadges,
  Reassurance,
  HowItWorks,
  CTAPro,
  Footer,
} from "@/components/landing";
import { AccordionSection } from "@/components/landing/Accordion";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { CitiesSection } from "@/components/landing/CitiesSection";

// Metadata SEO complètes
export const metadata: Metadata = {
  title: "Ambubook | Réservation de transport médical en ligne - Ambulance & VSL",
  description:
    "Réservez votre transport sanitaire en ligne : ambulance, VSL, transport médicalisé. Trouvez un ambulancier près de chez vous et réservez en quelques clics. Service gratuit, disponible 24h/24.",
  keywords: [
    "ambulance",
    "VSL",
    "transport sanitaire",
    "transport médical",
    "réservation ambulance",
    "transport patient",
    "ambulancier",
    "bon de transport",
    "transport hospitalier",
    "transport médicalisé",
  ],
  authors: [{ name: "Ambubook" }],
  creator: "Ambubook",
  publisher: "Ambubook",
  formatDetection: {
    telephone: true,
    email: true,
  },
  openGraph: {
    title: "Ambubook | Réservation de transport médical en ligne",
    description:
      "Réservez votre ambulance ou VSL en ligne. Trouvez un ambulancier près de chez vous et réservez en quelques clics.",
    url: "https://ambubook.fr",
    siteName: "Ambubook",
    type: "website",
    locale: "fr_FR",
    images: [
      {
        url: "https://ambubook.fr/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ambubook - Réservation de transport médical",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ambubook | Réservation de transport médical en ligne",
    description: "Réservez votre ambulance ou VSL en ligne. Service gratuit, disponible 24h/24.",
    images: ["https://ambubook.fr/og-image.jpg"],
  },
  alternates: {
    canonical: "https://ambubook.fr",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // google: "votre-code-verification-google",
  },
};

// Schema.org Organization
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://ambubook.fr/#organization",
  name: "Ambubook",
  url: "https://ambubook.fr",
  logo: "https://ambubook.fr/logo.png",
  description:
    "Plateforme de réservation de transport médical en ligne. Trouvez et réservez une ambulance ou un VSL près de chez vous.",
  foundingDate: "2024",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: "French",
  },
  sameAs: [
    "https://twitter.com/ambubook",
    "https://www.linkedin.com/company/ambubook",
  ],
};

// Schema.org WebSite avec SearchAction
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://ambubook.fr/#website",
  name: "Ambubook",
  url: "https://ambubook.fr",
  description: "Réservation de transport médical en ligne",
  publisher: {
    "@id": "https://ambubook.fr/#organization",
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://ambubook.fr/recherche?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

// Schema.org Service
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://ambubook.fr/#service",
  name: "Réservation de transport sanitaire",
  provider: {
    "@id": "https://ambubook.fr/#organization",
  },
  description:
    "Service de mise en relation entre patients et sociétés d'ambulances pour la réservation de transports sanitaires (ambulance, VSL).",
  serviceType: "Transport médical",
  areaServed: {
    "@type": "Country",
    name: "France",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Types de transport",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Transport en ambulance",
          description:
            "Transport médicalisé pour patients allongés ou nécessitant une surveillance",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Transport en VSL",
          description:
            "Véhicule Sanitaire Léger pour patients pouvant voyager assis",
        },
      },
    ],
  },
};

// Schema.org BreadcrumbList
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Accueil",
      item: "https://ambubook.fr",
    },
  ],
};

function HeroSkeleton() {
  return (
    <section className="relative bg-linear-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 lg:py-24">
          <div className="max-w-3xl mx-auto text-center animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-12 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
            <div className="h-6 bg-gray-100 rounded w-2/3 mx-auto mb-2"></div>
            <div className="h-6 bg-gray-100 rounded w-1/2 mx-auto mb-10"></div>
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <div className="flex-1 h-14 bg-gray-200 rounded-xl"></div>
              <div className="w-32 h-14 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      {/* Schemas JSON-LD pour le SEO */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Script
        id="service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 lg:pt-28">
          <Suspense fallback={<HeroSkeleton />}>
            <Hero />
          </Suspense>
          <TrustBadges />
          <ServicesSection />
          <Reassurance />
          <HowItWorks />
          <CitiesSection />
          <AccordionSection />
          <CTAPro />
        </main>
        <Footer />
      </div>
    </>
  );
}
