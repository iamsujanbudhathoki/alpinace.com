"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TripDepartureDate, DepartureDateStatus } from "@/lib/admin-data";
import { PackageSection } from "./package-section";

interface PackageDeparturesProps {
  dates: TripDepartureDate[];
  defaultPrice?: number;
  onBookDate?: (date: TripDepartureDate) => void;
  isBookingLoading?: boolean;
  activeDepartureDate?: string;
}

const STATUS_BADGES: Record<string, { label: string; bg: string }> = {
  [DepartureDateStatus.GUARANTEED]: { label: "Guaranteed", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  [DepartureDateStatus.AVAILABLE]: { label: "Available", bg: "bg-blue-50 text-blue-800 border-blue-200" },
  [DepartureDateStatus.LIMITED]: { label: "Limited Seats", bg: "bg-yellow-50 text-stone-900 border-yellow-300 font-semibold" },
  [DepartureDateStatus.FULL]: { label: "Full", bg: "bg-rose-50 text-rose-800 border-rose-200" },
};

export function PackageDepartures({
  dates = [],
  defaultPrice,
  onBookDate,
  isBookingLoading = false,
  activeDepartureDate,
}: PackageDeparturesProps) {
  if (!dates || dates.length === 0) return null;

  return (
    <PackageSection title="Scheduled departure dates">
      <div className="divide-y divide-stone-200">
        {dates.map((item, idx) => {
          const statusConfig = STATUS_BADGES[item.status || DepartureDateStatus.GUARANTEED] || STATUS_BADGES[DepartureDateStatus.GUARANTEED];
          const displayPrice = item.priceUSD || defaultPrice;

          return (
            <div
              key={item.id || idx}
              className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="type-heading-md text-stone-900">
                    {item.startDate} &rarr; {item.endDate}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusConfig.bg}`}>
                    {statusConfig.label}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-stone-500 font-medium">
                  {item.seatsAvailable !== undefined && (
                    <span>{item.seatsAvailable} seats remaining</span>
                  )}
                  {item.notes && (
                    <span className="text-stone-900 font-medium">
                      Note: {item.notes}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-stone-100">
                {displayPrice !== undefined && (
                  <div className="text-right">
                    <span className="type-caption block text-stone-400">
                      Per Person
                    </span>
                    <span className="type-heading-md text-stone-900 block">
                      ${displayPrice.toLocaleString()} USD
                    </span>
                  </div>
                )}

                {onBookDate && item.status !== DepartureDateStatus.FULL && (
                  <button
                    type="button"
                    disabled={isBookingLoading}
                    onClick={() => onBookDate(item)}
                    className="btn-primary py-2 px-4 min-h-[42px] text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-85 flex items-center justify-center gap-1.5"
                  >
                    {isBookingLoading && activeDepartureDate === item.startDate ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>Opening...</span>
                      </>
                    ) : (
                      <>
                        <span>Reserve</span>
                        <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </PackageSection>
  );
}
