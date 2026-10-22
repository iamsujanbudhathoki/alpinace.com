"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { notFound } from "next/navigation";
import { useRouter } from "@bprogress/next";
import {
  Calendar,
  Mountain,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { ExpeditionItem, initialExpeditionsData } from "@/lib/expedition-data";
import {
  ExpeditionService,
  FaqService,
  SettingService,
} from "@/lib/services/admin-service";
import {
  BookingPackageType,
  InquiryType,
  ClimbingGrade,
  FaqItem,
  FaqStatus,
  TripDepartureDate,
} from "@/lib/admin-data";
import { calculateApplicablePrice, getLowestGroupPrice } from "@/lib/pricing-util";
import { Testimonial } from "@/lib/home-data";
import { useDetailNav } from "@/lib/detail-nav-context";
import { PackageDetailSkeleton } from "@/components/marketing/skeletons/package-detail-skeleton";

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
  PackageUsefulInfo,
} from "@/components/marketing/package-details";
import { hasRichText, isHtmlContent } from "@/lib/utils";
import { PackageSection } from "@/components/marketing/package-details/package-section";

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
  const router = useRouter();
  const [isBooked, setIsBooked] = useState(false);
  const [isInquired, setIsInquired] = useState(false);
  const [selectedDeparture, setSelectedDeparture] = useState<TripDepartureDate | null>(null);
  const [isNavigatingToBooking, setIsNavigatingToBooking] = useState(false);
  const [selectedBookingDate, setSelectedBookingDate] = useState<string | undefined>(undefined);
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
          FaqService.getPublicAll(FaqStatus.ACTIVE).catch(() => []),
          SettingService.getPublicAll().catch(() => ({})),
          ExpeditionService.getPublicAll().catch(() => []),
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
  const applicablePricing = useMemo(() => {
    if (!expedition) return { pricePerPerson: 0, totalPrice: 0, applicableTier: null };
    return calculateApplicablePrice(expedition, calculatorClimbers);
  }, [expedition, calculatorClimbers]);

  const perPersonCalculated = applicablePricing.pricePerPerson;
  const totalPrice = applicablePricing.totalPrice;

  // Inclusions vs Exclusions existence based on schema
  const hasCostSection = hasRichText(expedition?.inclusionsText) || hasRichText(expedition?.exclusionsText);

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
    const list: { key: string; label: string }[] = [];
    if (hasRichText(expedition?.shortDesc)) {
      list.push({ key: "overview", label: "Overview" });
    }
    if (expedition?.itinerary && expedition.itinerary.length > 0 && expedition.itinerary.some((d: any) => d && (d.title || d.description))) {
      list.push({ key: "itinerary", label: "Itinerary" });
    }
    if (hasCostSection) {
      list.push({ key: "cost", label: "Includes/Excludes" });
    }
    if (expedition?.departureDates && expedition.departureDates.length > 0) {
      list.push({ key: "departures", label: "Departure Dates" });
    }
    if (hasRichText(expedition?.usefulInfoText)) {
      list.push({ key: "useful-info", label: "Useful Info" });
    }
    if (expedition?.mapImage && expedition.mapImage.trim()) {
      list.push({ key: "map", label: "Route Map" });
    }
    if (expedition?.packageFiles && expedition.packageFiles.length > 0) {
      list.push({ key: "files", label: "Downloads" });
    }
    if (displayReviews.length > 0) {
      list.push({ key: "reviews", label: "Reviews" });
    }
    if (displayFaqs.length > 0) {
      list.push({ key: "faqs", label: "FAQs" });
    }
    return list;
  }, [expedition, hasCostSection, displayFaqs, displayReviews]);

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
      onBookClick: () => navigateToBooking(),
      bookButtonLabel: "Apply for Expedition",
      isBookingLoading: isNavigatingToBooking,
    });

    return () => {
      setDetailNav(null);
    };
  }, [expedition, availableTabs, activeTab, setDetailNav, calculatorClimbers, selectedDeparture, isNavigatingToBooking]);

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

  const navigateToBooking = (departureDate?: string) => {
    if (!expedition) return;
    setIsNavigatingToBooking(true);
    setSelectedBookingDate(departureDate);
    const params = new URLSearchParams();
    if (calculatorClimbers) {
      params.set("travelers", String(calculatorClimbers));
    }
    const dateToUse = departureDate || selectedDeparture?.startDate;
    if (dateToUse) {
      params.set("date", dateToUse);
    }
    const queryString = params.toString() ? `?${params.toString()}` : "";
    router.push(`/expeditions/${expedition.slug}/booking${queryString}`);
  };

  const handleBookDeparture = (dateSlot: TripDepartureDate) => {
    setSelectedDeparture(dateSlot);
    navigateToBooking(dateSlot.startDate);
  };

  const peakMeters = expedition.peakHeightM !== undefined ? expedition.peakHeightM : expedition.maxAltitudeMeters;

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-20">
      {/* 1. HERO HEADER */}
      <PackageDetailHero
        title={expedition.title}
        image={expedition.image}
        backHref="/expeditions"
        backLabel="Back to Expeditions"
        priceUSD={
          expedition.groupPricingEnabled && expedition.groupPricing && expedition.groupPricing.length > 0
            ? getLowestGroupPrice(expedition.groupPricing, expedition.priceUSD)
            : expedition.priceUSD
        }
        priceLabel={
          expedition.groupPricingEnabled && expedition.groupPricing && expedition.groupPricing.length > 0
            ? "Price from"
            : "Starting Price"
        }
        bookButtonLabel="Book Expedition"
        onBookClick={() => navigateToBooking()}
        isBookingLoading={isNavigatingToBooking}
        isBooked={isBooked}
        isInquired={isInquired}
        badges={[
          ...(peakMeters !== undefined ? [{ label: `${peakMeters.toLocaleString()}m Summit` }] : []),
          ...(expedition.climbingGrade ? [{ label: expedition.climbingGrade, highlight: true }] : []),
          ...(expedition.sherpaGuideRatio ? [{ label: expedition.sherpaGuideRatio }] : []),
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
          <div className="lg:col-span-8 space-y-12 sm:space-y-16 w-full min-w-0">
            {/* Gallery Showcase */}
            {gallery.length > 0 && (
              <PackageGallery title={expedition.title} images={gallery} />
            )}

            {/* Inline Navigation Tabs (Visible before reaching sticky top) */}
            {availableTabs.length > 1 && (
              <div id="detail-page-tabs-bar" className="w-full min-w-0">
                <PackageTabsNav
                  tabs={availableTabs}
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                />
              </div>
            )}

            {/* SECTION: OVERVIEW */}
            {hasRichText(expedition.shortDesc) && (
              <section id="overview" className="scroll-mt-24">
                <PackageSection title="Overview">
                  <div
                    className="prose-editorial max-w-none"
                    dangerouslySetInnerHTML={{ __html: expedition.shortDesc }}
                  />
                </PackageSection>
              </section>
            )}

            {/* SECTION: CLIMBING ITINERARY */}
            {expedition.itinerary && expedition.itinerary.length > 0 && expedition.itinerary.some((d: any) => d && (d.title || d.description)) && (
              <section id="itinerary" className="scroll-mt-24">
                <PackageItinerary
                  days={expedition.itinerary}
                  title="Itinerary"
                />
              </section>
            )}

            {/* SECTION: INCLUSIONS & EXCLUSIONS */}
            {hasCostSection && (
              <section id="cost" className="scroll-mt-24">
                <PackageInclusions
                  inclusionsText={expedition.inclusionsText}
                  exclusionsText={expedition.exclusionsText}
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
                  isBookingLoading={isNavigatingToBooking}
                  activeDepartureDate={selectedBookingDate}
                />
              </section>
            )}

            {/* SECTION: USEFUL INFO */}
            {hasRichText(expedition.usefulInfoText) && (
              <section id="useful-info" className="scroll-mt-24">
                <PackageUsefulInfo usefulInfoText={expedition.usefulInfoText} />
              </section>
            )}

            {/* SECTION: MAP */}
            {Boolean(expedition.mapImage && expedition.mapImage.trim()) && (
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

            {/* SECTION: REVIEWS */}
            {displayReviews.length > 0 && (
              <section id="reviews" className="scroll-mt-24">
                <PackageReviews reviews={displayReviews} />
              </section>
            )}

            {/* SECTION: FAQS */}
            {displayFaqs.length > 0 && (
              <section id="faqs" className="scroll-mt-24">
                <PackageFaqs faqs={displayFaqs} />
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
              onBookClick={() => navigateToBooking()}
              bookButtonLabel="Apply for Expedition"
              isBookingLoading={isNavigatingToBooking}
              packageType={InquiryType.EXPEDITION}
              isBooked={isBooked}
              isInquired={isInquired}
              onResetBooked={() => setIsBooked(false)}
              onResetInquired={() => setIsInquired(false)}
              onInquirySuccess={() => setIsInquired(true)}
              basePriceUSD={expedition.priceUSD}
              groupPricingEnabled={expedition.groupPricingEnabled}
              groupPricing={expedition.groupPricing}
              departureDates={expedition.departureDates}
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


    </div>
  );
}
