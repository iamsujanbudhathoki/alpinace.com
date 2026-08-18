"use client";

import { useState, useMemo, useEffect } from "react";
import { notFound } from "next/navigation";
import {
  Calendar,
  Mountain,
  MapPin,
  Utensils,
  Users,
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
  ClimbingGrade,
  FaqItem,
  FaqStatus,
  TripDepartureDate,
} from "@/lib/admin-data";
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
  const [selectedDeparture, setSelectedDeparture] = useState<TripDepartureDate | null>(null);
  const [relatedExpeditions, setRelatedExpeditions] = useState<ExpeditionItem[]>(
    [],
  );

  // Dynamic FAQs from backend
  const [globalFaqs, setGlobalFaqs] = useState<FaqItem[]>([]);
  // Dynamic Reviews from backend
  const [globalReviews, setGlobalReviews] = useState<Testimonial[]>([]);

  const [calculatorClimbers, setCalculatorClimbers] = useState<number>(1);

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
    let discount = 1;
    if (calculatorClimbers >= 4) discount = 0.95;
    if (calculatorClimbers >= 8) discount = 0.9;
    return Math.round(baseCostPerPerson * calculatorClimbers * discount);
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

  // Dynamic tabs based on backend data
  const availableTabs = useMemo(() => {
    const list: { key: string; label: string }[] = [
      { key: "overview", label: "Overview" },
    ];
    if (expedition?.itinerary && expedition.itinerary.length > 0) {
      list.push({ key: "itinerary", label: "Climbing Itinerary" });
    }
    if (costIncludes.length > 0 || costExclusions.length > 0) {
      list.push({ key: "cost", label: "Inclusions & Exclusions" });
    }
    if (expedition?.departureDates && expedition.departureDates.length > 0) {
      list.push({ key: "departures", label: "Departure Dates" });
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
    return list;
  }, [expedition, costIncludes, costExclusions, displayFaqs]);

  const [activeTab, setActiveTab] = useState<string>("overview");

  const currentActiveTab = availableTabs.some((t) => t.key === activeTab)
    ? activeTab
    : availableTabs[0]?.key || "overview";

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

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-20">
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
          { label: `${peakMeters.toLocaleString()}m Peak` },
          { label: expedition.climbingGrade || "Technical Grade", highlight: true },
          { label: expedition.sherpaGuideRatio || "1:1 Sherpa" },
        ]}
      />

      {/* 2. QUICK FACTS BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <PackageQuickFacts
          facts={[
            {
              icon: <Mountain className="w-5 h-5" />,
              label: "Summit Altitude",
              value: `${peakMeters.toLocaleString()}m`,
            },
            {
              icon: <Compass className="w-5 h-5" />,
              label: "Climbing Grade",
              value: expedition.climbingGrade || ClimbingGrade.EXTREME_TECHNICAL_GRADE,
            },
            {
              icon: <ShieldCheck className="w-5 h-5" />,
              label: "Sherpa Ratio",
              value: expedition.sherpaGuideRatio || "1:1 Personal Sherpa",
            },
            {
              icon: <Calendar className="w-5 h-5" />,
              label: "Climbing Window",
              value: expedition.bestSeason || "Spring & Autumn",
            },
          ]}
        />
      </div>

      {/* 3. MAIN CONTENT GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Details Column */}
          <div className="lg:col-span-8 space-y-10">
            {/* Gallery Showcase */}
            {gallery.length > 0 && (
              <PackageGallery title={expedition.title} images={gallery} />
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
                  {expedition.shortDesc && (
                    <div className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-[#EAE5DC] shadow-2xs">
                      <h2 className="font-heading text-2xl font-bold text-[#1E2420]">
                        Expedition Overview &amp; Summit Logistics
                      </h2>
                      <div
                        className="prose prose-stone max-w-none text-[#3A423C] text-base leading-relaxed font-normal [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_h3]:font-bold [&_h3]:text-lg [&_h3]:text-[#1E2420] [&_h3]:mt-6 [&_h3]:mb-2 [&_h4]:font-bold [&_h4]:text-base [&_h4]:text-[#1E2420] [&_h4]:mt-4 [&_h4]:mb-2 [&_strong]:font-bold [&_strong]:text-[#1E2420] [&_a]:text-amber-700 [&_a]:underline"
                        dangerouslySetInnerHTML={{ __html: expedition.shortDesc }}
                      />
                    </div>
                  )}

                  {/* Highlights Grid */}
                  {(expedition.startEndLocation ||
                    expedition.meals ||
                    expedition.groupSizeRange ||
                    expedition.accommodation) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {expedition.startEndLocation && (
                        <div className="p-4 bg-white border border-[#EAE5DC] rounded-xl space-y-1">
                          <span className="text-xs font-semibold text-[#6B726C] uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#2D4536]" />
                            <span>Basecamp Location</span>
                          </span>
                          <p className="text-sm font-semibold text-[#1E2420]">
                            {expedition.startEndLocation}
                          </p>
                        </div>
                      )}

                      {expedition.accommodation && (
                        <div className="p-4 bg-white border border-[#EAE5DC] rounded-xl space-y-1">
                          <span className="text-xs font-semibold text-[#6B726C] uppercase tracking-wider flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5 text-[#2D4536]" />
                            <span>High Altitude Camps</span>
                          </span>
                          <p className="text-sm font-semibold text-[#1E2420]">
                            {expedition.accommodation}
                          </p>
                        </div>
                      )}

                      {expedition.meals && (
                        <div className="p-4 bg-white border border-[#EAE5DC] rounded-xl space-y-1">
                          <span className="text-xs font-semibold text-[#6B726C] uppercase tracking-wider flex items-center gap-1.5">
                            <Utensils className="w-3.5 h-3.5 text-[#2D4536]" />
                            <span>Expedition Kitchen</span>
                          </span>
                          <p className="text-sm font-semibold text-[#1E2420]">
                            {expedition.meals}
                          </p>
                        </div>
                      )}

                      {expedition.groupSizeRange && (
                        <div className="p-4 bg-white border border-[#EAE5DC] rounded-xl space-y-1">
                          <span className="text-xs font-semibold text-[#6B726C] uppercase tracking-wider flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-[#2D4536]" />
                            <span>Team Size</span>
                          </span>
                          <p className="text-sm font-semibold text-[#1E2420]">
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
                </div>
              )}

              {/* TAB 2: DETAILED ITINERARY */}
              {currentActiveTab === "itinerary" && expedition.itinerary && (
                <PackageItinerary
                  days={expedition.itinerary}
                  title="Climbing &amp; Acclimatization Itinerary"
                  subtitle={`${expedition.itinerary.length} Days expedition schedule for ${expedition.title}`}
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
              {currentActiveTab === "departures" && expedition.departureDates && (
                <PackageDepartures
                  dates={expedition.departureDates}
                  defaultPrice={expedition.priceUSD}
                  onBookDate={handleBookDeparture}
                />
              )}

              {/* TAB 5: MAP */}
              {currentActiveTab === "map" && expedition.mapImage && (
                <PackageTrekMap mapImage={expedition.mapImage} title={expedition.title} />
              )}

              {/* TAB 6: DOWNLOADS */}
              {currentActiveTab === "files" && expedition.packageFiles && (
                <PackageDownloads files={expedition.packageFiles} title={expedition.title} />
              )}

              {/* TAB 7: FAQS */}
              {currentActiveTab === "faqs" && <PackageFaqs faqs={displayFaqs} />}
            </div>

            {/* REVIEWS */}
            <PackageReviews reviews={displayReviews} />
          </div>

          {/* Sidebar Booking / Rate Estimator Widget */}
          <div className="lg:col-span-4 lg:sticky lg:top-36">
            <PackageBookingSidebar
              tripTitle={expedition.title}
              durationDays={expedition.durationDays}
              travelers={calculatorClimbers}
              onTravelersChange={setCalculatorClimbers}
              totalPrice={totalPrice}
              onBookClick={() => setIsBookingModalOpen(true)}
              bookButtonLabel="Apply for Expedition"
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
            region: e.region || "Himalayas",
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

      {/* 5. BOOKING MODAL */}
      <PublicBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
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
