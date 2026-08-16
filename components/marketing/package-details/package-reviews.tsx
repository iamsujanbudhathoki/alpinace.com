"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Quote,
  CheckCircle2,
  MapPin,
  Calendar,
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
      "Seamless airport pickups, knowledgeable local historians in Kathmandu, and breathtaking peaks. Truly the premier guiding company for the Himalayas.",
  },
];

function getInitials(name: string): string {
  if (!name) return "G";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function PackageReviews({
  reviews,
  title = "Traveler Reviews & Experiences",
  subtitle = "Authentic feedback and stories from travelers who completed this journey",
  overallRating = 4.9,
}: PackageReviewsProps) {
  const activeReviews =
    reviews && reviews.length > 0 ? reviews : DEFAULT_VERIFIED_REVIEWS;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(activeReviews.length > 1);
  const [currentIndex, setCurrentIndex] = useState(0);

  const updateScrollState = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);

    const card = scrollRef.current.querySelector<HTMLElement>(".review-card");
    if (card) {
      const cardWidth = card.offsetWidth + 16;
      const index = Math.round(scrollLeft / cardWidth);
      setCurrentIndex(Math.min(Math.max(0, index), activeReviews.length - 1));
    }
  }, [activeReviews.length]);

  useEffect(() => {
    updateScrollState();
  }, [updateScrollState]);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const card = container.querySelector<HTMLElement>(".review-card");
    const step = card ? card.offsetWidth + 16 : 380;
    const scrollAmount = step * (direction === "right" ? 1 : -1);

    container.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const card = container.querySelector<HTMLElement>(".review-card");
    const step = card ? card.offsetWidth + 16 : 380;

    container.scrollTo({
      left: index * step,
      behavior: "smooth",
    });
  };

  return (
    <section className="pt-8 border-t border-[#E6E0D5] space-y-6">
      {/* Header: Title, Trust Badge, Rating & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="font-heading text-xl md:text-2xl font-bold text-[#1E2420]">
              {title}
            </h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% Verified
            </span>
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#6B726C] mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Rating Summary & Navigation Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-[#F4EFE6] px-3.5 py-1.5 rounded-xl border border-[#E6E0D5]">
            <div className="flex items-center gap-0.5 text-[#C28835]">
              <Star className="w-4 h-4 fill-[#C28835] text-[#C28835]" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-[#1E2420]">
                {overallRating.toFixed(1)}
              </span>
              <span className="text-[#8C938D]"> / 5.0</span>
              <span className="text-[#6B726C] font-medium ml-1">
                ({activeReviews.length}{" "}
                {activeReviews.length === 1 ? "review" : "reviews"})
              </span>
            </div>
          </div>

          {activeReviews.length > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleScroll("left")}
                disabled={!canScrollLeft}
                aria-label="Previous review"
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                  canScrollLeft
                    ? "border-[#D4CBBF] bg-white text-[#1E2420] hover:bg-[#F4EFE6] hover:border-[#C28835] shadow-2xs"
                    : "border-[#EAE5DC] bg-[#FAF8F5] text-slate-300 cursor-not-allowed"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleScroll("right")}
                disabled={!canScrollRight}
                aria-label="Next review"
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                  canScrollRight
                    ? "border-[#D4CBBF] bg-white text-[#1E2420] hover:bg-[#F4EFE6] hover:border-[#C28835] shadow-2xs"
                    : "border-[#EAE5DC] bg-[#FAF8F5] text-slate-300 cursor-not-allowed"
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Cards Slider */}
      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth focus:outline-hidden
          [&::-webkit-scrollbar]:h-2
          [&::-webkit-scrollbar-track]:bg-[#F4EFE6]
          [&::-webkit-scrollbar-track]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-[#D4CBBF]
          [&::-webkit-scrollbar-thumb]:rounded-full
          hover:[&::-webkit-scrollbar-thumb]:bg-[#C28835]
          transition-all"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#D4CBBF #F4EFE6",
        }}
      >
        {activeReviews.map((rev, idx) => (
          <div
            key={rev.id || idx}
            className="review-card snap-start min-w-[300px] sm:min-w-[360px] md:min-w-[400px] max-w-[420px] shrink-0 p-6 bg-white border border-[#E6E0D5] hover:border-[#C28835]/60 rounded-2xl space-y-4 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-3.5">
              {/* Reviewer Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {rev.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={rev.avatar}
                      alt={rev.author}
                      onError={(e) => {
                        // Fallback on image error
                        const target = e.currentTarget;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = parent.querySelector(".avatar-fallback");
                          if (fallback) fallback.classList.remove("hidden");
                        }
                      }}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-[#E6E0D5] shrink-0"
                    />
                  ) : null}
                  <div
                    className={`avatar-fallback w-12 h-12 rounded-full bg-gradient-to-br from-[#242E27] to-[#3B4D41] text-[#EAE5DC] flex items-center justify-center font-bold text-sm ring-2 ring-[#E6E0D5] shrink-0 ${
                      rev.avatar ? "hidden" : "flex"
                    }`}
                  >
                    {getInitials(rev.author)}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#1E2420] flex items-center gap-1.5">
                      {rev.author}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-[#6B726C] mt-0.5">
                      {rev.country && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#C28835]" />
                          {rev.country}
                        </span>
                      )}
                      {rev.date && (
                        <span className="flex items-center gap-1 text-[#8C938D]">
                          <Calendar className="w-3 h-3" />
                          {rev.date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Quote className="w-6 h-6 text-[#E6E0D5] shrink-0 fill-current opacity-70" />
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5 text-[#C28835]">
                  {[...Array(rev.rating || 5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-[#C28835] text-[#C28835]"
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-[#1E2420]">
                  {(rev.rating || 5).toFixed(1)} / 5.0
                </span>
              </div>

              {/* Review Text */}
              <p className="text-xs sm:text-sm text-[#3A423C] leading-relaxed italic">
                &ldquo;{rev.content}&rdquo;
              </p>
            </div>

            {/* Bottom Card Meta */}
            <div className="pt-3 border-t border-[#F4EFE6] flex items-center justify-between text-[11px] text-[#6B726C]">
              <span className="flex items-center gap-1 font-semibold text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Verified Traveler
              </span>
              <span className="text-[10px] text-[#8C938D]">
                AlpineAce Expeditions
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Dots (for multiple reviews) */}
      {activeReviews.length > 1 && (
        <div className="flex justify-center items-center gap-1.5 pt-1">
          {activeReviews.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to review ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === i
                  ? "w-6 bg-[#C28835]"
                  : "w-1.5 bg-[#D4CBBF] hover:bg-[#A89D8E]"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
