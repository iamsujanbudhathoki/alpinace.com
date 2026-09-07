import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats an ISO date string or Date into a readable format like "Aug 5, 2026".
 * Falls back to the original value if it can't be parsed.
 */
export function formatDate(value: string | Date | undefined | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Generates a centralized gradient background style for range slider inputs using global CSS variables.
 */
export function getSliderFillStyle(fillPct: number): { background: string } {
  return {
    background: `linear-gradient(to right, var(--slider-fill, #1c1917) 0%, var(--slider-fill, #1c1917) ${fillPct}%, var(--slider-bg, #e7e5e4) ${fillPct}%, var(--slider-bg, #e7e5e4) 100%)`,
  };
}
