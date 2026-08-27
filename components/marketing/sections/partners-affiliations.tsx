"use client";

import React, { useState, useRef, useEffect } from "react";

interface Partner {
  id: string;
  name: string;
  website: string;
  logoUrl: string;
  fallbackUrl: string;
}

const OFFICIAL_PARTNERS: Partner[] = [
  {
    id: "moctca",
    name: "Ministry of Culture, Tourism & Civil Aviation",
    website: "https://tourism.gov.np",
    logoUrl: "/partners/moctca.jpeg",
    fallbackUrl: "https://rpcdn.ratopati.com/media/albums/culture_8OtcyEd3ME.jpeg",
  },
  {
    id: "ntb",
    name: "Nepal Tourism Board",
    website: "https://ntb.gov.np",
    logoUrl: "/partners/ntb.jpg",
    fallbackUrl: "https://d2s3cbzybmajg3.cloudfront.net/public/media/1920/ntb_logo-1663927863_resized1920.jpg",
  },
  {
    id: "taan",
    name: "Trekking Agencies' Association of Nepal",
    website: "https://www.taan.org.np",
    logoUrl: "/partners/taan.jpg",
    fallbackUrl: "https://www.taan.org.np/public/images/taan-logo.jpg",
  },
  {
    id: "nma",
    name: "Nepal Mountaineering Association",
    website: "https://www.nepalmountaineering.org",
    logoUrl: "/partners/nma.png",
    fallbackUrl: "https://www.nepalmountaineering.org/storage/website/logo-header.png",
  },
  {
    id: "hra",
    name: "Himalayan Rescue Association",
    website: "https://himalayanrescue.org.np",
    logoUrl: "/partners/hra.png",
    fallbackUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT48L_K_HXPmWDGYUknEtIskritbLNCm7AEZ3AqwyJtdg&s=10",
  },
  {
    id: "vitof",
    name: "Village Tourism Promotion Forum Nepal",
    website: "https://vitofnepal.org",
    logoUrl: "/partners/vitof.png",
    fallbackUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1x04NR53T93qQhmO71nYzXF2vfbje9s8hGCge3KbOog&s=10",
  },
];

const SET_COUNT = 6;

export function PartnersAffiliationsSection() {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [isDraggingState, setIsDraggingState] = useState(false);

  // Duplicate partner items 6 times for seamless infinite scroll and drag
  const marqueeItems = Array.from({ length: SET_COUNT }, () => OFFICIAL_PARTNERS).flat();

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isReducedMotion = mediaQuery.matches;

    const handleMotionChange = (e: MediaQueryListEvent) => {
      isReducedMotion = e.matches;
    };
    mediaQuery.addEventListener("change", handleMotionChange);

    // Initial scroll setup in the middle set to allow initial left/right drag
    const updateInitialScroll = () => {
      if (container && container.scrollWidth > 0) {
        const singleSetWidth = container.scrollWidth / SET_COUNT;
        if (container.scrollLeft === 0 && singleSetWidth > 0) {
          container.scrollLeft = singleSetWidth * 2;
        }
      }
    };

    updateInitialScroll();
    const timer = setTimeout(updateInitialScroll, 300);

    let animationFrameId: number;
    const baseSpeed = 0.5; // pixels per frame

    const normalizeScroll = (singleSetWidth: number) => {
      if (singleSetWidth <= 0 || !container) return;
      if (container.scrollLeft >= singleSetWidth * 4) {
        container.scrollLeft -= singleSetWidth * 2;
      } else if (container.scrollLeft <= singleSetWidth) {
        container.scrollLeft += singleSetWidth * 2;
      }
    };

    const step = () => {
      if (container) {
        const singleSetWidth = container.scrollWidth / SET_COUNT;

        if (!isHoveredRef.current && !isDraggingRef.current && !isReducedMotion) {
          container.scrollLeft += baseSpeed;
        }

        normalizeScroll(singleSetWidth);
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
      mediaQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  const handlePointerEnter = () => {
    isHoveredRef.current = true;
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    isHoveredRef.current = false;
    handlePointerUpOrCancel(e);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = scrollRef.current;
    if (!container) return;
    isDraggingRef.current = true;
    setIsDraggingState(true);
    startXRef.current = e.clientX;
    scrollLeftRef.current = container.scrollLeft;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore fallback
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const container = scrollRef.current;
    if (!container) return;
    const dx = e.clientX - startXRef.current;
    container.scrollLeft = scrollLeftRef.current - dx;

    const singleSetWidth = container.scrollWidth / SET_COUNT;
    if (singleSetWidth > 0) {
      if (container.scrollLeft >= singleSetWidth * 4) {
        container.scrollLeft -= singleSetWidth * 2;
        startXRef.current = e.clientX;
        scrollLeftRef.current = container.scrollLeft;
      } else if (container.scrollLeft <= singleSetWidth) {
        container.scrollLeft += singleSetWidth * 2;
        startXRef.current = e.clientX;
        scrollLeftRef.current = container.scrollLeft;
      }
    }
  };

  const handlePointerUpOrCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDraggingState(false);
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore fallback
    }
  };

  return (
    <section
      aria-label="Official Partners and Affiliations"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className="w-full bg-slate-50/60 py-10 sm:py-12 overflow-hidden relative select-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-700 bg-stone-100 px-3.5 py-1 rounded-full border border-stone-200 inline-block mb-2">
          Recognized &amp; Certified
        </span>
        <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          Official Partners &amp; Tourism Affiliations
        </h3>
        <p className="text-[11px] text-slate-500 mt-1 font-medium hidden sm:block">
          Hover to pause &bull; Click &amp; hold to drag partner logos horizontally
        </p>
      </div>

      <div className="relative">
        {/* Side gradient Fades */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

        {/* Scrollable / Drag Track */}
        <div
          ref={scrollRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUpOrCancel}
          onPointerCancel={handlePointerUpOrCancel}
          className={`flex items-center space-x-8 sm:space-x-12 overflow-x-auto py-3 no-scrollbar scrollbar-none transition-cursor touch-pan-y ${
            isDraggingState ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {marqueeItems.map((item, index) => {
            const uniqueKey = `${item.id}-${index}`;
            const hasError = imgErrors[uniqueKey];

            return (
              <div
                key={uniqueKey}
                title={item.name}
                className="group shrink-0 flex items-center justify-center px-2 py-1 transition-transform duration-200 hover:scale-105"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hasError ? item.fallbackUrl : item.logoUrl}
                  alt={item.name}
                  draggable={false}
                  className="h-9 sm:h-11 w-auto max-w-[130px] sm:max-w-[160px] object-contain opacity-85 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  onError={() =>
                    setImgErrors((prev) => ({ ...prev, [uniqueKey]: true }))
                  }
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
