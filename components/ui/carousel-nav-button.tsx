"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CarouselNavButtonProps {
  direction: "prev" | "next";
  onClick: () => void;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
}

export function CarouselNavButton({
  direction,
  onClick,
  ariaLabel,
  disabled = false,
  className,
}: CarouselNavButtonProps) {
  const isPrev = direction === "prev";
  const Icon = isPrev ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        // Visibility: Hidden on small mobile touchscreens (users swipe naturally), visible on tablet and up
        "hidden md:flex absolute top-1/2 -translate-y-1/2 z-20",
        // Proportional responsive sizing across viewports:
        // Tablet (md: 36px) -> Laptop/14" (lg: 40px) -> Desktop (xl: 44px)
        "w-9 h-9 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-11 xl:h-11",
        // Balanced responsive offsets avoiding card overlap and viewport clipping
        isPrev
          ? "-left-3 md:-left-3.5 lg:-left-4 xl:-left-5"
          : "-right-3 md:-right-3.5 lg:-right-4 xl:-right-5",
        // Clean circular button with glassmorphic backing & subtle elevation
        "rounded-full bg-white/95 backdrop-blur-xs text-stone-800 border border-stone-200/90 shadow-md",
        "items-center justify-center cursor-pointer select-none",
        // Consistent Alpine Ace brand interactions: yellow hover + active tactile press feedback
        "hover:bg-yellow-400 hover:border-yellow-400 hover:text-stone-950 hover:shadow-[0_6px_16px_rgba(234,179,8,0.3)] hover:scale-105 active:scale-95",
        "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2",
        "transition-all duration-200 ease-out",
        disabled && "opacity-40 cursor-not-allowed hover:bg-white hover:border-stone-200 hover:text-stone-800 hover:scale-100",
        className
      )}
    >
      <Icon
        className="w-4 h-4 md:w-4 md:h-4 lg:w-[18px] lg:h-[18px] xl:w-5 xl:h-5 transition-transform duration-200"
        strokeWidth={2.25}
      />
    </button>
  );
}
