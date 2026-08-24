"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { notFound } from "next/navigation";
import {
  Mountain,
  Compass,
  Calendar,
  BedDouble,
  ShieldAlert,
  Check,
} from "lucide-react";
import { TrekItem, initialTreksData } from "@/lib/trek-data";
import {
  TrekService,
  FaqService,
  SettingService,
} from "@/lib/services/admin-service";
import { FaqItem, FaqStatus, BookingPackageType, TripDepartureDate, PackageStatus } from "@/lib/admin-data";
import { Testimonial } from "@/lib/home-data";
import { useDetailNav } from "@/lib/detail-nav-context";
import { PackageDetailSkeleton } from "@/components/marketing/skeletons/package-detail-skeleton";
import { PublicBookingModal } from "@/components/marketing/modals/public-booking-modal";
import {
  PackageDetailHero,
  PackageHighlightsGrid,
  PackageQuickFacts,
  PackageGallery,
  PackageTabsNav,
  PackageItinerary,
  PackageInclusions,
  PackageFaqs,
  PackageReviews,
  PackageBookingSidebar,
  PackageRelatedTrips,
  PackageDepartures,
  PackageTrekMap,
  PackageDownloads,
  PackageAddons,
  PackageUsefulInfo,
} from "@/components/marketing/package-details";

interface TrekDetailClientProps {
  initialTrek: TrekItem | null;
  slug: string;
}

export function TrekDetailClient({ initialTrek, slug }: TrekDetailClientProps) {
  const [trek, setTrek] = useState<TrekItem | null>(initialTrek);
  const [loading, setLoading] = useState(!initialTrek);
  const [globalFaqs, setGlobalFaqs] = useState<FaqItem[]>([]);
  const [globalReviews, setGlobalReviews] = useState<Testimonial[]>([]);
  const [relatedTreks, setRelatedTreks] = useState<TrekItem[]>([]);

  const { setDetailNav } = useDetailNav();

  // Booking modal state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [calculatorTravelers, setCalculatorTravelers] = useState<number>(2);
  const [selectedDeparture, setSelectedDeparture] = useState<TripDepartureDate | null>(null);

  const [activeTab, setActiveTab] = useState<string>("overview");
  const isClickScrollingRef = useRef(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch backend data dynamically
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        if (!initialTrek) {
          const fetchedTrek = await TrekService.getBySlug(slug);
          if (isMounted && fetchedTrek) {
            setTrek(fetchedTrek);
          }
        }

        const [faqsData, settingsData, allTreks] = await Promise.all([
          FaqService.getAll(FaqStatus.ACTIVE).catch(() => []),
          SettingService.getAll().catch(() => ({})),
          TrekService.getAll().catch(() => []),
        ]);

        if (isMounted) {
          if (faqsData) setGlobalFaqs(faqsData);
          if (settingsData && (settingsData as any).testimonials) {
            try {
              const parsed = JSON.parse((settingsData as any).testimonials);
              if (Array.isArray(parsed)) setGlobalReviews(parsed);
            } catch {}
          }

          if (allTreks && allTreks.length > 0) {
            const filtered = allTreks.filter(
              (t) => t.slug !== slug && t.status === PackageStatus.ACTIVE
            );
            setRelatedTreks(filtered.slice(0, 3) as unknown as TrekItem[]);
          } else {
            const fallback = initialTreksData.filter((t) => t.slug !== slug);
            setRelatedTreks(fallback.slice(0, 3));
          }
        }
      } catch (err) {
        console.error("Failed to load trek detail data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [slug, initialTrek]);

  // Gallery images from backend data
  const gallery = useMemo(() => {
    if (!trek) return [];
    if (trek.galleryImages && Array.isArray(trek.galleryImages) && trek.galleryImages.length > 0) {
      return trek.galleryImages;
    }
    if (!trek.image) return [];
    if (trek.image.includes(",")) {
      return trek.image
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [trek.image];
  }, [trek]);

  // Inclusions parsed from backend inclusionsText
  const costIncludes = useMemo(() => {
    if (!trek?.inclusionsText || !trek.inclusionsText.trim()) return [];
    return trek.inclusionsText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [trek]);

  // Exclusions parsed from backend exclusionsText
  const costExclusions = useMemo(() => {
    if (!trek?.exclusionsText || !trek.exclusionsText.trim()) return [];
    return trek.exclusionsText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [trek]);

  // Reviews from package JSONB or global backend settings
  const displayReviews = useMemo(() => {
    if (trek?.reviews && Array.isArray(trek.reviews) && trek.reviews.length > 0) {
      return trek.reviews.map((r, i) => ({
        id: r.id || `trek-rev-${i}`,
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
  }, [trek, globalReviews]);

  // FAQs from package JSONB or global backend FAQs
  const displayFaqs = useMemo(() => {
    if (trek?.faqs && Array.isArray(trek.faqs) && trek.faqs.length > 0) {
      return trek.faqs.map((f, i) => ({
        id: `trek-faq-${i}`,
        question: f.question,
        answer: f.answer,
      }));
    }
    if (globalFaqs && globalFaqs.length > 0) {
      return globalFaqs.map((f) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
      }));
    }
    return [];
  }, [trek, globalFaqs]);

  // Calculate dynamic tabs based on actual available data
  const availableTabs = useMemo(() => {
    const list: { key: string; label: string }[] = [
      { key: "overview", label: "Overview" },
    ];
    if (trek?.itinerary && trek.itinerary.length > 0) {
      list.push({ key: "itinerary", label: "Detailed Itinerary" });
    }
    if (costIncludes.length > 0 || costExclusions.length > 0) {
      list.push({ key: "cost", label: "Inclusions" });
    }
    if (trek?.departureDates && trek.departureDates.length > 0) {
      list.push({ key: "departures", label: "Dates & Rates" });
    }
    if (trek?.mapImage) {
      list.push({ key: "map", label: "Trek Map" });
    }
    if (trek?.packageFiles && trek.packageFiles.length > 0) {
      list.push({ key: "files", label: "Downloads" });
    }
    if (displayFaqs.length > 0) {
      list.push({ key: "faqs", label: "FAQs" });
    }
    if (displayReviews.length > 0) {
      list.push({ key: "reviews", label: "Reviews" });
    }
    return list;
  }, [trek, costIncludes, costExclusions, displayFaqs, displayReviews]);

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
    if (!trek) return;

    setDetailNav({
      title: trek.title,
      categoryLabel: trek.region ? `${trek.region} Treks` : "Himalayan Treks",
      categoryHref: "/trekking",
      tabs: availableTabs,
      activeTab,
      onTabChange: handleTabChange,
      priceUSD: trek.priceUSD,
      onBookClick: () => setIsBookingModalOpen(true),
      bookButtonLabel: "Book Trek",
    });

    return () => {
      setDetailNav(null);
    };
  }, [trek, availableTabs, activeTab, setDetailNav]);

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

  // Price calculations
  const baseCostPerPerson = trek?.priceUSD || 0;
  const totalPrice = useMemo(() => {
    return Math.round(baseCostPerPerson * calculatorTravelers);
  }, [calculatorTravelers, baseCostPerPerson]);

  if (loading) {
    return <PackageDetailSkeleton />;
  }

  if (!trek) {
    notFound();
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
        title={trek.title}
        image={trek.image}
        backHref="/trekking"
        backLabel="Back to Treks"
        priceUSD={trek.priceUSD}
        bookButtonLabel="Book Trek"
        onBookClick={() => setIsBookingModalOpen(true)}
        badges={[
          ...(trek.region ? [{ label: trek.region }] : []),
          { label: trek.difficulty || "Moderate", highlight: true },
          { label: `${trek.durationDays} Days` },
        ]}
      />

      {/* 2. HIGHLIGHT SPECS GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <PackageHighlightsGrid packageData={trek} />
      </div>

      {/* 3. MAIN CONTENT GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-start">
          {/* Main Editorial Column */}
          <div className="lg:col-span-8 space-y-10 sm:space-y-12">
            {/* Gallery Showcase */}
            {gallery.length > 0 && (
              <PackageGallery title={trek.title} images={gallery} />
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
                  Trip Overview
                </h2>
              </div>

              {trek.shortDesc && (
                <div
                  className="prose-editorial max-w-none"
                  dangerouslySetInnerHTML={{ __html: trek.shortDesc }}
                />
              )}

              {/* Key Specs Typographic Grid */}
              {/* {(trek.startEndLocation ||
                trek.meals ||
                trek.groupSizeRange) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-3.5 border-y border-stone-200">
                  {trek.startEndLocation && (
                    <div className="space-y-0.5">
                      <span className="type-caption block">
                        Start &amp; Finish
                      </span>
                      <p className="type-heading-md text-stone-900">
                        {trek.startEndLocation}
                      </p>
                    </div>
                  )}

                  {trek.meals && (
                    <div className="space-y-0.5">
                      <span className="type-caption block">
                        Meals Provided
                      </span>
                      <p className="type-heading-md text-stone-900">
                        {trek.meals}
                      </p>
                    </div>
                  )}

                  {trek.groupSizeRange && (
                    <div className="space-y-0.5">
                      <span className="type-caption block">
                        Group Size
                      </span>
                      <p className="type-heading-md text-stone-900">
                        {trek.groupSizeRange}
                      </p>
                    </div>
                  )}
                </div>
              )} */}

              {/* Permits Section */}
              {trek.permitsRequired && trek.permitsRequired.length > 0 && (
                <div className="space-y-2 pt-1">
                  <h3 className="type-caption text-stone-900 font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-emerald-800" strokeWidth={1.75} />
                    <span>Required Official Permits</span>
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {trek.permitsRequired.map((permit, idx) => (
                      <span
                        key={idx}
                        className="bg-amber-50/60 border border-amber-200/80 text-amber-900 text-xs font-medium px-2.5 py-0.5 rounded-md"
                      >
                        {permit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-ons & Options */}
              <PackageAddons addonsText={trek.addonsText} />

              {/* Useful Info */}
              <PackageUsefulInfo usefulInfoText={trek.usefulInfoText} />
            </section>

            {/* SECTION: ITINERARY */}
            {trek.itinerary && trek.itinerary.length > 0 && (
              <section id="itinerary" className="scroll-mt-24">
                <PackageItinerary
                  days={trek.itinerary}
                  title="Detailed Itinerary"
                  subtitle={`${trek.itinerary.length} Days journey across ${trek.region}`}
                />
              </section>
            )}

            {/* SECTION: INCLUSIONS & EXCLUSIONS */}
            {(trek.inclusionsText || trek.exclusionsText || costIncludes.length > 0 || costExclusions.length > 0) && (
              <section id="cost" className="scroll-mt-24">
                <PackageInclusions
                  inclusionsText={trek.inclusionsText}
                  exclusionsText={trek.exclusionsText}
                  inclusions={costIncludes}
                  exclusions={costExclusions}
                />
              </section>
            )}

            {/* SECTION: DEPARTURE DATES */}
            {trek.departureDates && trek.departureDates.length > 0 && (
              <section id="departures" className="scroll-mt-24">
                <PackageDepartures
                  dates={trek.departureDates}
                  defaultPrice={trek.priceUSD}
                  onBookDate={handleBookDeparture}
                />
              </section>
            )}

            {/* SECTION: TREK MAP */}
            {trek.mapImage && (
              <section id="map" className="scroll-mt-24">
                <PackageTrekMap mapImage={trek.mapImage} title={trek.title} />
              </section>
            )}

            {/* SECTION: DOWNLOADS */}
            {trek.packageFiles && trek.packageFiles.length > 0 && (
              <section id="files" className="scroll-mt-24">
                <PackageDownloads files={trek.packageFiles} title={trek.title} />
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
              tripTitle={trek.title}
              durationDays={trek.durationDays}
              travelers={calculatorTravelers}
              onTravelersChange={setCalculatorTravelers}
              totalPrice={totalPrice}
              onBookClick={() => setIsBookingModalOpen(true)}
              bookButtonLabel="Book Trek"
              packageType={BookingPackageType.TREKKING}
              isBooked={isBooked}
            />
          </div>
        </div>
      </main>

      {/* 4. RELATED ADVENTURES SECTION */}
      {relatedTreks.length > 0 && (
        <PackageRelatedTrips
          trips={relatedTreks}
          categoryPath="/trekking"
          title="Other Recommended Himalayan Routes"
        />
      )}

      {/* 5. MOBILE STICKY BOOKING ACTION BAR (< 1024px) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-stone-200 py-2 px-4 z-30 shadow-lg flex items-center justify-between gap-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <div className="min-w-0">
          <span className="type-caption text-stone-700 font-semibold block truncate">
            Estimated Rate ({trek.durationDays} Days)
          </span>
          <div className="flex items-baseline gap-1">
            <span className="type-heading-xl text-stone-900">
              ${perPersonCalculated.toLocaleString()}
            </span>
            <span className="type-caption text-stone-700 font-bold">USD / person</span>
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
            Book Trek
          </button>
        )}
      </div>

      {/* 6. BOOKING MODAL */}
      <PublicBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={() => setIsBooked(true)}
        trip={{
          title: trek.title,
          slug: trek.slug,
          region: trek.region,
          durationDays: trek.durationDays,
          maxAltitudeMeters: trek.maxAltitudeMeters,
          difficulty: trek.difficulty,
          priceUSD: trek.priceUSD,
          image: trek.image,
          categoryType: BookingPackageType.TREKKING,
        }}
        initialTravelers={calculatorTravelers}
        initialDate={selectedDeparture?.startDate}
      />
    </div>
  );
}
