"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  Clock,
  TrendingUp,
  Star,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
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

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  // Autoplay Plugin Setup
  const autoplay = useRef(
    Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  // Embla Carousel Hook
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
      containScroll: "trimSnaps",
    },
    [autoplay.current]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Load featured items from backend API
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

  // Re-initialize Embla when switching active tab
  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
      emblaApi.scrollTo(0);
    }
  }, [activeTab, emblaApi]);

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
    <section className="py-12 sm:py-16 bg-stone-50/50 overflow-hidden border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 pb-4 border-b border-stone-200/80">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider bg-amber-100/60 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Handcrafted Expeditions</span>
            </div>
            <h2 className="type-heading-xl text-2xl sm:text-3xl text-stone-900 font-extrabold tracking-tight">
              Featured Treks &amp; Expeditions
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm font-normal">
              Guided Himalayan routes organized directly by our team in Kathmandu.
            </p>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 self-start md:self-auto">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-stone-200/80 shadow-2xs">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/80"
                    }`}
                    aria-selected={isActive}
                    role="tab"
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        isActive ? "bg-amber-500 text-slate-950" : "bg-stone-200/70 text-stone-600"
                      }`}
                    >
                      {tab.count}
                    </span>
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

        {/* Embla Carousel Container */}
        <div className="relative group/carousel">
          {/* Navigation Arrows */}
          {!loading && currentPackages.length > 0 && (
            <div className="hidden sm:flex items-center gap-2 absolute -top-14 right-0 z-20">
              <button
                onClick={scrollPrev}
                aria-label="Previous Slide"
                className="w-9 h-9 rounded-xl bg-white text-stone-800 border border-stone-200/90 shadow-2xs flex items-center justify-center hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={scrollNext}
                aria-label="Next Slide"
                className="w-9 h-9 rounded-xl bg-white text-stone-800 border border-stone-200/90 shadow-2xs flex items-center justify-center hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-2xl border border-stone-200/80 p-4 space-y-4 animate-pulse shadow-xs"
                >
                  <div className="h-48 bg-stone-200/70 rounded-xl w-full" />
                  <div className="h-4 bg-stone-200 rounded w-1/3" />
                  <div className="h-5 bg-stone-200 rounded w-3/4" />
                  <div className="h-3 bg-stone-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : currentPackages.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 sm:p-12 text-center space-y-3 border border-stone-200/80 shadow-2xs">
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
            <div className="overflow-hidden cursor-grab active:cursor-grabbing py-2 -mx-2 px-2" ref={emblaRef}>
              <div className="flex gap-5">
                {currentPackages.map((pkg) => {
                  const packageHref = getPackageLink(pkg, activeTab);

                  return (
                    <div
                      key={pkg.id}
                      className="flex-[0_0_88%] sm:flex-[0_0_48%] lg:flex-[0_0_31.5%] min-w-0"
                    >
                      <Link
                        href={packageHref}
                        className="group h-full flex flex-col bg-white rounded-2xl border border-stone-200/80 hover:border-amber-700/40 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                      >
                        {/* Image Frame */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
                          <img
                            src={pkg.image || "/mountain-placeholder.jpg"}
                            alt={pkg.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out opacity-95 group-hover:opacity-100"
                          />

                          {/* Top Badges */}
                          {pkg.region && (
                            <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-lg border border-white/10 shadow-xs">
                              {pkg.region}
                            </div>
                          )}

                          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-slate-900 text-[11px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-xs border border-stone-200">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>{pkg.rating.toFixed(1)}</span>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            {pkg.difficulty && (
                              <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 inline-block">
                                {pkg.difficulty}
                              </div>
                            )}
                            <h3 className="font-heading text-base font-bold text-stone-900 leading-snug group-hover:text-amber-900 transition-colors line-clamp-2">
                              {pkg.title}
                            </h3>
                            {pkg.shortDesc && (
                              <p className="text-stone-600 text-xs leading-relaxed font-normal line-clamp-2">
                                {pkg.shortDesc.replace(/<[^>]*>?/gm, "")}
                              </p>
                            )}
                          </div>

                          {/* Metadata & Pricing Footer */}
                          <div className="pt-3 border-t border-stone-100 space-y-3">
                            <div className="flex items-center justify-between text-xs text-stone-600 font-semibold">
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-stone-400" />
                                {pkg.durationDays} Days
                              </span>
                              {pkg.maxAltitudeMeters > 0 && (
                                <span className="flex items-center gap-1.5 text-stone-800 font-bold">
                                  <TrendingUp className="w-3.5 h-3.5 text-amber-700" />
                                  {pkg.maxAltitudeMeters.toLocaleString()}m
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <div>
                                <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">From</span>
                                <span className="text-base sm:text-lg font-black text-stone-900">
                                  ${pkg.priceUSD.toLocaleString()} <span className="text-[11px] font-normal text-stone-500">USD</span>
                                </span>
                              </div>

                              <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 group-hover:bg-amber-700 group-hover:text-white text-xs font-bold transition-all duration-200">
                                <span>Explore</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pagination Indicators */}
          {!loading && currentPackages.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {scrollSnaps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollTo(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === selectedIndex
                      ? "w-7 bg-amber-700"
                      : "w-2 bg-stone-300 hover:bg-stone-400"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
