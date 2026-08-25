"use client";

import React, { useState } from "react";

interface Partner {
  id: string;
  name: string;
  website: string;
  logoUrl?: string;
  svgIcon: React.ReactNode;
}

const OFFICIAL_PARTNERS: Partner[] = [
  {
    id: "ntb",
    name: "Nepal Tourism Board (NTB)",
    website: "https://ntb.gov.np",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Nepal_Tourism_Board_logo.svg/512px-Nepal_Tourism_Board_logo.svg.png",
    svgIcon: (
      <svg className="h-9 sm:h-11 w-auto" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 40L25 10L40 40H10Z" fill="#D97706" opacity="0.9"/>
        <path d="M25 40L33 22L41 40H25Z" fill="#1E293B" opacity="0.8"/>
      </svg>
    ),
  },
  {
    id: "taan",
    name: "Trekking Agencies' Association of Nepal (TAAN)",
    website: "https://www.taan.org.np",
    logoUrl: "https://www.taan.org.np/images/logo.png",
    svgIcon: (
      <svg className="h-9 sm:h-11 w-auto" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="25" cy="25" r="21" stroke="#1E293B" strokeWidth="3" fill="none"/>
        <path d="M14 34L25 14L36 34H14Z" fill="#1E293B"/>
      </svg>
    ),
  },
  {
    id: "tims",
    name: "Trekking Information Management System (TIMS)",
    website: "https://timsnepal.com",
    logoUrl: "https://timsnepal.com/images/tims-logo.png",
    svgIcon: (
      <svg className="h-9 sm:h-11 w-auto" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="6" width="38" height="38" rx="10" fill="#0F172A"/>
        <path d="M14 34L25 15L36 34H14Z" fill="#F59E0B"/>
      </svg>
    ),
  },
  {
    id: "nma",
    name: "Nepal Mountaineering Association (NMA)",
    website: "https://www.nma.org.np",
    logoUrl: "https://www.nma.org.np/images/logo.png",
    svgIcon: (
      <svg className="h-9 sm:h-11 w-auto" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 40L25 8L42 40H8Z" fill="#0F172A"/>
        <path d="M20 40L25 28L30 40H20Z" fill="#F59E0B"/>
      </svg>
    ),
  },
  {
    id: "keep",
    name: "Kathmandu Environmental Education Project (KEEP)",
    website: "https://keepnepal.org",
    logoUrl: "https://keepnepal.org/wp-content/uploads/2021/04/keep-logo.png",
    svgIcon: (
      <svg className="h-9 sm:h-11 w-auto" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="25" cy="25" r="20" fill="#15803D" opacity="0.15"/>
        <path d="M15 34C15 34 25 16 35 34" stroke="#15803D" strokeWidth="3.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "moctca",
    name: "Ministry of Culture, Tourism & Civil Aviation (MoCTCA)",
    website: "https://tourism.gov.np",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Emblem_of_Nepal.svg/512px-Emblem_of_Nepal.svg.png",
    svgIcon: (
      <svg className="h-9 sm:h-11 w-auto" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 38L25 12L40 38H10Z" fill="#B91C1C"/>
      </svg>
    ),
  },
  {
    id: "hra",
    name: "Himalayan Rescue Association (HRA Nepal)",
    website: "https://himalayanrescue.org.np",
    logoUrl: "https://himalayanrescue.org.np/assets/images/logo.png",
    svgIcon: (
      <svg className="h-9 sm:h-11 w-auto" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="8" width="34" height="34" rx="8" fill="#DC2626"/>
        <path d="M25 16V34M16 25H34" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "vitof",
    name: "Village Tourism Promotion Forum Nepal (VITOF-Nepal)",
    website: "https://vitofnepal.org",
    logoUrl: "https://vitofnepal.org/wp-content/uploads/2020/09/vitof-logo.png",
    svgIcon: (
      <svg className="h-9 sm:h-11 w-auto" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 38L25 12L40 38H10Z" fill="#047857"/>
      </svg>
    ),
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
      {/* Side gradient Fades for smooth edge blending on white background */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      {/* Auto-scrolling Marquee Track */}
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
              className="group relative shrink-0 flex items-center justify-center px-2 py-1 transition-transform duration-200 hover:scale-105"
              aria-label={item.name}
            >
              {item.logoUrl && !hasError ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={item.logoUrl}
                  alt={item.name}
                  className="h-10 sm:h-12 w-auto max-w-[140px] sm:max-w-[170px] object-contain opacity-70 group-hover:opacity-100 transition-all duration-300 grayscale group-hover:grayscale-0"
                  onError={() =>
                    setImgErrors((prev) => ({ ...prev, [uniqueKey]: true }))
                  }
                />
              ) : (
                <div className="opacity-70 group-hover:opacity-100 transition-opacity duration-200">
                  {item.svgIcon}
                </div>
              )}

              {/* Tooltip: Shows ONLY organization name on hover after short transition, disappears naturally on mouse leave */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30 whitespace-nowrap bg-stone-900 text-white text-[11px] font-bold px-3 py-1 rounded-md shadow-xl border border-stone-800 tracking-wide">
                {item.name}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900" />
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
