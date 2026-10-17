"use client";

import type { ReactNode } from "react";

export interface PackageSectionProps {
  title: string;
  /** Optional control rendered at the end of the header (buttons, rating summary...). */
  action?: ReactNode;
  /**
   * `plain` keeps the editorial flow on the page background.
   * `panel` frames logistical content (cost, add-ons, prep info) on a tinted surface
   * so neighbouring sections read as distinct chapters.
   */
  variant?: "plain" | "panel";
  className?: string;
  children: ReactNode;
}

export function PackageSection({
  title,
  action,
  variant = "plain",
  className = "",
  children,
}: PackageSectionProps) {
  const surface =
    variant === "panel"
      ? "rounded-2xl border border-stone-200 bg-stone-50/70 p-5 sm:p-6"
      : "";

  return (
    <div className={`space-y-5 sm:space-y-6 ${surface} ${className}`}>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
        <div className="min-w-0">
          <h2 className="type-heading-section">{title}</h2>
        </div>

        {action && <div className="shrink-0 self-start sm:self-auto">{action}</div>}
      </header>

      {children}
    </div>
  );
}
