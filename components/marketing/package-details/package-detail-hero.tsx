"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
}: PackageDetailHeroProps) {
  return (
    <section className="relative h-[440px] sm:h-[500px] lg:h-[540px] w-full overflow-hidden bg-[#16221B]">
      {/* Background Image & Ambient Gradient */}
      <div className="absolute inset-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141F18]/95 via-[#141F18]/50 to-[#141F18]/30" />
      </div>

      {/* Breadcrumb Link */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-28">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-xs font-medium text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{backLabel}</span>
        </Link>
      </div>

      {/* Hero Content */}
      <div className="absolute bottom-10 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className={`px-2.5 py-1 rounded font-medium ${
                      badge.highlight
                        ? "bg-[#2D4536] text-[#E3EDE6] font-semibold uppercase tracking-wider text-[11px]"
                        : "bg-white/15 text-white backdrop-blur-xs"
                    }`}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                {title}
              </h1>
            </div>

            {/* Price & CTA Button */}
            <div className="shrink-0 flex items-center gap-4">
              <div className="text-right hidden sm:block text-white">
                <span className="text-xs text-white/70 block uppercase tracking-wider">
                  {priceLabel}
                </span>
                <span className="text-2xl font-bold font-heading">
                  ${Number(priceUSD).toLocaleString()}{" "}
                  <span className="text-xs font-normal text-white/80">USD</span>
                </span>
              </div>
              <button
                onClick={onBookClick}
                className="bg-[#C28835] hover:bg-[#AD772B] text-white font-semibold text-sm px-6 py-3.5 rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>{bookButtonLabel}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
