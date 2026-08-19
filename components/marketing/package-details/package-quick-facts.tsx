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
    <div
      className={`border-y border-stone-200 py-3 sm:py-4 ${className}`}
    >
      <div
        className={`grid gap-3 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-stone-200 ${
          facts.length === 2
            ? "grid-cols-1 sm:grid-cols-2"
            : facts.length === 3
            ? "grid-cols-1 sm:grid-cols-3"
            : "grid-cols-2 lg:grid-cols-4"
        }`}
      >
        {facts.map((fact, index) => (
          <div
            key={index}
            className={`${
              index === 0
                ? "sm:pr-5"
                : index === facts.length - 1
                ? "pt-2.5 sm:pt-0 sm:pl-5"
                : "pt-2.5 sm:pt-0 sm:px-5"
            }`}
          >
            <span className="type-caption block mb-0.5">
              {fact.label}
            </span>
            <span className="type-heading-md text-stone-900 block">
              {fact.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
