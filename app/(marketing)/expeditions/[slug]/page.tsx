"use client";

import { useState, useMemo, useEffect, use } from "react";
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
} from "@/lib/admin-data";
import { Testimonial } from "@/lib/home-data";
import { PackageDetailSkeleton } from "@/components/marketing/skeletons/package-detail-skeleton";
import { PublicBookingModal } from "@/components/marketing/modals/public-booking-modal";
import {
  PackageDetailHero,
  PackageQuickFacts,
  PackageGallery,
  PackageTabsNav,
  PackageInclusions,
  PackageFaqs,
  PackageReviews,
  PackageBookingSidebar,
  PackageRelatedTrips,
} from "@/components/marketing/package-details";

interface ExpeditionDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function ExpeditionDetailPage({
  params,
}: ExpeditionDetailPageProps) {
  const resolvedParams = use(params);
  const [expedition, setExpedition] = useState<ExpeditionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [relatedExpeditions, setRelatedExpeditions] = useState<ExpeditionItem[]>([]);

  // Dynamic FAQs from backend
  const [globalFaqs, setGlobalFaqs] = useState<FaqItem[]>([]);
  // Dynamic Reviews from backend
  const [globalReviews, setGlobalReviews] = useState<Testimonial[]>([]);

  const [calculatorClimbers, setCalculatorClimbers] = useState<number>(2);

  useEffect(() => {
    async function loadData() {
      try {
        const raw = await ExpeditionService.getBySlug(resolvedParams.slug);
        if (raw) {
          setExpedition({
            id: raw.id,
            title: raw.title,
            slug: raw.slug,
            category: raw.category,
            rating: Number(raw.rating),
            reviewsCount: Number(raw.reviewsCount),
            image: raw.image || "",
            shortDesc: raw.shortDesc || "",
            durationDays: Number(raw.durationDays),
            peakHeightM: Number(raw.peakHeightM || raw.maxAltitudeMeters || 0),
            maxAltitudeMeters:
              raw.maxAltitudeMeters !== undefined
                ? Number(raw.maxAltitudeMeters)
                : undefined,
            climbingGrade:
              raw.climbingGrade ||
              (raw.difficulty as unknown as ClimbingGrade),
            difficulty: raw.difficulty,
            sherpaGuideRatio: raw.sherpaGuideRatio,
            oxygenRequired: raw.oxygenRequired,
            bestSeason: raw.bestSeason || "",
            priceUSD: Number(raw.priceUSD),
            startEndLocation: raw.startEndLocation,
            accommodation: raw.accommodation,
            meals: raw.meals,
            groupSizeRange: raw.groupSizeRange,
            permitsRequired: raw.permitsRequired || [],
            inclusionsText: raw.inclusionsText,
            exclusionsText: raw.exclusionsText,
            faqs: raw.faqs,
            reviews: raw.reviews,
            status: raw.status,
            region: raw.region,
          });
        } else {
          const staticMatch = initialExpeditionsData.find(
            (e) => e.slug === resolvedParams.slug,
          );
          setExpedition(staticMatch || null);
        }

        // Live FAQs
        const liveFaqs = await FaqService.getAll(FaqStatus.ACTIVE);
        if (liveFaqs && Array.isArray(liveFaqs)) {
          setGlobalFaqs(liveFaqs);
        }

        // Live Testimonials
        const settings = await SettingService.getAll();
        if (settings?.testimonials) {
          try {
            const parsed = JSON.parse(settings.testimonials);
            if (Array.isArray(parsed)) {
              setGlobalReviews(parsed);
            }
          } catch (e) {
            console.warn("Failed to parse dynamic testimonials:", e);
          }
        }

        // Related Expeditions
        const all = await ExpeditionService.getAll();
        if (all && Array.isArray(all)) {
          setRelatedExpeditions(
            all
              .filter((e) => e.slug !== resolvedParams.slug)
              .slice(0, 3)
              .map((r) => ({
                id: r.id,
                title: r.title,
                slug: r.slug,
                category: r.category,
                rating: Number(r.rating),
                reviewsCount: Number(r.reviewsCount),
                image: r.image || "",
                shortDesc: r.shortDesc || "",
                durationDays: Number(r.durationDays),
                peakHeightM: Number(r.peakHeightM || r.maxAltitudeMeters || 0),
                climbingGrade:
                  r.climbingGrade ||
                  (r.difficulty as unknown as ClimbingGrade),
                bestSeason: r.bestSeason || "",
                priceUSD: Number(r.priceUSD),
                permitsRequired: r.permitsRequired || [],
                status: r.status,
                region: r.region,
              })),
          );
        }
      } catch (e) {
        console.warn("Failed to fetch expedition by slug", e);
        const staticMatch = initialExpeditionsData.find(
          (e) => e.slug === resolvedParams.slug,
        );
        setExpedition(staticMatch || null);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [resolvedParams.slug]);

  // Gallery state from backend data
  const gallery = useMemo(() => {
    if (!expedition || !expedition.image) return [];
    if (expedition.image.includes(",")) {
      return expedition.image
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [expedition.image];
  }, [expedition]);

  // Price calculations
  const baseCostPerPerson = expedition?.priceUSD || 0;
  const totalPrice = useMemo(() => {
    let discount = 1;
    if (calculatorClimbers >= 4) discount = 0.95;
    return Math.round(baseCostPerPerson * calculatorClimbers * discount);
  }, [baseCostPerPerson, calculatorClimbers]);

  // Inclusions vs Exclusions parsed from backend
  const costIncludes = useMemo(() => {
    if (!expedition?.inclusionsText || !expedition.inclusionsText.trim()) return [];
    return expedition.inclusionsText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [expedition]);

  const costExclusions = useMemo(() => {
    if (!expedition?.exclusionsText || !expedition.exclusionsText.trim()) return [];
    return expedition.exclusionsText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [expedition]);

  // FAQs
  const displayFaqs = useMemo(() => {
    if (expedition?.faqs && Array.isArray(expedition.faqs) && expedition.faqs.length > 0) {
      return expedition.faqs.map((f, i) => ({
        id: `exp-faq-${i}`,
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
  }, [expedition, globalFaqs]);

  // Reviews
  const displayReviews = useMemo(() => {
    if (expedition?.reviews && Array.isArray(expedition.reviews) && expedition.reviews.length > 0) {
      return expedition.reviews.map((r, i) => ({
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
    if (costIncludes.length > 0 || costExclusions.length > 0) {
      list.push({ key: "cost", label: "Inclusions & Exclusions" });
    }
    if (displayFaqs.length > 0) {
      list.push({ key: "faqs", label: "FAQs" });
    }
    return list;
  }, [costIncludes, costExclusions, displayFaqs]);

  const [activeTab, setActiveTab] = useState<string>("overview");

  // Derive active tab safely during render without cascading useEffect renders
  const currentActiveTab = availableTabs.some((t) => t.key === activeTab)
    ? activeTab
    : (availableTabs[0]?.key || "overview");

  if (loading) {
    return <PackageDetailSkeleton />;
  }

  if (!expedition) {
    return notFound();
  }

  const peakElevation =
    expedition.peakHeightM || expedition.maxAltitudeMeters;

  const quickFacts = [
    ...(peakElevation
      ? [
          {
            icon: <Mountain className="w-5 h-5" />,
            label: "Peak Elevation",
            value: `${peakElevation.toLocaleString()} m`,
          },
        ]
      : []),
    ...(expedition.climbingGrade || expedition.difficulty
      ? [
          {
            icon: <Compass className="w-5 h-5" />,
            label: "Climbing Grade",
            value: (
              <span className="capitalize">
                {expedition.climbingGrade || expedition.difficulty}
              </span>
            ),
          },
        ]
      : []),
    ...(expedition.bestSeason
      ? [
          {
            icon: <Calendar className="w-5 h-5" />,
            label: "Best Season",
            value: expedition.bestSeason,
          },
        ]
      : []),
    ...(expedition.sherpaGuideRatio
      ? [
          {
            icon: <Users className="w-5 h-5" />,
            label: "Sherpa Ratio",
            value: expedition.sherpaGuideRatio,
          },
        ]
      : []),
  ];



  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1E2420] antialiased">
      {/* 1. HERO HEADER */}
      <PackageDetailHero
        title={expedition.title}
        image={expedition.image}
        backHref="/expeditions"
        backLabel="All Mountaineering Expeditions"
        priceUSD={expedition.priceUSD}
        onBookClick={() => setIsBookingModalOpen(true)}
        bookButtonLabel="Apply For Expedition"
        badges={[
          ...(expedition.region
            ? [{ label: `${expedition.region} Region`, highlight: true }]
            : []),
          ...(expedition.durationDays
            ? [{ label: `${expedition.durationDays} Days` }]
            : []),
          ...(peakElevation
            ? [{ label: `Apex ${peakElevation.toLocaleString()}m` }]
            : []),
          ...(expedition.climbingGrade || expedition.difficulty
            ? [
                {
                  label: `${expedition.climbingGrade || expedition.difficulty} Grade`,
                },
              ]
            : []),
        ]}
      />

      {/* 2. QUICK FACTS BAR */}
      {quickFacts.length > 0 && <PackageQuickFacts facts={quickFacts} />}

      {/* 3. MAIN CONTENT & SIDEBAR */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Main Column */}
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
                    <div className="space-y-4">
                      <h2 className="font-heading text-2xl font-bold text-[#1E2420]">
                        Expedition Overview
                      </h2>
                      <p className="text-[#3A423C] text-base leading-relaxed font-normal">
                        {expedition.shortDesc}
                      </p>
                    </div>
                  )}

                  {/* Highlights Grid */}
                  {(expedition.startEndLocation ||
                    expedition.meals ||
                    expedition.groupSizeRange ||
                    expedition.sherpaGuideRatio) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E6E0D5]">
                      {expedition.startEndLocation && (
                        <div className="p-4 bg-white border border-[#EAE5DC] rounded-xl space-y-1">
                          <span className="text-xs font-semibold text-[#6B726C] uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#2D4536]" />
                            <span>Basecamp Logistics</span>
                          </span>
                          <p className="text-sm font-semibold text-[#1E2420]">
                            {expedition.startEndLocation}
                          </p>
                        </div>
                      )}

                      {expedition.meals && (
                        <div className="p-4 bg-white border border-[#EAE5DC] rounded-xl space-y-1">
                          <span className="text-xs font-semibold text-[#6B726C] uppercase tracking-wider flex items-center gap-1.5">
                            <Utensils className="w-3.5 h-3.5 text-[#2D4536]" />
                            <span>High Altitude Nutrition</span>
                          </span>
                          <p className="text-sm font-semibold text-[#1E2420]">
                            {expedition.meals}
                          </p>
                        </div>
                      )}

                      {expedition.sherpaGuideRatio && (
                        <div className="p-4 bg-white border border-[#EAE5DC] rounded-xl space-y-1">
                          <span className="text-xs font-semibold text-[#6B726C] uppercase tracking-wider flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-[#2D4536]" />
                            <span>Climber Ratio</span>
                          </span>
                          <p className="text-sm font-semibold text-[#1E2420]">
                            {expedition.sherpaGuideRatio}
                          </p>
                        </div>
                      )}

                      {expedition.groupSizeRange && (
                        <div className="p-4 bg-white border border-[#EAE5DC] rounded-xl space-y-1">
                          <span className="text-xs font-semibold text-[#6B726C] uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#2D4536]" />
                            <span>Expedition Team Size</span>
                          </span>
                          <p className="text-sm font-semibold text-[#1E2420]">
                            {expedition.groupSizeRange}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Required Permits */}
                  {expedition.permitsRequired &&
                    expedition.permitsRequired.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-[#E6E0D5]">
                        <h3 className="text-xs font-semibold text-[#6B726C] uppercase tracking-wider">
                          Included Government Royalties &amp; Permits
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {expedition.permitsRequired.map((permit, idx) => (
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
                </div>
              )}

              {/* TAB 2: INCLUSIONS & EXCLUSIONS */}
              {currentActiveTab === "cost" && (
                <PackageInclusions
                  inclusions={costIncludes}
                  exclusions={costExclusions}
                />
              )}

              {/* TAB 3: FAQS */}
              {currentActiveTab === "faqs" && <PackageFaqs faqs={displayFaqs} />}
            </div>

            {/* TESTIMONIALS / REVIEWS */}
            {displayReviews.length > 0 && (
              <PackageReviews reviews={displayReviews} />
            )}
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
              bookButtonLabel="Apply For Expedition"
            />
          </div>
        </div>
      </main>

      {/* 4. RELATED EXPEDITIONS SECTION */}
      {relatedExpeditions.length > 0 && (
        <PackageRelatedTrips
          trips={relatedExpeditions}
          categoryPath="/expeditions"
          title="Other Himalayan Mountaineering Expeditions"
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
          maxAltitudeMeters: expedition.maxAltitudeMeters || expedition.peakHeightM,
          difficulty: expedition.difficulty,
          priceUSD: expedition.priceUSD,
          image: expedition.image,
          categoryType: BookingPackageType.EXPEDITION,
        }}
        initialTravelers={calculatorClimbers}
      />
    </div>
  );
}
