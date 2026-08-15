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
    <section className={`border-b border-[#E6E0D5] bg-white sticky top-20 z-20 shadow-2xs ${className}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div
          className={`grid py-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-[#EFEBE3] ${
            facts.length === 2
              ? "grid-cols-2"
              : facts.length === 3
              ? "grid-cols-2 md:grid-cols-3"
              : "grid-cols-2 md:grid-cols-4"
          }`}
        >
          {facts.map((fact, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 ${
                index === 0
                  ? "md:pr-4"
                  : index === facts.length - 1
                  ? "pt-3 md:pt-0 md:pl-4"
                  : "pt-3 md:pt-0 md:px-4"
              }`}
            >
              {fact.icon && (
                <div className="text-[#2D4536] shrink-0">{fact.icon}</div>
              )}
              <div className="min-w-0">
                <span className="text-[11px] text-[#6B726C] uppercase tracking-wider font-semibold block">
                  {fact.label}
                </span>
                <span className="text-sm font-semibold text-[#1E2420] truncate block">
                  {fact.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
