"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { notFound } from "next/navigation";
import {
  Calendar,
  Mountain,
  ShieldCheck,
  Compass,
  Check,
} from "lucide-react";
import { ExpeditionItem, initialExpeditionsData } from "@/lib/expedition-data";
import {
  ExpeditionService,
  FaqService,
  SettingService,
} from "@/lib/services/admin-service";
import {
  BookingPackageType,
  ClimbingGrade,
  FaqItem,
  FaqStatus,
  TripDepartureDate,
} from "@/lib/admin-data";
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

interface ExpeditionDetailClientProps {
  initialExpedition: ExpeditionItem | any | null;
  slug: string;
}

export function ExpeditionDetailClient({
  initialExpedition,
  slug,
}: ExpeditionDetailClientProps) {
  const [expedition, setExpedition] = useState<ExpeditionItem | any | null>(
    initialExpedition,
  );
  const [loading, setLoading] = useState(!initialExpedition);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [selectedDeparture, setSelectedDeparture] = useState<TripDepartureDate | null>(null);
  const [relatedExpeditions, setRelatedExpeditions] = useState<ExpeditionItem[]>(
    [],
  );

  const { setDetailNav } = useDetailNav();

  // Dynamic FAQs from backend
  const [globalFaqs, setGlobalFaqs] = useState<FaqItem[]>([]);
  // Dynamic Reviews from backend
  const [globalReviews, setGlobalReviews] = useState<Testimonial[]>([]);

  const [calculatorClimbers, setCalculatorClimbers] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const isClickScrollingRef = useRef(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        if (!initialExpedition) {
          const raw = await ExpeditionService.getBySlug(slug);
          if (raw) {
            setExpedition(raw);
          }
        }

        const [faqsData, settingsData, allExps] = await Promise.all([
          FaqService.getAll(FaqStatus.ACTIVE).catch(() => []),
          SettingService.getAll().catch(() => ({})),
          ExpeditionService.getAll().catch(() => []),
        ]);

        if (faqsData) setGlobalFaqs(faqsData);
        if (settingsData && (settingsData as any).testimonials) {
          try {
            const parsed = JSON.parse((settingsData as any).testimonials);
            if (Array.isArray(parsed)) setGlobalReviews(parsed);
          } catch {}
        }

        if (allExps && allExps.length > 0) {
          const filtered = allExps.filter((e) => e.slug !== slug);
          setRelatedExpeditions(filtered.slice(0, 3) as unknown as ExpeditionItem[]);
        } else {
          const fallback = initialExpeditionsData.filter((e) => e.slug !== slug);
          setRelatedExpeditions(fallback.slice(0, 3));
        }
      } catch (e) {
        console.warn("Failed to fetch expedition by slug", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug, initialExpedition]);

  // Gallery state from backend data
  const gallery = useMemo(() => {
    if (!expedition) return [];
    if (expedition.galleryImages && Array.isArray(expedition.galleryImages) && expedition.galleryImages.length > 0) {
      return expedition.galleryImages;
    }
    if (!expedition.image) return [];
    if (expedition.image.includes(",")) {
      return expedition.image
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
    return [expedition.image];
  }, [expedition]);

  // Price calculations
  const baseCostPerPerson = expedition?.priceUSD || 0;
  const totalPrice = useMemo(() => {
    return Math.round(baseCostPerPerson * calculatorClimbers);
  }, [baseCostPerPerson, calculatorClimbers]);

  // Inclusions vs Exclusions parsed from backend
  const costIncludes = useMemo(() => {
    if (!expedition?.inclusionsText || !expedition.inclusionsText.trim()) return [];
    return expedition.inclusionsText
      .split(/[\n,]+/)
      .map((s: string) => s.trim())
      .filter(Boolean);
  }, [expedition]);

  const costExclusions = useMemo(() => {
    if (!expedition?.exclusionsText || !expedition.exclusionsText.trim()) return [];
    return expedition.exclusionsText
      .split(/[\n,]+/)
      .map((s: string) => s.trim())
      .filter(Boolean);
  }, [expedition]);

  // FAQs
  const displayFaqs = useMemo(() => {
    if (
      expedition?.faqs &&
      Array.isArray(expedition.faqs) &&
      expedition.faqs.length > 0
    ) {
      return expedition.faqs.map((f: any, i: number) => ({
        id: `exp-faq-${i}`,
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
  }, [expedition, globalFaqs]);

  // Reviews
  const displayReviews = useMemo(() => {
    if (
      expedition?.reviews &&
      Array.isArray(expedition.reviews) &&
      expedition.reviews.length > 0
    ) {
      return expedition.reviews.map((r: any, i: number) => ({
        id: r.id || `exp-rev-${i}`,
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
  }, [expedition, globalReviews]);

  // Dynamic tabs mapping to page sections
  const availableTabs = useMemo(() => {
    const list: { key: string; label: string }[] = [
      { key: "overview", label: "Overview" },
    ];
    if (expedition?.itinerary && expedition.itinerary.length > 0) {
      list.push({ key: "itinerary", label: "Climbing Itinerary" });
    }
    if (costIncludes.length > 0 || costExclusions.length > 0) {
      list.push({ key: "cost", label: "Inclusions" });
    }
    if (expedition?.departureDates && expedition.departureDates.length > 0) {
      list.push({ key: "departures", label: "Dates & Rates" });
    }
    if (expedition?.mapImage) {
      list.push({ key: "map", label: "Route Map" });
    }
    if (expedition?.packageFiles && expedition.packageFiles.length > 0) {
      list.push({ key: "files", label: "Downloads" });
    }
    if (displayFaqs.length > 0) {
      list.push({ key: "faqs", label: "FAQs" });
    }
    if (displayReviews.length > 0) {
      list.push({ key: "reviews", label: "Reviews" });
    }
    return list;
  }, [expedition, costIncludes, costExclusions, displayFaqs, displayReviews]);

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
    if (!expedition) return;

    setDetailNav({
      title: expedition.title,
      categoryLabel: "Expeditions",
      categoryHref: "/expeditions",
      tabs: availableTabs,
      activeTab,
      onTabChange: handleTabChange,
      priceUSD: expedition.priceUSD,
      onBookClick: () => setIsBookingModalOpen(true),
      bookButtonLabel: "Apply for Expedition",
    });

    return () => {
      setDetailNav(null);
    };
  }, [expedition, availableTabs, activeTab, setDetailNav]);

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

  if (!expedition) {
    return notFound();
  }

  const handleBookDeparture = (dateSlot: TripDepartureDate) => {
    setSelectedDeparture(dateSlot);
    setIsBookingModalOpen(true);
  };

  const peakMeters = expedition.peakHeightM || expedition.maxAltitudeMeters || 8000;
  const perPersonCalculated = Math.round(totalPrice / Math.max(1, calculatorClimbers));

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-20">
      {/* 1. HERO HEADER */}
      <PackageDetailHero
        title={expedition.title}
        image={expedition.image}
        backHref="/expeditions"
        backLabel="Back to Expeditions"
        priceUSD={expedition.priceUSD}
        bookButtonLabel="Book Expedition"
        onBookClick={() => setIsBookingModalOpen(true)}
        badges={[
          { label: `${peakMeters.toLocaleString()}m Summit` },
          { label: expedition.climbingGrade || "Technical Grade", highlight: true },
          { label: expedition.sherpaGuideRatio || "1:1 Sherpa" },
        ]}
      />

      {/* 2. HIGHLIGHT SPECS GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <PackageHighlightsGrid packageData={expedition} />
      </div>

      {/* 3. MAIN CONTENT GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-start">
          {/* Main Editorial Column */}
          <div className="lg:col-span-8 space-y-10 sm:space-y-12">
            {/* Gallery Showcase */}
            {gallery.length > 0 && (
              <PackageGallery title={expedition.title} images={gallery} />
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
                  Expedition Overview &amp; Summit Logistics
                </h2>
              </div>

              {expedition.shortDesc && (
                <div
                  className="prose-editorial max-w-none"
                  dangerouslySetInnerHTML={{ __html: expedition.shortDesc }}
                />
              )}

              {/* Key Specs Typographic Grid */}
              {(expedition.startEndLocation ||
                expedition.meals ||
                expedition.groupSizeRange ||
                expedition.accommodation) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3.5 border-y border-stone-200">
                  {expedition.startEndLocation && (
                    <div className="space-y-0.5">
                      <span className="type-caption block">
                        Basecamp
                      </span>
                      <p className="type-heading-md text-stone-900">
                        {expedition.startEndLocation}
                      </p>
                    </div>
                  )}

                  {expedition.accommodation && (
                    <div className="space-y-0.5">
                      <span className="type-caption block">
                        High Camps
                      </span>
                      <p className="type-heading-md text-stone-900">
                        {expedition.accommodation}
                      </p>
                    </div>
                  )}

                  {expedition.meals && (
                    <div className="space-y-0.5">
                      <span className="type-caption block">
                        Kitchen
                      </span>
                      <p className="type-heading-md text-stone-900">
                        {expedition.meals}
                      </p>
                    </div>
                  )}

                  {expedition.groupSizeRange && (
                    <div className="space-y-0.5">
                      <span className="type-caption block">
                        Team Size
                      </span>
                      <p className="type-heading-md text-stone-900">
                        {expedition.groupSizeRange}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Add-ons & Summit Upgrades */}
              <PackageAddons addonsText={expedition.addonsText} />

              {/* Useful Info & Requirements */}
              <PackageUsefulInfo usefulInfoText={expedition.usefulInfoText} />
            </section>

            {/* SECTION: CLIMBING ITINERARY */}
            {expedition.itinerary && expedition.itinerary.length > 0 && (
              <section id="itinerary" className="scroll-mt-24">
                <PackageItinerary
                  days={expedition.itinerary}
                  title="Climbing &amp; Acclimatization Itinerary"
                  subtitle={`${expedition.itinerary.length} Days expedition schedule for ${expedition.title}`}
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
            {expedition.departureDates && expedition.departureDates.length > 0 && (
              <section id="departures" className="scroll-mt-24">
                <PackageDepartures
                  dates={expedition.departureDates}
                  defaultPrice={expedition.priceUSD}
                  onBookDate={handleBookDeparture}
                />
              </section>
            )}

            {/* SECTION: MAP */}
            {expedition.mapImage && (
              <section id="map" className="scroll-mt-24">
                <PackageTrekMap mapImage={expedition.mapImage} title={expedition.title} />
              </section>
            )}

            {/* SECTION: DOWNLOADS */}
            {expedition.packageFiles && expedition.packageFiles.length > 0 && (
              <section id="files" className="scroll-mt-24">
                <PackageDownloads files={expedition.packageFiles} title={expedition.title} />
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
              tripTitle={expedition.title}
              durationDays={expedition.durationDays}
              travelers={calculatorClimbers}
              onTravelersChange={setCalculatorClimbers}
              totalPrice={totalPrice}
              onBookClick={() => setIsBookingModalOpen(true)}
              bookButtonLabel="Apply for Expedition"
              packageType={BookingPackageType.EXPEDITION}
              isBooked={isBooked}
            />
          </div>
        </div>
      </main>

      {/* 4. RELATED EXPEDITIONS */}
      {relatedExpeditions.length > 0 && (
        <PackageRelatedTrips
          trips={relatedExpeditions.map((e: any) => ({
            id: e.id,
            title: e.title,
            slug: e.slug,
            region: e.region,
            durationDays: e.durationDays,
            maxAltitudeMeters: e.peakHeightM || e.maxAltitudeMeters || 8000,
            difficulty: e.difficulty || "Extreme",
            priceUSD: e.priceUSD,
            image: e.image,
            rating: e.rating || 5.0,
            reviewsCount: e.reviewsCount || 14,
          }))}
          categoryPath="/expeditions"
          title="Other Himalayan Summit Expeditions"
        />
      )}

      {/* 5. MOBILE STICKY BOOKING ACTION BAR (< 1024px) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-stone-200 py-2 px-4 z-30 shadow-lg flex items-center justify-between gap-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <div className="min-w-0">
          <span className="type-caption text-stone-700 font-semibold block truncate">
            Estimated Rate ({expedition.durationDays} Days)
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
            Book Expedition
          </button>
        )}
      </div>

      {/* 6. BOOKING MODAL */}
      <PublicBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={() => setIsBooked(true)}
        trip={{
          title: expedition.title,
          slug: expedition.slug,
          region: expedition.region,
          durationDays: expedition.durationDays,
          maxAltitudeMeters: expedition.peakHeightM || expedition.maxAltitudeMeters || 8000,
          difficulty: expedition.difficulty || "Extreme",
          priceUSD: expedition.priceUSD,
          image: expedition.image,
          categoryType: BookingPackageType.EXPEDITION,
        }}
        initialTravelers={calculatorClimbers}
        initialDate={selectedDeparture?.startDate}
      />
    </div>
  );
}
