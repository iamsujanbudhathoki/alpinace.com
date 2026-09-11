"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";

export interface ReviewItemProp {
  id?: string;
  author: string;
  country?: string;
  date?: string;
  content: string;
  avatar?: string;
  rating?: number;
}

export interface PackageReviewsProps {
  reviews?: ReviewItemProp[];
  title?: string;
  subtitle?: string;
  overallRating?: number;
}

function getReviewHeadline(content: string): string {
  if (!content) return "Exceptional Himalayan Experience";
  const cleaned = content.replace(/^["“']|["”']$/g, "").trim();
  const firstSentence = cleaned.split(/[.!?]/)[0].trim();
  if (firstSentence.length >= 10 && firstSentence.length <= 65) {
    return firstSentence;
  }
  return "Very professional company with excellent guides";
}

export function PackageReviews({
  reviews = [],
  title = "Traveler Reviews",
  overallRating = 5.0,
}: PackageReviewsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const activeReviews = reviews;

  const updateScrollState = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const card = container.querySelector<HTMLElement>(".review-card");
    const scrollAmount = card ? card.offsetWidth + 16 : 380;

    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const getInitials = (name: string) => {
    if (!name) return "AA";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <section className="space-y-6">
      {/* Header: Title, Rating & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
        <h2 className="type-heading-xl">
          {title}
        </h2>

        {/* Rating Summary & Controls */}
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 bg-stone-100/80 px-2.5 py-1 rounded-full border border-stone-200 text-xs">
            <div className="flex items-center gap-0.5 text-accent">
              <Star className="w-3.5 h-3.5 fill-accent text-accent" />
            </div>
            <div className="text-xs font-semibold text-stone-900">
              <span>{overallRating.toFixed(1)}</span>
              <span className="text-stone-400 font-normal"> / 5.0</span>
              <span className="text-stone-500 font-normal ml-1">
                ({activeReviews.length})
              </span>
            </div>
          </div>

          {activeReviews.length > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleScroll("left")}
                disabled={!canScrollLeft}
                aria-label="Previous review"
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                  canScrollLeft
                    ? "border-stone-300 bg-white text-stone-900 hover:bg-stone-950 hover:text-white shadow-xs"
                    : "border-stone-200 bg-stone-50 text-stone-300 cursor-not-allowed"
                }`}
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={2} />
              </button>

              <button
                type="button"
                onClick={() => handleScroll("right")}
                disabled={!canScrollRight}
                aria-label="Next review"
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                  canScrollRight
                    ? "border-stone-300 bg-white text-stone-900 hover:bg-stone-950 hover:text-white shadow-xs"
                    : "border-stone-200 bg-stone-50 text-stone-300 cursor-not-allowed"
                }`}
              >
                <ChevronRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Slider */}
      {activeReviews.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-xl border border-dashed border-stone-200 bg-stone-50 text-stone-500 text-xs">
          No traveler reviews submitted for this package yet.
        </div>
      ) : (
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-4 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scroll-smooth focus:outline-hidden scrollbar-none"
        >
        {activeReviews.map((rev, idx) => (
          <div
            key={rev.id || idx}
            className="review-card snap-start min-w-[280px] sm:min-w-[340px] max-w-[380px] shrink-0 p-5 bg-white border border-stone-200/90 rounded-2xl flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-300 group"
          >
            <div className="space-y-3.5">
              {/* Reviewer Header */}
              <div className="flex items-center justify-between gap-2.5 pb-3 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  {rev.avatar ? (
                    <Image
                      src={rev.avatar}
                      alt={rev.author}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover border border-stone-200 shrink-0 shadow-2xs"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-stone-900 text-accent font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                      {getInitials(rev.author)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="font-heading text-xs sm:text-sm font-bold text-stone-900 truncate">
                      {rev.author}
                    </h3>
                    {(rev.country || rev.date) && (
                      <p className="text-[11px] text-stone-500 font-medium truncate">
                        {[rev.country, rev.date].filter(Boolean).join(" • ")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Star Rating */}
                <div className="flex items-center gap-0.5 text-accent shrink-0">
                  {Array.from({ length: rev.rating || 5 }).map((_, s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-accent text-accent" />
                  ))}
                </div>
              </div>

              {/* Bold Review Headline */}
              <h4 className="font-heading text-sm font-bold text-stone-900 leading-snug line-clamp-2">
                {getReviewHeadline(rev.content)}
              </h4>

              {/* Review Content */}
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-normal line-clamp-4">
                &ldquo;{rev.content}&rdquo;
              </p>
            </div>

          
          </div>
        ))}
      </div>
      )}
    </section>
  );
}
