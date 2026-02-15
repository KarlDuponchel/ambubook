"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistance } from "@/lib/geo";
import { BookingModal, Company } from "@/components/booking";
import type { CompanySearchResult } from "@/lib/types";

interface CompanyCardProps {
  company: CompanySearchResult;
}

export function CompanyCard({ company }: CompanyCardProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const bookingCompany: Company = {
    id: company.id,
    name: company.name,
    slug: company.slug,
    city: company.city,
  };

  return (
    <>
      <div className="block p-6 bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all group">
        <div className="flex items-start justify-between gap-4">
          <Link
            href={`/${company.slug}`}
            className="flex-1 min-w-0"
          >
            <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
              {company.name}
            </h3>

            {(company.address || company.city) && (
              <p className="mt-1 text-neutral-600 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-neutral-400 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="truncate">
                  {[company.address, company.postalCode, company.city]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </p>
            )}

            {company.phone && (
              <p className="mt-1 text-neutral-600 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-neutral-400 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>{company.phone}</span>
              </p>
            )}
          </Link>

          <div className="flex flex-col items-end gap-2">
            {company.distance !== undefined && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700">
                {formatDistance(company.distance)}
              </span>
            )}

            <button
              type="button"
              onClick={() => setIsBookingModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
            >
              Réserver
            </button>
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        company={bookingCompany}
      />
    </>
  );
}
