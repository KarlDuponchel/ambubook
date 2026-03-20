"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Ambulance,
  Car,
  Calendar,
  CalendarOff,
  Shield,
  Users,
  Target,
  ChevronLeft,
  X,
} from "lucide-react";
import { BookingModal, Company } from "@/components/booking";
import { CompanyFull, DAY_LABELS } from "@/lib/types";
import { Header, Footer } from "@/components/landing";

interface CompanyPageClientProps {
  company: CompanyFull;
}

export function CompanyPageClient({ company }: CompanyPageClientProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const bookingCompany: Company = {
    id: company.id,
    name: company.name,
    slug: company.slug,
    city: company.city,
    hasAmbulance: company.hasAmbulance,
    hasVSL: company.hasVSL,
  };

  // Trier les horaires (Lundi en premier)
  const sortedHours = [...(company.hours || [])].sort((a, b) => {
    const dayA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
    const dayB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
    return dayA - dayB;
  });

  return (
    <>
      <Header />

      <main className="min-h-screen bg-neutral-50">
        {/* Cover Image */}
        <div className="relative h-64 md:h-80 bg-linear-to-br from-primary-100 to-primary-200">
          {company.coverImageUrl ? (
            <Image
              src={company.coverImageUrl}
              alt={`Couverture ${company.name}`}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="h-24 w-24 text-primary-300 opacity-50" />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
        </div>

        {/* Contenu principal */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-16">
          {/* Header Card */}
          <article className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden mb-6">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Logo */}
                <div className="shrink-0">
                  <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl bg-white border-4 border-white shadow-lg overflow-hidden">
                    {company.logoUrl ? (
                      <Image
                        src={company.logoUrl}
                        alt={`Logo ${company.name}`}
                        width={128}
                        height={128}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="h-full w-full bg-primary-100 flex items-center justify-center">
                        <Building2 className="h-12 w-12 text-primary-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Infos principales */}
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
                    {company.name}
                  </h1>

                  {/* Badges services */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {company.hasAmbulance && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium bg-primary-100 text-primary-700 rounded-full">
                        <Ambulance className="h-4 w-4" />
                        Ambulance
                      </span>
                    )}
                    {company.hasVSL && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium bg-success-100 text-success-700 rounded-full">
                        <Car className="h-4 w-4" />
                        VSL
                      </span>
                    )}
                    {company.acceptsOnlineBooking && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium bg-info-100 text-info-700 rounded-full">
                        <Calendar className="h-4 w-4" />
                        Réservation en ligne
                      </span>
                    )}
                  </div>

                  {/* Coordonnées */}
                  <address className="not-italic space-y-2 text-neutral-600">
                    {(company.address || company.city) && (
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-neutral-400 shrink-0" />
                        <span>
                          {[company.address, company.postalCode, company.city]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </p>
                    )}
                    {company.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-neutral-400 shrink-0" />
                        <Link
                          href={`tel:${company.phone}`}
                          className="hover:text-primary-600 transition-colors"
                        >
                          {company.phone}
                        </Link>

                      </p>
                    )}
                    {company.email && (
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-neutral-400 shrink-0" />
                        <Link
                          href={`mailto:${company.email}`}
                          className="hover:text-primary-600 transition-colors"
                        >
                          {company.email}
                        </Link>

                      </p>
                    )}
                  </address>
                </div>

                {/* Bouton réserver */}
                <div className="sm:self-start">
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="w-full sm:w-auto px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-primary-600/25"
                  >
                    {company.acceptsOnlineBooking ? "Réserver un transport" : "Contacter"}
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* Grid 2 colonnes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne principale (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              {company.description && (
                <section className="bg-white rounded-xl border border-neutral-200 p-6">
                  <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                    À propos
                  </h2>
                  <p className="text-neutral-600 whitespace-pre-wrap leading-relaxed">
                    {company.description}
                  </p>
                </section>
              )}

              {/* Galerie photos */}
              {company.photos && company.photos.length > 0 && (
                <section className="bg-white rounded-xl border border-neutral-200 p-6">
                  <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                    Photos
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {company.photos.map((photo) => (
                      <button
                        key={photo.id}
                        onClick={() => setSelectedPhoto(photo.url)}
                        className="relative aspect-4/3 rounded-lg overflow-hidden bg-neutral-100 hover:opacity-90 transition-opacity"
                      >
                        <Image
                          src={photo.url}
                          alt={photo.caption || `Photo de ${company.name}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar (1/3) */}
            <aside className="space-y-6">
              {/* Horaires */}
              {sortedHours.length > 0 && (
                <section className="bg-white rounded-xl border border-neutral-200 p-6">
                  <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary-600" />
                    Horaires
                  </h2>
                  <div className="space-y-2">
                    {sortedHours.map((hour) => (
                      <div
                        key={hour.dayOfWeek}
                        className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0"
                      >
                        <span className="font-medium text-neutral-700">
                          {DAY_LABELS[hour.dayOfWeek]}
                        </span>
                        {hour.isClosed ? (
                          <span className="text-neutral-400">Fermé</span>
                        ) : hour.openTime && hour.closeTime ? (
                          <span className="text-neutral-600">
                            {hour.openTime} - {hour.closeTime}
                          </span>
                        ) : (
                          <span className="text-neutral-400">-</span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Prochaines fermetures */}
              {company.timeOffs && company.timeOffs.length > 0 && (
                <section className="bg-white rounded-xl border border-neutral-200 p-6">
                  <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                    <CalendarOff className="h-5 w-5 text-warning-600" />
                    Prochaines fermetures
                  </h2>
                  <div className="space-y-3">
                    {company.timeOffs.map((timeOff) => {
                      const start = new Date(timeOff.startDate);
                      const end = new Date(timeOff.endDate);
                      const now = new Date();
                      const isActive = start <= now && end >= now;

                      const formatDateRange = () => {
                        if (start.toDateString() === end.toDateString()) {
                          return start.toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                          });
                        }
                        if (start.getMonth() === end.getMonth()) {
                          return `${start.getDate()} - ${end.getDate()} ${end.toLocaleDateString("fr-FR", { month: "long" })}`;
                        }
                        return `${start.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} - ${end.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`;
                      };

                      return (
                        <div
                          key={timeOff.id}
                          className={`p-3 rounded-lg ${isActive ? "bg-warning-50 border border-warning-200" : "bg-neutral-50"}`}
                        >
                          <div className="flex items-center gap-2">
                            {isActive && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-warning-100 text-warning-700 rounded-full">
                                En cours
                              </span>
                            )}
                            <span className="font-medium text-neutral-900">{timeOff.title}</span>
                          </div>
                          <p className="text-sm text-neutral-500 mt-1">{formatDateRange()}</p>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Infos complémentaires */}
              {(company.licenseNumber || company.foundedYear || company.fleetSize || company.coverageRadius) && (
                <section className="bg-white rounded-xl border border-neutral-200 p-6">
                  <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                    Informations
                  </h2>
                  <div className="space-y-3">
                    {company.licenseNumber && (
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-neutral-400" />
                        <div>
                          <p className="text-sm text-neutral-500">Agrément ARS</p>
                          <p className="font-medium text-neutral-900">{company.licenseNumber}</p>
                        </div>
                      </div>
                    )}
                    {company.foundedYear && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-neutral-400" />
                        <div>
                          <p className="text-sm text-neutral-500">Depuis</p>
                          <p className="font-medium text-neutral-900">{company.foundedYear}</p>
                        </div>
                      </div>
                    )}
                    {company.fleetSize && (
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-neutral-400" />
                        <div>
                          <p className="text-sm text-neutral-500">Véhicules</p>
                          <p className="font-medium text-neutral-900">{company.fleetSize}</p>
                        </div>
                      </div>
                    )}
                    {company.coverageRadius && (
                      <div className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-neutral-400" />
                        <div>
                          <p className="text-sm text-neutral-500">Rayon d&apos;intervention</p>
                          <p className="font-medium text-neutral-900">{company.coverageRadius} km</p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* CTA Mobile */}
              <div className="lg:hidden">
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors"
                >
                  {company.acceptsOnlineBooking ? "Réserver un transport" : "Contacter"}
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />

      {/* Modal de réservation */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        company={bookingCompany}
      />

      {/* Modal photo plein écran */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full">
            <Image
              src={selectedPhoto}
              alt="Photo"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
