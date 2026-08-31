"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

export interface HeroBadge {
  label: string;
  highlight?: boolean;
}

export interface PackageDetailHeroProps {
  title: string;
  image: string;
  backHref: string;
  backLabel: string;
  badges: HeroBadge[];
  priceUSD: number;
  onBookClick: () => void;
  priceLabel?: string;
  bookButtonLabel?: string;
  isBooked?: boolean;
  isInquired?: boolean;
}

export function PackageDetailHero({
  title,
  image,
  backHref,
  backLabel,
  badges,
  priceUSD,
  onBookClick,
  priceLabel = "Starting from",
  bookButtonLabel = "Book Expedition",
  isBooked = false,
  isInquired = false,
}: PackageDetailHeroProps) {
  return (
    <section className="relative h-[340px] sm:h-[380px] lg:h-[420px] w-full overflow-hidden bg-stone-950">
      {/* Background Image & Editorial Gradient */}
      <div className="absolute inset-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-stone-950/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-transparent to-transparent" />
      </div>

      {/* Breadcrumb Navigation */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white transition-all bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1 rounded-sm border border-white/10"
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={2} />
          <span>{backLabel}</span>
        </Link>
      </div>

      {/* Hero Content */}
      <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6">
            <div className="space-y-2.5 max-w-3xl">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className={`px-2.5 py-0.5 rounded-sm font-medium transition-all ${
                      badge.highlight
                        ? "bg-emerald-900/80 text-emerald-100 border border-emerald-700/60 tracking-wider text-xs uppercase shadow-xs"
                        : "bg-white/15 text-white border border-white/20 backdrop-blur-sm text-xs"
                    }`}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h1 className="type-display text-white">
                {title}
              </h1>
            </div>

            {/* Price & CTA Action */}
            <div className="shrink-0 flex items-center gap-4">
              <div className="text-right hidden sm:block text-white">
                <span className="type-caption text-stone-300 block">
                  {priceLabel}
                </span>
                <span className="text-xl sm:text-2xl font-bold font-heading text-white">
                  ${Number(priceUSD).toLocaleString()}{" "}
                  <span className="text-xs font-normal text-stone-300">USD</span>
                </span>
              </div>

              {isBooked ? (
                <div className="bg-emerald-800/90 backdrop-blur-sm text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-sm border border-emerald-600/50 flex items-center gap-2 shadow-sm">
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                  <span>Booking Request Submitted</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onBookClick}
                  className="bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white font-semibold text-xs sm:text-sm px-4.5 py-2.5 rounded-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer group"
                >
                  <span>{bookButtonLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
