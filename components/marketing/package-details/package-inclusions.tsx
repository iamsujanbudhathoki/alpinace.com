"use client";

import { Check, Minus } from "lucide-react";

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
      {/* Header */}
      <div className="pb-3 border-b border-stone-200">
        <h2 className="type-heading-xl">
          {title}
        </h2>
        {subtitle && (
          <p className="type-body-sm mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
        {/* Inclusions Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <h3 className="type-heading-md">
              {inclusionsTitle}
            </h3>
            <span className="type-caption">
              {inclusions.length} items
            </span>
          </div>

          <ul className="space-y-2 text-xs sm:text-sm text-stone-700">
            {inclusions.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <Check className="w-3.5 h-3.5 text-emerald-800 shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="type-body">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Exclusions Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <h3 className="type-heading-md">
              {exclusionsTitle}
            </h3>
            <span className="type-caption">
              {exclusions.length} items
            </span>
          </div>

          <ul className="space-y-2 text-xs sm:text-sm text-stone-600">
            {exclusions.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <Minus className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" strokeWidth={2} />
                <span className="type-body text-stone-600">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
