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
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 32L20 8L32 32H8Z" fill="#D97706" opacity="0.9"/>
        <path d="M20 32L27 18L34 32H20Z" fill="#1E293B" opacity="0.8"/>
      </svg>
    ),
  },
  {
    id: "taan",
    name: "Trekking Agencies' Association of Nepal (TAAN)",
    website: "https://www.taan.org.np",
    logoUrl: "https://www.taan.org.np/images/logo.png",
    svgIcon: (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="16" stroke="#1E293B" strokeWidth="2.5" fill="none"/>
        <path d="M11 27L20 11L29 27H11Z" fill="#1E293B"/>
      </svg>
    ),
  },
  {
    id: "tims",
    name: "Trekking Information Management System (TIMS)",
    website: "https://timsnepal.com",
    logoUrl: "https://timsnepal.com/images/tims-logo.png",
    svgIcon: (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="5" width="30" height="30" rx="8" fill="#0F172A"/>
        <path d="M11 27L20 12L29 27H11Z" fill="#F59E0B"/>
      </svg>
    ),
  },
  {
    id: "nma",
    name: "Nepal Mountaineering Association (NMA)",
    website: "https://www.nma.org.np",
    logoUrl: "https://www.nma.org.np/images/logo.png",
    svgIcon: (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 32L20 6L34 32H6Z" fill="#0F172A"/>
        <path d="M16 32L20 22L24 32H16Z" fill="#F59E0B"/>
      </svg>
    ),
  },
  {
    id: "keep",
    name: "Kathmandu Environmental Education Project (KEEP)",
    website: "https://keepnepal.org",
    logoUrl: "https://keepnepal.org/wp-content/uploads/2021/04/keep-logo.png",
    svgIcon: (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="16" fill="#15803D" opacity="0.15"/>
        <path d="M12 27C12 27 20 13 28 27" stroke="#15803D" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "moctca",
    name: "Ministry of Culture, Tourism & Civil Aviation (MoCTCA)",
    website: "https://tourism.gov.np",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Emblem_of_Nepal.svg/512px-Emblem_of_Nepal.svg.png",
    svgIcon: (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 30L20 10L32 30H8Z" fill="#B91C1C"/>
      </svg>
    ),
  },
  {
    id: "hra",
    name: "Himalayan Rescue Association (HRA Nepal)",
    website: "https://himalayanrescue.org.np",
    logoUrl: "https://himalayanrescue.org.np/assets/images/logo.png",
    svgIcon: (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="6" width="28" height="28" rx="6" fill="#DC2626"/>
        <path d="M20 13V27M13 20H27" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "vitof",
    name: "Village Tourism Promotion Forum Nepal (VITOF-Nepal)",
    website: "https://vitofnepal.org",
    logoUrl: "https://vitofnepal.org/wp-content/uploads/2020/09/vitof-logo.png",
    svgIcon: (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 30L20 10L32 30H8Z" fill="#047857"/>
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
      <div className="flex items-center space-x-6 sm:space-x-8 animate-partner-marquee w-max">
        {marqueeItems.map((item, index) => {
          const uniqueKey = `${item.id}-${index}`;
          const hasError = imgErrors[uniqueKey];

          return (
            <a
              key={uniqueKey}
              href={item.website}
              target="_blank"
              rel="noopener noreferrer"
              className="group shrink-0 flex items-center gap-3 px-4 py-2 rounded-full bg-slate-50/90 border border-stone-200/90 hover:border-amber-400 hover:bg-amber-50/50 transition-all duration-300 shadow-2xs cursor-pointer"
              aria-label={item.name}
            >
              {item.logoUrl && !hasError ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={item.logoUrl}
                  alt={item.name}
                  className="h-6 sm:h-7 w-auto max-w-[80px] sm:max-w-[100px] object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-200"
                  onError={() =>
                    setImgErrors((prev) => ({ ...prev, [uniqueKey]: true }))
                  }
                />
              ) : (
                <div className="shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  {item.svgIcon}
                </div>
              )}

              <span className="text-xs sm:text-sm font-semibold text-stone-800 group-hover:text-stone-950 transition-colors whitespace-nowrap">
                {item.name}
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
