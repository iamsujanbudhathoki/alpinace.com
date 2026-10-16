"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { notFound, useRouter } from "next/navigation";
import {
  BedDouble,
  Calendar,
  Compass,
  Utensils,
} from "lucide-react";
import { TourItem, initialToursData } from "@/lib/tour-data";
import { FaqService, SettingService, TourService } from "@/lib/services/admin-service";
import { BookingPackageType, InquiryType, FaqItem, FaqStatus, TripDepartureDate } from "@/lib/admin-data";
import { calculateApplicablePrice, getLowestGroupPrice } from "@/lib/pricing-util";
import { Testimonial } from "@/lib/home-data";
import { useDetailNav } from "@/lib/detail-nav-context";
import { PackageDetailSkeleton } from "@/components/marketing/skeletons/package-detail-skeleton";

import {
  PackageBookingSidebar,
  PackageDetailHero,
  PackageHighlightsGrid,
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
import { hasRichText, isHtmlContent } from "@/lib/utils";
import { PackageSection } from "@/components/marketing/package-details/package-section";

interface TourDetailClientProps {
  initialTour: TourItem | any | null;
  slug: string;
}

export function TourDetailClient({ initialTour, slug }: TourDetailClientProps) {
  const [tour, setTour] = useState<TourItem | any | null>(initialTour);
  const [loading, setLoading] = useState(!initialTour);
  const [relatedTours, setRelatedTours] = useState<TourItem[]>([]);
  const router = useRouter();
  const [isBooked, setIsBooked] = useState(false);
  const [isInquired, setIsInquired] = useState(false);
  const [selectedDeparture, setSelectedDeparture] = useState<TripDepartureDate | null>(null);

  const { setDetailNav } = useDetailNav();

  const [globalFaqs, setGlobalFaqs] = useState<FaqItem[]>([]);
  const [globalReviews, setGlobalReviews] = useState<Testimonial[]>([]);
  const [calculatorTravelers, setCalculatorTravelers] = useState<number>(2);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
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
          FaqService.getPublicAll(FaqStatus.ACTIVE).catch(() => []),
          SettingService.getPublicAll().catch(() => ({})),
          TourService.getPublicAll().catch(() => []),
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

  // Active addons and pricing
  const activeAddons = useMemo(() => {
    return (tour?.addons || []).filter((a: any) => a.isActive !== false && a.title?.trim());
  }, [tour?.addons]);

  const bookingAddons = useMemo(() => {
    return activeAddons.map((addon: any) => ({
      id: addon.id,
      label: addon.title,
      description: addon.description || "",
      pricePerPerson: Number(addon.priceUSD) || 0,
      checked: selectedAddonIds.includes(addon.id),
      onChange: (checked: boolean) => {
        setSelectedAddonIds((prev) =>
          checked ? [...prev, addon.id] : prev.filter((id) => id !== addon.id)
        );
      },
    }));
  }, [activeAddons, selectedAddonIds]);

  const addonsPerPerson = useMemo(() => {
    return activeAddons
      .filter((a: any) => selectedAddonIds.includes(a.id))
      .reduce((sum: number, a: any) => sum + (Number(a.priceUSD) || 0), 0);
  }, [activeAddons, selectedAddonIds]);

  // Price calculations
  const applicablePricing = useMemo(() => {
    if (!tour) return { pricePerPerson: 0, totalPrice: 0, applicableTier: null };
    return calculateApplicablePrice(tour, calculatorTravelers);
  }, [tour, calculatorTravelers]);

  const perPersonCalculated = applicablePricing.pricePerPerson + addonsPerPerson;
  const totalPrice = perPersonCalculated * calculatorTravelers;

  // Inclusions vs Exclusions existence based on schema
  const hasCostSection = hasRichText(tour?.inclusionsText) || hasRichText(tour?.exclusionsText);

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
    const list: { key: string; label: string }[] = [];
    if (hasRichText(tour?.shortDesc)) {
      list.push({ key: "overview", label: "Overview" });
    }
    if (tour?.itinerary && tour.itinerary.length > 0 && tour.itinerary.some((d: any) => d && (d.title || d.description))) {
      list.push({ key: "itinerary", label: "Itinerary" });
    }
    if (hasCostSection) {
      list.push({ key: "cost", label: "Includes/Excludes" });
    }
    if ((tour?.addons && tour.addons.some((a: any) => a.isActive !== false && a.title)) || hasRichText(tour?.addonsText)) {
      list.push({ key: "addons", label: "Add-Ons" });
    }
    if (tour?.departureDates && tour.departureDates.length > 0) {
      list.push({ key: "departures", label: "Departure Dates" });
    }
    if (hasRichText(tour?.usefulInfoText)) {
      list.push({ key: "useful-info", label: "Useful Info" });
    }
    if (tour?.mapImage && tour.mapImage.trim()) {
      list.push({ key: "map", label: "Route Map" });
    }
    if (tour?.packageFiles && tour.packageFiles.length > 0) {
      list.push({ key: "files", label: "Downloads" });
    }
    if (displayReviews.length > 0) {
      list.push({ key: "reviews", label: "Reviews" });
    }
    if (displayFaqs.length > 0) {
      list.push({ key: "faqs", label: "FAQs" });
    }
    return list;
  }, [tour, hasCostSection, displayFaqs, displayReviews]);

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
      onBookClick: () => navigateToBooking(),
      bookButtonLabel: "Reserve Private Tour",
    });

    return () => {
      setDetailNav(null);
    };
  }, [tour, availableTabs, activeTab, setDetailNav, calculatorTravelers, selectedDeparture, selectedAddonIds]);

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

  const navigateToBooking = (departureDate?: string) => {
    if (!tour) return;
    const params = new URLSearchParams();
    params.set("type", "tour");
    params.set("slug", tour.slug);
    if (calculatorTravelers) {
      params.set("travelers", String(calculatorTravelers));
    }
    const dateToUse = departureDate || selectedDeparture?.startDate;
    if (dateToUse) {
      params.set("date", dateToUse);
    }
    if (selectedAddonIds.length > 0) {
      params.set("addons", selectedAddonIds.join(","));
    }
    router.push(`/book?${params.toString()}`);
  };

  const handleBookDeparture = (dateSlot: TripDepartureDate) => {
    setSelectedDeparture(dateSlot);
    navigateToBooking(dateSlot.startDate);
  };

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-20">
      {/* 1. HERO HEADER */}
      <PackageDetailHero
        title={tour.title}
        image={tour.image}
        backHref="/tours"
        backLabel="Back to Tours"
        priceUSD={
          tour.groupPricingEnabled && tour.groupPricing && tour.groupPricing.length > 0
            ? getLowestGroupPrice(tour.groupPricing, tour.priceUSD)
            : tour.priceUSD
        }
        priceLabel={
          tour.groupPricingEnabled && tour.groupPricing && tour.groupPricing.length > 0
            ? "Price from"
            : "Starting Price"
        }
        bookButtonLabel="Book Tour"
        onBookClick={() => navigateToBooking()}
        isBooked={isBooked}
        isInquired={isInquired}
        badges={[
          ...(tour.region ? [{ label: tour.region }] : []),
          { label: tour.tourType || "Heritage Tour", highlight: true },
          { label: `${tour.durationDays} Days` },
        ]}
      />

      {/* 2. HIGHLIGHT SPECS GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <PackageHighlightsGrid packageData={tour} />
      </div>

      {/* 3. MAIN CONTENT GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-start">
          {/* Main Editorial Column */}
          <div className="lg:col-span-8 space-y-12 sm:space-y-16 w-full min-w-0">
            {/* Photo Gallery Showcase */}
            {gallery.length > 0 && (
              <PackageGallery title={tour.title} images={gallery} />
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
            {hasRichText(tour.shortDesc) && (
              <section id="overview" className="scroll-mt-24">
                <PackageSection
                  icon={Compass}
                  eyebrow="The experience"
                  title="Overview"
                >
                  <div
                    className="prose-editorial max-w-none"
                    dangerouslySetInnerHTML={{ __html: tour.shortDesc }}
                  />
                </PackageSection>
              </section>
            )}

            {/* SECTION: ITINERARY */}
            {tour.itinerary && tour.itinerary.length > 0 && tour.itinerary.some((d: any) => d && (d.title || d.description)) && (
              <section id="itinerary" className="scroll-mt-24">
                <PackageItinerary
                  days={tour.itinerary}
                  title="Detailed Itinerary"
                />
              </section>
            )}

            {/* SECTION: INCLUSIONS & EXCLUSIONS */}
            {hasCostSection && (
              <section id="cost" className="scroll-mt-24">
                <PackageInclusions
                  inclusionsText={tour.inclusionsText}
                  exclusionsText={tour.exclusionsText}
                />
              </section>
            )}

            {/* SECTION: ADD-ONS */}
            {((tour.addons && tour.addons.length > 0) || hasRichText(tour.addonsText)) && (
              <section id="addons" className="scroll-mt-24">
                <PackageAddons addons={tour.addons} addonsText={tour.addonsText} />
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

            {/* SECTION: USEFUL INFO */}
            {hasRichText(tour.usefulInfoText) && (
              <section id="useful-info" className="scroll-mt-24">
                <PackageUsefulInfo usefulInfoText={tour.usefulInfoText} />
              </section>
            )}

            {/* SECTION: MAP */}
            {Boolean(tour.mapImage && tour.mapImage.trim()) && (
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
              tripTitle={tour.title}
              durationDays={tour.durationDays}
              travelers={calculatorTravelers}
              onTravelersChange={setCalculatorTravelers}
              addons={bookingAddons}
              totalPrice={totalPrice}
              onBookClick={() => navigateToBooking()}
              bookButtonLabel="Reserve Private Tour"
              packageType={InquiryType.TOUR}
              isBooked={isBooked}
              isInquired={isInquired}
              onResetBooked={() => setIsBooked(false)}
              onResetInquired={() => setIsInquired(false)}
              onInquirySuccess={() => setIsInquired(true)}
              basePriceUSD={tour.priceUSD}
              groupPricingEnabled={tour.groupPricingEnabled}
              groupPricing={tour.groupPricing}
              departureDates={tour.departureDates}
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
            region: t.region,
            durationDays: t.durationDays,
            maxAltitudeMeters: t.maxAltitudeMeters || 1400,
            difficulty: t.difficulty || "Easy",
            priceUSD: t.priceUSD,
            image: t.image,
            rating: t.rating || 5.0,
            reviewsCount: t.reviewsCount || 10,
          }))}
          categoryPath="/tours"
          title="Explore More Luxury Tours"
        />
      )}


    </div>
  );
}
