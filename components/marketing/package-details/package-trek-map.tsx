"use client";

import { Compass, MapPin, Maximize2 } from "lucide-react";
import { openSingleImage } from "@/lib/utils/lightbox";

interface PackageTrekMapProps {
  mapImage?: string;
  title: string;
}

export function PackageTrekMap({ mapImage, title }: PackageTrekMapProps) {
  if (!mapImage) return null;

  return (
    <div className="bg-white border border-[#EAE5DC] rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E6E0D5]">
        <div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#1E2420] flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-amber-700" />
            <span>Trek Route Map &amp; Elevation Profile</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#6B726C] mt-1">
            Geographical route map and elevation trajectory for {title}.
          </p>
        </div>

        <button
          type="button"
          onClick={(e) => openSingleImage(mapImage, `${title} Trek Route Map`, e.currentTarget)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2D4536] hover:text-[#1E2E24] bg-[#F5F2EC] hover:bg-[#EAE5DC] px-3 py-1.5 rounded-lg transition-colors cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Expand Route Map</span>
        </button>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={(e) => openSingleImage(mapImage, `${title} Trek Route Map`, e.currentTarget)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            openSingleImage(mapImage, `${title} Trek Route Map`, e.currentTarget);
          }
        }}
        className="relative group rounded-xl overflow-hidden bg-[#1E2420] border border-[#EAE5DC] cursor-zoom-in shadow-2xs"
        title="Click to view full resolution map"
      >
        <img
          src={mapImage}
          alt={`${title} Trek Route Map`}
          className="w-full max-h-[500px] object-contain mx-auto transition-transform duration-300 group-hover:scale-102"
        />

        <div className="absolute inset-0 bg-[#1E2420]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white/90 text-[#1E2420] text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-amber-700" />
            <span>Click for Full Resolution Map</span>
          </span>
        </div>
      </div>
    </div>
  );
}
