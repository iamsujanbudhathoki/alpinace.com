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

  // Mouse drag & click prevention setup
  const [isPointerDragging, setIsPointerDragging] = useState(false);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);



  // Autoplay configuration
  const autoplay = useRef(
    Autoplay({ delay: 4200, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  // Embla Carousel with dragFree enabled for responsive inertia dragging
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
      dragFree: true,
      containScroll: false,
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
          maxAltitudeMeters: Number(p.maxAltitudeMeters || 0),
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
          category: p.categoryType || p.category || "Expedition",
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

        if (mappedTreks.length > 0) setTreks(mappedTreks);
        if (mappedTours.length > 0) setTours(mappedTours);
        if (mappedExpeditions.length > 0) setExpeditions(mappedExpeditions);
      } catch (e) {
        console.warn("Error fetching featured routes:", e);
      } finally {
        setLoading(false);
      }
    }

    loadFeatured();
  }, []);

  // Pointer drag tracking to differentiate click vs drag scroll
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    setIsPointerDragging(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerStartRef.current) return;
    const dx = Math.abs(e.clientX - pointerStartRef.current.x);
    const dy = Math.abs(e.clientY - pointerStartRef.current.y);
    if (dx > 5 || dy > 5) {
      setIsPointerDragging(true);
    }
  };

  const handlePointerUp = () => {
    pointerStartRef.current = null;
    setTimeout(() => {
      setIsPointerDragging(false);
    }, 60);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isPointerDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  };



  const getCurrentPackages = (): TravelPackage[] => {
    switch (activeTab) {
      case "tours":
        return tours;
      case "expeditions":
        return expeditions;
      case "treks":
      default:
        return treks;
    }
  };

  const currentPackages = getCurrentPackages();

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

  const tabs: { key: FeaturedTab; label: string; iconUrl: string }[] = [
    { key: "treks", label: "Trekkings", iconUrl: "/trekking.png" },
    { key: "tours", label: "Tours", iconUrl: "/peaks.png" },
    { key: "expeditions", label: "Expeditions", iconUrl: "/expeditions.png" },
  ];

  return (
    <section className="py-16 sm:py-20 bg-stone-50 border-b border-stone-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Filter Navigation Links with Custom PNG Icons & View All CTA on Right */}
        <div className="relative flex flex-col sm:flex-row items-center justify-center pb-4 border-b border-stone-200 min-h-[52px]">
          {/* Centered Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="inline-flex items-center gap-2.5 text-base sm:text-lg font-medium cursor-pointer whitespace-nowrap group pb-1"
                >
                  <img
                    src={tab.iconUrl}
                    alt={tab.label}
                    className="w-6 h-6 sm:w-7 sm:h-7 object-contain shrink-0"
                  />
                  <span className="relative inline-block">
                    <span
                      className={
                        isActive
                          ? "text-stone-900 font-bold"
                          : "text-stone-500 group-hover:text-stone-900 font-medium transition-colors"
                      }
                    >
                      {tab.label}
                    </span>
                    <span
                      className={`absolute left-0 right-0 -bottom-1 h-[2px] transition-all ${
                        isActive ? "bg-stone-900" : "bg-transparent group-hover:bg-stone-300"
                      }`}
                    />
                  </span>
                </button>
              );
            })}
          </div>

          {/* View All Link Positioned on Right */}
          {!loading && currentPackages.length > 0 && (
            <div className="mt-2 sm:mt-0 sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2">
              <Link
                href={exploreInfo.href}
                className="text-[11px] sm:text-xs font-medium text-stone-600 hover:text-stone-900 hover:underline inline-flex items-center gap-1 transition-colors"
              >
                {exploreInfo.label} &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* Horizontal Showcase / Carousel Container */}
        <div className="relative pt-8 group/carousel select-none">
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
                className="inline-block text-xs font-semibold text-stone-900 hover:underline"
              >
                {exploreInfo.label} &rarr;
              </Link>
            </div>
          ) : currentPackages.length === 1 ? (
            /* Single item clean layout */
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
                        <h3 className="font-heading text-base sm:text-lg font-bold text-stone-900 group-hover:text-stone-600 transition-colors leading-snug line-clamp-1">
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
                        <span className="text-xs font-semibold text-stone-900 group-hover:underline">
                          Explore Route &rarr;
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            /* Multi-item Embla Carousel with Mouse Drag & Hover Motion */
            <div
              className="overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
              ref={emblaRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <div className="flex -ml-6">
                {currentPackages.map((pkg) => {
                  const packageHref = getPackageLink(pkg, activeTab);

                  return (
                    <div
                      key={pkg.id}
                      className="flex-[0_0_88%] sm:flex-[0_0_46%] lg:flex-[0_0_31.5%] min-w-0 pl-6"
                    >
                      <Link
                        href={packageHref}
                        onClick={handleCardClick}
                        className="group flex flex-col h-full bg-white rounded-sm border border-stone-200 hover:border-stone-400 transition-all duration-300 overflow-hidden"
                      >
                        {/* Mountain Image Frame */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900">
                          <img
                            src={pkg.image || "/mountain-placeholder.jpg"}
                            alt={pkg.title}
                            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out opacity-95 group-hover:opacity-100"
                            draggable={false}
                          />

                          {/* Region Tag */}
                          {pkg.region && (
                            <span className="absolute top-3 left-3 bg-stone-900/90 text-white text-[11px] font-medium px-2.5 py-0.5 rounded-sm tracking-wide">
                              {pkg.region}
                            </span>
                          )}
                        </div>

                        {/* Destination Card Body */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                              <span>{pkg.durationDays} Days</span>
                              {pkg.maxAltitudeMeters > 0 && (
                                <span>{pkg.maxAltitudeMeters.toLocaleString()}m altitude</span>
                              )}
                            </div>

                            <h3 className="font-heading text-base sm:text-lg font-bold text-stone-900 group-hover:text-stone-600 transition-colors leading-snug line-clamp-1">
                              {pkg.title}
                            </h3>
                          </div>

                          {/* Pricing & CTA */}
                          <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                            <div>
                              <span className="text-[11px] text-stone-400 block font-medium">From</span>
                              <span className="text-base font-bold text-stone-900">
                                ${pkg.priceUSD ? pkg.priceUSD.toLocaleString() : "0"} <span className="text-xs font-normal text-stone-500">USD</span>
                              </span>
                            </div>

                            <span className="text-xs font-medium text-stone-900 group-hover:underline">
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
        </div>
      </div>
    </section>
  );
}
