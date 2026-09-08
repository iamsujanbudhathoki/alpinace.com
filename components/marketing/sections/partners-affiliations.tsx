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
    logoUrl: "/partners/moctca.jpeg",
    fallbackUrl: "https://rpcdn.ratopati.com/media/albums/culture_8OtcyEd3ME.jpeg",
  },
  {
    id: "ntb",
    name: "Nepal Tourism Board",
    logoUrl: "/partners/ntb.jpg",
    fallbackUrl: "https://d2s3cbzybmajg3.cloudfront.net/public/media/1920/ntb_logo-1663927863_resized1920.jpg",
  },
  {
    id: "taan",
    name: "Trekking Agencies' Association of Nepal",
    logoUrl: "/partners/taan.jpg",
    fallbackUrl: "https://www.taan.org.np/public/images/taan-logo.jpg",
  },
  {
    id: "nma",
    name: "Nepal Mountaineering Association",
    logoUrl: "/partners/nma.png",
    fallbackUrl: "https://www.nepalmountaineering.org/storage/website/logo-header.png",
  },
  {
    id: "hra",
    name: "Himalayan Rescue Association",
    logoUrl: "/partners/hra.png",
    fallbackUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT48L_K_HXPmWDGYUknEtIskritbLNCm7AEZ3AqwyJtdg&s=10",
  },
  {
    id: "vitof",
    name: "Village Tourism Promotion Forum Nepal",
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
    <section className="py-10 sm:py-14 bg-white border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading matching website design system */}
        <div className="text-center space-y-1 mb-6 sm:mb-8">
          <span className="text-stone-500 text-xs font-medium block">
            Partners &amp; Affiliations
          </span>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
            Associated with
          </h2>
          <div className="h-0.5 w-10 sm:w-12 bg-[#eab308] rounded-full mx-auto mt-2.5" />
        </div>

        {/* Clean Static Showcase Cards without redirect links */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-5xl mx-auto">
          {partners.map((partner) => {
            const hasError = imgErrors[partner.id];
            const imgSrc = hasError && partner.fallbackUrl ? partner.fallbackUrl : partner.logoUrl;

            return (
              <div
                key={partner.id}
                title={partner.name}
                className="w-32 sm:w-36 md:w-40 h-16 sm:h-18 bg-white border border-stone-200/80 rounded-md p-3 flex items-center justify-center shrink-0 transition-all duration-200 hover:border-stone-300 shadow-2xs"
              >
                <Image
                  src={imgSrc}
                  alt={partner.name}
                  width={130}
                  height={44}
                  onError={() => handleImageError(partner.id)}
                  className="max-h-9 sm:max-h-11 w-auto object-contain"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
