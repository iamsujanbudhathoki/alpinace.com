"use client";

import React from "react";

export interface QuickFactItem {
  icon?: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
}

export interface PackageQuickFactsProps {
  facts: QuickFactItem[];
  className?: string;
}

export function PackageQuickFacts({
  facts,
  className = "",
}: PackageQuickFactsProps) {
  if (!facts || facts.length === 0) return null;

  return (
    <div className={`bg-stone-50/70 border border-stone-200 rounded-md p-3.5 sm:p-4.5 ${className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {facts.map((fact, index) => (
          <div key={index} className="bg-white border border-stone-200/80 rounded p-2.5 sm:p-3">
            <span className="type-caption block text-stone-500 font-semibold text-[11px] uppercase tracking-wider mb-0.5">
              {fact.label}
            </span>
            <span className="type-heading-md text-stone-900 block font-bold truncate">
              {fact.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
