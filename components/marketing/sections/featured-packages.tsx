"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { apiClient } from "@/lib/services/api-client";
import { TravelPackage } from "@/lib/home-data";
import { PackageStatus, CategoryType } from "@/lib/admin-data";

type FeaturedTab = "popular" | "treks" | "tours" | "expeditions";

interface FeaturedPackagesProps {
  initialPopular?: TravelPackage[];
  initialTreks?: TravelPackage[];
  initialTours?: TravelPackage[];
  initialExpeditions?: TravelPackage[];
}

export function FeaturedPackages({
  initialPopular = [],
  initialTreks = [],
  initialTours = [],
  initialExpeditions = [],
}: FeaturedPackagesProps) {
  const [activeTab, setActiveTab] = useState<FeaturedTab>("popular");
  const [popular, setPopular] = useState<TravelPackage[]>(initialPopular);
  const [treks, setTreks] = useState<TravelPackage[]>(initialTreks);
  const [tours, setTours] = useState<TravelPackage[]>(initialTours);
  const [expeditions, setExpeditions] = useState<TravelPackage[]>(initialExpeditions);
  const [loading, setLoading] = useState(
    initialPopular.length === 0 && initialTreks.length === 0 && initialTours.length === 0 && initialExpeditions.length === 0
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

  // Re-init Embla when changing active category tab or when package items update
  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
      emblaApi.scrollTo(0);
    }
  }, [activeTab, popular, treks, tours, expeditions, emblaApi]);

  // Load featured & popular items from backend API
  useEffect(() => {
    async function loadFeatured() {
      try {
        const [
          treksRes,
          toursRes,
          expeditionsRes,
          popTreksRes,
          popToursRes,
          popExpeditionsRes,
        ] = await Promise.all([
          apiClient.get<any[]>(`/treks?isFeatured=true`).catch(() => null),
          apiClient.get<any[]>(`/tours?isFeatured=true`).catch(() => null),
          apiClient.get<any[]>(`/expeditions?isFeatured=true`).catch(() => null),
          apiClient.get<any[]>(`/treks?isPopular=true`).catch(() => null),
          apiClient.get<any[]>(`/tours?isPopular=true`).catch(() => null),
          apiClient.get<any[]>(`/expeditions?isPopular=true`).catch(() => null),
        ]);

        let rawTreks = treksRes && treksRes.success && Array.isArray(treksRes.data) ? treksRes.data : [];
        let rawTours = toursRes && toursRes.success && Array.isArray(toursRes.data) ? toursRes.data : [];
        let rawExpeditions = expeditionsRes && expeditionsRes.success && Array.isArray(expeditionsRes.data) ? expeditionsRes.data : [];

        let rawPopTreks = popTreksRes && popTreksRes.success && Array.isArray(popTreksRes.data) ? popTreksRes.data : [];
        let rawPopTours = popToursRes && popToursRes.success && Array.isArray(popToursRes.data) ? popToursRes.data : [];
        let rawPopExpeditions = popExpeditionsRes && popExpeditionsRes.success && Array.isArray(popExpeditionsRes.data) ? popExpeditionsRes.data : [];

        // If no strictly FEATURED items found, fall back to fetching public items so all featured/active routes are displayed
        if (rawTreks.length === 0) {
          const fallback = await apiClient.get<any[]>("/treks?limit=50").catch(() => null);
          if (fallback && fallback.success && Array.isArray(fallback.data)) {
            rawTreks = fallback.data;
          }
        }
        if (rawTours.length === 0) {
          const fallback = await apiClient.get<any[]>("/tours?limit=50").catch(() => null);
          if (fallback && fallback.success && Array.isArray(fallback.data)) {
            rawTours = fallback.data;
          }
        }
        if (rawExpeditions.length === 0) {
          const fallback = await apiClient.get<any[]>("/expeditions?limit=50").catch(() => null);
          if (fallback && fallback.success && Array.isArray(fallback.data)) {
            rawExpeditions = fallback.data;
          }
        }

        // If no explicitly tagged popular items returned from endpoint, fall back to isPopular flag or top routes
        if (rawPopTreks.length === 0 && rawPopTours.length === 0 && rawPopExpeditions.length === 0) {
          rawPopTreks = rawTreks.filter((t: any) => t.isPopular);
          rawPopTours = rawTours.filter((t: any) => t.isPopular);
          rawPopExpeditions = rawExpeditions.filter((t: any) => t.isPopular);

          if (rawPopTreks.length === 0 && rawPopTours.length === 0 && rawPopExpeditions.length === 0) {
            rawPopTreks = rawTreks.slice(0, 3);
            rawPopTours = rawTours.slice(0, 2);
            rawPopExpeditions = rawExpeditions.slice(0, 2);
          }
        }

        const mapRawToPackage = (p: any, defaultCategory: string, catType: CategoryType): TravelPackage => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          category: p.categoryType || p.category || defaultCategory,
          categoryType: catType,
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
          isPopular: p.isPopular,
        });

        const mappedPopular: TravelPackage[] = [
          ...rawPopTreks.map((p) => mapRawToPackage(p, "Trekking", CategoryType.TREKKING)),
          ...rawPopTours.map((p) => mapRawToPackage(p, "Tour", CategoryType.TOURS)),
          ...rawPopExpeditions.map((p) => mapRawToPackage(p, "Expedition", CategoryType.EXPEDITIONS)),
        ];

        const mappedTreks: TravelPackage[] = rawTreks.map((p) => mapRawToPackage(p, "Trekking", CategoryType.TREKKING));
        const mappedTours: TravelPackage[] = rawTours.map((p) => mapRawToPackage(p, "Tour", CategoryType.TOURS));
        const mappedExpeditions: TravelPackage[] = rawExpeditions.map((p) => mapRawToPackage(p, "Expedition", CategoryType.EXPEDITIONS));

        if (mappedPopular.length > 0) setPopular(mappedPopular);
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
      case "popular":
        return popular;
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

  // Ensure sufficient item sequence for seamless infinite loop scrolling without slide detachment or line wrapping
  const displayPackages =
    currentPackages.length > 1 && currentPackages.length < 10
      ? [...currentPackages, ...currentPackages, ...currentPackages]
      : currentPackages;

  const getPackageLink = (pkg: TravelPackage, tab: FeaturedTab) => {
    if (tab === "tours" || pkg.categoryType === CategoryType.TOURS) return `/tours/${pkg.slug}`;
    if (tab === "expeditions" || pkg.categoryType === CategoryType.EXPEDITIONS) return `/expeditions/${pkg.slug}`;
    if (tab === "treks" || pkg.categoryType === CategoryType.TREKKING) return `/trekking/${pkg.slug}`;

    const cat = (pkg.category || "").toLowerCase();
    if (cat.includes("tour")) return `/tours/${pkg.slug}`;
    if (cat.includes("expedition") || cat.includes("peak") || cat.includes("climb")) return `/expeditions/${pkg.slug}`;
    return `/trekking/${pkg.slug}`;
  };

  const getExploreAllLink = (tab: FeaturedTab) => {
    switch (tab) {
      case "popular":
        return { href: "/trekking", label: "View All Popular Packages" };
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
    { key: "popular", label: "Popular", iconUrl: "/icons/popular-fire.png" },
    { key: "treks", label: "Trekkings", iconUrl: "/icons/trekking.png" },
    { key: "tours", label: "Tours", iconUrl: "/icons/tour.png" },
    { key: "expeditions", label: "Expeditions", iconUrl: "/icons/expeditions.png" },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-stone-50 border-b border-stone-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filter Navigation Bar: Perfectly Centered across all screen sizes with horizontal touch-scroll on mobile */}
        <div className="relative flex items-center justify-center pb-3 sm:pb-4 border-b border-stone-200">
          {/* Scrollable container on mobile, centered row */}
          <div className="w-full overflow-x-auto nav-horizontal-scroll scrollbar-none py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex flex-nowrap items-center justify-center min-w-max gap-6 sm:gap-8 md:gap-12 mx-auto">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className="inline-flex items-center gap-2 sm:gap-2.5 text-sm sm:text-base md:text-lg font-medium cursor-pointer whitespace-nowrap shrink-0 group pb-2 pt-1 select-none transition-all"
                  >
                    <Image
                      src={tab.iconUrl}
                      alt={tab.label}
                      width={28}
                      height={28}
                      className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 object-contain shrink-0 transition-transform duration-200 group-hover:scale-110"
                    />
                    <span className="relative inline-block">
                      <span
                        className={
                          isActive
                            ? "text-stone-900 font-bold tracking-tight"
                            : "text-stone-500 group-hover:text-stone-900 font-medium transition-colors"
                        }
                      >
                        {tab.label}
                      </span>
                      <span
                        className={`absolute left-0 right-0 -bottom-1.5 transition-all duration-300 rounded-full ${
                          isActive
                            ? "h-[3px] bg-yellow-400 opacity-100 shadow-[0_1px_6px_rgba(234,179,8,0.5)]"
                            : "h-[2px] bg-transparent opacity-0 group-hover:opacity-100 group-hover:bg-stone-300"
                        }`}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop View All CTA Link - Absolutely positioned to avoid disrupting center alignment */}
          {!loading && currentPackages.length > 0 && (
            <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 shrink-0">
              <Link
                href={exploreInfo.href}
                className="text-xs md:text-sm font-semibold text-stone-600 hover:text-stone-950 transition-colors inline-flex items-center gap-1.5 group whitespace-nowrap"
              >
                <span className="group-hover:underline underline-offset-4 decoration-yellow-400">{exploreInfo.label}</span>
                <span className="text-yellow-500 font-bold group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </Link>
            </div>
          )}
        </div>

        {/* Horizontal Showcase / Carousel Container */}
        <div className="relative pt-6 sm:pt-8 group/carousel select-none">
          {/* Navigation Arrows (Only on desktop if more than 1 item) */}
          {!loading && currentPackages.length > 1 && (
            <>
              <button
                type="button"
                onClick={scrollPrev}
                aria-label="Previous Destination"
                className="hidden md:flex absolute -left-4 lg:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-white text-stone-800 border border-stone-200 shadow-md items-center justify-center hover:bg-yellow-400 hover:border-yellow-400 hover:text-stone-950 transition-all cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                aria-label="Next Destination"
                className="hidden md:flex absolute -right-4 lg:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-white text-stone-800 border border-stone-200 shadow-md items-center justify-center hover:bg-yellow-400 hover:border-yellow-400 hover:text-stone-950 transition-all cursor-pointer active:scale-95"
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
                  className="bg-white rounded-2xl border border-stone-200 p-4 space-y-4 animate-pulse"
                >
                  <div className="h-52 bg-stone-100 rounded-xl w-full" />
                  <div className="h-4 bg-stone-200 rounded w-1/3" />
                  <div className="h-5 bg-stone-200 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : currentPackages.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 sm:p-12 text-center space-y-3 border border-stone-200">
              <p className="text-sm text-stone-600">
                {activeTab === "popular"
                  ? "No popular packages available currently."
                  : "No featured routes in this category currently."}
              </p>
              <Link
                href={exploreInfo.href}
                className="inline-block text-xs font-semibold text-stone-900 hover:text-yellow-600 hover:underline"
              >
                {exploreInfo.label} &rarr;
              </Link>
            </div>
          ) : currentPackages.length === 1 ? (
            /* Single item centered layout */
            <div className="max-w-md mx-auto">
              {currentPackages.map((pkg) => {
                const packageHref = getPackageLink(pkg, activeTab);
                return (
                  <Link
                    key={pkg.id}
                    href={packageHref}
                    className="group flex flex-col bg-white rounded-2xl border border-stone-200 overflow-hidden transition-all duration-300 ease-out hover:border-yellow-400/60 hover:-translate-y-1 hover:shadow-[0_16px_32px_-6px_rgba(0,0,0,0.12)]"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900">
                      <Image
                        src={pkg.image || "/mountain-placeholder.jpg"}
                        alt={pkg.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      {pkg.region && (
                        <span className="absolute top-3 left-3 bg-stone-900/90 text-white text-[11px] font-medium px-2.5 py-1 rounded-md tracking-wide">
                          {pkg.region}
                        </span>
                      )}
                      {pkg.isPopular && (
                        <span className="absolute top-3 right-3 bg-yellow-400 text-stone-950 text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wide shadow-xs flex items-center gap-1.5 z-10">
                          <Image src="/icons/popular-fire.png" alt="Popular" width={12} height={12} className="w-3 h-3 object-contain" />
                          Popular
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
                        <h3 className="font-heading text-base sm:text-lg font-bold text-stone-900 group-hover:text-yellow-600 transition-colors leading-snug line-clamp-1">
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
                        <span className="text-xs font-semibold text-stone-900 group-hover:text-yellow-600 group-hover:underline inline-flex items-center gap-1">
                          Explore Route &rarr;
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            /* Multi-item Embla Carousel: Mobile swipeable cards with visual peek, tablet 2-card, desktop 3-card grid */
            <div
              className="overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y py-4 -my-4"
              ref={emblaRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <div className="flex flex-nowrap -ml-4 sm:-ml-6 lg:-ml-8">
                {displayPackages.map((pkg, index) => {
                  const packageHref = getPackageLink(pkg, activeTab);

                  return (
                    <div
                      key={`${pkg.id}-${index}`}
                      className="flex-[0_0_88%] xs:flex-[0_0_85%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333333%] min-w-0 pl-4 sm:pl-6 lg:pl-8 shrink-0"
                    >
                      <Link
                        href={packageHref}
                        onClick={handleCardClick}
                        className="group flex flex-col h-full bg-white rounded-2xl border border-stone-200/90 overflow-hidden transition-all duration-300 ease-out hover:border-yellow-400/60 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12)]"
                      >
                        {/* Taller Mountain Image Frame */}
                        <div className="relative aspect-[16/11] w-full overflow-hidden bg-stone-900">
                          <Image
                            src={pkg.image || "/mountain-placeholder.jpg"}
                            alt={pkg.title}
                            fill
                            sizes="(max-width: 640px) 88vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                            draggable={false}
                          />

                          {/* Region Tag */}
                          {pkg.region && (
                            <span className="absolute top-3.5 left-3.5 bg-stone-900/90 text-white text-xs font-medium px-3 py-1 rounded-md tracking-wide shadow-xs">
                              {pkg.region}
                            </span>
                          )}
                          {/* Popular Tag in Brand Yellow */}
                          {pkg.isPopular && (
                            <span className="absolute top-3.5 right-3.5 bg-yellow-400 text-stone-950 text-xs font-bold px-2.5 py-1 rounded-md tracking-wide shadow-sm flex items-center gap-1.5 z-10">
                              <Image src="/icons/popular-fire.png" alt="Popular" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
                              Popular
                            </span>
                          )}
                        </div>

                        {/* Destination Card Body */}
                        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                              <span>{pkg.durationDays} Days</span>
                              {pkg.maxAltitudeMeters > 0 && (
                                <span>{pkg.maxAltitudeMeters.toLocaleString()}m altitude</span>
                              )}
                            </div>

                            <h3 className="font-heading text-base sm:text-lg font-bold text-stone-900 group-hover:text-yellow-600 transition-colors leading-snug line-clamp-1">
                              {pkg.title}
                            </h3>
                          </div>

                          {/* Pricing & CTA */}
                          <div className="pt-3.5 border-t border-stone-100 flex items-center justify-between">
                            <div>
                              <span className="text-[11px] text-stone-400 block font-medium">From</span>
                              <span className="text-base sm:text-lg font-bold text-stone-900">
                                ${pkg.priceUSD ? pkg.priceUSD.toLocaleString() : "0"}{" "}
                                <span className="text-xs font-normal text-stone-500">USD</span>
                              </span>
                            </div>

                            <span className="text-xs sm:text-sm font-semibold text-stone-900 group-hover:text-yellow-600 group-hover:underline inline-flex items-center gap-1">
                              <span>Explore Route</span>
                              <span className="group-hover:translate-x-0.5 transition-transform text-yellow-500 font-bold">&rarr;</span>
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

        {/* Mobile Centered View All Action */}
        {!loading && currentPackages.length > 0 && (
          <div className="flex md:hidden justify-center pt-6 sm:pt-8">
            <Link
              href={exploreInfo.href}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-stone-200 hover:bg-yellow-400 hover:border-yellow-400 text-stone-900 text-xs font-semibold transition-all shadow-xs active:scale-95"
            >
              <span>{exploreInfo.label}</span>
              <span className="text-yellow-500 group-hover:text-stone-950 font-bold">&rarr;</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
