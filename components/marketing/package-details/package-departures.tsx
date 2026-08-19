"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TripDepartureDate } from "@/lib/admin-data";

interface PackageDeparturesProps {
  dates: TripDepartureDate[];
  defaultPrice?: number;
  onBookDate?: (date: TripDepartureDate) => void;
}

const STATUS_BADGES: Record<string, { label: string; bg: string }> = {
  guaranteed: { label: "Guaranteed", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  available: { label: "Available", bg: "bg-blue-50 text-blue-800 border-blue-200" },
  limited: { label: "Limited Seats", bg: "bg-amber-50 text-amber-800 border-amber-200" },
  full: { label: "Full", bg: "bg-rose-50 text-rose-800 border-rose-200" },
};

export function PackageDepartures({
  dates = [],
  defaultPrice,
  onBookDate,
}: PackageDeparturesProps) {
  if (!dates || dates.length === 0) {
    return (
      <div className="space-y-3">
        <div className="pb-4 border-b border-stone-200">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-stone-900 tracking-tight">
            Upcoming Departures
          </h2>
        </div>
        <p className="text-base text-stone-600 leading-relaxed">
          Custom departure dates are available upon request. Contact our travel specialists to arrange private departures tailored to your schedule.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-stone-200">
        <h2 className="type-heading-xl">
          Scheduled Departure Dates
        </h2>
        <p className="type-body-sm mt-0.5">
          Choose a guaranteed departure slot or request custom group dates.
        </p>
      </div>

      <div className="divide-y divide-stone-200">
        {dates.map((item, idx) => {
          const statusConfig = STATUS_BADGES[item.status || "guaranteed"] || STATUS_BADGES.guaranteed;
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
                    <span className="text-amber-800">
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

                {onBookDate && item.status !== "full" && (
                  <button
                    type="button"
                    onClick={() => onBookDate(item)}
                    className="btn-primary py-1.5 px-3"
                  >
                    <span>Reserve</span>
                    <ArrowRight className="w-3 h-3" strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
