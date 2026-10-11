"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, ZoomIn, Loader2 } from "lucide-react";
import { openSingleImage } from "@/lib/utils/lightbox";

interface PackageTrekMapProps {
  mapImage?: string;
  title: string;
}

export function PackageTrekMap({ mapImage, title }: PackageTrekMapProps) {
  const [downloading, setDownloading] = useState(false);

  if (!mapImage || !mapImage.trim()) return null;

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloading) return;
    setDownloading(true);

    try {
      const res = await fetch(mapImage);
      if (!res.ok) throw new Error("Network response was not ok");
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const ext = mapImage.split(".").pop()?.split("?")[0] || "jpg";
      const cleanTitle = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      a.download = `${cleanTitle}-route-map.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback for cross-origin or direct navigation
      const a = document.createElement("a");
      a.href = mapImage;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-route-map`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-stone-200">
        <div>
          <h2 className="type-heading-xl">Route Map</h2>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="btn-secondary h-8 px-3 text-xs font-semibold text-stone-700 hover:text-stone-900 border border-stone-300 rounded-md flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs disabled:opacity-50"
          title="Download Route Map"
        >
          {downloading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-600" />
          ) : (
            <Download className="w-3.5 h-3.5 text-stone-600" strokeWidth={2} />
          )}
          <span>{downloading ? "Downloading..." : "Download Map"}</span>
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
        className="relative group rounded-xl overflow-hidden bg-stone-100/40 border border-stone-200 cursor-zoom-in shadow-xs w-full block"
        title="Click to view full-size route map"
      >
        <Image
          src={mapImage}
          alt={`${title} Route Map`}
          width={1400}
          height={900}
          sizes="(max-width: 1024px) 100vw, 800px"
          className="w-full h-auto block object-cover transition-transform duration-500 group-hover:scale-[1.01]"
        />

        {/* Floating Download Action Button on Image */}
        <div className="absolute top-3 right-3 z-10">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="w-9 h-9 rounded-lg bg-white/90 hover:bg-white text-stone-800 shadow-md backdrop-blur-xs border border-stone-200/80 flex items-center justify-center transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
            title="Download Route Map"
            aria-label="Download Route Map"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin text-stone-700" />
            ) : (
              <Download className="w-4 h-4 text-stone-700" strokeWidth={2} />
            )}
          </button>
        </div>

        {/* Click to expand overlay hint */}
        <div className="absolute bottom-3 right-3 opacity-90 group-hover:opacity-100 transition-opacity pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-900/80 text-white text-xs font-medium backdrop-blur-xs shadow-sm">
            <ZoomIn className="w-3.5 h-3.5" />
            Click to expand
          </span>
        </div>
      </div>
    </div>
  );
}
