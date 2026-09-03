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

  // Duplicate the partner list 3 times to create a seamless infinite marquee loop
  const marqueePartners = [
    ...OFFICIAL_PARTNERS,
    ...OFFICIAL_PARTNERS,
    ...OFFICIAL_PARTNERS,
  ];

  return (
    <section className="relative py-8 sm:py-10 bg-stone-100/70 border-b border-stone-200/80 overflow-hidden select-none">
      {/* Centered Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5 sm:mb-6 text-center">
        <span className="text-stone-500 text-xs sm:text-sm font-semibold uppercase tracking-wider inline-block">
          Partners &amp; Affiliations
        </span>
      </div>

      {/* Infinite Auto-Scrolling Marquee Container */}
      <div className="group relative w-full overflow-hidden py-2">
        {/* Soft edge gradient masks for smooth entry and exit */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 md:w-32 bg-gradient-to-r from-stone-100/90 via-stone-100/60 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 md:w-32 bg-gradient-to-l from-stone-100/90 via-stone-100/60 to-transparent z-10" />

        {/* Scrolling Track */}
        <div className="flex items-center animate-partner-marquee group-hover:[animation-play-state:paused]">
          {marqueePartners.map((partner, index) => {
            const hasError = imgErrors[partner.id];
            const imgSrc = hasError ? partner.fallbackUrl : partner.logoUrl;

            return (
              <div
                key={`${partner.id}-${index}`}
                title={partner.name}
                aria-label={partner.name}
                className="flex items-center justify-center shrink-0 px-6 sm:px-10 md:px-12"
              >
                <img
                  src={imgSrc}
                  alt={partner.name}
                  onError={() => handleImageError(partner.id)}
                  className="h-9 sm:h-11 md:h-12 w-auto max-w-[130px] sm:max-w-[160px] md:max-w-[180px] object-contain"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
