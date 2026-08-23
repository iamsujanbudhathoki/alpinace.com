"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Clock,
  TrendingUp,
  Star,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { apiClient } from "@/lib/services/api-client";
import { TravelPackage } from "@/lib/home-data";
import { PackageStatus } from "@/lib/admin-data";

type FeaturedTab = "treks" | "tours" | "expeditions";

interface FeaturedPackagesProps {
  initialTreks?: TravelPackage[];
  initialTours?: TravelPackage[];
  initialExpeditions?: TravelPackage[];
}

export function FeaturedPackages({
  initialTreks = [],
  initialTours = [],
  initialExpeditions = [],
}: FeaturedPackagesProps) {
  const [activeTab, setActiveTab] = useState<FeaturedTab>("treks");
  const [treks, setTreks] = useState<TravelPackage[]>(initialTreks);
  const [tours, setTours] = useState<TravelPackage[]>(initialTours);
  const [expeditions, setExpeditions] = useState<TravelPackage[]>(initialExpeditions);
  const [loading, setLoading] = useState(
    initialTreks.length === 0 && initialTours.length === 0 && initialExpeditions.length === 0
  );
  const [isPaused, setIsPaused] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const [treksRes, toursRes, expeditionsRes] = await Promise.all([
          apiClient.get<any[]>(`/treks?status=${PackageStatus.FEATURED}`),
          apiClient.get<any[]>(`/tours?status=${PackageStatus.FEATURED}`),
          apiClient.get<any[]>(`/expeditions?status=${PackageStatus.FEATURED}`),
        ]);

        const rawTreks = treksRes && treksRes.success && Array.isArray(treksRes.data) ? treksRes.data : [];
        const rawTours = toursRes && toursRes.success && Array.isArray(toursRes.data) ? toursRes.data : [];
        const rawExpeditions = expeditionsRes && expeditionsRes.success && Array.isArray(expeditionsRes.data) ? expeditionsRes.data : [];

        const mappedTreks: TravelPackage[] = rawTreks.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          category: p.categoryType || p.category || "Trekking",
          region: p.region,
          durationDays: Number(p.durationDays || 0),
          maxAltitudeMeters: Number(p.maxAltitudeMeters || 0),
          difficulty: p.difficulty,
          priceUSD: Number(p.priceUSD || 0),
          rating: Number(p.rating || 5),
          reviewsCount: Number(p.reviewsCount || 0),
          image: p.image,
          shortDesc: p.shortDesc,
          status: p.status,
        }));

        const mappedTours: TravelPackage[] = rawTours.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          category: p.categoryType || p.category || "Tour",
          region: p.region,
          durationDays: Number(p.durationDays || 0),
          maxAltitudeMeters: Number(p.maxAltitudeMeters || p.peakHeightM || 0),
          difficulty: p.difficulty,
          priceUSD: Number(p.priceUSD || 0),
          rating: Number(p.rating || 5),
          reviewsCount: Number(p.reviewsCount || 0),
          image: p.image,
          shortDesc: p.shortDesc,
          status: p.status,
        }));

        const mappedExpeditions: TravelPackage[] = rawExpeditions.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          category: p.category,
          region: p.region,
          durationDays: Number(p.durationDays || 0),
          maxAltitudeMeters: Number(p.maxAltitudeMeters || p.peakHeightM || 0),
          difficulty: p.difficulty,
          priceUSD: Number(p.priceUSD || 0),
          rating: Number(p.rating || 5),
          reviewsCount: Number(p.reviewsCount || 0),
          image: p.image,
          shortDesc: p.shortDesc,
          status: p.status,
        }));

        setTreks(mappedTreks);
        setTours(mappedTours);
        setExpeditions(mappedExpeditions);
      } catch (e) {
        console.warn("Failed to fetch featured packages from backend:", e);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const currentPackages =
    activeTab === "treks"
      ? treks
      : activeTab === "tours"
      ? tours
      : expeditions;

  // Smooth Auto-scroll interval
  useEffect(() => {
    if (isPaused || loading || currentPackages.length === 0) return;

    const interval = setInterval(() => {
      if (!scrollContainerRef.current) return;
      const el = scrollContainerRef.current;
      const maxScroll = el.scrollWidth - el.clientWidth;

      if (maxScroll <= 5) return;

      if (el.scrollLeft >= maxScroll - 20) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 360, behavior: "smooth" });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused, loading, activeTab, currentPackages.length]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === "left" ? -360 : 360;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const getPackageLink = (pkg: TravelPackage, tab: FeaturedTab) => {
    if (tab === "tours") return `/tours/${pkg.slug}`;
    if (tab === "expeditions") return `/expeditions/${pkg.slug}`;
    return `/trekking/${pkg.slug}`;
  };

  const getExploreAllLink = (tab: FeaturedTab) => {
    switch (tab) {
      case "tours":
        return { href: "/tours", label: "View All Tours" };
      case "expeditions":
        return { href: "/expeditions", label: "View All Expeditions" };
      case "treks":
      default:
        return { href: "/trekking", label: "View All Treks" };
    }
  };

  const exploreInfo = getExploreAllLink(activeTab);

  const tabs: { key: FeaturedTab; label: string; count: number }[] = [
    { key: "treks", label: "Treks", count: treks.length },
    { key: "tours", label: "Tours", count: tours.length },
    { key: "expeditions", label: "Expeditions", count: expeditions.length },
  ];

  return (
    <section className="py-12 sm:py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 pb-4 border-b border-stone-200/80">
          <div className="space-y-1">
            <h2 className="type-heading-xl text-2xl sm:text-3xl text-stone-900">
              Featured Treks &amp; Expeditions
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm font-normal">
              Guided Himalayan routes organized directly by our team in Kathmandu.
            </p>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 self-start md:self-auto">
            <div className="flex items-center gap-5 sm:gap-6 py-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      if (scrollContainerRef.current) {
                        scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
                      }
                    }}
                    className={`relative pb-2 text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "text-amber-900 font-bold"
                        : "text-stone-500 hover:text-stone-900"
                    }`}
                    aria-selected={isActive}
                    role="tab"
                  >
                    <span>{tab.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-700 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            <Link
              href={exploreInfo.href}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-950 transition-colors group shrink-0"
            >
              <span>{exploreInfo.label}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Carousel Container with Controls */}
        <div className="relative group/carousel">
          {/* Scroll Navigation Arrows */}
          {!loading && currentPackages.length > 0 && (
            <>
              <button
                onClick={() => scroll("left")}
                aria-label="Scroll Left"
                className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 text-stone-800 shadow-md border border-stone-200/80 flex items-center justify-center hover:bg-amber-800 hover:text-white transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => scroll("right")}
                aria-label="Scroll Right"
                className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 text-stone-800 shadow-md border border-stone-200/80 flex items-center justify-center hover:bg-amber-800 hover:text-white transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </>
          )}

          {loading ? (
            <div className="flex gap-4 sm:gap-6 overflow-x-hidden py-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="w-[280px] sm:w-[320px] md:w-[340px] flex-shrink-0 bg-stone-50/50 rounded-xl border border-stone-200/60 p-4 space-y-4 animate-pulse"
                >
                  <div className="h-44 sm:h-48 bg-stone-200/80 rounded-lg w-full" />
                  <div className="h-4 bg-stone-200 rounded w-1/3" />
                  <div className="h-5 bg-stone-200 rounded w-3/4" />
                  <div className="h-3 bg-stone-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : currentPackages.length === 0 ? (
            <div className="bg-stone-50/50 rounded-xl p-8 sm:p-12 text-center space-y-3 border border-stone-200/60">
              <p className="text-sm font-medium text-stone-600">
                No featured {activeTab} available at this moment.
              </p>
              <Link
                href={exploreInfo.href}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:underline"
              >
                <span>{exploreInfo.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div
              ref={scrollContainerRef}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
              onFocus={() => setIsPaused(true)}
              onBlur={() => setIsPaused(false)}
              className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth py-3 px-0.5 touch-pan-x scrollbar-none snap-x snap-mandatory focus:outline-none"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {currentPackages.map((pkg) => {
                const packageHref = getPackageLink(pkg, activeTab);

                return (
                  <Link
                    key={pkg.id}
                    href={packageHref}
                    className="w-[280px] sm:w-[320px] lg:w-[340px] flex-shrink-0 snap-start group flex flex-col bg-white rounded-xl border border-stone-200/80 hover:border-amber-700/40 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
                  >
                    {/* Image Frame */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
                      <img
                        src={pkg.image || "/mountain-placeholder.jpg"}
                        alt={pkg.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />

                      {/* Top Badges */}
                      {pkg.region && (
                        <div className="absolute top-2.5 left-2.5 bg-stone-900/80 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-0.5 rounded-md">
                          {pkg.region}
                        </div>
                      )}

                      <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-md text-stone-900 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>{pkg.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        {pkg.difficulty && (
                          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-800">
                            {pkg.difficulty}
                          </div>
                        )}
                        <h3 className="font-heading text-sm sm:text-base font-bold text-stone-900 leading-snug group-hover:text-amber-800 transition-colors line-clamp-2">
                          {pkg.title}
                        </h3>
                        {pkg.shortDesc && (
                          <p className="text-stone-600 text-xs leading-relaxed font-normal line-clamp-2">
                            {pkg.shortDesc.replace(/<[^>]*>?/gm, "")}
                          </p>
                        )}
                      </div>

                      {/* Metadata & Pricing Footer */}
                      <div className="pt-3 border-t border-stone-100 space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-stone-400" />
                            {pkg.durationDays} Days
                          </span>
                          {pkg.maxAltitudeMeters > 0 && (
                            <span className="flex items-center gap-1.5 text-stone-700 font-semibold">
                              <TrendingUp className="w-3.5 h-3.5 text-stone-400" />
                              {pkg.maxAltitudeMeters.toLocaleString()}m
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div>
                            <span className="text-[10px] text-stone-500 font-medium block">Starting from</span>
                            <span className="text-sm sm:text-base font-bold text-stone-900">
                              ${pkg.priceUSD.toLocaleString()} <span className="text-[10px] font-normal text-stone-500">USD</span>
                            </span>
                          </div>

                          <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 group-hover:translate-x-0.5 transition-transform">
                            <span>Explore</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
