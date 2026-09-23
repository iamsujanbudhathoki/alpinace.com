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
 * Formats an ISO date string or Date into a readable date and time format like "Sep 23, 2026, 5:45 PM".
 * Falls back to the original value if it can't be parsed.
 */
export function formatDateTime(value: string | Date | undefined | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Smart formatting for notifications showing contextual date and time.
 * E.g., "Today, 5:45 PM", "Yesterday, 5:45 PM", or "Sep 23, 2026, 5:45 PM".
 */
export function formatNotificationTime(value: string | Date | undefined | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date.getTime())) return String(value);

  const now = new Date();
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return `Today, ${timeStr}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Yesterday, ${timeStr}`;
  }

  const isSameYear = date.getFullYear() === now.getFullYear();
  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(isSameYear ? {} : { year: "numeric" }),
  });

  return `${dateStr}, ${timeStr}`;
}

/**
 * Generates a centralized gradient background style for range slider inputs using global CSS variables.
 */
export function getSliderFillStyle(fillPct: number): { background: string } {
  return {
    background: `linear-gradient(to right, var(--slider-fill, #1c1917) 0%, var(--slider-fill, #1c1917) ${fillPct}%, var(--slider-bg, #e7e5e4) ${fillPct}%, var(--slider-bg, #e7e5e4) 100%)`,
  };
}
