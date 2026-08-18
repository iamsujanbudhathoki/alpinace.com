"use client";

import { useState, useMemo, useEffect } from "react";
import { notFound } from "next/navigation";
import {
  BedDouble,
  Calendar,
  Compass,
  MapPin,
  Users,
  Utensils,
} from "lucide-react";
import { TourItem, initialToursData } from "@/lib/tour-data";
import { FaqService, SettingService, TourService } from "@/lib/services/admin-service";
import { BookingPackageType, FaqItem, FaqStatus, TourType, TripDepartureDate } from "@/lib/admin-data";
import { Testimonial, TESTIMONIALS } from "@/lib/home-data";
import { PackageDetailSkeleton } from "@/components/marketing/skeletons/package-detail-skeleton";
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
  PackageDepartures,
  PackageTrekMap,
  PackageDownloads,
  PackageAddons,
  PackageUsefulInfo,
} from "@/components/marketing/package-details";

interface TourDetailClientProps {
  initialTour: TourItem | any | null;
  slug: string;
}

export function TourDetailClient({ initialTour, slug }: TourDetailClientProps) {
  const [tour, setTour] = useState<TourItem | any | null>(initialTour);
  const [loading, setLoading] = useState(!initialTour);
  const [relatedTours, setRelatedTours] = useState<TourItem[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDeparture, setSelectedDeparture] = useState<TripDepartureDate | null>(null);

  const [globalFaqs, setGlobalFaqs] = useState<FaqItem[]>([]);
  const [globalReviews, setGlobalReviews] = useState<Testimonial[]>([]);
  const [calculatorTravelers, setCalculatorTravelers] = useState<number>(2);

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
          FaqService.getAll(FaqStatus.ACTIVE).catch(() => []),
          SettingService.getAll().catch(() => ({})),
          TourService.getAll().catch(() => []),
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
    if (tour?.departureDates && tour.departureDates.length > 0) {
      list.push({ key: "departures", label: "Departure Dates" });
    }
    if (tour?.mapImage) {
      list.push({ key: "map", label: "Route Map" });
    }
    if (tour?.packageFiles && tour.packageFiles.length > 0) {
      list.push({ key: "files", label: "Downloads" });
    }
    if (displayFaqs.length > 0) {
      list.push({ key: "faqs", label: "FAQs" });
    }
    return list;
  }, [tour, costIncludes, costExclusions, displayFaqs]);

  const [activeTab, setActiveTab] = useState<string>("overview");

  const currentActiveTab = availableTabs.some((t) => t.key === activeTab)
    ? activeTab
    : availableTabs[0]?.key || "overview";

  if (loading) {
    return <PackageDetailSkeleton />;
  }

  if (!tour) {
    return notFound();
  }

  const handleBookDeparture = (dateSlot: TripDepartureDate) => {
    setSelectedDeparture(dateSlot);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-20">
      {/* 1. HERO HEADER */}
      <PackageDetailHero
        title={tour.title}
        image={tour.image}
        backHref="/tours"
        backLabel="Back to Tours"
        priceUSD={tour.priceUSD}
        bookButtonLabel="Book Tour"
        onBookClick={() => setIsBookingModalOpen(true)}
        badges={[
          { label: tour.region || "Nepal" },
          { label: tour.tourType || "Heritage Tour", highlight: true },
        ]}
      />

      {/* 2. QUICK FACTS BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <PackageQuickFacts
          facts={[
            {
              icon: <Compass className="w-5 h-5" />,
              label: "Tour Style",
              value: tour.tourType || "Heritage & Luxury",
            },
            {
              icon: <Calendar className="w-5 h-5" />,
              label: "Best Season",
              value: tour.bestSeason || "Year Round",
            },
            {
              icon: <BedDouble className="w-5 h-5" />,
              label: "Accommodation",
              value: tour.accommodation || "Luxury Boutique Hotel",
            },
            {
              icon: <Utensils className="w-5 h-5" />,
              label: "Meals Included",
              value: tour.meals || "Breakfast & Dinners",
            },
          ]}
        />
      </div>

      {/* 3. MAIN CONTENT GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Details Column */}
          <div className="lg:col-span-8 space-y-10">
            {/* Photo Gallery Showcase */}
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
                    <div className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-[#EAE5DC] shadow-2xs">
                      <h2 className="font-heading text-2xl font-bold text-[#1E2420]">
                        Tour Overview
                      </h2>
                      <div
                        className="prose prose-stone max-w-none text-[#3A423C] text-base leading-relaxed font-normal [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_h3]:font-bold [&_h3]:text-lg [&_h3]:text-[#1E2420] [&_h3]:mt-6 [&_h3]:mb-2 [&_h4]:font-bold [&_h4]:text-base [&_h4]:text-[#1E2420] [&_h4]:mt-4 [&_h4]:mb-2 [&_strong]:font-bold [&_strong]:text-[#1E2420] [&_a]:text-amber-700 [&_a]:underline"
                        dangerouslySetInnerHTML={{ __html: tour.shortDesc }}
                      />
                    </div>
                  )}

                  {/* Tour Specific Specs */}
                  {(tour.transportation ||
                    tour.startEndLocation ||
                    tour.groupSizeRange) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {tour.transportation && (
                        <div className="p-4 bg-white border border-[#EAE5DC] rounded-xl space-y-1">
                          <span className="text-xs font-semibold text-[#6B726C] uppercase tracking-wider flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5 text-[#2D4536]" />
                            <span>Transportation Mode</span>
                          </span>
                          <p className="text-sm font-semibold text-[#1E2420]">
                            {tour.transportation}
                          </p>
                        </div>
                      )}

                      {tour.startEndLocation && (
                        <div className="p-4 bg-white border border-[#EAE5DC] rounded-xl space-y-1">
                          <span className="text-xs font-semibold text-[#6B726C] uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#2D4536]" />
                            <span>Start &amp; Finish</span>
                          </span>
                          <p className="text-sm font-semibold text-[#1E2420]">
                            {tour.startEndLocation}
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

                  {/* Add-ons & Options */}
                  <PackageAddons addonsText={tour.addonsText} />

                  {/* Useful Info */}
                  <PackageUsefulInfo usefulInfoText={tour.usefulInfoText} />
                </div>
              )}

              {/* TAB 2: DETAILED ITINERARY */}
              {currentActiveTab === "itinerary" && tour.itinerary && (
                <PackageItinerary
                  days={tour.itinerary}
                  title="Day-by-Day Sightseeing Itinerary"
                  subtitle={`${tour.itinerary.length} Days luxury tour across ${tour.region}`}
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
              {currentActiveTab === "departures" && tour.departureDates && (
                <PackageDepartures
                  dates={tour.departureDates}
                  defaultPrice={tour.priceUSD}
                  onBookDate={handleBookDeparture}
                />
              )}

              {/* TAB 5: MAP */}
              {currentActiveTab === "map" && tour.mapImage && (
                <PackageTrekMap mapImage={tour.mapImage} title={tour.title} />
              )}

              {/* TAB 6: DOWNLOADS */}
              {currentActiveTab === "files" && tour.packageFiles && (
                <PackageDownloads files={tour.packageFiles} title={tour.title} />
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
              tripTitle={tour.title}
              durationDays={tour.durationDays}
              travelers={calculatorTravelers}
              onTravelersChange={setCalculatorTravelers}
              totalPrice={totalPrice}
              onBookClick={() => setIsBookingModalOpen(true)}
              bookButtonLabel="Reserve Private Tour"
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
            region: t.region || "Nepal",
            durationDays: t.durationDays,
            maxAltitudeMeters: t.maxAltitudeMeters || 1400,
            difficulty: t.difficulty || "Easy",
            priceUSD: t.priceUSD,
            image: t.image,
            rating: t.rating || 5.0,
            reviewsCount: t.reviewsCount || 10,
          }))}
          categoryPath="/tours"
          title="Explore More Luxury Nepal Tours"
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
          maxAltitudeMeters: tour.maxAltitudeMeters || 1400,
          difficulty: tour.difficulty || "Easy",
          priceUSD: tour.priceUSD,
          image: tour.image,
          categoryType: BookingPackageType.TOUR,
        }}
        initialTravelers={calculatorTravelers}
        initialDate={selectedDeparture?.startDate}
      />
    </div>
  );
}
