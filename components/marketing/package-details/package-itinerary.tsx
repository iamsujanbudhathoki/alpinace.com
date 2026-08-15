"use client";

import { useState } from "react";
import {
  ChevronDown,
  Mountain,
  BedDouble,
  Utensils,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";
import { TripItineraryDay, TripItineraryDetail } from "@/lib/trek-data";

export type { TripItineraryDay, TripItineraryDetail };
export type ItineraryDay = TripItineraryDay;

export interface PackageItineraryProps {
  days: TripItineraryDay[];
  title?: string;
  subtitle?: string;
}

export function PackageItinerary({
  days = [],
  title = "Detailed Itinerary",
  subtitle,
}: PackageItineraryProps) {
  // -1 indicates all open, 0 indicates all closed, or specific day number open (defaulting to Day 1 open)
  const [openDay, setOpenDay] = useState<number>(1);

  if (!days || days.length === 0) return null;

  const isAllExpanded = openDay === -1;

  const toggleExpandAll = () => {
    setOpenDay(isAllExpanded ? 0 : -1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-3 border-b border-[#E6E0D5]">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#1E2420]">
            {title}
          </h2>
          <p className="text-xs text-[#6B726C] mt-0.5">
            {subtitle || `${days.length} Days total journey breakdown`}
          </p>
        </div>

        <button
          type="button"
          onClick={toggleExpandAll}
          className="text-xs font-bold text-[#2D4536] hover:text-[#1E2420] hover:underline cursor-pointer transition-colors bg-[#F3EFEA] hover:bg-[#EAE4DC] px-3 py-1.5 rounded-lg"
        >
          {isAllExpanded ? "Collapse All" : "Expand All"}
        </button>
      </div>

      {/* Timeline List */}
      <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E2DDD3]">
        {days.map((day, idx) => {
          const dayNum = Number(day.day || idx + 1);
          const formattedDayLabel = `Day ${String(dayNum).padStart(2, "0")}`;
          const isOpen = isAllExpanded || openDay === dayNum;

          // Collect all extra details / highlights
          const detailList: Array<{ label: string; value: string; icon?: any }> = [];

          if (day.maxAltitude) {
            detailList.push({
              label: "Max. Altitude",
              value: day.maxAltitude,
              icon: Mountain,
            });
          }

          if (day.accommodation || day.overnight) {
            detailList.push({
              label: "Overnight",
              value: day.accommodation || day.overnight || "",
              icon: BedDouble,
            });
          }

          if (day.meals) {
            detailList.push({
              label: "Meals",
              value: day.meals,
              icon: Utensils,
            });
          }

          if (Array.isArray(day.details)) {
            day.details.forEach((d) => {
              if (d && d.label && d.value) {
                detailList.push({
                  label: d.label,
                  value: d.value,
                  icon: Sparkles,
                });
              }
            });
          }

          return (
            <div
              key={idx}
              className={`relative bg-white border rounded-xl overflow-hidden shadow-2xs transition-all duration-200 ${
                isOpen ? "border-[#D6CEC2] ring-1 ring-[#D6CEC2]/50" : "border-[#EAE5DC] hover:border-[#D6CEC2]"
              }`}
            >
              {/* Day badge marker on vertical line */}
              <div
                className={`absolute -left-6 sm:-left-8 top-4 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold z-10 transition-colors ${
                  isOpen ? "bg-[#2D4536] text-white shadow-xs" : "bg-[#EAE5DC] text-[#2D4536]"
                }`}
              >
                {dayNum}
              </div>

              {/* Accordion Header Button */}
              <button
                type="button"
                onClick={() => setOpenDay(openDay === dayNum ? 0 : dayNum)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#FAF8F5] transition-colors"
              >
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-heading text-sm sm:text-base font-bold text-[#1E2420]">
                    {formattedDayLabel}:
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-[#2D4536]">
                    {day.title || `Day ${dayNum} Route`}
                  </span>
                </div>

                <ChevronDown
                  className={`h-4 w-4 text-[#6B726C] transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180 text-[#2D4536]" : ""
                  }`}
                />
              </button>

              {/* Accordion Body */}
              {isOpen && (
                <div className="px-5 pb-5 pt-2 text-sm text-[#3A423C] space-y-4 border-t border-[#F0EBE1] bg-[#FCFAF7]">
                  {day.description ? (
                    <p className="leading-relaxed font-normal text-sm sm:text-[14.5px] text-[#2C342E]">
                      {day.description}
                    </p>
                  ) : (
                    <p className="text-xs text-[#8A918B] italic">
                      Detailed route and trekking specifications for {formattedDayLabel}.
                    </p>
                  )}

                  {/* Highlights / Specs Badges */}
                  {detailList.length > 0 && (
                    <div className="pt-3 border-t border-[#EAE4DC] flex flex-wrap gap-2 sm:gap-3">
                      {detailList.map((item, dIdx) => (
                        <div
                          key={dIdx}
                          className="inline-flex items-center gap-1.5 bg-white border border-[#E4DED3] px-3 py-1.5 rounded-lg text-xs shadow-2xs"
                        >
                          <span className="text-[#6B726C] font-medium">
                            {item.label}:
                          </span>
                          <strong className="text-[#1E2420] font-bold">
                            {item.value}
                          </strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
