"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { SettingService } from "@/lib/services/admin-service";

interface Partner {
  id: string;
  name: string;
  website?: string;
  logoUrl: string;
  fallbackUrl?: string;
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
  const [partners, setPartners] = useState<Partner[]>(OFFICIAL_PARTNERS);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadPartners() {
      try {
        const settings = await SettingService.getPublicAll();
        if (settings && (settings as any).partners) {
          const parsed = typeof (settings as any).partners === "string"
            ? JSON.parse((settings as any).partners)
            : (settings as any).partners;
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPartners(parsed);
          }
        }
      } catch (e) {
        // Fall back gracefully
      }
    }
    loadPartners();
  }, []);

  const handleImageError = (id: string) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  if (!partners || partners.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-white border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading: Clean, crisp, centered matching reference image */}
        <h2 className="text-center font-heading text-stone-600 text-xs sm:text-sm font-semibold tracking-normal mb-8 sm:mb-10">
          Associated with
        </h2>

        {/* Logo Grid Cards: Static, equal width & height cards with subtle rounded borders */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-5xl mx-auto">
          {partners.map((partner) => {
            const hasError = imgErrors[partner.id];
            const imgSrc = hasError && partner.fallbackUrl ? partner.fallbackUrl : partner.logoUrl;

            const card = (
              <div
                className="w-36 sm:w-40 md:w-44 h-16 sm:h-20 bg-white border border-stone-200 rounded-lg p-3 flex items-center justify-center transition-all duration-300 hover:border-stone-400 hover:shadow-2xs group cursor-pointer"
                title={partner.name}
              >
                <Image
                  src={imgSrc}
                  alt={partner.name}
                  width={140}
                  height={48}
                  onError={() => handleImageError(partner.id)}
                  className="max-h-10 sm:max-h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            );

            if (partner.website) {
              return (
                <a
                  key={partner.id}
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={partner.name}
                  className="focus:outline-none focus:ring-2 focus:ring-stone-400 rounded-lg shrink-0"
                >
                  {card}
                </a>
              );
            }

            return (
              <div key={partner.id} className="shrink-0">
                {card}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
