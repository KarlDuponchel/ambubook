import { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { prisma } from "@/lib/prisma";
import { getSignedDownloadUrl } from "@/lib/s3";
import { CompanyPageClient } from "./CompanyPageClient";
import { CompanyFull } from "@/lib/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Fonction pour récupérer les données de l'entreprise
async function getCompany(slug: string): Promise<CompanyFull | null> {
  const company = await prisma.company.findUnique({
    where: {
      slug,
      isActive: true,
    },
    include: {
      photos: {
        orderBy: { order: "asc" },
      },
      hours: {
        orderBy: { dayOfWeek: "asc" },
      },
      timeOffs: {
        where: {
          endDate: { gte: new Date() },
        },
        orderBy: { startDate: "asc" },
        take: 5, // Limiter aux 5 prochains congés
      },
    },
  });

  if (!company) return null;

  // Générer les URLs signées pour les images
  let logoUrl = company.logoUrl;
  let coverImageUrl = company.coverImageUrl;

  if (company.logoUrl && company.logoUrl.startsWith("companies/")) {
    logoUrl = await getSignedDownloadUrl(company.logoUrl);
  }

  if (company.coverImageUrl && company.coverImageUrl.startsWith("companies/")) {
    coverImageUrl = await getSignedDownloadUrl(company.coverImageUrl);
  }

  // Générer les URLs signées pour les photos
  const photosWithSignedUrls = await Promise.all(
    company.photos.map(async (photo) => ({
      id: photo.id,
      fileKey: photo.fileKey,
      url: photo.fileKey.startsWith("companies/")
        ? await getSignedDownloadUrl(photo.fileKey)
        : photo.url,
      caption: photo.caption,
      order: photo.order,
      createdAt: photo.createdAt.toISOString(),
    }))
  );

  // Transformer les hours pour le type
  const hoursFormatted = company.hours.map((h) => ({
    id: h.id,
    dayOfWeek: h.dayOfWeek,
    openTime: h.openTime,
    closeTime: h.closeTime,
    isClosed: h.isClosed,
  }));

  // Transformer les timeOffs pour le type
  const timeOffsFormatted = company.timeOffs.map((t) => ({
    id: t.id,
    title: t.title,
    startDate: t.startDate.toISOString(),
    endDate: t.endDate.toISOString(),
    createdAt: t.createdAt.toISOString(),
  }));

  return {
    id: company.id,
    name: company.name,
    slug: company.slug,
    address: company.address,
    city: company.city,
    postalCode: company.postalCode,
    phone: company.phone,
    email: company.email,
    latitude: company.latitude,
    longitude: company.longitude,
    siret: company.siret,
    description: company.description,
    logoUrl,
    coverImageUrl,
    hasAmbulance: company.hasAmbulance,
    hasVSL: company.hasVSL,
    acceptsOnlineBooking: company.acceptsOnlineBooking,
    foundedYear: company.foundedYear,
    fleetSize: company.fleetSize,
    coverageRadius: company.coverageRadius,
    licenseNumber: company.licenseNumber,
    photos: photosWithSignedUrls,
    hours: hoursFormatted,
    timeOffs: timeOffsFormatted,
    isOwner: false,
    ownerId: company.ownerId,
  };
}

// Génération des metadata SEO dynamiques
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompany(slug);

  if (!company) {
    return {
      title: "Entreprise non trouvée | Ambubook",
    };
  }

  const services = [
    company.hasAmbulance && "Ambulance",
    company.hasVSL && "VSL",
  ].filter(Boolean).join(" et ");

  const title = `${company.name} - ${services} à ${company.city || "votre service"} | Ambubook`;

  const description = company.description
    ? company.description.slice(0, 160)
    : `${company.name} : société d'ambulances${company.city ? ` à ${company.city}` : ""}. ${services ? `Services : ${services}.` : ""} Réservez votre transport sanitaire en ligne sur Ambubook.`;

  const url = `https://ambubook.fr/${company.slug}`;

  return {
    title,
    description,
    keywords: [
      "ambulance",
      "VSL",
      "transport sanitaire",
      "transport médical",
      company.city,
      company.postalCode,
      company.name,
    ].filter(Boolean) as string[],
    openGraph: {
      title,
      description,
      url,
      siteName: "Ambubook",
      type: "website",
      locale: "fr_FR",
      images: company.logoUrl
        ? [
            {
              url: company.logoUrl,
              width: 400,
              height: 400,
              alt: `Logo ${company.name}`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: company.logoUrl ? [company.logoUrl] : undefined,
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Schema.org LocalBusiness pour le SEO
function generateLocalBusinessSchema(company: CompanyFull) {
  const dayMapping: Record<number, string> = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
  };

  const openingHours = company.hours
    ?.filter((h) => !h.isClosed && h.openTime && h.closeTime)
    .map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: dayMapping[h.dayOfWeek],
      opens: h.openTime,
      closes: h.closeTime,
    }));

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `https://ambubook.fr/${company.slug}`,
    name: company.name,
    description: company.description || `Service d'ambulances et transport sanitaire`,
    url: `https://ambubook.fr/${company.slug}`,
    telephone: company.phone || undefined,
    email: company.email || undefined,
    image: company.logoUrl || undefined,
    address: company.address
      ? {
          "@type": "PostalAddress",
          streetAddress: company.address,
          addressLocality: company.city,
          postalCode: company.postalCode,
          addressCountry: "FR",
        }
      : undefined,
    geo:
      company.latitude && company.longitude
        ? {
            "@type": "GeoCoordinates",
            latitude: company.latitude,
            longitude: company.longitude,
          }
        : undefined,
    openingHoursSpecification: openingHours?.length ? openingHours : undefined,
    priceRange: "€€",
    currenciesAccepted: "EUR",
    paymentAccepted: "Cash, Credit Card, Carte Vitale",
    areaServed: company.coverageRadius
      ? {
          "@type": "GeoCircle",
          geoMidpoint: {
            "@type": "GeoCoordinates",
            latitude: company.latitude,
            longitude: company.longitude,
          },
          geoRadius: `${company.coverageRadius} km`,
        }
      : undefined,
    foundingDate: company.foundedYear?.toString(),
    numberOfEmployees: company.fleetSize
      ? {
          "@type": "QuantitativeValue",
          value: company.fleetSize,
        }
      : undefined,
    sameAs: [],
    aggregateRating: undefined, // À ajouter quand on aura les avis
  };
}

// Page principale (Server Component)
export default async function CompanyPage({ params }: PageProps) {
  const { slug } = await params;
  const company = await getCompany(slug);

  if (!company) {
    notFound();
  }

  const localBusinessSchema = generateLocalBusinessSchema(company);

  return (
    <>
      {/* Schema.org LocalBusiness pour le SEO */}
      <Script
        id="local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <CompanyPageClient company={company} />
    </>
  );
}
