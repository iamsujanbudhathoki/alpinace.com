"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Quote,
} from "lucide-react";

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

const DEFAULT_VERIFIED_REVIEWS: ReviewItemProp[] = [
  {
    id: "vr-1",
    author: "Elena Rostova",
    country: "Switzerland",
    date: "Autumn 2025",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    rating: 5,
    content:
      "An extraordinary journey with AlpineAce. The Sherpa crew and logistics were flawless from start to finish. Acclimatization days were perfectly paced and the high passes offered once-in-a-lifetime views.",
  },
  {
    id: "vr-2",
    author: "Marcus Vance",
    country: "United States",
    date: "Spring 2025",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    rating: 5,
    content:
      "The level of professionalism, safety orientation, and authentic hospitality blew our group away. The lodge selections and food quality exceeded all our expectations.",
  },
  {
    id: "vr-3",
    author: "Sophie Laurent",
    country: "France",
    date: "October 2025",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    rating: 5,
    content:
      "Incredible vistas, caring mountain guides, and seamless coordination. Even when the weather shifted, the expedition leader adapted the schedule safely without missing a single highlight.",
  },
  {
    id: "vr-4",
    author: "David & Maya Chen",
    country: "Singapore",
    date: "November 2025",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    rating: 5,
    content:
      "From the early preparation packing lists to the final return flight, everything was handled with utmost care. A true hallmark of luxury Himalayan mountaineering.",
  },
];

export function PackageReviews({
  reviews = [],
  title = "Traveler Reviews & Experiences",
  subtitle = "Direct feedback from mountaineers and adventurers who climbed this route with us",
  overallRating = 5.0,
}: PackageReviewsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const activeReviews = reviews.length > 0 ? reviews : DEFAULT_VERIFIED_REVIEWS;

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
      {/* Header: Title, Trust Badge, Rating & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-3 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="type-heading-xl">
              {title}
            </h2>
           
          </div>
          {subtitle && (
            <p className="type-body-sm mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Rating Summary & Controls */}
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
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
                className={`w-7.5 h-7.5 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                  canScrollLeft
                    ? "border-stone-300 bg-white text-stone-900 hover:bg-stone-50 shadow-xs"
                    : "border-stone-200 bg-stone-50 text-stone-300 cursor-not-allowed"
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2} />
              </button>

              <button
                type="button"
                onClick={() => handleScroll("right")}
                disabled={!canScrollRight}
                aria-label="Next review"
                className={`w-7.5 h-7.5 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                  canScrollRight
                    ? "border-stone-300 bg-white text-stone-900 hover:bg-stone-50 shadow-xs"
                    : "border-stone-200 bg-stone-50 text-stone-300 cursor-not-allowed"
                }`}
              >
                <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Slider */}
      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className="flex gap-4 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scroll-smooth focus:outline-hidden scrollbar-none"
      >
        {activeReviews.map((rev, idx) => (
          <div
            key={rev.id || idx}
            className="review-card snap-start min-w-[270px] sm:min-w-[320px] max-w-[360px] shrink-0 p-4 bg-white border border-stone-200 rounded-xl space-y-3 flex flex-col justify-between shadow-2xs"
          >
            <div className="space-y-2.5">
              {/* Reviewer Header */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  {rev.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={rev.avatar}
                      alt={rev.author}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-stone-200 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-amber-800 text-amber-50 flex items-center justify-center font-bold text-xs shrink-0">
                      {getInitials(rev.author)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="type-heading-md text-stone-900 truncate">
                      {rev.author}
                    </h3>
                    {rev.country && (
                      <span className="type-body-sm text-stone-400 block truncate">
                        {rev.country} {rev.date ? `• ${rev.date}` : ""}
                      </span>
                    )}
                  </div>
                </div>

                <Quote className="w-3.5 h-3.5 text-stone-300 shrink-0" />
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className={`w-3 h-3 ${
                      s < (rev.rating || 5)
                        ? "fill-amber-500 text-amber-500"
                        : "text-stone-200"
                    }`}
                  />
                ))}
              </div>

              {/* Review Content */}
              <p className="type-body text-stone-700 font-normal">
                &ldquo;{rev.content}&rdquo;
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
