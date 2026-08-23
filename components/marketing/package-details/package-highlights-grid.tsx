"use client";

import React from "react";
import {
  Globe,
  Gauge,
  Mountain,
  CloudSun,
  BedDouble,
  Utensils,
  MapPin,
  HelpCircle,
} from "lucide-react";
import { TrekItem } from "@/lib/trek-data";
import { PackageItem } from "@/lib/admin-data";

export interface PackageHighlightsGridProps {
  packageData: TrekItem | PackageItem;
  className?: string;
}

export function DurationIcon({ className = "w-6 h-6 text-slate-700" }: { className?: string }) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M31.6667 6.66634H28.3333V3.33301H25V6.66634H15V3.33301H11.6667V6.66634H8.33333C6.495 6.66634 5 8.16134 5 9.99967V33.333C5 35.1713 6.495 36.6663 8.33333 36.6663H31.6667C33.505 36.6663 35 35.1713 35 33.333V9.99967C35 8.16134 33.505 6.66634 31.6667 6.66634ZM31.67 33.333H8.33333V13.333H31.6667L31.67 33.333Z"
        fill="currentColor"
      />
      <path
        d="M18.3336 29.0236L27.8453 19.5119L25.4886 17.1553L18.3336 24.3103L14.5119 20.4886L12.1553 22.8453L18.3336 29.0236Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ActivityIcon({ className = "w-6 h-6 text-slate-700" }: { className?: string }) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M22.4832 9.13346C24.3166 9.13346 25.8166 7.63346 25.8166 5.80013C25.8166 3.9668 24.3166 2.4668 22.4832 2.4668C20.6499 2.4668 19.1499 3.9668 19.1499 5.80013C19.1499 7.63346 20.6499 9.13346 22.4832 9.13346ZM17.1999 29.1335L18.1499 24.9668L21.6499 28.3001V36.6335C21.6499 37.5501 22.3999 38.3001 23.3166 38.3001C24.2332 38.3001 24.9832 37.5501 24.9832 36.6335V27.2335C24.9832 26.3168 24.6166 25.4501 23.9499 24.8168L21.4832 22.4668L22.4832 17.4668C24.3614 19.614 26.9326 21.0352 29.7499 21.4835C30.7499 21.6335 31.6499 20.8335 31.6499 19.8168C31.6499 19.0001 31.0499 18.3168 30.2332 18.1835C27.6999 17.7668 25.5999 16.2668 24.4832 14.3001L22.8166 11.6335C22.1499 10.6335 21.1499 9.9668 19.9832 9.9668C19.4832 9.9668 19.1499 10.1335 18.6499 10.1335L12.0166 12.9335C11.4128 13.1916 10.8981 13.6214 10.5366 14.1696C10.1751 14.7178 9.98266 15.3601 9.98324 16.0168V19.9668C9.98324 20.8835 10.7332 21.6335 11.6499 21.6335C12.5666 21.6335 13.3166 20.8835 13.3166 19.9668V15.9668L16.3166 14.8001L13.6499 28.3001L7.11657 26.9668C6.21657 26.7835 5.33324 27.3668 5.1499 28.2668V28.3335C4.96657 29.2335 5.5499 30.1168 6.4499 30.3001L13.2999 31.6668C14.1519 31.8359 15.0363 31.6658 15.7647 31.1926C16.4931 30.7194 17.0081 29.9806 17.1999 29.1335Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function PackageHighlightsGrid({
  packageData,
  className = "",
}: PackageHighlightsGridProps) {
  if (!packageData) return null;

  const maxAltM = packageData.maxAltitudeMeters || (packageData as any).peakHeightM || 0;
  const maxAltFt = Math.round(maxAltM * 3.28084);

  const items = [
    {
      icon: <Globe className="w-6 h-6 text-slate-700" />,
      label: "Country",
      value: packageData.country,
      hasTooltip: false,
    },
    {
      icon: <DurationIcon className="w-6 h-6 text-slate-700" />,
      label: "Duration",
      value: `${packageData.durationDays} Days`,
      hasTooltip: false,
    },
    {
      icon: <Gauge className="w-6 h-6 text-slate-700" />,
      label: "Difficulty",
      value: packageData.difficulty,
      hasTooltip: true,
      tooltipText: "Difficulty grade based on altitude, terrain, and daily walking hours.",
    },
    {
      icon: <ActivityIcon className="w-6 h-6 text-slate-700" />,
      label: "Activity",
      value: packageData.activity,
      hasTooltip: false,
    },
    {
      icon: <Mountain className="w-6 h-6 text-slate-700" />,
      label: "Max. altitude",
      value: maxAltM > 0 ? `${maxAltM.toLocaleString()} m/${maxAltFt.toLocaleString()} ft` : undefined,
      hasTooltip: false,
    },
    {
      icon: <CloudSun className="w-6 h-6 text-slate-700" />,
      label: "Best season",
      value: packageData.bestSeason,
      hasTooltip: false,
    },
    {
      icon: <BedDouble className="w-6 h-6 text-slate-700" />,
      label: "Accomodation",
      value: packageData.accommodation,
      hasTooltip: true,
      tooltipText: "Types of lodging included during the journey.",
    },
    {
      icon: <Utensils className="w-6 h-6 text-slate-700" />,
      label: "Meals",
      value: packageData.meals,
      hasTooltip: true,
      tooltipText: "Meal plans provided during the trip.",
    },
    {
      icon: <MapPin className="w-6 h-6 text-slate-700" />,
      label: "Start/End Point",
      value: packageData.startEndLocation,
      hasTooltip: false,
    },
  ];

  return (
    <div
      className={`bg-stone-50 rounded-xl p-6 sm:p-7 border border-stone-200 ${className}`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3.5">
            <div className="shrink-0 pt-0.5 text-stone-700">{item.icon}</div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-stone-600">
                  {item.label}
                </span>
                {item.hasTooltip && (
                  <div className="group relative inline-block">
                    <HelpCircle className="w-3.5 h-3.5 text-stone-400 cursor-help" />
                    {item.tooltipText && (
                      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block w-48 p-2 bg-stone-900 text-white text-[11px] rounded shadow-lg z-50 text-center font-normal">
                        {item.tooltipText}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p className="text-sm font-bold text-stone-900 capitalize">
                {item.value || "—"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
