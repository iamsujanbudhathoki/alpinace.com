"use client";

import { Calendar, Users, DollarSign, CheckCircle2, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TripDepartureDate } from "@/lib/admin-data";

interface PackageDeparturesProps {
  dates: TripDepartureDate[];
  defaultPrice?: number;
  onBookDate?: (date: TripDepartureDate) => void;
}

const STATUS_BADGES: Record<string, { label: string; bg: string }> = {
  guaranteed: { label: "Guaranteed", bg: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  available: { label: "Available", bg: "bg-blue-100 text-blue-800 border-blue-300" },
  limited: { label: "Limited Seats", bg: "bg-amber-100 text-amber-800 border-amber-300" },
  full: { label: "Full", bg: "bg-rose-100 text-rose-800 border-rose-300" },
};

export function PackageDepartures({
  dates = [],
  defaultPrice,
  onBookDate,
}: PackageDeparturesProps) {
  if (!dates || dates.length === 0) {
    return (
      <div className="bg-white border border-[#EAE5DC] rounded-2xl p-6 sm:p-8 space-y-3 shadow-2xs">
        <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#1E2420] flex items-center gap-2.5">
          <Calendar className="w-5 h-5 text-amber-700" />
          <span>Upcoming Departure Dates</span>
        </h2>
        <p className="text-sm text-[#4E5650]">
          Custom departure dates are available upon request. Contact our expedition specialists to arrange private departures for your dates.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#EAE5DC] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E6E0D5]">
        <div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#1E2420] flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-amber-700" />
            <span>Scheduled Departure Dates ({dates.length})</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#6B726C] mt-1">
            Choose a guaranteed departure date slot or request custom group dates.
          </p>
        </div>
      </div>

      <div className="divide-y divide-[#EAE5DC]">
        {dates.map((item, idx) => {
          const statusConfig = STATUS_BADGES[item.status || "guaranteed"] || STATUS_BADGES.guaranteed;
          const displayPrice = item.priceUSD || defaultPrice;

          return (
            <div
              key={item.id || idx}
              className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-base font-bold text-[#1E2420]">
                    {item.startDate} &rarr; {item.endDate}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusConfig.bg}`}>
                    {statusConfig.label}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#525B54]">
                  {item.seatsAvailable !== undefined && (
                    <span className="flex items-center gap-1 font-medium">
                      <Users className="w-3.5 h-3.5 text-amber-700" />
                      <span>{item.seatsAvailable} seats available</span>
                    </span>
                  )}
                  {item.notes && (
                    <span className="italic text-[#2D4536] font-medium">
                      Note: {item.notes}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#F0EBE1]">
                {displayPrice !== undefined && (
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-[#6B726C] font-semibold block">
                      Price per Person
                    </span>
                    <span className="text-lg font-black text-[#2D4536]">
                      ${displayPrice.toLocaleString()} USD
                    </span>
                  </div>
                )}

                {onBookDate && item.status !== "full" && (
                  <Button
                    type="button"
                    onClick={() => onBookDate(item)}
                    className="bg-[#2D4536] hover:bg-[#1E2E24] text-white text-xs font-bold px-4 h-9 rounded-xl gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <span>Reserve Date</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
