"use client";

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
} from "@/components/marketing/package-details";
import { PackageDetailSkeleton } from "@/components/marketing/skeletons/package-detail-skeleton";
import { BookingPackageType, FaqItem, FaqStatus, TourType } from "@/lib/admin-data";
import { Testimonial } from "@/lib/home-data";
import { FaqService, SettingService, TourService } from "@/lib/services/admin-service";
import { TourItem, initialToursData } from "@/lib/tour-data";
import {
  BedDouble,
  Calendar,
  Compass,
  MapPin,
  Users,
  Utensils
} from "lucide-react";
import { notFound } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface TourDetailClientProps {
  initialTour: TourItem | any | null;
  slug: string;
}

export function TourDetailClient({ initialTour, slug }: TourDetailClientProps) {
  const [tour, setTour] = useState<TourItem | any | null>(initialTour);
  const [loading, setLoading] = useState(!initialTour);
  const [relatedTours, setRelatedTours] = useState<TourItem[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Dynamic FAQs from backend
  const [globalFaqs, setGlobalFaqs] = useState<FaqItem[]>([]);
  // Dynamic Reviews from backend
  const [globalReviews, setGlobalReviews] = useState<Testimonial[]>([]);

  const [calculatorTravelers, setCalculatorTravelers] = useState<number>(2);

  useEffect(() => {
    async function loadData() {
      try {
        if (!initialTour) {
          const raw = await TourService.getBySlug(slug);
          if (raw) {
            setTour({
              id: raw.id,
              title: raw.title,
              slug: raw.slug,
              category: raw.category,
              rating: Number(raw.rating),
              reviewsCount: Number(raw.reviewsCount),
              image: raw.image || "",
              shortDesc: raw.shortDesc || "",
              durationDays: Number(raw.durationDays),
              maxAltitudeMeters: raw.maxAltitudeMeters,
              tourType: raw.tourType || (raw.category as unknown as TourType),
              bestSeason: raw.bestSeason || "",
              priceUSD: Number(raw.priceUSD),
              startEndLocation: raw.startEndLocation,
              accommodation: raw.accommodation,
              meals: raw.meals,
              groupSizeRange: raw.groupSizeRange,
              highlights: raw.permitsRequired || [],
              permitsRequired: raw.permitsRequired || [],
              inclusionsText: raw.inclusionsText,
              exclusionsText: raw.exclusionsText,
              itinerary: raw.itinerary || [],
              faqs: raw.faqs,
              reviews: raw.reviews,
              categoryId: raw.categoryId,
              metaTitle: raw.metaTitle,
              metaDescription: raw.metaDescription,
              keywords: raw.keywords,
              status: raw.status,
              region: raw.region,
            });
          } else {
            const staticMatch = initialToursData.find((t) => t.slug === slug);
            setTour(staticMatch || null);
          }
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

        // Related Tours
        const all = await TourService.getAll();
        if (all && Array.isArray(all)) {
          setRelatedTours(
            all
              .filter((t) => t.slug !== slug)
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
                tourType: r.tourType || (r.category as unknown as TourType),
                bestSeason: r.bestSeason || "",
                priceUSD: Number(r.priceUSD),
                highlights: r.permitsRequired || [],
                status: r.status,
                region: r.region,
              })),
          );
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
    if (!tour || !tour.image) return [];
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
    let discount = 1;
    if (calculatorTravelers >= 4) discount = 0.95;
    if (calculatorTravelers >= 8) discount = 0.9;
    return Math.round(baseCostPerPerson * calculatorTravelers * discount);
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

  // Dynamic tabs based on backend data
  const availableTabs = useMemo(() => {
    const list: { key: string; label: string }[] = [
      { key: "overview", label: "Overview" },
    ];
    if (tour?.itinerary && tour.itinerary.length > 0) {
      list.push({ key: "itinerary", label: "Detailed Itinerary" });
    }
    if (costIncludes.length > 0 || costExclusions.length > 0) {
      list.push({ key: "cost", label: "Inclusions & Exclusions" });
    }
    if (displayFaqs.length > 0) {
      list.push({ key: "faqs", label: "FAQs" });
    }
    return list;
  }, [tour, costIncludes, costExclusions, displayFaqs]);

  const [activeTab, setActiveTab] = useState<string>("overview");

  // Derive active tab safely during render without cascading useEffect renders
  const currentActiveTab = availableTabs.some((t) => t.key === activeTab)
    ? activeTab
    : availableTabs[0]?.key || "overview";

  if (loading) {
    return <PackageDetailSkeleton />;
  }

  if (!tour) {
    return notFound();
  }

  // Quick facts based on backend data
  const quickFacts = [
    ...(tour.durationDays
      ? [
          {
            icon: <Calendar className="w-5 h-5" />,
            label: "Duration",
            value: `${tour.durationDays} Days`,
          },
        ]
      : []),
    ...(tour.tourType
      ? [
          {
            icon: <Compass className="w-5 h-5" />,
            label: "Tour Style",
            value: (
              <span className="capitalize">
                {String(tour.tourType).replace(/_/g, " ")}
              </span>
            ),
          },
        ]
      : []),
    ...(tour.bestSeason
      ? [
          {
            icon: <Calendar className="w-5 h-5" />,
            label: "Best Season",
            value: tour.bestSeason,
          },
        ]
      : []),
    ...(tour.accommodation
      ? [
          {
            icon: <BedDouble className="w-5 h-5" />,
            label: "Hotel & Resort",
            value: tour.accommodation,
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1E2420] antialiased">
      {/* 1. HERO HEADER */}
      <PackageDetailHero
        title={tour.title}
        image={tour.image}
        backHref="/tours"
        backLabel="All Tour Packages"
        priceUSD={tour.priceUSD}
        onBookClick={() => setIsBookingModalOpen(true)}
        bookButtonLabel="Book Private Tour"
        badges={[
          ...(tour.region
            ? [{ label: `${tour.region} Experience`, highlight: true }]
            : []),
          ...(tour.durationDays ? [{ label: `${tour.durationDays} Days` }] : []),
          ...(tour.tourType
            ? [
                {
                  label: `${String(tour.tourType).replace(/_/g, " ")}`,
                },
              ]
            : []),
          ...(tour.accommodation ? [{ label: tour.accommodation }] : []),
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
              <PackageGallery title={tour.title} images={gallery} />
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
                  {tour.shortDesc && (
                    <div className="space-y-4">
                      <h2 className="font-heading text-2xl font-bold text-[#1E2420]">
                        Tour Overview
                      </h2>
                      <div
                        className="prose prose-stone max-w-none text-[#3A423C] text-base leading-relaxed font-normal [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_h3]:font-bold [&_h3]:text-lg [&_h3]:text-[#1E2420] [&_h3]:mt-6 [&_h3]:mb-2 [&_h4]:font-bold [&_h4]:text-base [&_h4]:text-[#1E2420] [&_h4]:mt-4 [&_h4]:mb-2 [&_strong]:font-bold [&_strong]:text-[#1E2420] [&_a]:text-amber-700 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-amber-500 [&_blockquote]:pl-4 [&_blockquote]:italic"
                        dangerouslySetInnerHTML={{ __html: tour.shortDesc }}
                      />
                    </div>
                  )}

                  {/* Highlights Grid */}
                  {(tour.startEndLocation ||
                    tour.meals ||
                    tour.groupSizeRange) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E6E0D5]">
                      {tour.startEndLocation && (
                        <div className="p-4 bg-white border border-[#EAE5DC] rounded-xl space-y-1">
                          <span className="text-xs font-semibold text-[#6B726C] uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#2D4536]" />
                            <span>Destination Route</span>
                          </span>
                          <p className="text-sm font-semibold text-[#1E2420]">
                            {tour.startEndLocation}
                          </p>
                        </div>
                      )}

                      {tour.meals && (
                        <div className="p-4 bg-white border border-[#EAE5DC] rounded-xl space-y-1">
                          <span className="text-xs font-semibold text-[#6B726C] uppercase tracking-wider flex items-center gap-1.5">
                            <Utensils className="w-3.5 h-3.5 text-[#2D4536]" />
                            <span>Meals Plan</span>
                          </span>
                          <p className="text-sm font-semibold text-[#1E2420]">
                            {tour.meals}
                          </p>
                        </div>
                      )}

                      {tour.groupSizeRange && (
                        <div className="p-4 bg-white border border-[#EAE5DC] rounded-xl space-y-1">
                          <span className="text-xs font-semibold text-[#6B726C] uppercase tracking-wider flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-[#2D4536]" />
                            <span>Group Capacity</span>
                          </span>
                          <p className="text-sm font-semibold text-[#1E2420]">
                            {tour.groupSizeRange}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Highlights List */}
                  {tour.highlights && tour.highlights.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-[#E6E0D5]">
                      <h3 className="text-xs font-semibold text-[#6B726C] uppercase tracking-wider">
                        Tour Highlights &amp; Inclusions
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {tour.highlights.map((highlight: string, idx: number) => (
                          <span
                            key={idx}
                            className="bg-[#EAE5DC] text-[#242E27] text-xs font-medium px-3 py-1 rounded-md"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: DETAILED ITINERARY */}
              {currentActiveTab === "itinerary" && tour.itinerary && (
                <PackageItinerary
                  days={tour.itinerary}
                  title="Daily Program Itinerary"
                  subtitle={`${tour.itinerary.length} Days journey through ${tour.region || "Nepal"}`}
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
            <PackageReviews reviews={displayReviews} />
          </div>

          {/* Sidebar Booking / Rate Estimator Widget */}
          <div className="lg:col-span-4 lg:sticky lg:top-36">
            <PackageBookingSidebar
              tripTitle={tour.title}
              durationDays={tour.durationDays}
              travelers={calculatorTravelers}
              onTravelersChange={setCalculatorTravelers}
              totalPrice={totalPrice}
              onBookClick={() => setIsBookingModalOpen(true)}
              bookButtonLabel="Book Private Tour"
            />
          </div>
        </div>
      </main>

      {/* 4. RELATED TOURS SECTION */}
      {relatedTours.length > 0 && (
        <PackageRelatedTrips
          trips={relatedTours}
          categoryPath="/tours"
          title="Other Recommended Scenic & Cultural Tours"
        />
      )}

      {/* 5. BOOKING MODAL */}
      <PublicBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        trip={{
          title: tour.title,
          slug: tour.slug,
          region: tour.region,
          durationDays: tour.durationDays,
          maxAltitudeMeters: tour.maxAltitudeMeters,
          priceUSD: tour.priceUSD,
          image: tour.image,
          categoryType: BookingPackageType.TOUR,
        }}
        initialTravelers={calculatorTravelers}
      />
    </div>
  );
}
