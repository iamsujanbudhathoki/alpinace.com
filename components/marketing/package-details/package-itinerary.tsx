"use client";

import { useState } from "react";
import {
  ChevronDown,
  Mountain,
  Utensils,
  BedDouble,
  Clock,
  Compass,
  MapPin,
  Footprints,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
        <h2 className="type-heading-xl">
          {title}
        </h2>

        <button
          type="button"
          onClick={toggleExpandAll}
          className="btn-secondary py-2 px-3.5 self-start sm:self-auto shrink-0 min-h-[40px] text-xs font-semibold"
        >
          <span>{isAllExpanded ? "Collapse All" : "Expand All"}</span>
        </button>
      </div>

      {/* Clean Editorial Timeline Flow */}
      <div className="relative pl-5 sm:pl-7 border-l border-stone-200 ml-2 sm:ml-2.5 space-y-5 sm:space-y-6 pt-1 pb-2">
        {days.map((day, idx) => {
          const dayNum = Number(day.day || idx + 1);
          const formattedDayLabel = `Day ${String(dayNum).padStart(2, "0")}`;
          const isOpen = isAllExpanded || openDay === dayNum;

          // Resolve Altitude
          const altitudeVal = day.maxAltitude || day.altitude;

          // Resolve Duration / Walking Time
          const durationVal =
            day.duration ||
            day.walkingTime ||
            day.walkingHours ||
            day.time ||
            day.details?.find((d) => /duration|walking|hours|time/i.test(d.label))?.value;

          // Resolve Accommodation
          const stayVal = day.accommodation || day.overnight || day.stay || day.lodging;

          // Resolve Meals
          const mealsVal = day.meals || day.meal;

          // Collect specs with dedicated icons and styling
          const specs: {
            icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
            iconColor: string;
            label: string;
            value: string;
          }[] = [];

          if (altitudeVal) {
            specs.push({
              icon: Mountain,
              iconColor: "text-amber-600",
              label: "Altitude",
              value: altitudeVal,
            });
          }

          if (durationVal) {
            specs.push({
              icon: Clock,
              iconColor: "text-blue-600",
              label: "Duration",
              value: durationVal,
            });
          }

          if (stayVal) {
            specs.push({
              icon: BedDouble,
              iconColor: "text-violet-600",
              label: "Stay",
              value: stayVal,
            });
          }

          if (mealsVal) {
            specs.push({
              icon: Utensils,
              iconColor: "text-emerald-600",
              label: "Meals",
              value: mealsVal,
            });
          }

          // Custom key-value highlights if defined
          if (day.details && Array.isArray(day.details)) {
            for (const d of day.details) {
              if (!d.label || !d.value) continue;
              if (/duration|walking|hours|time/i.test(d.label) && durationVal) continue;
              if (/altitude/i.test(d.label) && altitudeVal) continue;
              if (/meal/i.test(d.label) && mealsVal) continue;
              if (/stay|lodging|hotel|accommodation/i.test(d.label) && stayVal) continue;

              let CustomIcon = Compass;
              let customColor = "text-stone-600";
              if (/distance|km|miles/i.test(d.label)) {
                CustomIcon = Footprints;
                customColor = "text-teal-600";
              } else if (/location|place/i.test(d.label)) {
                CustomIcon = MapPin;
                customColor = "text-rose-600";
              }

              specs.push({
                icon: CustomIcon,
                iconColor: customColor,
                label: d.label,
                value: d.value,
              });
            }
          }

          return (
            <article key={idx} className="relative group">
              {/* Timeline Marker Dot */}
              <div className="absolute -left-6 sm:-left-8 top-3.5 w-2.5 h-2.5 rounded-full bg-accent ring-4 ring-white" />

              {/* Day Header */}
              <button
                type="button"
                onClick={() => setOpenDay(openDay === dayNum ? 0 : dayNum)}
                className="w-full text-left cursor-pointer group flex items-start justify-between gap-3 py-2 min-h-[44px]"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="type-caption text-stone-900 font-bold block">
                      {formattedDayLabel}
                    </span>

                    {/* Quick Highlights with Icons in Header */}
                    {altitudeVal && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 bg-stone-100/90 px-2 py-0.5 rounded border border-stone-200/70">
                        <Mountain className="w-3 h-3 text-amber-600 shrink-0" strokeWidth={2.2} />
                        <span>{altitudeVal}</span>
                      </span>
                    )}

                    {durationVal && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 bg-stone-100/90 px-2 py-0.5 rounded border border-stone-200/70">
                        <Clock className="w-3 h-3 text-blue-600 shrink-0" strokeWidth={2.2} />
                        <span>{durationVal}</span>
                      </span>
                    )}

                    {mealsVal && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 bg-stone-100/90 px-2 py-0.5 rounded border border-stone-200/70">
                        <Utensils className="w-3 h-3 text-emerald-600 shrink-0" strokeWidth={2.2} />
                        <span>{mealsVal}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="type-heading-md text-stone-900 group-hover:underline transition-colors">
                    {day.title || `Day ${dayNum} Schedule`}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-center">
                  <ChevronDown
                    className={`h-4 w-4 text-stone-400 group-hover:text-stone-700 transition-transform duration-200 ${
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
                  <div className="space-y-3 pt-0.5 pb-1">
                    {day.description ? (
                      <p className="type-body whitespace-pre-line text-stone-700 leading-relaxed">
                        {day.description}
                      </p>
                    ) : (
                      <p className="type-body-sm text-stone-400 italic">
                        Detailed route and trekking specifications for {formattedDayLabel}.
                      </p>
                    )}

                    {/* Day Metadata Chips with Icons */}
                    {specs.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-stone-200/80 mt-2">
                        {specs.map((spec, sIdx) => {
                          const IconComp = spec.icon;
                          return (
                            <div
                              key={sIdx}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-stone-50 border border-stone-200/90 text-stone-800 shadow-2xs hover:bg-stone-100/90 transition-colors"
                            >
                              <IconComp className={`w-3.5 h-3.5 shrink-0 ${spec.iconColor}`} strokeWidth={2.2} />
                              <span className="font-semibold text-stone-500">{spec.label}:</span>
                              <span className="font-bold text-stone-900">{spec.value}</span>
                            </div>
                          );
                        })}
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
