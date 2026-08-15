"use client";

import { CheckCircle2, X } from "lucide-react";

export interface PackageInclusionsProps {
  inclusions: string[];
  exclusions: string[];
  title?: string;
  subtitle?: string;
  inclusionsTitle?: string;
  exclusionsTitle?: string;
}

export function PackageInclusions({
  inclusions,
  exclusions,
  title = "What's Included & Excluded",
  subtitle = "Transparent pricing with zero hidden operational costs",
  inclusionsTitle = "Included in Package",
  exclusionsTitle = "Not Included",
}: PackageInclusionsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-[#1E2420]">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-[#6B726C] mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
        {/* Inclusions */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#1E2420] uppercase tracking-wider pb-2 border-b border-[#E6E0D5] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2D4536]" />
            <span>{inclusionsTitle}</span>
          </h3>
          <ul className="space-y-3 text-sm text-[#3A423C]">
            {inclusions.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-4 h-4 rounded-full bg-[#E5EFE8] text-[#2D4536] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  ✓
                </span>
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Exclusions */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#1E2420] uppercase tracking-wider pb-2 border-b border-[#E6E0D5] flex items-center gap-2">
            <X className="w-4 h-4 text-[#994D4D]" />
            <span>{exclusionsTitle}</span>
          </h3>
          <ul className="space-y-3 text-sm text-[#6B726C]">
            {exclusions.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-4 h-4 rounded-full bg-[#FCE8E8] text-[#994D4D] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  ×
                </span>
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
