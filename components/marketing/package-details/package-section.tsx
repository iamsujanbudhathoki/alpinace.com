"use client";

import type { ComponentType, ReactNode } from "react";

type SectionIcon = ComponentType<{ className?: string; strokeWidth?: number }>;

export interface PackageSectionProps {
  title: string;
  /** Short label naming the chapter this section belongs to, e.g. "The experience". */
  eyebrow?: string;
  icon?: SectionIcon;
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
  eyebrow,
  icon: Icon,
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
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <span className="flex w-10 h-10 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white text-emerald-800 shadow-2xs">
              <Icon className="w-5 h-5" strokeWidth={1.75} />
            </span>
          )}
          <div className="min-w-0">
            {eyebrow && (
              <p className="type-caption text-emerald-800">{eyebrow}</p>
            )}
            <h2 className="type-heading-section">{title}</h2>
          </div>
        </div>

        {action && <div className="shrink-0 self-start sm:self-auto">{action}</div>}
      </header>

      {children}
    </div>
  );
}
