"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { notFound } from "next/navigation";
import {
  BedDouble,
  Calendar,
  Compass,
  Utensils,
  Check,
} from "lucide-react";
import { TourItem, initialToursData } from "@/lib/tour-data";
import { FaqService, SettingService, TourService } from "@/lib/services/admin-service";
import { BookingPackageType, FaqItem, FaqStatus, TripDepartureDate } from "@/lib/admin-data";
import { Testimonial } from "@/lib/home-data";
import { useDetailNav } from "@/lib/detail-nav-context";
import { PackageDetailSkeleton } from "@/components/marketing/skeletons/package-detail-skeleton";
import { PublicBookingModal } from "@/components/marketing/modals/public-booking-modal";
import {
  PackageBookingSidebar,
  PackageDetailHero,
  PackageFaqs,
  PackageGallery,
  PackageInclusions,
  PackageItinerary,
  PackageQuickFacts,
  PackageRelatedTrips,
  PackageReviews,
  PackageTabsNav,
  PackageDepartures,
  PackageTrekMap,
  PackageDownloads,
  PackageAddons,
  PackageUsefulInfo,
} from "@/components/marketing/package-details";

interface TourDetailClientProps {
  initialTour: TourItem | any | null;
  slug: string;
}

export function TourDetailClient({ initialTour, slug }: TourDetailClientProps) {
  const [tour, setTour] = useState<TourItem | any | null>(initialTour);
  const [loading, setLoading] = useState(!initialTour);
  const [relatedTours, setRelatedTours] = useState<TourItem[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [selectedDeparture, setSelectedDeparture] = useState<TripDepartureDate | null>(null);

  const { setDetailNav } = useDetailNav();

  const [globalFaqs, setGlobalFaqs] = useState<FaqItem[]>([]);
  const [globalReviews, setGlobalReviews] = useState<Testimonial[]>([]);
  const [calculatorTravelers, setCalculatorTravelers] = useState<number>(2);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const isClickScrollingRef = useRef(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        if (!initialTour) {
          const raw = await TourService.getBySlug(slug);
          if (raw) {
            setTour(raw);
          }
        }

        const [faqsData, settingsData, allTours] = await Promise.all([
          FaqService.getAll(FaqStatus.ACTIVE).catch(() => []),
          SettingService.getAll().catch(() => ({})),
          TourService.getAll().catch(() => []),
        ]);

        if (faqsData) setGlobalFaqs(faqsData);
        if (settingsData && (settingsData as any).testimonials) {
          try {
            const parsed = JSON.parse((settingsData as any).testimonials);
            if (Array.isArray(parsed)) setGlobalReviews(parsed);
          } catch {}
        }

        if (allTours && allTours.length > 0) {
          const filtered = allTours.filter((t) => t.slug !== slug);
          setRelatedTours(filtered.slice(0, 3) as unknown as TourItem[]);
        } else {
          const fallback = initialToursData.filter((t) => t.slug !== slug);
          setRelatedTours(fallback.slice(0, 3));
        }
      } catch (e) {
        console.warn("Failed to fetch tour by slug", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug, initialTour]);

  // Gallery state from backend data
  const gallery = useMemo(() => {
    if (!tour) return [];
    if (tour.galleryImages && Array.isArray(tour.galleryImages) && tour.galleryImages.length > 0) {
      return tour.galleryImages;
    }
    if (!tour.image) return [];
    if (tour.image.includes(",")) {
      return tour.image
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
    return [tour.image];
  }, [tour]);

  // Price calculations
  const baseCostPerPerson = tour?.priceUSD || 0;
  const totalPrice = useMemo(() => {
    return Math.round(baseCostPerPerson * calculatorTravelers);
  }, [baseCostPerPerson, calculatorTravelers]);

  // Inclusions vs Exclusions parsed from backend
  const costIncludes = useMemo(() => {
    if (!tour?.inclusionsText || !tour.inclusionsText.trim()) return [];
    return tour.inclusionsText
      .split(/[\n,]+/)
      .map((s: string) => s.trim())
      .filter(Boolean);
  }, [tour]);

  const costExclusions = useMemo(() => {
    if (!tour?.exclusionsText || !tour.exclusionsText.trim()) return [];
    return tour.exclusionsText
      .split(/[\n,]+/)
      .map((s: string) => s.trim())
      .filter(Boolean);
  }, [tour]);

  // FAQs
  const displayFaqs = useMemo(() => {
    if (tour?.faqs && Array.isArray(tour.faqs) && tour.faqs.length > 0) {
      return tour.faqs.map((f: any, i: number) => ({
        id: `tour-faq-${i}`,
        question: f.question,
        answer: f.answer,
      }));
    }
    if (globalFaqs && globalFaqs.length > 0) {
      return globalFaqs.map((f: any) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
      }));
    }
    return [];
  }, [tour, globalFaqs]);

  // Reviews
  const displayReviews = useMemo(() => {
    if (tour?.reviews && Array.isArray(tour.reviews) && tour.reviews.length > 0) {
      return tour.reviews.map((r: any, i: number) => ({
        id: r.id || `tour-rev-${i}`,
        author: r.author,
        country: r.country,
        content: r.content,
        avatar: r.avatar,
        rating: r.rating,
      }));
    }
    if (globalReviews && globalReviews.length > 0) {
      return globalReviews.map((r) => ({
        id: r.id,
        author: r.author,
        country: r.country,
        content: r.content,
        avatar: r.avatar,
        rating: r.rating,
      }));
    }
    return [];
  }, [tour, globalReviews]);

  // Dynamic tabs mapping to page sections
  const availableTabs = useMemo(() => {
    const list: { key: string; label: string }[] = [
      { key: "overview", label: "Overview" },
    ];
    if (tour?.itinerary && tour.itinerary.length > 0) {
      list.push({ key: "itinerary", label: "Detailed Itinerary" });
    }
    if (costIncludes.length > 0 || costExclusions.length > 0) {
      list.push({ key: "cost", label: "Inclusions" });
    }
    if (tour?.departureDates && tour.departureDates.length > 0) {
      list.push({ key: "departures", label: "Dates & Rates" });
    }
    if (tour?.mapImage) {
      list.push({ key: "map", label: "Route Map" });
    }
    if (tour?.packageFiles && tour.packageFiles.length > 0) {
      list.push({ key: "files", label: "Downloads" });
    }
    if (displayFaqs.length > 0) {
      list.push({ key: "faqs", label: "FAQs" });
    }
    if (displayReviews.length > 0) {
      list.push({ key: "reviews", label: "Reviews" });
    }
    return list;
  }, [tour, costIncludes, costExclusions, displayFaqs, displayReviews]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    isClickScrollingRef.current = true;

    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      isClickScrollingRef.current = false;
    }, 700);
  };

  // Register contextual navigation in global SiteHeader
  useEffect(() => {
    if (!tour) return;

    setDetailNav({
      title: tour.title,
      categoryLabel: "Nepal Cultural Tours",
      categoryHref: "/tours",
      tabs: availableTabs,
      activeTab,
      onTabChange: handleTabChange,
      priceUSD: tour.priceUSD,
      onBookClick: () => setIsBookingModalOpen(true),
      bookButtonLabel: "Reserve Private Tour",
    });

    return () => {
      setDetailNav(null);
    };
  }, [tour, availableTabs, activeTab, setDetailNav]);

  // Scroll-spy to keep active tab synchronized with manual page scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (isClickScrollingRef.current) return;

      const tabKeys = availableTabs.map((t) => t.key);
      if (tabKeys.length === 0) return;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Bottom of page -> activate last tab
      if (scrollY + windowHeight >= documentHeight - 80) {
        setActiveTab(tabKeys[tabKeys.length - 1]);
        return;
      }

      const offset = 100; // single top header offset
      let current = tabKeys[0];

      for (const key of tabKeys) {
        const el = document.getElementById(key);
        if (el) {
          const top = el.getBoundingClientRect().top;
          if (top <= offset) {
            current = key;
          }
        }
      }

      setActiveTab(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, [availableTabs]);

  if (loading) {
    return <PackageDetailSkeleton />;
  }

  if (!tour) {
    return notFound();
  }

  const handleBookDeparture = (dateSlot: TripDepartureDate) => {
    setSelectedDeparture(dateSlot);
    setIsBookingModalOpen(true);
  };

  const perPersonCalculated = Math.round(totalPrice / Math.max(1, calculatorTravelers));

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-20">
      {/* 1. HERO HEADER */}
      <PackageDetailHero
        title={tour.title}
        image={tour.image}
        backHref="/tours"
        backLabel="Back to Tours"
        priceUSD={tour.priceUSD}
        bookButtonLabel="Book Tour"
        onBookClick={() => setIsBookingModalOpen(true)}
        badges={[
          { label: tour.region || "Nepal" },
          { label: tour.tourType || "Heritage Tour", highlight: true },
          { label: `${tour.durationDays} Days` },
        ]}
      />

      {/* 2. QUICK FACTS BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <PackageQuickFacts
          facts={[
            {
              icon: <Compass className="w-5 h-5" strokeWidth={1.75} />,
              label: "Tour Style",
              value: tour.tourType || "Heritage & Luxury",
            },
            {
              icon: <Calendar className="w-5 h-5" strokeWidth={1.75} />,
              label: "Best Season",
              value: tour.bestSeason || "Year Round",
            },
            {
              icon: <BedDouble className="w-5 h-5" strokeWidth={1.75} />,
              label: "Accommodation",
              value: tour.accommodation || "Luxury Boutique Hotel",
            },
            {
              icon: <Utensils className="w-5 h-5" strokeWidth={1.75} />,
              label: "Meals Included",
              value: tour.meals || "Breakfast & Dinners",
            },
          ]}
        />
      </div>

      {/* 3. MAIN CONTENT GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-start">
          {/* Main Editorial Column */}
          <div className="lg:col-span-8 space-y-10 sm:space-y-12">
            {/* Photo Gallery Showcase */}
            {gallery.length > 0 && (
              <PackageGallery title={tour.title} images={gallery} />
            )}

            {/* Inline Navigation Tabs (Visible before reaching sticky top) */}
            {availableTabs.length > 1 && (
              <div id="detail-page-tabs-bar">
                <PackageTabsNav
                  tabs={availableTabs}
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                />
              </div>
            )}

            {/* SECTION: OVERVIEW */}
            <section id="overview" className="scroll-mt-24 space-y-5">
              <div className="pb-3 border-b border-stone-200">
                <h2 className="type-heading-xl">
                  Tour Overview
                </h2>
              </div>

              {tour.shortDesc && (
                <div
                  className="prose-editorial max-w-none"
                  dangerouslySetInnerHTML={{ __html: tour.shortDesc }}
                />
              )}

              {/* Tour Key Specs Typographic Grid */}
              {(tour.transportation ||
                tour.startEndLocation ||
                tour.groupSizeRange) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-3.5 border-y border-stone-200">
                  {tour.transportation && (
                    <div className="space-y-0.5">
                      <span className="type-caption block">
                        Transportation
                      </span>
                      <p className="type-heading-md text-stone-900">
                        {tour.transportation}
                      </p>
                    </div>
                  )}

                  {tour.startEndLocation && (
                    <div className="space-y-0.5">
                      <span className="type-caption block">
                        Start &amp; Finish
                      </span>
                      <p className="type-heading-md text-stone-900">
                        {tour.startEndLocation}
                      </p>
                    </div>
                  )}

                  {tour.groupSizeRange && (
                    <div className="space-y-0.5">
                      <span className="type-caption block">
                        Group Capacity
                      </span>
                      <p className="type-heading-md text-stone-900">
                        {tour.groupSizeRange}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Add-ons & Options */}
              <PackageAddons addonsText={tour.addonsText} />

              {/* Useful Info */}
              <PackageUsefulInfo usefulInfoText={tour.usefulInfoText} />
            </section>

            {/* SECTION: ITINERARY */}
            {tour.itinerary && tour.itinerary.length > 0 && (
              <section id="itinerary" className="scroll-mt-24">
                <PackageItinerary
                  days={tour.itinerary}
                  title="Day-by-Day Sightseeing Itinerary"
                  subtitle={`${tour.itinerary.length} Days luxury tour across ${tour.region}`}
                />
              </section>
            )}

            {/* SECTION: INCLUSIONS & EXCLUSIONS */}
            {(costIncludes.length > 0 || costExclusions.length > 0) && (
              <section id="cost" className="scroll-mt-24">
                <PackageInclusions
                  inclusions={costIncludes}
                  exclusions={costExclusions}
                />
              </section>
            )}

            {/* SECTION: DEPARTURE DATES */}
            {tour.departureDates && tour.departureDates.length > 0 && (
              <section id="departures" className="scroll-mt-24">
                <PackageDepartures
                  dates={tour.departureDates}
                  defaultPrice={tour.priceUSD}
                  onBookDate={handleBookDeparture}
                />
              </section>
            )}

            {/* SECTION: MAP */}
            {tour.mapImage && (
              <section id="map" className="scroll-mt-24">
                <PackageTrekMap mapImage={tour.mapImage} title={tour.title} />
              </section>
            )}

            {/* SECTION: DOWNLOADS */}
            {tour.packageFiles && tour.packageFiles.length > 0 && (
              <section id="files" className="scroll-mt-24">
                <PackageDownloads files={tour.packageFiles} title={tour.title} />
              </section>
            )}

            {/* SECTION: FAQS */}
            {displayFaqs.length > 0 && (
              <section id="faqs" className="scroll-mt-24">
                <PackageFaqs faqs={displayFaqs} />
              </section>
            )}

            {/* SECTION: REVIEWS */}
            {displayReviews.length > 0 && (
              <section id="reviews" className="scroll-mt-24">
                <PackageReviews reviews={displayReviews} />
              </section>
            )}
          </div>

          {/* Sticky Booking Sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-20 lg:self-start">
            <PackageBookingSidebar
              tripTitle={tour.title}
              durationDays={tour.durationDays}
              travelers={calculatorTravelers}
              onTravelersChange={setCalculatorTravelers}
              totalPrice={totalPrice}
              onBookClick={() => setIsBookingModalOpen(true)}
              bookButtonLabel="Reserve Private Tour"
              packageType="Tour"
              isBooked={isBooked}
            />
          </div>
        </div>
      </main>

      {/* 4. RELATED TOURS */}
      {relatedTours.length > 0 && (
        <PackageRelatedTrips
          trips={relatedTours.map((t: any) => ({
            id: t.id,
            title: t.title,
            slug: t.slug,
            region: t.region || "Nepal",
            durationDays: t.durationDays,
            maxAltitudeMeters: t.maxAltitudeMeters || 1400,
            difficulty: t.difficulty || "Easy",
            priceUSD: t.priceUSD,
            image: t.image,
            rating: t.rating || 5.0,
            reviewsCount: t.reviewsCount || 10,
          }))}
          categoryPath="/tours"
          title="Explore More Luxury Nepal Tours"
        />
      )}

      {/* 5. MOBILE STICKY BOOKING ACTION BAR (< 1024px) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-stone-200 py-2 px-4 z-30 shadow-lg flex items-center justify-between gap-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <div className="min-w-0">
          <span className="type-caption text-stone-500 block truncate">
            Estimated Rate ({tour.durationDays} Days)
          </span>
          <div className="flex items-baseline gap-1">
            <span className="type-heading-xl text-stone-900">
              ${perPersonCalculated.toLocaleString()}
            </span>
            <span className="type-caption text-stone-400">USD / person</span>
          </div>
        </div>
        {isBooked ? (
          <div className="bg-emerald-700 text-white font-semibold text-xs px-3 py-2 rounded-lg shadow-xs flex items-center gap-1 shrink-0">
            <Check className="w-3.5 h-3.5" />
            <span>Request Submitted</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsBookingModalOpen(true)}
            className="bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
          >
            Book Tour
          </button>
        )}
      </div>

      {/* 6. BOOKING MODAL */}
      <PublicBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={() => setIsBooked(true)}
        trip={{
          title: tour.title,
          slug: tour.slug,
          region: tour.region,
          durationDays: tour.durationDays,
          maxAltitudeMeters: tour.maxAltitudeMeters || 1400,
          difficulty: tour.difficulty || "Easy",
          priceUSD: tour.priceUSD,
          image: tour.image,
          categoryType: BookingPackageType.TOUR,
        }}
        initialTravelers={calculatorTravelers}
        initialDate={selectedDeparture?.startDate}
      />
    </div>
  );
}
