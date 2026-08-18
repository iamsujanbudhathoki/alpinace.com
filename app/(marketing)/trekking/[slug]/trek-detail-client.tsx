"use client";

import { useState, useMemo, useEffect } from "react";
import { notFound } from "next/navigation";
import {
  Mountain,
  Compass,
  Calendar,
  BedDouble,
  MapPin,
  Utensils,
  Users,
} from "lucide-react";
import { TrekItem, initialTreksData } from "@/lib/trek-data";
import {
  TrekService,
  FaqService,
  SettingService,
} from "@/lib/services/admin-service";
import { FaqItem, FaqStatus, BookingPackageType, TripDepartureDate } from "@/lib/admin-data";
import { Testimonial, TESTIMONIALS } from "@/lib/home-data";
import { PackageDetailSkeleton } from "@/components/marketing/skeletons/package-detail-skeleton";
import { PublicBookingModal } from "@/components/marketing/modals/public-booking-modal";
import {
  PackageDetailHero,
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

  // Booking modal state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [calculatorTravelers, setCalculatorTravelers] = useState<number>(2);
  const [selectedDeparture, setSelectedDeparture] = useState<TripDepartureDate | null>(null);

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
              (t) => t.slug !== slug && t.status === "active"
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
      list.push({ key: "cost", label: "Inclusions & Exclusions" });
    }
    if (trek?.departureDates && trek.departureDates.length > 0) {
      list.push({ key: "departures", label: "Departure Dates" });
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
    return list;
  }, [trek, costIncludes, costExclusions, displayFaqs]);

  const [activeTab, setActiveTab] = useState<string>("overview");

  // Derive active tab safely during render without cascading useEffect renders
  const currentActiveTab = availableTabs.some((t) => t.key === activeTab)
    ? activeTab
    : availableTabs[0]?.key || "overview";

  // Price calculations
  const baseCostPerPerson = trek?.priceUSD || 0;
  const totalPrice = useMemo(() => {
    let discount = 1;
    if (calculatorTravelers >= 4) discount = 0.95;
    if (calculatorTravelers >= 8) discount = 0.9;
    return Math.round(baseCostPerPerson * calculatorTravelers * discount);
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

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-20">
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
          { label: trek.region || "Trekking" },
          { label: trek.difficulty || "Moderate", highlight: true },
          { label: `${trek.durationDays} Days` },
        ]}
      />

      {/* 2. QUICK FACTS BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <PackageQuickFacts
          facts={[
            {
              icon: <Mountain className="w-5 h-5" />,
              label: "Max Elevation",
              value: `${(trek.maxAltitudeMeters || 1400).toLocaleString()}m`,
            },
            {
              icon: <Compass className="w-5 h-5" />,
              label: "Difficulty Grade",
              value: trek.difficulty,
            },
            {
              icon: <Calendar className="w-5 h-5" />,
              label: "Best Season",
              value: trek.bestSeason,
            },
            {
              icon: <BedDouble className="w-5 h-5" />,
              label: "Accommodation",
              value: trek.accommodation || "Lodge / Teahouse",
            },
          ]}
        />
      </div>

      {/* 3. MAIN CONTENT GRID (LEFT DETAILS + RIGHT SIDEBAR) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Details Column */}
          <div className="lg:col-span-8 space-y-10">
            {/* Gallery Showcase */}
            {gallery.length > 0 && (
              <PackageGallery title={trek.title} images={gallery} />
            )}

            {/* Navigation Tabs */}
            {availableTabs.length > 1 && (
              <PackageTabsNav
                tabs={availableTabs}
                activeTab={currentActiveTab}
                onTabChange={setActiveTab}
              />
            )}

            {/* TAB CONTENT AREA */}
            <div className="space-y-8">
              {/* TAB 1: OVERVIEW */}
              {currentActiveTab === "overview" && (
                <div className="space-y-8">
                  {trek.shortDesc && (
                    <div className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-[#EAE5DC] shadow-2xs">
                      <h2 className="font-heading text-2xl font-bold text-[#1E2420]">
                        Trip Overview
                      </h2>
                      <div
                        className="prose prose-stone max-w-none text-[#3A423C] text-base leading-relaxed font-normal [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_h3]:font-bold [&_h3]:text-lg [&_h3]:text-[#1E2420] [&_h3]:mt-6 [&_h3]:mb-2 [&_h4]:font-bold [&_h4]:text-base [&_h4]:text-[#1E2420] [&_h4]:mt-4 [&_h4]:mb-2 [&_strong]:font-bold [&_strong]:text-[#1E2420] [&_a]:text-amber-700 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-amber-500 [&_blockquote]:pl-4 [&_blockquote]:italic"
                        dangerouslySetInnerHTML={{ __html: trek.shortDesc }}
                      />
                    </div>
                  )}

                  {/* Highlights Grid */}
                  {(trek.startEndLocation ||
                    trek.meals ||
                    trek.groupSizeRange) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {trek.startEndLocation && (
                        <div className="p-4 bg-white border border-[#EAE5DC] rounded-xl space-y-1">
                          <span className="text-xs font-semibold text-[#6B726C] uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#2D4536]" />
                            <span>Start &amp; Finish</span>
                          </span>
                          <p className="text-sm font-semibold text-[#1E2420]">
                            {trek.startEndLocation}
                          </p>
                        </div>
                      )}

                      {trek.meals && (
                        <div className="p-4 bg-white border border-[#EAE5DC] rounded-xl space-y-1">
                          <span className="text-xs font-semibold text-[#6B726C] uppercase tracking-wider flex items-center gap-1.5">
                            <Utensils className="w-3.5 h-3.5 text-[#2D4536]" />
                            <span>Meals Provided</span>
                          </span>
                          <p className="text-sm font-semibold text-[#1E2420]">
                            {trek.meals}
                          </p>
                        </div>
                      )}

                      {trek.groupSizeRange && (
                        <div className="p-4 bg-white border border-[#EAE5DC] rounded-xl space-y-1">
                          <span className="text-xs font-semibold text-[#6B726C] uppercase tracking-wider flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-[#2D4536]" />
                            <span>Group Size</span>
                          </span>
                          <p className="text-sm font-semibold text-[#1E2420]">
                            {trek.groupSizeRange}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Permits Section */}
                  {trek.permitsRequired && trek.permitsRequired.length > 0 && (
                    <div className="space-y-3 p-6 bg-white border border-[#EAE5DC] rounded-2xl">
                      <h3 className="text-xs font-semibold text-[#6B726C] uppercase tracking-wider">
                        Required Permits
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {trek.permitsRequired.map((permit, idx) => (
                          <span
                            key={idx}
                            className="bg-[#EAE5DC] text-[#242E27] text-xs font-medium px-3 py-1 rounded-md"
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
                </div>
              )}

              {/* TAB 2: DETAILED ITINERARY */}
              {currentActiveTab === "itinerary" && trek.itinerary && (
                <PackageItinerary
                  days={trek.itinerary}
                  title="Detailed Itinerary"
                  subtitle={`${trek.itinerary.length} Days journey across ${trek.region}`}
                />
              )}

              {/* TAB 3: INCLUSIONS & EXCLUSIONS */}
              {currentActiveTab === "cost" && (
                <PackageInclusions
                  inclusions={costIncludes}
                  exclusions={costExclusions}
                />
              )}

              {/* TAB 4: DEPARTURE DATES */}
              {currentActiveTab === "departures" && trek.departureDates && (
                <PackageDepartures
                  dates={trek.departureDates}
                  defaultPrice={trek.priceUSD}
                  onBookDate={handleBookDeparture}
                />
              )}

              {/* TAB 5: TREK MAP */}
              {currentActiveTab === "map" && trek.mapImage && (
                <PackageTrekMap mapImage={trek.mapImage} title={trek.title} />
              )}

              {/* TAB 6: DOWNLOADS */}
              {currentActiveTab === "files" && trek.packageFiles && (
                <PackageDownloads files={trek.packageFiles} title={trek.title} />
              )}

              {/* TAB 7: FAQS */}
              {currentActiveTab === "faqs" && <PackageFaqs faqs={displayFaqs} />}
            </div>

            {/* TESTIMONIALS / REVIEWS */}
            <PackageReviews reviews={displayReviews} />
          </div>

          {/* Sidebar Booking / Rate Estimator Widget */}
          <div className="lg:col-span-4 lg:sticky lg:top-36">
            <PackageBookingSidebar
              tripTitle={trek.title}
              durationDays={trek.durationDays}
              travelers={calculatorTravelers}
              onTravelersChange={setCalculatorTravelers}
              totalPrice={totalPrice}
              onBookClick={() => setIsBookingModalOpen(true)}
              bookButtonLabel="Book Expedition"
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

      {/* 5. BOOKING MODAL */}
      <PublicBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
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
