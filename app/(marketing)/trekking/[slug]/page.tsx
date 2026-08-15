"use client";

import { useState, useMemo, useEffect, use } from "react";
import { notFound } from "next/navigation";
import {
  Mountain,
  Compass,
  Calendar,
  BedDouble,
  MapPin,
  Utensils,
  Users,
  ShieldCheck,
} from "lucide-react";
import { TrekItem, initialTreksData } from "@/lib/trek-data";
import {
  TrekService,
  FaqService,
  SettingService,
} from "@/lib/services/admin-service";
import { FaqItem, FaqStatus, BookingPackageType } from "@/lib/admin-data";
import { Testimonial } from "@/lib/home-data";
import { PackageDetailSkeleton } from "@/components/marketing/skeletons/package-detail-skeleton";
import { PublicBookingModal } from "@/components/marketing/modals/public-booking-modal";
import {
  PackageDetailHero,
  PackageQuickFacts,
  PackageGallery,
  PackageTabsNav,
  PackageItinerary,
  PackageInclusions,
  PackageChecklist,
  PackageFaqs,
  PackageReviews,
  PackageBookingSidebar,
  PackageRelatedTrips,
} from "@/components/marketing/package-details";

interface TrekDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function TrekDetailPage({ params }: TrekDetailPageProps) {
  const resolvedParams = use(params);
  const [trek, setTrek] = useState<TrekItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Dynamic FAQs from backend
  const [globalFaqs, setGlobalFaqs] = useState<FaqItem[]>([]);

  // Dynamic Reviews from backend settings
  const [globalReviews, setGlobalReviews] = useState<Testimonial[]>([]);

  // Dynamic Related Treks from backend
  const [relatedTreks, setRelatedTreks] = useState<TrekItem[]>([]);

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Calculator State
  const [calculatorTravelers, setCalculatorTravelers] = useState<number>(2);

  // Load dynamic data from backend APIs
  useEffect(() => {
    async function loadData() {
      try {
        // 1. Fetch Trek By Slug
        const item = await TrekService.getBySlug(resolvedParams.slug);
        if (item) {
          setTrek(item);
        } else {
          const staticMatch = initialTreksData.find(
            (t) => t.slug === resolvedParams.slug,
          );
          setTrek(staticMatch || null);
        }

        // 2. Fetch Live Global FAQs from API
        const liveFaqs = await FaqService.getAll(FaqStatus.ACTIVE);
        if (liveFaqs && Array.isArray(liveFaqs)) {
          setGlobalFaqs(liveFaqs);
        }

        // 3. Fetch Live Testimonials from Global Settings API
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

        // 4. Fetch Active Treks for Related Section
        const allTreks = await TrekService.getAll();
        if (allTreks && Array.isArray(allTreks)) {
          setRelatedTreks(
            allTreks
              .filter((t) => t.slug !== resolvedParams.slug)
              .slice(0, 3),
          );
        }
      } catch (e) {
        console.warn("Failed to fetch dynamic trek details data:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [resolvedParams.slug]);

  // Gallery images from backend data
  const gallery = useMemo(() => {
    if (!trek || !trek.image) return [];
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
    if (displayFaqs.length > 0) {
      list.push({ key: "faqs", label: "FAQs" });
    }
    return list;
  }, [trek?.itinerary, costIncludes, costExclusions, displayFaqs]);

  const [activeTab, setActiveTab] = useState<string>("overview");

  // Derive active tab safely during render without cascading useEffect renders
  const currentActiveTab = availableTabs.some((t) => t.key === activeTab)
    ? activeTab
    : (availableTabs[0]?.key || "overview");

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
    return notFound();
  }

  // Quick facts based on backend data
  const quickFacts = [
    ...(trek.maxAltitudeMeters
      ? [
          {
            icon: <Mountain className="w-5 h-5" />,
            label: "Max Elevation",
            value: `${trek.maxAltitudeMeters.toLocaleString()} m`,
          },
        ]
      : []),
    ...(trek.difficulty
      ? [
          {
            icon: <Compass className="w-5 h-5" />,
            label: "Trek Grade",
            value: <span className="capitalize">{trek.difficulty}</span>,
          },
        ]
      : []),
    ...(trek.bestSeason
      ? [
          {
            icon: <Calendar className="w-5 h-5" />,
            label: "Best Season",
            value: trek.bestSeason,
          },
        ]
      : []),
    ...(trek.accommodation
      ? [
          {
            icon: <BedDouble className="w-5 h-5" />,
            label: "Accommodation",
            value: trek.accommodation,
          },
        ]
      : []),
  ];



  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1E2420] antialiased">
      {/* 1. HERO HEADER */}
      <PackageDetailHero
        title={trek.title}
        image={trek.image}
        backHref="/trekking"
        backLabel="All Treks & Itineraries"
        priceUSD={trek.priceUSD}
        onBookClick={() => setIsBookingModalOpen(true)}
        bookButtonLabel="Book Expedition"
        badges={[
          ...(trek.region
            ? [{ label: `${trek.region} Region`, highlight: true }]
            : []),
          ...(trek.durationDays ? [{ label: `${trek.durationDays} Days` }] : []),
          ...(trek.difficulty
            ? [{ label: `${trek.difficulty} Grade` }]
            : []),
          ...(trek.maxAltitudeMeters
            ? [{ label: `Max ${trek.maxAltitudeMeters.toLocaleString()}m` }]
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
                    <div className="space-y-4">
                      <h2 className="font-heading text-2xl font-bold text-[#1E2420]">
                        Trip Overview
                      </h2>
                      <p className="text-[#3A423C] text-base leading-relaxed font-normal">
                        {trek.shortDesc}
                      </p>
                    </div>
                  )}

                  {/* Highlights Grid */}
                  {(trek.startEndLocation ||
                    trek.meals ||
                    trek.groupSizeRange) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E6E0D5]">
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
                    <div className="space-y-3 pt-4 border-t border-[#E6E0D5]">
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

              {/* TAB 4: FAQS */}
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
      />
    </div>
  );
}
