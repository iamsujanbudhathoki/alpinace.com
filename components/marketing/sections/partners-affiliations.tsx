"use client";

import React, { useState } from "react";

interface Partner {
  id: string;
  name: string;
  website: string;
  logoUrl: string;
  fallbackUrl: string;
}

const OFFICIAL_PARTNERS: Partner[] = [
  {
    id: "moctca",
    name: "Ministry of Culture, Tourism & Civil Aviation",
    website: "https://tourism.gov.np",
    logoUrl: "/partners/moctca.jpeg",
    fallbackUrl: "https://rpcdn.ratopati.com/media/albums/culture_8OtcyEd3ME.jpeg",
  },
  {
    id: "ntb",
    name: "Nepal Tourism Board",
    website: "https://ntb.gov.np",
    logoUrl: "/partners/ntb.jpg",
    fallbackUrl: "https://d2s3cbzybmajg3.cloudfront.net/public/media/1920/ntb_logo-1663927863_resized1920.jpg",
  },
  {
    id: "taan",
    name: "Trekking Agencies' Association of Nepal",
    website: "https://www.taan.org.np",
    logoUrl: "/partners/taan.jpg",
    fallbackUrl: "https://www.taan.org.np/public/images/taan-logo.jpg",
  },
  {
    id: "nma",
    name: "Nepal Mountaineering Association",
    website: "https://www.nepalmountaineering.org",
    logoUrl: "/partners/nma.png",
    fallbackUrl: "https://www.nepalmountaineering.org/storage/website/logo-header.png",
  },
  {
    id: "hra",
    name: "Himalayan Rescue Association",
    website: "https://himalayanrescue.org.np",
    logoUrl: "/partners/hra.png",
    fallbackUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT48L_K_HXPmWDGYUknEtIskritbLNCm7AEZ3AqwyJtdg&s=10",
  },
  {
    id: "vitof",
    name: "Village Tourism Promotion Forum Nepal",
    website: "https://vitofnepal.org",
    logoUrl: "/partners/vitof.png",
    fallbackUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1x04NR53T93qQhmO71nYzXF2vfbje9s8hGCge3KbOog&s=10",
  },
];

export function PartnersAffiliationsSection() {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  // Duplicate logos 4 times to ensure a seamless, continuous marquee track on all screen sizes
  const marqueeLogos = [...OFFICIAL_PARTNERS, ...OFFICIAL_PARTNERS, ...OFFICIAL_PARTNERS, ...OFFICIAL_PARTNERS];

  return (
    <section className="py-8 bg-stone-100/70 border-b border-stone-200/80 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3 text-stone-500 text-xs font-semibold uppercase tracking-wider">
        <span>Partners &amp; Affiliations</span>
      </div>

      <div className="relative w-full overflow-hidden">
        {/* Gradient edge masks for smooth fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-stone-100/90 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-stone-100/90 to-transparent z-10 pointer-events-none" />

        {/* Continuous Automatic Marquee Track */}
        <div className="animate-marquee-track flex items-center gap-8 sm:gap-12 py-2">
          {marqueeLogos.map((partner, idx) => {
            const hasError = imgErrors[partner.id];
            const imgSrc = hasError ? partner.fallbackUrl : partner.logoUrl;

            return (
              <a
                key={`${partner.id}-${idx}`}
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                title={partner.name}
                aria-label={partner.name}
                className="shrink-0 flex items-center justify-center h-12 w-28 sm:w-36 px-3 py-1 group transition-opacity"
              >
                <img
                  src={imgSrc}
                  alt={partner.name}
                  onError={() => handleImageError(partner.id)}
                  className="max-h-10 max-w-full object-contain hover:scale-105 transition-all duration-300"
                />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
