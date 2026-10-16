"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { notFound, useRouter } from "next/navigation";
import {
  Mountain,
  Compass,
  Calendar,
  BedDouble,
  ShieldAlert,
} from "lucide-react";
import { TrekItem, initialTreksData } from "@/lib/trek-data";
import {
  TrekService,
  FaqService,
  SettingService,
} from "@/lib/services/admin-service";
import { FaqItem, FaqStatus, BookingPackageType, InquiryType, TripDepartureDate, PackageStatus } from "@/lib/admin-data";
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
  PackageAddons,
  PackageUsefulInfo,
} from "@/components/marketing/package-details";
import { hasRichText, isHtmlContent } from "@/lib/utils";
import { PackageSection } from "@/components/marketing/package-details/package-section";

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

  const router = useRouter();
  const [isBooked, setIsBooked] = useState(false);
  const [isInquired, setIsInquired] = useState(false);
  const [calculatorTravelers, setCalculatorTravelers] = useState<number>(2);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
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
          FaqService.getPublicAll(FaqStatus.ACTIVE).catch(() => []),
          SettingService.getPublicAll().catch(() => ({})),
          TrekService.getPublicAll().catch(() => []),
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

  // Inclusions vs Exclusions existence based on schema
  const hasCostSection = hasRichText(trek?.inclusionsText) || hasRichText(trek?.exclusionsText);

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
    const list: { key: string; label: string }[] = [];
    if (hasRichText(trek?.shortDesc)) {
      list.push({ key: "overview", label: "Overview" });
    }
    if (trek?.itinerary && trek.itinerary.length > 0 && trek.itinerary.some((d) => d && (d.title || d.description))) {
      list.push({ key: "itinerary", label: "Itinerary" });
    }
    if (hasCostSection) {
      list.push({ key: "cost", label: "Includes/Excludes" });
    }
    if ((trek?.addons && trek.addons.some((a) => a.isActive !== false && a.title)) || hasRichText(trek?.addonsText)) {
      list.push({ key: "addons", label: "Add-Ons" });
    }
    if (trek?.departureDates && trek.departureDates.length > 0) {
      list.push({ key: "departures", label: "Departure Dates" });
    }
    if (hasRichText(trek?.usefulInfoText)) {
      list.push({ key: "useful-info", label: "Useful Info" });
    }
    if (trek?.mapImage && trek.mapImage.trim()) {
      list.push({ key: "map", label: "Trek Map" });
    }
    if (trek?.packageFiles && trek.packageFiles.length > 0) {
      list.push({ key: "files", label: "Downloads" });
    }
    if (displayReviews.length > 0) {
      list.push({ key: "reviews", label: "Reviews" });
    }
    if (displayFaqs.length > 0) {
      list.push({ key: "faqs", label: "FAQs" });
    }
    return list;
  }, [trek, hasCostSection, displayFaqs, displayReviews]);

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
      onBookClick: () => navigateToBooking(),
      bookButtonLabel: "Book Trek",
    });

    return () => {
      setDetailNav(null);
    };
  }, [trek, availableTabs, activeTab, setDetailNav, calculatorTravelers, selectedDeparture, selectedAddonIds]);

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

  // Active addons and pricing
  const activeAddons = useMemo(() => {
    return (trek?.addons || []).filter((a) => a.isActive !== false && a.title?.trim());
  }, [trek?.addons]);

  const bookingAddons = useMemo(() => {
    return activeAddons.map((addon) => ({
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
      .filter((a) => selectedAddonIds.includes(a.id))
      .reduce((sum, a) => sum + (Number(a.priceUSD) || 0), 0);
  }, [activeAddons, selectedAddonIds]);

  // Price calculations
  const applicablePricing = useMemo(() => {
    if (!trek) return { pricePerPerson: 0, totalPrice: 0, applicableTier: null };
    return calculateApplicablePrice(trek, calculatorTravelers);
  }, [trek, calculatorTravelers]);

  const perPersonCalculated = applicablePricing.pricePerPerson + addonsPerPerson;
  const totalPrice = perPersonCalculated * calculatorTravelers;

  if (loading) {
    return <PackageDetailSkeleton />;
  }

  if (!trek) {
    notFound();
  }

  const navigateToBooking = (departureDate?: string) => {
    if (!trek) return;
    const params = new URLSearchParams();
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
    const queryString = params.toString() ? `?${params.toString()}` : "";
    router.push(`/trekking/${trek.slug}/booking${queryString}`);
  };

  const handleBookDeparture = (dateSlot: TripDepartureDate) => {
    setSelectedDeparture(dateSlot);
    navigateToBooking(dateSlot.startDate);
  };

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-20">
      {/* 1. HERO HEADER */}
      <PackageDetailHero
        title={trek.title}
        image={trek.image}
        backHref="/trekking"
        backLabel="Back to Treks"
        priceUSD={
          trek.groupPricingEnabled && trek.groupPricing && trek.groupPricing.length > 0
            ? getLowestGroupPrice(trek.groupPricing, trek.priceUSD)
            : trek.priceUSD
        }
        priceLabel={
          trek.groupPricingEnabled && trek.groupPricing && trek.groupPricing.length > 0
            ? "Price from"
            : "Starting Price"
        }
        bookButtonLabel="Book Trek"
        onBookClick={() => navigateToBooking()}
        isBooked={isBooked}
        isInquired={isInquired}
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
          <div className="lg:col-span-8 space-y-12 sm:space-y-16 w-full min-w-0">
            {/* Gallery Showcase */}
            {gallery.length > 0 && (
              <PackageGallery title={trek.title} images={gallery} />
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
            {hasRichText(trek.shortDesc) && (
              <section id="overview" className="scroll-mt-24">
                <PackageSection
                  icon={Compass}
                  eyebrow="The experience"
                  title="Overview"
                >
                  <div
                    className="prose-editorial max-w-none"
                    dangerouslySetInnerHTML={{ __html: trek.shortDesc }}
                  />
                </PackageSection>
              </section>
            )}

            {/* SECTION: ITINERARY */}
            {trek.itinerary && trek.itinerary.length > 0 && trek.itinerary.some((d) => d && (d.title || d.description)) && (
              <section id="itinerary" className="scroll-mt-24">
                <PackageItinerary
                  days={trek.itinerary}
                  title="Detailed Itinerary"
                />
              </section>
            )}

            {/* SECTION: INCLUSIONS & EXCLUSIONS */}
            {hasCostSection && (
              <section id="cost" className="scroll-mt-24">
                <PackageInclusions
                  inclusionsText={trek.inclusionsText}
                  exclusionsText={trek.exclusionsText}
                />
              </section>
            )}

            {/* SECTION: ADD-ONS */}
            {((trek.addons && trek.addons.length > 0) || hasRichText(trek.addonsText)) && (
              <section id="addons" className="scroll-mt-24">
                <PackageAddons addons={trek.addons} addonsText={trek.addonsText} />
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

            {/* SECTION: USEFUL INFO */}
            {hasRichText(trek.usefulInfoText) && (
              <section id="useful-info" className="scroll-mt-24">
                <PackageUsefulInfo usefulInfoText={trek.usefulInfoText} />
              </section>
            )}

            {/* SECTION: TREK MAP */}
            {Boolean(trek.mapImage && trek.mapImage.trim()) && (
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
              tripTitle={trek.title}
              durationDays={trek.durationDays}
              travelers={calculatorTravelers}
              onTravelersChange={setCalculatorTravelers}
              addons={bookingAddons}
              totalPrice={totalPrice}
              onBookClick={() => navigateToBooking()}
              bookButtonLabel="Book Trek"
              packageType={InquiryType.TREKKING}
              isBooked={isBooked}
              isInquired={isInquired}
              onResetBooked={() => setIsBooked(false)}
              onResetInquired={() => setIsInquired(false)}
              onInquirySuccess={() => setIsInquired(true)}
              basePriceUSD={trek.priceUSD}
              groupPricingEnabled={trek.groupPricingEnabled}
              groupPricing={trek.groupPricing}
              departureDates={trek.departureDates}
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

    </div>
  );
}
