"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { openLightbox } from "@/lib/utils/lightbox";

export interface PackageGalleryProps {
  title: string;
  images: string[];
  aspectRatioClass?: string;
}

export function PackageGallery({
  title,
  images,
  aspectRatioClass = "aspect-16/10",
}: PackageGalleryProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const activePhoto = images[activePhotoIndex] || images[0] || "";

  if (!images || images.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Main Image Showcase */}
      <div
        onClick={(e) => {
          const position = Math.max(0, images.indexOf(activePhoto));
          openLightbox({
            items: images.map((photo) => ({
              img: photo,
              thumb: photo,
              alt: title,
              caption: `${title} • High Resolution Mountain View`,
            })),
            position,
            el: e.currentTarget,
          });
        }}
        className={`relative ${aspectRatioClass} w-full rounded-2xl overflow-hidden bg-stone-950 border border-stone-200 cursor-pointer group shadow-2xs`}
        title="Click to view full screen gallery"
      >
        <img
          src={activePhoto}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
          <span className="inline-flex items-center gap-2 bg-white/95 text-stone-900 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-md backdrop-blur-xs">
            <Maximize2 className="w-3.5 h-3.5 text-emerald-800" strokeWidth={2} />
            <span>View Fullscreen ({images.length} photos)</span>
          </span>
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {images.map((photo, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActivePhotoIndex(i)}
              className={`relative aspect-4/3 rounded-xl overflow-hidden cursor-pointer transition-all ${
                activePhoto === photo
                  ? "ring-2 ring-emerald-800 ring-offset-2 ring-offset-white"
                  : "opacity-70 hover:opacity-100 hover:scale-102"
              }`}
            >
              <img
                src={photo}
                alt={`Thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
