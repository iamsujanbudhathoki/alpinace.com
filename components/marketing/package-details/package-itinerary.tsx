"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  overnight?: string;
  meals?: string;
}

export interface PackageItineraryProps {
  days: ItineraryDay[];
  title?: string;
  subtitle?: string;
}

export function PackageItinerary({
  days,
  title = "Daily Route & Itinerary",
  subtitle,
}: PackageItineraryProps) {
  const [openDay, setOpenDay] = useState<number>(1);

  if (!days || days.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-[#E6E0D5]">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#1E2420]">
            {title}
          </h2>
          <p className="text-xs text-[#6B726C] mt-0.5">
            {subtitle || `${days.length} Days total journey`}
          </p>
        </div>
        <button
          onClick={() => setOpenDay(openDay === -1 ? 1 : -1)}
          className="text-xs font-semibold text-[#2D4536] hover:underline cursor-pointer"
        >
          {openDay === -1 ? "Collapse All" : "Expand All"}
        </button>
      </div>

      {/* Vertical Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E2DDD3]">
        {days.map((day) => {
          const isOpen = openDay === -1 || openDay === day.day;
          return (
            <div
              key={day.day}
              className="relative bg-white border border-[#EAE5DC] rounded-xl overflow-hidden shadow-2xs transition-all"
            >
              {/* Day badge marker */}
              <div className="absolute -left-6 sm:-left-8 top-4 w-6 h-6 rounded-full bg-[#2D4536] text-white flex items-center justify-center text-[10px] font-bold z-10">
                {day.day}
              </div>

              <button
                onClick={() => setOpenDay(openDay === day.day ? 0 : day.day)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#FAF8F5] transition-colors"
              >
                <span className="font-heading text-sm sm:text-base font-semibold text-[#1E2420]">
                  Day {day.day}: {day.title}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-[#6B726C] transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180 text-[#2D4536]" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-sm text-[#3A423C] space-y-3 border-t border-[#F0EBE1] bg-[#FCFAF7]">
                  <p className="leading-relaxed">{day.description}</p>
                  {(day.meals || day.overnight) && (
                    <div className="flex flex-wrap gap-4 pt-2 text-xs text-[#6B726C]">
                      {day.meals && (
                        <span>
                          Meals:{" "}
                          <strong className="text-[#1E2420]">
                            {day.meals}
                          </strong>
                        </span>
                      )}
                      {day.overnight && (
                        <span>
                          Overnight:{" "}
                          <strong className="text-[#1E2420]">
                            {day.overnight}
                          </strong>
                        </span>
                      )}
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
