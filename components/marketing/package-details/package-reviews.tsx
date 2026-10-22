"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { PackageSection } from "./package-section";

export interface ReviewItemProp {
  id?: string;
  author: string;
  country?: string;
  date?: string;
  title?: string;
  content?: string;
  comment?: string;
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
  if (firstSentence.length >= 10 && firstSentence.length <= 75) {
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

  if (!activeReviews || activeReviews.length === 0) return null;

  return (
    <PackageSection
      title={title}
      action={
        <div className="flex items-center gap-3">
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
      }
    >
      {/* Trust & Satisfaction Banner */}
      <div className="mb-4 p-3 rounded-xl bg-stone-50/90 border border-stone-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-900">100% Verified Guest Feedback</p>
            <p className="text-[11px] text-stone-500">Real experiences from international trekkers and climbers</p>
          </div>
        </div>
        <div className="flex items-center gap-3.5 text-xs">
          <div className="flex items-center gap-1.5 text-stone-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>Guide Safety: <strong className="text-stone-900 font-bold">5.0/5</strong></span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-stone-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>Trip Reliability: <strong className="text-stone-900 font-bold">100%</strong></span>
          </div>
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
          {activeReviews.map((rev, idx) => {
            const reviewText = (rev.content || rev.comment || "").trim();
            const headline = rev.title?.trim() || getReviewHeadline(reviewText);

            return (
              <div
                key={rev.id || idx}
                className="review-card snap-start min-w-[280px] sm:min-w-[340px] max-w-[390px] shrink-0 p-5 bg-white border border-stone-200/90 rounded-2xl flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-300 group"
              >
                <div className="space-y-3.5">
                  {/* Reviewer Header */}
                  <div className="flex items-center justify-between gap-2.5 pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-3 min-w-0">
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
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-heading text-xs sm:text-sm font-bold text-stone-900 truncate">
                            {rev.author}
                          </h3>
                          <span
                            title="Verified Booking"
                            className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-full px-1.5 py-0.2 shrink-0"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                            <span>Verified</span>
                          </span>
                        </div>
                        {(rev.country || rev.date) && (
                          <p className="text-[11px] text-stone-500 font-medium truncate mt-0.5">
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
                    {headline}
                  </h4>

                  {/* Review Content */}
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-normal line-clamp-5">
                    &ldquo;{reviewText}&rdquo;
                  </p>
                </div>

                {/* Card Footer Trust Signal */}
                <div className="pt-3 mt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                  <span className="font-medium text-stone-500">Alpine Ace Verified Review</span>
                  <span className="font-semibold text-stone-700">{(rev.rating || 5).toFixed(1)} / 5.0</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PackageSection>
  );
}
