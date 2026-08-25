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
      <svg className="h-8 sm:h-10 w-auto" viewBox="0 0 160 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 38L30 12L45 38H15Z" fill="#D97706" opacity="0.9"/>
        <path d="M32 38L42 20L52 38H32Z" fill="#475569" opacity="0.8"/>
        <text x="60" y="28" fill="#F8FAFC" fontSize="13" fontWeight="800" fontFamily="sans-serif">NEPAL TOURISM</text>
        <text x="60" y="40" fill="#D97706" fontSize="10" fontWeight="700" fontFamily="sans-serif">BOARD • NTB</text>
      </svg>
    ),
  },
  {
    id: "taan",
    name: "Trekking Agencies' Association of Nepal (TAAN)",
    website: "https://www.taan.org.np",
    logoUrl: "https://www.taan.org.np/images/logo.png",
    svgIcon: (
      <svg className="h-8 sm:h-10 w-auto" viewBox="0 0 150 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="25" cy="25" r="20" stroke="#F8FAFC" strokeWidth="2.5" fill="none"/>
        <path d="M15 32L25 15L35 32H15Z" fill="#F8FAFC"/>
        <text x="52" y="26" fill="#F8FAFC" fontSize="13" fontWeight="800" fontFamily="sans-serif">TAAN NEPAL</text>
        <text x="52" y="38" fill="#94A3B8" fontSize="9" fontWeight="600" fontFamily="sans-serif">TREKKING ASSOCIATION</text>
      </svg>
    ),
  },
  {
    id: "tims",
    name: "Trekking Information Management System (TIMS)",
    website: "https://timsnepal.com",
    logoUrl: "https://timsnepal.com/images/tims-logo.png",
    svgIcon: (
      <svg className="h-8 sm:h-10 w-auto" viewBox="0 0 140 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="8" width="34" height="34" rx="8" fill="#1E293B"/>
        <path d="M12 32L22 16L32 32H12Z" fill="#F59E0B"/>
        <text x="48" y="27" fill="#F8FAFC" fontSize="14" fontWeight="800" fontFamily="sans-serif">TIMS NEPAL</text>
        <text x="48" y="39" fill="#94A3B8" fontSize="9" fontWeight="600" fontFamily="sans-serif">OFFICIAL TREK PERMIT</text>
      </svg>
    ),
  },
  {
    id: "nma",
    name: "Nepal Mountaineering Association (NMA)",
    website: "https://www.nma.org.np",
    logoUrl: "https://www.nma.org.np/images/logo.png",
    svgIcon: (
      <svg className="h-8 sm:h-10 w-auto" viewBox="0 0 160 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 38L28 8L46 38H10Z" fill="#F8FAFC"/>
        <path d="M22 38L28 26L34 38H22Z" fill="#F59E0B"/>
        <text x="54" y="26" fill="#F8FAFC" fontSize="13" fontWeight="800" fontFamily="sans-serif">NMA MOUNTAINEERING</text>
        <text x="54" y="38" fill="#94A3B8" fontSize="9" fontWeight="600" fontFamily="sans-serif">PEAK CLIMBING NEPAL</text>
      </svg>
    ),
  },
  {
    id: "keep",
    name: "Kathmandu Environmental Education Project (KEEP)",
    website: "https://keepnepal.org",
    logoUrl: "https://keepnepal.org/wp-content/uploads/2021/04/keep-logo.png",
    svgIcon: (
      <svg className="h-8 sm:h-10 w-auto" viewBox="0 0 140 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="22" cy="25" r="18" fill="#16A34A" opacity="0.2"/>
        <path d="M14 33C14 33 22 17 30 33" stroke="#22C55E" strokeWidth="3" strokeLinecap="round"/>
        <text x="48" y="27" fill="#22C55E" fontSize="14" fontWeight="800" fontFamily="sans-serif">KEEP NEPAL</text>
        <text x="48" y="39" fill="#94A3B8" fontSize="9" fontWeight="600" fontFamily="sans-serif">ECO TREKKING SAFETY</text>
      </svg>
    ),
  },
  {
    id: "moctca",
    name: "Ministry of Culture, Tourism & Civil Aviation (MoCTCA)",
    website: "https://tourism.gov.np",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Emblem_of_Nepal.svg/512px-Emblem_of_Nepal.svg.png",
    svgIcon: (
      <svg className="h-8 sm:h-10 w-auto" viewBox="0 0 160 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 36L26 12L40 36H12Z" fill="#EF4444"/>
        <text x="48" y="25" fill="#F8FAFC" fontSize="12" fontWeight="800" fontFamily="sans-serif">GOVT. OF NEPAL</text>
        <text x="48" y="37" fill="#94A3B8" fontSize="9" fontWeight="600" fontFamily="sans-serif">MINISTRY OF TOURISM</text>
      </svg>
    ),
  },
  {
    id: "hra",
    name: "Himalayan Rescue Association (HRA Nepal)",
    website: "https://himalayanrescue.org.np",
    logoUrl: "https://himalayanrescue.org.np/assets/images/logo.png",
    svgIcon: (
      <svg className="h-8 sm:h-10 w-auto" viewBox="0 0 150 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="10" width="30" height="30" rx="6" fill="#EF4444"/>
        <path d="M21 16V34M12 25H30" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round"/>
        <text x="44" y="27" fill="#F8FAFC" fontSize="13" fontWeight="800" fontFamily="sans-serif">HRA RESCUE</text>
        <text x="44" y="39" fill="#EF4444" fontSize="9" fontWeight="700" fontFamily="sans-serif">MOUNTAIN MEDICAL SAFETY</text>
      </svg>
    ),
  },
  {
    id: "vitof",
    name: "Village Tourism Promotion Forum Nepal (VITOF-Nepal)",
    website: "https://vitofnepal.org",
    logoUrl: "https://vitofnepal.org/wp-content/uploads/2020/09/vitof-logo.png",
    svgIcon: (
      <svg className="h-8 sm:h-10 w-auto" viewBox="0 0 150 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 35L24 14L38 35H10Z" fill="#10B981"/>
        <text x="46" y="26" fill="#10B981" fontSize="13" fontWeight="800" fontFamily="sans-serif">VITOF-NEPAL</text>
        <text x="46" y="38" fill="#94A3B8" fontSize="9" fontWeight="600" fontFamily="sans-serif">COMMUNITY VILLAGE TOURISM</text>
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
    <section aria-label="Official Partners and Affiliations" className="w-full bg-stone-900 border-y border-stone-800/90 py-4 sm:py-5 overflow-hidden relative select-none">
      {/* Side gradient Fades for smooth edge blending */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-stone-900 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-stone-900 to-transparent z-10 pointer-events-none" />

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
                  className="h-8 sm:h-10 w-auto max-w-[130px] sm:max-w-[160px] object-contain opacity-75 group-hover:opacity-100 transition-all duration-200 brightness-200 contrast-125 group-hover:brightness-100"
                  onError={() =>
                    setImgErrors((prev) => ({ ...prev, [uniqueKey]: true }))
                  }
                />
              ) : (
                <div className="opacity-80 group-hover:opacity-100 transition-opacity duration-200">
                  {item.svgIcon}
                </div>
              )}

              {/* Tooltip: Shows ONLY organization name on hover after short transition, disappears naturally on mouse leave */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30 whitespace-nowrap bg-stone-950 text-white text-[11px] font-bold px-3 py-1 rounded-md shadow-xl border border-stone-700/80 tracking-wide">
                {item.name}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-950" />
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
