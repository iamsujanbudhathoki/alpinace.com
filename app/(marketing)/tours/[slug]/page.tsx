"use client";

import { useState, useMemo, useEffect, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Star,
  Maximize2,
  Calendar,
  Compass,
  MapPin,
  Users,
  Utensils,
  BedDouble,
  ShieldCheck,
  HelpCircle,
  Car,
} from "lucide-react";
import { TourItem, initialToursData } from "@/lib/tour-data";
import { TourService, InquiryService } from "@/lib/services/admin-service";
import { BookingPackageType } from "@/lib/admin-data";
import { PackageDetailSkeleton } from "@/components/marketing/skeletons/package-detail-skeleton";
import { PublicBookingModal } from "@/components/marketing/modals/public-booking-modal";
import { openLightbox } from "@/lib/utils/lightbox";

interface TourDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function TourDetailPage({ params }: TourDetailPageProps) {
  const resolvedParams = use(params);
  const [tour, setTour] = useState<TourItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedTours, setRelatedTours] = useState<TourItem[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const raw = await TourService.getBySlug(resolvedParams.slug);
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
            tourType: raw.tourType || (raw.category as any),
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
            faqs: raw.faqs,
            reviews: raw.reviews,
            status: raw.status,
            region: raw.region,
          });
        } else {
          const staticMatch = initialToursData.find(
            (t) => t.slug === resolvedParams.slug,
          );
          setTour(staticMatch || null);
        }

        const all = await TourService.getAll();
        if (all && all.length > 0) {
          setRelatedTours(
            all
              .filter((t) => t.slug !== resolvedParams.slug)
              .slice(0, 2)
              .map((raw) => ({
                id: raw.id,
                title: raw.title,
                slug: raw.slug,
                category: raw.category,
                rating: Number(raw.rating),
                reviewsCount: Number(raw.reviewsCount),
                image: raw.image || "",
                shortDesc: raw.shortDesc || "",
                durationDays: Number(raw.durationDays),
                tourType: raw.tourType || (raw.category as any),
                bestSeason: raw.bestSeason || "",
                priceUSD: Number(raw.priceUSD),
                highlights: raw.permitsRequired || [],
                status: raw.status,
                region: raw.region,
              })),
          );
        }
      } catch (e) {
        console.warn("Failed to fetch tour by slug", e);
        const staticMatch = initialToursData.find(
          (t) => t.slug === resolvedParams.slug,
        );
        setTour(staticMatch || null);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [resolvedParams.slug]);

  // Interactive tab state
  const [activeTab, setActiveTab] = useState<
    "overview" | "itinerary" | "cost" | "faqs"
  >("overview");
  const [openItineraryDay, setOpenItineraryDay] = useState<number>(1);
  const [calculatorTravelers, setCalculatorTravelers] = useState<number>(2);
  const [vipAddon, setVipAddon] = useState<boolean>(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  // Gallery state
  const gallery = useMemo(() => {
    return [
      tour?.image ||
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1585409677983-0f6c41ca913b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    ];
  }, [tour?.image]);

  const [activePhoto, setActivePhoto] = useState<string>(gallery[0]);

  useEffect(() => {
    if (gallery[0]) setActivePhoto(gallery[0]);
  }, [gallery]);

  // Lead inquiry state
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  // Price calculations
  const baseCostPerPerson = tour?.priceUSD || 1200;
  const vipCostPerPerson = 250;
  const totalPrice = useMemo(() => {
    const addonPrice = vipAddon ? vipCostPerPerson : 0;
    return (baseCostPerPerson + addonPrice) * calculatorTravelers;
  }, [baseCostPerPerson, vipAddon, calculatorTravelers]);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tour) return;
    try {
      await InquiryService.create({
        guestName: inquiryName,
        email: inquiryEmail,
        phone: "+1 000-000-0000",
        country: "International",
        interestedTrip: tour.title,
        travelDates: "Upcoming Season",
        groupSize: calculatorTravelers,
        message: `Inquiry for ${tour.title}. Travelers: ${calculatorTravelers}. VIP Guide: ${vipAddon ? "Yes" : "No"}. Estimated Price: $${totalPrice}`,
      });
    } catch (e) {
      console.warn("Failed to create inquiry via API:", e);
    }
    setInquirySubmitted(true);
  };

  // Day-by-day itinerary data
  const itineraryDays = useMemo(() => {
    if (!tour) return [];
    const days = [];
    const total = Math.max(1, tour.durationDays);
    for (let i = 1; i <= total; i++) {
      if (i === 1) {
        days.push({
          day: 1,
          title: "VIP Airport Meet & Luxury Heritage Reception",
          description:
            "Private executive escort to your five-star boutique hotel. Welcome high-tea briefing with your cultural historian guide.",
          overnight: "Luxury Heritage Palace / Boutique Hotel",
          meals: "Welcome Dinner",
        });
      } else if (i === total) {
        days.push({
          day: total,
          title: "Leisure Morning & Executive Airport Transfer",
          description:
            "Enjoy a final leisurely breakfast with mountain views. Private chauffeur transfer to Tribhuvan International Airport.",
          overnight: "Homeward Bound",
          meals: "Breakfast",
        });
      } else {
        days.push({
          day: i,
          title: `Guided Exploration of ${tour.region || "Heritage Landmarks"} (Day ${i})`,
          description:
            "Private guided excursions to sacred shrines, royal courtyards, artisan workshops, and scenic viewpoints with private transport.",
          overnight: "Boutique Resort / Heritage Hotel",
          meals: "Breakfast, Lunch, Dinner",
        });
      }
    }
    return days;
  }, [tour]);

  // Inclusions vs Exclusions
  const costIncludes = useMemo(() => {
    if (tour?.inclusionsText && tour.inclusionsText.trim()) {
      return tour.inclusionsText
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [
      "All domestic transfers and private vehicle transport",
      "Handpicked luxury hotel & resort accommodations",
      "100% certified local expert historian guide throughout",
      "All entrance passes to UNESCO World Heritage monuments & national parks",
      "Daily gourmet breakfast and curated welcome dinner",
      "24/7 private concierge support desk",
    ];
  }, [tour]);

  const costExclusions = useMemo(() => {
    if (tour?.exclusionsText && tour.exclusionsText.trim()) {
      return tour.exclusionsText
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [
      "International airfare to and from Kathmandu",
      "Nepal tourist visa fees ($50 USD at airport)",
      "Personal travel & medical insurance",
      "Personal alcoholic beverages & premium bottled refreshments",
      "Gratuities for guides and chauffeurs (discretionary)",
    ];
  }, [tour]);

  // Specific FAQs from JSONB
  const displayFaqs = useMemo(() => {
    if (tour?.faqs && Array.isArray(tour.faqs) && tour.faqs.length > 0) {
      return tour.faqs;
    }
    return [
      {
        question: "What physical fitness level is required for this tour?",
        answer:
          "Our luxury cultural and wellness tours are suitable for travelers of all ages. Transportation is provided via private air-conditioned vehicles with gentle walking tours.",
      },
      {
        question: "Are monument entry tickets and permits included?",
        answer:
          "Yes, all entrance tickets, monument passes, and national park permits are 100% included in the package rate.",
      },
      {
        question: "Can special dietary requests be accommodated?",
        answer:
          "Yes, our team coordinates directly with luxury hotel partners and boutique restaurants to cater to vegan, vegetarian, gluten-free, and halal dietary needs.",
      },
    ];
  }, [tour]);

  // Specific Reviews from JSONB
  const displayReviews = useMemo(() => {
    if (tour?.reviews && Array.isArray(tour.reviews) && tour.reviews.length > 0) {
      return tour.reviews;
    }
    return [
      {
        author: "Jonathan Vance",
        country: "United States",
        date: "May 2026",
        rating: 5,
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        content:
          "The private guide and heritage hotel made this trip unforgettable. AlpineAce sets the gold standard in luxury Nepal travel.",
      },
      {
        author: "Elena Rostova",
        country: "Germany",
        date: "April 2026",
        rating: 5,
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
        content:
          "Every detail was handled with care, from private transfers to the resort itself. Genuinely five-star from start to finish.",
      },
    ];
  }, [tour]);

  if (loading) {
    return <PackageDetailSkeleton />;
  }

  if (!tour) {
    return notFound();
  }

  return (
    <div className="pt-20 min-h-screen bg-stone-50 text-slate-900 pb-24 font-sans">
      {/* 1. HERO BANNER */}
      <section className="relative h-96 sm:h-112 md:h-128 w-full overflow-hidden text-white">
        <div className="absolute inset-0 z-0">
          <img
            src={tour.image}
            alt={tour.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent" />
        </div>

        {/* Back Link */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pt-6">
          <Link
            href="/tours"
            className="inline-flex items-center gap-2 bg-white/95 text-slate-900 hover:bg-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full border border-slate-200 shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-slate-700" />
            <span>Back to Tours Catalog</span>
          </Link>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-10 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-4xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-amber-600 text-white text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-md shadow-xs">
                  {tour.region}
                </span>
                <span className="bg-white/90 border border-slate-200 text-slate-900 text-xs px-3 py-1 rounded-md font-bold">
                  {tour.durationDays} {tour.durationDays === 1 ? "Day" : "Days"}
                </span>
                <span className="bg-white/90 border border-slate-200 text-slate-900 text-xs px-3 py-1 rounded-md font-bold">
                  {tour.category || "Luxury Tour"}
                </span>
              </div>
              <h1 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-md leading-tight">
                {tour.title}
              </h1>
            </div>

            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs sm:text-sm px-6 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 shrink-0 border border-amber-400/40"
            >
              <ShieldCheck className="w-4 h-4 text-amber-200" />
              <span>Book Tour &bull; ${Number(tour.priceUSD).toLocaleString()}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT LAYOUT */}
      <section className="py-12 max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Block */}
          <div className="lg:col-span-8 space-y-10">
            {/* Gallery Showcase */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div
                onClick={(e) => {
                  const position = Math.max(0, gallery.indexOf(activePhoto));
                  openLightbox({
                    items: gallery.map((photo) => ({
                      img: photo,
                      thumb: photo,
                      alt: tour.title,
                      caption: `${tour.title} • Tour Gallery`,
                    })),
                    position,
                    el: e.currentTarget,
                  });
                }}
                className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 cursor-pointer group"
                title="Click to view full screen gallery"
              >
                <img
                  src={activePhoto}
                  alt="Tour Showcase View"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-slate-950/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="inline-flex items-center gap-2 bg-white/95 text-slate-900 px-4 py-2 rounded-full text-xs font-bold shadow-lg backdrop-blur-xs transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <Maximize2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>View Fullscreen Gallery</span>
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {gallery.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhoto(photo)}
                    className={`relative aspect-4/3 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                      activePhoto === photo
                        ? "border-amber-600 shadow-xs scale-102"
                        : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={photo}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Facts Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white text-slate-900 p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="space-y-1 border-r border-slate-100 pr-4">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-heading font-extrabold flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-amber-600" />
                  <span>Transport</span>
                </span>
                <span className="text-xs sm:text-sm font-extrabold block text-amber-700 truncate">
                  Private AC Fleet
                </span>
              </div>
              <div className="space-y-1 sm:border-r border-slate-100 sm:px-4">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-heading font-extrabold flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-600" />
                  <span>Pace</span>
                </span>
                <span className="text-xs sm:text-sm font-extrabold block text-slate-900">
                  Relaxed &bull; Luxury
                </span>
              </div>
              <div className="space-y-1 border-r border-slate-100 px-4">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-heading font-extrabold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>Season</span>
                </span>
                <span className="text-xs sm:text-sm font-extrabold block text-slate-900 truncate">
                  {tour.bestSeason}
                </span>
              </div>
              <div className="space-y-1 pl-4">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-heading font-extrabold flex items-center gap-1.5">
                  <BedDouble className="w-3.5 h-3.5 text-amber-600" />
                  <span>Lodging</span>
                </span>
                <span className="text-xs sm:text-sm font-extrabold block text-slate-900 truncate">
                  {tour.accommodation || "Heritage Hotels"}
                </span>
              </div>
            </div>

            {/* Custom Tab Selector */}
            <div className="border-b border-slate-200 flex flex-wrap gap-1">
              {(["overview", "itinerary", "cost", "faqs"] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-3 font-heading text-xs font-extrabold uppercase tracking-wider border-b-2 transition-colors cursor-pointer capitalize ${
                      activeTab === tab
                        ? "border-slate-900 text-slate-900 font-extrabold"
                        : "border-transparent text-slate-500 hover:text-slate-900 font-bold"
                    }`}
                  >
                    {tab === "cost" ? "Inclusions & Costs" : tab}
                  </button>
                ),
              )}
            </div>

            {/* Active Tab Panel */}
            <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-xs leading-relaxed">
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <h2 className="font-heading text-xl font-bold text-slate-900">
                    Tour Highlights &amp; Experience
                  </h2>
                  <p className="text-slate-800 text-sm font-normal leading-relaxed">
                    {tour.shortDesc}
                  </p>

                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <h3 className="font-heading text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Included Highlights &amp; Entries
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(tour.highlights?.length > 0
                        ? tour.highlights
                        : ["UNESCO Monument Passes", "Private Guide Escort"]
                      ).map((h, idx) => (
                        <span
                          key={idx}
                          className="bg-amber-50 border border-amber-200 text-amber-950 text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-2xs"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ITINERARY ACCORDION */}
              {activeTab === "itinerary" && (
                <div className="space-y-4">
                  <h2 className="font-heading text-xl font-bold text-slate-900 mb-4">
                    Day-By-Day Tour Itinerary
                  </h2>

                  <div className="space-y-3">
                    {itineraryDays.map((day) => {
                      const isOpen = openItineraryDay === day.day;
                      return (
                        <div
                          key={day.day}
                          className="border border-slate-200 rounded-2xl overflow-hidden bg-stone-50/60 transition-all"
                        >
                          <button
                            onClick={() =>
                              setOpenItineraryDay(isOpen ? 0 : day.day)
                            }
                            className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer hover:bg-stone-100/70"
                          >
                            <span className="font-heading text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-3">
                              <span className="bg-slate-900 text-amber-400 w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0">
                                D{day.day}
                              </span>
                              {day.title}
                            </span>
                            <ChevronDown
                              className={`h-4 w-4 text-slate-600 transition-transform duration-300 shrink-0 ${
                                isOpen ? "rotate-180 text-amber-700" : ""
                              }`}
                            />
                          </button>

                          {isOpen && (
                            <div className="p-6 bg-white border-t border-slate-200 space-y-3 text-xs sm:text-sm text-slate-800 font-normal leading-relaxed animate-in fade-in duration-150">
                              <p>{day.description}</p>
                              <div className="flex flex-wrap gap-4 pt-3 border-t border-slate-100 text-xs font-bold text-slate-700">
                                <span>
                                  Meals:{" "}
                                  <strong className="text-slate-900">
                                    {day.meals}
                                  </strong>
                                </span>
                                <span>
                                  Overnight:{" "}
                                  <strong className="text-slate-900">
                                    {day.overnight}
                                  </strong>
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: COST INCLUSIONS & EXCLUSIONS */}
              {activeTab === "cost" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-heading text-xs font-extrabold text-emerald-800 uppercase tracking-wider border-b border-emerald-100 pb-2.5 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Cost Inclusions</span>
                    </h3>
                    <ul className="space-y-3 text-xs text-slate-800 font-normal leading-relaxed">
                      {costIncludes.map((inc, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="text-emerald-600 font-bold">&check;</span>
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-heading text-xs font-extrabold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2.5 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                      <span>Cost Exclusions</span>
                    </h3>
                    <ul className="space-y-3 text-xs text-slate-800 font-normal leading-relaxed">
                      {costExclusions.map((exc, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="text-slate-400 font-bold">&bull;</span>
                          <span>{exc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 4: FAQS */}
              {activeTab === "faqs" && (
                <div className="space-y-4">
                  <h2 className="font-heading text-xl font-bold text-slate-900">
                    Tour FAQs
                  </h2>
                  <div className="space-y-3">
                    {displayFaqs.map((faq, idx) => {
                      const isOpen = activeFaqIndex === idx;
                      return (
                        <div
                          key={idx}
                          className="border border-slate-200 rounded-2xl overflow-hidden bg-stone-50/60"
                        >
                          <button
                            onClick={() =>
                              setActiveFaqIndex(isOpen ? null : idx)
                            }
                            className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-100/70"
                          >
                            <span className="font-heading text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2.5">
                              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>{faq.question}</span>
                            </span>
                            <ChevronDown
                              className={`h-4 w-4 text-slate-500 transition-transform duration-300 shrink-0 ${
                                isOpen ? "rotate-180 text-amber-700" : ""
                              }`}
                            />
                          </button>
                          {isOpen && (
                            <div className="p-5 bg-white border-t border-slate-200 text-xs sm:text-sm text-slate-800 font-normal leading-relaxed">
                              {faq.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Client Chronicles & Reviews Pane */}
            <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <h3 className="font-heading text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Client Chronicles &amp; Reviews
              </h3>

              <div className="space-y-6 divide-y divide-slate-100">
                {displayReviews.map((rev, idx) => (
                  <div key={idx} className="pt-6 first:pt-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.avatar}
                          alt={rev.author}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">
                            {rev.author}
                          </h4>
                          <span className="text-xs text-slate-500 font-medium leading-none">
                            {rev.country} {rev.date ? `\u2014 ${rev.date}` : ""}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-0.5 text-amber-500">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-3.5 w-3.5 fill-amber-500 text-amber-500"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-800 text-xs leading-relaxed italic font-normal">
                      &ldquo;{rev.content}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Pure Interactive Calculator & Lead Inquiry Box */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            {/* Live Calculator Box */}
            <div className="bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-900 p-5 text-white">
                <span className="text-xs uppercase font-black tracking-widest text-amber-400 block">
                  Bespoke Tour Rate Estimator
                </span>
                <h3 className="font-heading text-sm font-extrabold text-white">
                  Trip Estimate &amp; Calculator
                </h3>
              </div>

              <div className="p-6 space-y-6">
                {/* Traveler Counter */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-heading font-extrabold tracking-wider text-slate-900">
                    <span>NUMBER OF TRAVELERS</span>
                    <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      {calculatorTravelers}{" "}
                      {calculatorTravelers === 1 ? "Person" : "People"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={calculatorTravelers <= 1}
                      onClick={() =>
                        setCalculatorTravelers(calculatorTravelers - 1)
                      }
                      className="bg-slate-100 text-slate-900 hover:bg-slate-200 disabled:opacity-40 w-11 h-11 rounded-xl flex items-center justify-center font-extrabold border border-slate-200 cursor-pointer text-lg"
                    >
                      -
                    </button>
                    <input
                      type="text"
                      readOnly
                      value={calculatorTravelers}
                      className="flex-grow bg-slate-50 border border-slate-200 text-center text-base font-extrabold rounded-xl py-2 text-slate-900 focus:outline-none"
                    />
                    <button
                      disabled={calculatorTravelers >= 12}
                      onClick={() =>
                        setCalculatorTravelers(calculatorTravelers + 1)
                      }
                      className="bg-slate-100 text-slate-900 hover:bg-slate-200 disabled:opacity-40 w-11 h-11 rounded-xl flex items-center justify-center font-extrabold border border-slate-200 cursor-pointer text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* VIP Addon Switcher */}
                <div className="bg-stone-50 p-4 rounded-2xl border border-slate-200 flex items-start gap-3 justify-between">
                  <div className="space-y-1">
                    <span className="font-heading text-xs font-bold text-slate-900">
                      Private VIP Guide Upgrade
                    </span>
                    <p className="text-xs text-slate-600 leading-normal font-medium">
                      Dedicated private expert historian guide (+$250/person)
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={vipAddon}
                    onChange={(e) => setVipAddon(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded accent-amber-600 shrink-0 cursor-pointer"
                  />
                </div>

                {/* Dynamic Price Display */}
                <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                  <div>
                    <span className="text-xs text-slate-500 block font-heading font-extrabold tracking-wider">
                      ESTIMATED TOUR PRICE
                    </span>
                    <span className="text-xs text-amber-700 block font-extrabold">
                      Hotels, transport &amp; passes
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-heading text-2xl sm:text-3xl font-black text-slate-900">
                      ${totalPrice.toLocaleString()}{" "}
                      <span className="text-xs font-normal text-slate-500">
                        USD
                      </span>
                    </span>
                    <span className="text-xs text-slate-500 block font-medium">
                      For {calculatorTravelers} travelers
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm py-4 rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 border border-amber-500/50"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-200" />
                  <span>Secure Reservation Now</span>
                </button>
              </div>
            </div>

            {/* Direct Inquiry Form Box */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              {inquirySubmitted ? (
                <div className="text-center py-6 space-y-3 animate-in fade-in duration-200">
                  <div className="bg-emerald-50 text-emerald-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto border border-emerald-200 font-bold text-lg">
                    &check;
                  </div>
                  <h3 className="font-heading text-sm font-bold text-slate-900">
                    Inquiry Transmitted
                  </h3>
                  <p className="text-slate-600 text-xs leading-normal font-normal">
                    Your request has been logged. Our concierge desk will email your formal proposal within 4 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-heading text-sm font-bold text-slate-900">
                      Request Custom Itinerary
                    </h3>
                    <p className="text-slate-600 text-xs leading-normal font-normal">
                      Have specific tour requirements? Transmit a custom inquiry.
                    </p>
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-slate-400 font-medium"
                  />

                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-slate-400 font-medium"
                  />

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <span>Inquire for {calculatorTravelers} Travelers</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: OTHER PRESTIGIOUS TOURS */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <h3 className="font-heading text-lg font-extrabold text-slate-900 mb-8">
            Other Prestigious Nepal Tours
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {(relatedTours.length > 0
              ? relatedTours
              : initialToursData.filter((t) => t.slug !== tour.slug).slice(0, 2)
            ).map((p) => (
              <Link key={p.id} href={`/tours/${p.slug}`}>
                <div className="bg-stone-50 border border-slate-200 rounded-2xl p-5 flex gap-4 hover:border-slate-300 transition-all cursor-pointer group shadow-xs">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-24 h-24 rounded-xl object-cover shrink-0"
                  />
                  <div className="space-y-1.5 flex-grow">
                    <span className="text-amber-700 text-xs uppercase font-extrabold tracking-widest block">
                      {p.region} &bull; {p.durationDays}{" "}
                      {p.durationDays === 1 ? "DAY" : "DAYS"}
                    </span>
                    <h4 className="font-heading text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-amber-700 transition-colors leading-snug">
                      {p.title}
                    </h4>
                    <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed font-normal">
                      {p.shortDesc}
                    </p>
                    <span className="text-xs font-extrabold text-slate-900 block pt-1">
                      From ${Number(p.priceUSD).toLocaleString()} USD
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECURE PUBLIC BOOKING MODAL */}
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
