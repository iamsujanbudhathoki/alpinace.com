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
        className={`relative ${aspectRatioClass} w-full rounded-xl overflow-hidden bg-[#16221B] cursor-pointer group`}
        title="Click to view full screen gallery"
      >
        <img
          src={activePhoto}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="inline-flex items-center gap-2 bg-white text-[#1E2420] px-4 py-2 rounded-md text-xs font-semibold shadow-md">
            <Maximize2 className="w-3.5 h-3.5 text-[#2D4536]" />
            <span>View Fullscreen ({images.length} photos)</span>
          </span>
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2.5">
          {images.map((photo, i) => (
            <button
              key={i}
              onClick={() => setActivePhotoIndex(i)}
              className={`relative aspect-4/3 rounded-lg overflow-hidden cursor-pointer transition-all ${
                activePhoto === photo
                  ? "ring-2 ring-[#2D4536] ring-offset-2 ring-offset-[#FBF9F5]"
                  : "opacity-75 hover:opacity-100"
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
