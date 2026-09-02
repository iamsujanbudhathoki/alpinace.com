"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

  // Autoplay plugin configuration for smooth, continuous sliding
  const autoplay = useRef(
    Autoplay({ delay: 3800, stopOnInteraction: false, stopOnMouseEnter: true })
  );

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

  // Re-init Embla when changing active category tab
  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
      emblaApi.scrollTo(0);
    }
  }, [activeTab, emblaApi]);

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

        if (mappedTreks.length > 0) setTreks(mappedTreks);
        if (mappedTours.length > 0) setTours(mappedTours);
        if (mappedExpeditions.length > 0) setExpeditions(mappedExpeditions);
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

  const tabs: { key: FeaturedTab; label: string }[] = [
    { key: "treks", label: "Trekking Circuits" },
    { key: "expeditions", label: "Peak Expeditions" },
    { key: "tours", label: "Cultural Tours" },
  ];

  return (
    <section className="py-16 sm:py-20 bg-stone-50 border-b border-stone-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Clean Travel Agency Header & Tab Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-200">
          <div className="space-y-1">
            <span className="text-amber-700 text-xs font-semibold block">
              Featured Destinations
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Himalayan Expeditions &amp; Routes
            </h2>
          </div>

          {/* Minimalist Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2.5 min-h-[42px] text-xs sm:text-sm font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap border ${isActive
                      ? "bg-stone-900 text-white border-stone-900 shadow-xs"
                      : "bg-white text-stone-700 border-stone-200 hover:border-stone-400"
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Horizontal Showcase / Grid */}
        <div className="relative pt-8 group/carousel">
          {/* Navigation Arrows (Only if more than 1 item) */}
          {!loading && currentPackages.length > 1 && (
            <>
              <button
                onClick={scrollPrev}
                aria-label="Previous Destination"
                className="hidden md:flex absolute -left-4 top-1/2 z-20 w-10 h-10 rounded-sm bg-white/95 text-stone-900 border border-stone-200 shadow-sm items-center justify-center hover:bg-stone-900 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={scrollNext}
                aria-label="Next Destination"
                className="hidden md:flex absolute -right-4 top-1/2 z-20 w-10 h-10 rounded-sm bg-white/95 text-stone-900 border border-stone-200 shadow-sm items-center justify-center hover:bg-stone-900 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-sm border border-stone-200 p-4 space-y-4 animate-pulse"
                >
                  <div className="h-52 bg-stone-100 rounded-sm w-full" />
                  <div className="h-4 bg-stone-200 rounded w-1/3" />
                  <div className="h-5 bg-stone-200 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : currentPackages.length === 0 ? (
            <div className="bg-white rounded-sm p-8 sm:p-12 text-center space-y-3 border border-stone-200">
              <p className="text-sm text-stone-600">
                No featured routes in this category currently.
              </p>
              <Link
                href={exploreInfo.href}
                className="inline-block text-xs font-semibold text-amber-700 hover:underline"
              >
                {exploreInfo.label} &rarr;
              </Link>
            </div>
          ) : currentPackages.length === 1 ? (
            /* Single item clean layout - static, no horizontal scrolling */
            <div className="max-w-md">
              {currentPackages.map((pkg) => {
                const packageHref = getPackageLink(pkg, activeTab);
                return (
                  <Link
                    key={pkg.id}
                    href={packageHref}
                    className="group flex flex-col bg-white rounded-sm border border-stone-200 hover:border-stone-400 transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900">
                      <img
                        src={pkg.image || "/mountain-placeholder.jpg"}
                        alt={pkg.title}
                        className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out opacity-95 group-hover:opacity-100"
                      />
                      {pkg.region && (
                        <span className="absolute top-3 left-3 bg-stone-900/90 text-white text-[11px] font-medium px-2.5 py-0.5 rounded-sm tracking-wide">
                          {pkg.region}
                        </span>
                      )}
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                          <span>{pkg.durationDays} Days</span>
                          {pkg.maxAltitudeMeters > 0 && (
                            <span>{pkg.maxAltitudeMeters.toLocaleString()}m altitude</span>
                          )}
                        </div>
                        <h3 className="font-heading text-base sm:text-lg font-bold text-stone-900 group-hover:text-amber-700 transition-colors leading-snug line-clamp-1">
                          {pkg.title}
                        </h3>
                      </div>
                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-stone-400 block font-medium">From</span>
                          <span className="text-base font-bold text-stone-900">
                            ${pkg.priceUSD.toLocaleString()} <span className="text-xs font-normal text-stone-500">USD</span>
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-amber-700 group-hover:underline">
                          Explore Route &rarr;
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            /* Multi-item Embla Carousel */
            <div className="overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y" ref={emblaRef}>
              <div className="flex gap-6">
                {currentPackages.map((pkg) => {
                  const packageHref = getPackageLink(pkg, activeTab);

                  return (
                    <div
                      key={pkg.id}
                      className="flex-[0_0_88%] sm:flex-[0_0_46%] lg:flex-[0_0_31.5%] min-w-0"
                    >
                      <Link
                        href={packageHref}
                        className="group flex flex-col h-full bg-white rounded-sm border border-stone-200 hover:border-stone-400 transition-all duration-300 overflow-hidden"
                      >
                        {/* Mountain Image Frame */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900">
                          <img
                            src={pkg.image || "/mountain-placeholder.jpg"}
                            alt={pkg.title}
                            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out opacity-95 group-hover:opacity-100"
                          />

                          {/* Region Tag */}
                          {pkg.region && (
                            <span className="absolute top-3 left-3 bg-stone-900/90 text-white text-[11px] font-medium px-2.5 py-0.5 rounded-sm tracking-wide">
                              {pkg.region}
                            </span>
                          )}
                        </div>

                        {/* Minimalist Destination Card Body */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                              <span>{pkg.durationDays} Days</span>
                              {pkg.maxAltitudeMeters > 0 && (
                                <span>{pkg.maxAltitudeMeters.toLocaleString()}m altitude</span>
                              )}
                            </div>

                            <h3 className="font-heading text-base sm:text-lg font-bold text-stone-900 group-hover:text-amber-700 transition-colors leading-snug line-clamp-1">
                              {pkg.title}
                            </h3>
                          </div>

                          {/* Pricing & CTA */}
                          <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                            <div>
                              <span className="text-[11px] text-stone-400 block font-medium">From</span>
                              <span className="text-base font-bold text-stone-900">
                                ${pkg.priceUSD.toLocaleString()} <span className="text-xs font-normal text-stone-500">USD</span>
                              </span>
                            </div>

                            <span className="text-xs font-semibold text-amber-700 group-hover:underline">
                              Explore Route &rarr;
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Explore Link */}
          {!loading && currentPackages.length > 0 && (
            <div className="mt-8 flex justify-end">
              <Link
                href={exploreInfo.href}
                className="text-xs font-semibold text-stone-800 hover:text-amber-700 transition-colors"
              >
                {exploreInfo.label} &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
