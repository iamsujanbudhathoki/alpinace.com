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
    id: "ntb",
    name: "Nepal Tourism Board",
    website: "https://ntb.gov.np",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Nepal_Tourism_Board_logo.svg/512px-Nepal_Tourism_Board_logo.svg.png",
    fallbackUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "taan",
    name: "Trekking Agencies' Association of Nepal",
    website: "https://www.taan.org.np",
    logoUrl: "https://www.taan.org.np/images/logo.png",
    fallbackUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "tims",
    name: "Trekking Information Management System",
    website: "https://timsnepal.com",
    logoUrl: "https://timsnepal.com/images/tims-logo.png",
    fallbackUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "nma",
    name: "Nepal Mountaineering Association",
    website: "https://www.nma.org.np",
    logoUrl: "https://www.nma.org.np/images/logo.png",
    fallbackUrl: "https://images.unsplash.com/photo-1583870908408-3f9c6f8a9e0f?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "keep",
    name: "Kathmandu Environmental Education Project",
    website: "https://keepnepal.org",
    logoUrl: "https://keepnepal.org/wp-content/uploads/2021/04/keep-logo.png",
    fallbackUrl: "https://images.unsplash.com/photo-1585409677983-0f6c41ca913b?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "moctca",
    name: "Ministry of Culture, Tourism & Civil Aviation",
    website: "https://tourism.gov.np",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Emblem_of_Nepal.svg/512px-Emblem_of_Nepal.svg.png",
    fallbackUrl: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "hra",
    name: "Himalayan Rescue Association",
    website: "https://himalayanrescue.org.np",
    logoUrl: "https://himalayanrescue.org.np/assets/images/logo.png",
    fallbackUrl: "https://images.unsplash.com/photo-1516482498816-ba38689e1c14?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "vitof",
    name: "Village Tourism Promotion Forum Nepal",
    website: "https://vitofnepal.org",
    logoUrl: "https://vitofnepal.org/wp-content/uploads/2020/09/vitof-logo.png",
    fallbackUrl: "https://images.unsplash.com/photo-1544644181-1484b3fdfc32?auto=format&fit=crop&w=200&q=80",
  },
];

export function PartnersAffiliationsSection() {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Tripled array creates a 100% seamless infinite scroll loop with 0 jumping glitches
  const marqueeItems = [
    ...OFFICIAL_PARTNERS,
    ...OFFICIAL_PARTNERS,
    ...OFFICIAL_PARTNERS,
  ];

  return (
    <section aria-label="Official Partners and Affiliations" className="w-full bg-white border-y border-stone-200/80 py-5 sm:py-6 overflow-hidden relative select-none shadow-2xs">
      {/* Side gradient Fades */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      {/* Auto-scrolling Marquee Track - PURE LOGO IMAGES ONLY */}
      <div className="flex items-center space-x-12 sm:space-x-20 animate-partner-marquee w-max">
        {marqueeItems.map((item, index) => {
          const uniqueKey = `${item.id}-${index}`;
          const hasError = imgErrors[uniqueKey];

          return (
            <a
              key={uniqueKey}
              href={item.website}
              target="_blank"
              rel="noopener noreferrer"
              className="group shrink-0 flex items-center justify-center px-2 py-1 transition-transform duration-200 hover:scale-105"
              aria-label={item.name}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={hasError ? item.fallbackUrl : item.logoUrl}
                alt={item.name}
                className="h-10 sm:h-12 w-auto max-w-[140px] sm:max-w-[170px] object-contain opacity-75 group-hover:opacity-100 transition-all duration-300 grayscale group-hover:grayscale-0"
                onError={() =>
                  setImgErrors((prev) => ({ ...prev, [uniqueKey]: true }))
                }
              />
            </a>
          );
        })}
      </div>
    </section>
  );
}
