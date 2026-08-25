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
  Footprints,
  Compass,
  Mountain,
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

  const tabs = [
    { key: "treks" as FeaturedTab, label: "Treks", count: treks.length, icon: Footprints },
    { key: "tours" as FeaturedTab, label: "Tours", count: tours.length, icon: Compass },
    { key: "expeditions" as FeaturedTab, label: "Expeditions", count: expeditions.length, icon: Mountain },
  ];

  return (
    <section className="py-12 sm:py-16 bg-stone-50/50 overflow-hidden border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Section Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-8 pb-5 border-b border-stone-200">
          <div className="space-y-1 max-w-xl mx-auto">
            <span className="text-amber-800 text-xs font-bold block tracking-normal">
              Sherpa-Guided Journeys
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Featured Treks &amp; Expeditions
            </h2>
            <p className="text-stone-700 text-xs sm:text-sm font-normal mt-1 leading-relaxed">
              Guided Himalayan routes organized directly by our team in Kathmandu.
            </p>
          </div>

          {/* Centered Category Navigation Tabs */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-3 overflow-x-auto max-w-full scrollbar-none pt-3">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 border-b-2 whitespace-nowrap ${
                    isActive
                      ? "border-stone-900 text-stone-900 font-bold"
                      : "border-transparent text-stone-700 hover:text-stone-900 font-medium"
                  }`}
                  aria-selected={isActive}
                  role="tab"
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-stone-900" : "text-stone-500"}`} />
                  <span>{tab.label}</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-sm font-bold ${
                      isActive ? "bg-stone-900 text-white" : "bg-stone-200/80 text-stone-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Embla Carousel Container */}
        <div className="relative group/carousel">
          {/* Floating Side Navigation Arrows (Desktop & Tablet) */}
          {!loading && currentPackages.length > 1 && (
            <>
              <button
                onClick={scrollPrev}
                aria-label="Previous Slide"
                className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-sm bg-white text-stone-900 border border-stone-200 shadow-sm items-center justify-center hover:bg-stone-100 hover:scale-105 transition-all duration-200 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={scrollNext}
                aria-label="Next Slide"
                className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-sm bg-white text-stone-900 border border-stone-200 shadow-sm items-center justify-center hover:bg-stone-100 hover:scale-105 transition-all duration-200 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-sm border border-stone-200 p-4 space-y-4 animate-pulse shadow-sm"
                >
                  <div className="h-48 bg-stone-100 rounded-sm w-full" />
                  <div className="h-4 bg-stone-200 rounded w-1/3" />
                  <div className="h-5 bg-stone-200 rounded w-3/4" />
                  <div className="h-3 bg-stone-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : currentPackages.length === 0 ? (
            <div className="bg-white rounded-sm p-8 sm:p-12 text-center space-y-3 border border-stone-200 shadow-2xs">
              <p className="text-sm font-medium text-stone-700">
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
            <div className="overflow-hidden cursor-grab active:cursor-grabbing py-2 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" ref={emblaRef}>
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
                        className="group h-full flex flex-col bg-white rounded-sm border border-stone-200 hover:border-stone-400 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
                      >
                        {/* Image Frame */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900">
                          <img
                            src={pkg.image || "/mountain-placeholder.jpg"}
                            alt={pkg.title}
                            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent pointer-events-none" />

                          {/* Top Badges */}
                          {pkg.region && (
                            <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-sm border border-white/10">
                              {pkg.region}
                            </div>
                          )}

                          {pkg.rating > 0 && (
                            <div className="absolute top-3 right-3 bg-white/95 text-stone-900 text-[11px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1 border border-stone-200">
                              <Star className="w-3 h-3 text-amber-600 fill-amber-600" />
                              <span>{pkg.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        {/* Card Content */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            {pkg.difficulty && (
                              <span className="text-[11px] font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200 inline-block">
                                {pkg.difficulty}
                              </span>
                            )}
                            <h3 className="font-heading text-base sm:text-lg font-bold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-2">
                              {pkg.title}
                            </h3>
                            {pkg.shortDesc && (
                              <p className="text-stone-700 text-xs sm:text-sm leading-relaxed font-normal line-clamp-2">
                                {pkg.shortDesc.replace(/<[^>]*>?/gm, "")}
                              </p>
                            )}
                          </div>

                          {/* Metadata & Pricing Footer */}
                          <div className="pt-3 border-t border-stone-100 space-y-3">
                            <div className="flex items-center justify-between text-xs text-stone-800 font-semibold">
                              <span className="flex items-center gap-1.5 text-stone-800">
                                <Clock className="w-3.5 h-3.5 text-stone-500" />
                                <span>{pkg.durationDays} Days</span>
                              </span>
                              {pkg.maxAltitudeMeters > 0 && (
                                <span className="flex items-center gap-1.5 text-stone-900 font-bold">
                                  <TrendingUp className="w-3.5 h-3.5 text-amber-800" />
                                  <span>{pkg.maxAltitudeMeters.toLocaleString()}m max</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <div>
                                <span className="text-xs text-stone-500 font-medium block">Starting from</span>
                                <span className="text-base sm:text-lg font-extrabold text-stone-900">
                                  ${pkg.priceUSD.toLocaleString()} <span className="text-xs font-normal text-stone-600">USD</span>
                                </span>
                              </div>

                              <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-sm bg-stone-100 text-stone-900 group-hover:bg-stone-900 group-hover:text-white text-xs font-semibold transition-all duration-200">
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

          {/* Pagination Indicators, Slide Counter & View All Link */}
          {!loading && currentPackages.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-1 pt-2">
              <div className="flex items-center gap-4 text-xs font-semibold text-stone-700">
                <span>
                  Showing <span className="text-stone-900 font-bold">{selectedIndex + 1}</span> of <span className="text-stone-900 font-bold">{scrollSnaps.length}</span>
                </span>

                <div className="flex items-center gap-1.5">
                  {scrollSnaps.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => scrollTo(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === selectedIndex
                          ? "w-8 bg-stone-900"
                          : "w-2 bg-stone-300 hover:bg-stone-400"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <Link
                href={exploreInfo.href}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-950 transition-colors group shrink-0"
              >
                <span>{exploreInfo.label}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
