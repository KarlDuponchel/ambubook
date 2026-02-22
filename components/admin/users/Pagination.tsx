"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminPagination } from "@/lib/types";

interface PaginationProps {
  pagination: AdminPagination;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const limitOptions = [10, 20, 50];

export function Pagination({ pagination, onPageChange, onLimitChange }: PaginationProps) {
  const { page, limit, total, totalPages } = pagination;

  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  // Calcul des pages à afficher
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (page > 3) {
        pages.push("...");
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
      {/* Info et sélecteur de limite */}
      <div className="flex items-center gap-4 text-sm text-neutral-600">
        <span>
          {startItem}-{endItem} sur {total}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-neutral-500">Afficher</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
            className="px-2 py-1 bg-white border border-neutral-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          >
            {limitOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="p-1.5 rounded text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {getPageNumbers().map((pageNum, index) => (
            pageNum === "..." ? (
              <span key={`ellipsis-${index}`} className="px-2 text-neutral-400">
                ...
              </span>
            ) : (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  "min-w-[32px] h-8 px-2 rounded text-sm font-medium transition-colors",
                  page === pageNum
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                {pageNum}
              </button>
            )
          ))}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="p-1.5 rounded text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
