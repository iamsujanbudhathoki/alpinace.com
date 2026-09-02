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

  return (
    <section className="py-10 sm:py-12 bg-stone-100/70 border-b border-stone-200/80 overflow-hidden select-none">
      {/* Centered Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8 text-center">
        <span className="text-stone-500 text-xs sm:text-sm font-semibold uppercase tracking-wider inline-block">
          Partners &amp; Affiliations
        </span>
      </div>

      {/* Centered Responsive Grid/Flex Logos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-12">
          {OFFICIAL_PARTNERS.map((partner) => {
            const hasError = imgErrors[partner.id];
            const imgSrc = hasError ? partner.fallbackUrl : partner.logoUrl;

            return (
              <a
                key={partner.id}
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                title={partner.name}
                aria-label={partner.name}
                className="flex items-center justify-center h-14 w-28 sm:w-36 md:w-40 p-2 group transition-all duration-300 rounded-lg hover:bg-stone-200/50"
              >
                <img
                  src={imgSrc}
                  alt={partner.name}
                  onError={() => handleImageError(partner.id)}
                  className="max-h-11 sm:max-h-12 max-w-full object-contain grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
