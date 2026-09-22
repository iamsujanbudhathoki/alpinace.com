"use client";

import Image from "next/image";
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
            Route Map
          </h2>
        </div>
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
        title=""
      >
        <Image
          src={mapImage}
          alt={`${title} Route Map`}
          width={1200}
          height={700}
          sizes="(max-width: 1024px) 100vw, 800px"
          className="w-full max-h-[540px] object-contain mx-auto transition-transform duration-500 group-hover:scale-102"
        />

        
      </div>
    </div>
  );
}
