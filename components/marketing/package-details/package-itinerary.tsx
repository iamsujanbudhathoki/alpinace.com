"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
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
  // 0 indicates all closed by default, -1 indicates all open, or specific day number open
  const [openDay, setOpenDay] = useState<number>(0);

  if (!days || days.length === 0) return null;

  const isAllExpanded = openDay === -1;

  const toggleExpandAll = () => {
    setOpenDay(isAllExpanded ? 0 : -1);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-3 border-b border-stone-200">
        <div>
          <h2 className="type-heading-xl">
            {title}
          </h2>
          {subtitle && (
            <p className="type-body-sm mt-0.5">{subtitle}</p>
          )}
        </div>

        <button
          type="button"
          onClick={toggleExpandAll}
          className="btn-secondary py-1 px-2.5 self-start sm:self-auto shrink-0"
        >
          <span>{isAllExpanded ? "Collapse All" : "Expand All"}</span>
        </button>
      </div>

      {/* Clean Editorial Timeline Flow */}
      <div className="relative pl-5 sm:pl-7 border-l border-stone-200 ml-2 sm:ml-2.5 space-y-6 sm:space-y-7 pt-1 pb-2">
        {days.map((day, idx) => {
          const dayNum = Number(day.day || idx + 1);
          const formattedDayLabel = `Day ${String(dayNum).padStart(2, "0")}`;
          const isOpen = isAllExpanded || openDay === dayNum;

          // Collect specs
          const specs: { label: string; value: string }[] = [];
          if (day.maxAltitude) specs.push({ label: "Altitude", value: day.maxAltitude });
          if (day.accommodation || day.overnight)
            specs.push({ label: "Stay", value: day.accommodation || day.overnight || "" });
          if (day.meals) specs.push({ label: "Meals", value: day.meals });

          return (
            <article key={idx} className="relative group">
              {/* Timeline Marker Dot */}
              <div className="absolute -left-[25px] sm:-left-[33px] top-1.5 w-2 h-2 rounded-full bg-amber-700 ring-4 ring-white" />

              {/* Day Header */}
              <button
                type="button"
                onClick={() => setOpenDay(openDay === dayNum ? 0 : dayNum)}
                className="w-full text-left cursor-pointer group flex items-baseline justify-between gap-3"
              >
                <div className="space-y-0.5 min-w-0">
                  <span className="type-caption text-amber-800 font-bold block">
                    {formattedDayLabel}
                  </span>
                  <h3 className="type-heading-md text-stone-900 group-hover:text-amber-800 transition-colors">
                    {day.title || `Day ${dayNum} Schedule`}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-center">
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-stone-400 group-hover:text-stone-700 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-stone-700" : ""
                    }`}
                    strokeWidth={2}
                  />
                </div>
              </button>

              {/* Day Content Body with Smooth Height Animation */}
              <div
                className={`grid transition-[grid-template-rows,opacity] duration-250 ease-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0 mt-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="space-y-2.5 pt-0.5 pb-1">
                    {day.description ? (
                      <p className="type-body whitespace-pre-line">
                        {day.description}
                      </p>
                    ) : (
                      <p className="type-body-sm text-stone-400 italic">
                        Detailed route and trekking specifications for {formattedDayLabel}.
                      </p>
                    )}

                    {/* Day Metadata Footer */}
                    {specs.length > 0 && (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 border-t border-stone-100/80">
                        {specs.map((spec, sIdx) => (
                          <div key={sIdx} className="flex items-center gap-1 text-xs text-stone-500">
                            <span className="font-medium text-stone-400">{spec.label}:</span>
                            <span className="font-semibold text-stone-700">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
