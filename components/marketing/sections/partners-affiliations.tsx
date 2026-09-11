"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { SettingService } from "@/lib/services/admin-service";

interface Partner {
  id: string;
  name: string;
  website?: string;
  logoUrl: string;
}

const OFFICIAL_PARTNERS: Partner[] = [
  {
    id: "moctca",
    name: "Ministry of Culture, Tourism & Civil Aviation",
    logoUrl: "/partners/moctca.jpeg",
  },
  {
    id: "ntb",
    name: "Nepal Tourism Board",
    logoUrl: "/partners/ntb.jpg",
  },
  {
    id: "taan",
    name: "Trekking Agencies' Association of Nepal",
    logoUrl: "/partners/taan.jpg",
  },
  {
    id: "nma",
    name: "Nepal Mountaineering Association",
    logoUrl: "/partners/nma.png",
  },
  {
    id: "hra",
    name: "Himalayan Rescue Association",
    logoUrl: "/partners/hra.png",
  },
  {
    id: "vitof",
    name: "Village Tourism Promotion Forum Nepal",
    logoUrl: "/partners/vitof.png",
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
    <section className="py-8 bg-white border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6">
          {/* Section Heading in one line */}
          <h2 className="font-heading text-base sm:text-lg font-bold text-stone-900 shrink-0 whitespace-nowrap">
            Associated with
          </h2>

          {/* Partner Logos in one horizontal line */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 sm:gap-4">
            {partners.map((partner) => {
              if (imgErrors[partner.id]) return null;

              return (
                <div
                  key={partner.id}
                  title={partner.name}
                  className="w-28 sm:w-32 md:w-36 h-12 sm:h-14 bg-white border border-stone-200/80 rounded-md p-2.5 flex items-center justify-center shrink-0 transition-all duration-200 hover:border-stone-300 shadow-2xs"
                >
                  <Image
                    src={partner.logoUrl}
                    alt={partner.name}
                    width={120}
                    height={40}
                    onError={() => handleImageError(partner.id)}
                    className="max-h-7 sm:max-h-9 w-auto object-contain"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
