"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface TabItem {
  key: string;
  label: string;
}

export interface PackageTabsNavProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  className?: string;
  offset?: number;
  variant?: "default" | "header";
}

export function PackageTabsNav({
  tabs,
  activeTab,
  onTabChange,
  className = "",
  offset = 80,
  variant = "default",
}: PackageTabsNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  // Check scroll position to update scroll indicators / arrows
  const checkScrollState = useCallback(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const scrollLeft = Math.ceil(el.scrollLeft);
    const maxScroll = el.scrollWidth - el.clientWidth;

    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < maxScroll - 2);
  }, []);

  useEffect(() => {
    checkScrollState();
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("scroll", checkScrollState, { passive: true });
    window.addEventListener("resize", checkScrollState, { passive: true });

    return () => {
      el.removeEventListener("scroll", checkScrollState);
      window.removeEventListener("resize", checkScrollState);
    };
  }, [checkScrollState, tabs]);

  // Native non-passive wheel handler to map vertical wheel to horizontal scroll without jumping page
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;

      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta !== 0) {
        const canScroll =
          (delta > 0 && el.scrollLeft < el.scrollWidth - el.clientWidth) ||
          (delta < 0 && el.scrollLeft > 0);
        if (canScroll) {
          e.preventDefault();
          el.scrollLeft += delta;
        }
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Auto-scroll the active tab into view in horizontal container only when necessary
  useEffect(() => {
    if (activeBtnRef.current && containerRef.current) {
      const container = containerRef.current;
      const button = activeBtnRef.current;

      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      const isVisible =
        buttonRect.left >= containerRect.left + 12 &&
        buttonRect.right <= containerRect.right - 12;

      if (!isVisible && container.scrollWidth > container.clientWidth) {
        const relativeLeft = buttonRect.left - containerRect.left + container.scrollLeft;
        const buttonWidth = buttonRect.width;
        const containerWidth = containerRect.width;
        const scrollLeft = relativeLeft - containerWidth / 2 + buttonWidth / 2;

        container.scrollTo({
          left: Math.max(0, scrollLeft),
          behavior: "smooth",
        });
      }
    }
  }, [activeTab]);

  // Mouse Drag-to-Scroll implementation
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - containerRef.current.offsetLeft;
    scrollLeftRef.current = containerRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 5) {
      hasDraggedRef.current = true;
    }
    containerRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const scrollByAmount = (direction: "left" | "right") => {
    if (!containerRef.current) return;
    const amount = direction === "left" ? -220 : 220;
    containerRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (!tabs || tabs.length === 0) return null;

  const handleTabClick = (key: string) => {
    if (hasDraggedRef.current) {
      return;
    }
    onTabChange(key);

    const section = document.getElementById(key);
    if (section) {
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: "smooth",
      });
    }
  };

  const isHeaderVariant = variant === "header";

  return (
    <div
      className={`relative flex items-center min-w-0 select-none group/tabs-nav ${
        isHeaderVariant
          ? "flex-1 self-stretch"
          : "border-b border-stone-200 bg-white/95 backdrop-blur-md w-full"
      } ${className}`}
    >
      {/* Scroll Left Arrow Button */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByAmount("left")}
          className="absolute left-0 top-0 bottom-0 z-20 px-1 flex items-center justify-center bg-gradient-to-r from-white via-white/90 to-transparent text-stone-700 hover:text-stone-950 cursor-pointer transition-opacity duration-200"
          aria-label="Scroll left"
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white shadow-xs border border-stone-200 flex items-center justify-center">
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </button>
      )}

      {/* Scroll Right Arrow Button */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByAmount("right")}
          className="absolute right-0 top-0 bottom-0 z-20 px-1 flex items-center justify-center bg-gradient-to-l from-white via-white/90 to-transparent text-stone-700 hover:text-stone-950 cursor-pointer transition-opacity duration-200"
          aria-label="Scroll right"
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white shadow-xs border border-stone-200 flex items-center justify-center">
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>
      )}

      {/* Horizontal Scroll Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        style={{
          display: "flex",
          alignItems: "center",
          overflowX: "auto",
          overflowY: "hidden",
          whiteSpace: "nowrap",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-x pan-y",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        className={`nav-horizontal-scroll px-1 w-full min-w-0 ${
          isHeaderVariant ? "self-stretch py-1" : "-mb-px sm:px-0"
        } ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      >
        <div className="flex items-center h-full gap-1 sm:gap-2 min-w-max">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                ref={isActive ? activeBtnRef : null}
                data-tab-key={tab.key}
                type="button"
                onClick={() => handleTabClick(tab.key)}
                className={`
                  relative whitespace-nowrap shrink-0 min-w-max cursor-pointer flex items-center justify-center font-medium select-none
                  transition-colors duration-150
                  ${
                    isHeaderVariant
                      ? "px-3 sm:px-4 py-2 text-xs sm:text-sm min-h-[40px]"
                      : "px-4 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm min-h-[44px] border-b-2"
                  }
                  ${
                    isActive
                      ? isHeaderVariant
                        ? "text-stone-950 font-bold"
                        : "border-accent text-stone-950 font-bold"
                      : isHeaderVariant
                        ? "text-stone-600 hover:text-stone-900 font-medium"
                        : "border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-300"
                  }
                `}
              >
                <span>{tab.label}</span>
                {isActive && isHeaderVariant && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
