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
    id: "taan",
    name: "Trekking Agencies' Association of Nepal",
    website: "https://www.taan.org.np",
    logoUrl: "/partners/taan.jpg",
    fallbackUrl: "https://www.taan.org.np/public/images/taan-logo.jpg",
  },
  {
    id: "ntb",
    name: "Nepal Tourism Board",
    website: "https://ntb.gov.np",
    logoUrl: "/partners/ntb.png",
    fallbackUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Nepal_Tourism_Board_logo.svg/512px-Nepal_Tourism_Board_logo.svg.png",
  },
  {
    id: "tims",
    name: "Trekking Information Management System",
    website: "https://timsnepal.com",
    logoUrl: "/partners/tims.png",
    fallbackUrl: "https://timsnepal.com/images/tims-logo.png",
  },
  {
    id: "nma",
    name: "Nepal Mountaineering Association",
    website: "https://www.nepalmountaineering.org",
    logoUrl: "/partners/nma.png",
    fallbackUrl: "https://www.nepalmountaineering.org/storage/website/logo-header.png",
  },
  {
    id: "keep",
    name: "Kathmandu Environmental Education Project",
    website: "https://keepnepal.org",
    logoUrl: "/partners/keep.png",
    fallbackUrl: "https://keepnepal.org/wp-content/uploads/2021/04/keep-logo.png",
  },
  {
    id: "hra",
    name: "Himalayan Rescue Association",
    website: "https://himalayanrescue.org.np",
    logoUrl: "/partners/hra.png",
    fallbackUrl: "https://himalayanrescue.org.np/assets/images/logo.png",
  },
  {
    id: "vitof",
    name: "Village Tourism Promotion Forum Nepal",
    website: "https://vitofnepal.org",
    logoUrl: "/partners/vitof.png",
    fallbackUrl: "https://vitofnepal.org/wp-content/uploads/2020/09/vitof-logo.png",
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
