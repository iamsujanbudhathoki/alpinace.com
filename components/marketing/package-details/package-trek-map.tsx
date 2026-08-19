"use client";

import { Maximize2 } from "lucide-react";
import { openSingleImage } from "@/lib/utils/lightbox";

interface PackageTrekMapProps {
  mapImage?: string;
  title: string;
}

export function PackageTrekMap({ mapImage, title }: PackageTrekMapProps) {
  if (!mapImage) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-3 border-b border-stone-200">
        <div>
          <h2 className="type-heading-xl">
            Route Map &amp; Elevation Profile
          </h2>
          <p className="type-body-sm mt-0.5">
            Topographical route trajectory for {title}.
          </p>
        </div>

        <button
          type="button"
          onClick={(e) => openSingleImage(mapImage, `${title} Route Map`, e.currentTarget)}
          className="btn-secondary"
        >
          <Maximize2 className="w-3 h-3" strokeWidth={2} />
          <span>Full Resolution</span>
        </button>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={(e) => openSingleImage(mapImage, `${title} Route Map`, e.currentTarget)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            openSingleImage(mapImage, `${title} Route Map`, e.currentTarget);
          }
        }}
        className="relative group rounded-xl overflow-hidden bg-stone-100/40 border border-stone-200 cursor-zoom-in shadow-xs"
        title="Click to view full resolution map"
      >
        <img
          src={mapImage}
          alt={`${title} Route Map`}
          className="w-full max-h-[540px] object-contain mx-auto transition-transform duration-500 group-hover:scale-102"
        />

        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white/95 text-stone-900 text-xs font-bold px-4 py-2 rounded-full shadow-md flex items-center gap-2 backdrop-blur-xs">
            <Maximize2 className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Click for Full Resolution Map</span>
          </span>
        </div>
      </div>
    </div>
  );
}
