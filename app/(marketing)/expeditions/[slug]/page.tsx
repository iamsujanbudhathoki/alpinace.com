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
  Mountain,
  AlertTriangle,
} from "lucide-react";
import { ExpeditionItem, initialExpeditionsData } from "@/lib/expedition-data";
import { ExpeditionService, InquiryService } from "@/lib/services/admin-service";
import { BookingPackageType } from "@/lib/admin-data";
import { PackageDetailSkeleton } from "@/components/marketing/skeletons/package-detail-skeleton";
import { PublicBookingModal } from "@/components/marketing/modals/public-booking-modal";
import { openLightbox } from "@/lib/utils/lightbox";

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
  const [relatedExpeditions, setRelatedExpeditions] = useState<
    ExpeditionItem[]
  >([]);

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
            maxAltitudeMeters: raw.maxAltitudeMeters !== undefined ? Number(raw.maxAltitudeMeters) : undefined,
            climbingGrade: raw.climbingGrade || (raw.difficulty as any),
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
            status: raw.status as any,
            region: raw.region as any,
          });
        } else {
          const staticMatch = initialExpeditionsData.find(
            (e) => e.slug === resolvedParams.slug,
          );
          setExpedition(staticMatch || null);
        }

        const all = await ExpeditionService.getAll();
        if (all && all.length > 0) {
          setRelatedExpeditions(
            all
              .filter((e) => e.slug !== resolvedParams.slug)
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
                peakHeightM: Number(raw.peakHeightM || raw.maxAltitudeMeters || 0),
                climbingGrade: raw.climbingGrade || (raw.difficulty as any),
                bestSeason: raw.bestSeason || "",
                priceUSD: Number(raw.priceUSD),
                permitsRequired: raw.permitsRequired || [],
                status: raw.status as any,
                region: raw.region as any,
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

  // Interactive tab state
  const [activeTab, setActiveTab] = useState<
    "overview" | "itinerary" | "cost" | "equipment" | "faqs"
  >("overview");
  const [openItineraryDay, setOpenItineraryDay] = useState<number>(1);
  const [calculatorClimbers, setCalculatorClimbers] = useState<number>(2);
  const [oxygenAddon, setOxygenAddon] = useState<boolean>(true);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  // Gallery state
  const gallery = useMemo(() => {
    return [
      expedition?.image ||
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1583870908408-3f9c6f8a9e0f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516482498816-ba38689e1c14?auto=format&fit=crop&w=1200&q=80",
    ];
  }, [expedition?.image]);

  const [activePhoto, setActivePhoto] = useState<string>(gallery[0]);

  useEffect(() => {
    if (gallery[0]) setActivePhoto(gallery[0]);
  }, [gallery]);

  // Lead inquiry state
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  // Price calculations
  const baseCostPerPerson = expedition?.priceUSD || 2800;
  const oxygenCostPerPerson = 1200;
  const totalPrice = useMemo(() => {
    let perPerson = baseCostPerPerson;
    if (oxygenAddon) perPerson += oxygenCostPerPerson;
    let discount = 1;
    if (calculatorClimbers >= 4) discount = 0.95;
    return Math.round(perPerson * calculatorClimbers * discount);
  }, [baseCostPerPerson, oxygenAddon, calculatorClimbers]);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expedition) return;
    try {
      await InquiryService.create({
        guestName: inquiryName,
        email: inquiryEmail,
        phone: "+1 000-000-0000",
        country: "International",
        interestedTrip: expedition.title,
        travelDates: "Upcoming Climbing Season",
        groupSize: calculatorClimbers,
        message: `Expedition inquiry for ${expedition.title}. Climbers: ${calculatorClimbers}. Summit Oxygen: ${oxygenAddon ? "Included" : "Excluded"}. Estimated Price: $${totalPrice}`,
      });
    } catch (e) {
      console.warn("Failed to create inquiry via API:", e);
    }
    setInquirySubmitted(true);
  };

  // Day-by-day itinerary data
  const itineraryDays = useMemo(() => {
    if (!expedition) return [];
    const days = [];
    const total = Math.max(3, expedition.durationDays);
    const peakM = expedition.peakHeightM || 6812;

    days.push({
      day: 1,
      title: "Kathmandu Arrival & Expedition Briefing at Ministry",
      description:
        "Meet your private expedition concierge. Equipment check, satellite phone setup, and high-altitude logistics briefing with lead IFMGA Sherpa.",
      overnight: "Boutique Heritage Hotel, Kathmandu",
      meals: "Welcome Dinner",
    });

    days.push({
      day: 2,
      title: "Helicopter Transfer to Basecamp & Acclimatization",
      description:
        "Direct helicopter shuttle into the high alpine valley. Settle into heated dome basecamp tents with private generators and Starlink Wi-Fi.",
      overnight: "Alpine Ace Luxury Basecamp",
      meals: "Breakfast, Lunch, Dinner",
    });

    const middleCount = total - 4;
    for (let i = 1; i <= middleCount; i++) {
      const cur = i + 2;
      const isSummit = i === middleCount - 1;
      if (isSummit) {
        days.push({
          day: cur,
          title: `Summit Push & Reaching Peak Apex (${peakM.toLocaleString()}m)`,
          description:
            "Midnight departure with 1:1 Sherpa support, supplemental TopOut oxygen systems, and fixed safety lines to the summit ridge.",
          overnight: "High Camp / Basecamp Dome",
          meals: "Summit Energy Food & Basecamp Banquet",
        });
      } else {
        days.push({
          day: cur,
          title: `High Camp Rotations & Technical Acclimatization (Day ${cur})`,
          description:
            "Establish Camps I & II, rope-fixing practice, and biometric monitoring by expedition physicians.",
          overnight: "High Alpine Camp / Basecamp",
          meals: "Breakfast, Lunch, Dinner",
        });
      }
    }

    days.push({
      day: total - 1,
      title: "Basecamp Clearance & Helicopter Return to Kathmandu",
      description:
        "Clean basecamp eco-protocol check and private helicopter flight returning to Kathmandu. Evening gala celebration.",
      overnight: "Luxury Hotel, Kathmandu",
      meals: "Breakfast, Celebration Dinner",
    });

    days.push({
      day: total,
      title: "Official Debriefing & International Departure",
      description:
        "Official summit certificate presentation and airport chauffeur transfer for your flight home.",
      overnight: "Homeward Bound",
      meals: "Breakfast",
    });

    return days;
  }, [expedition]);

  // Inclusions vs Exclusions
  const costIncludes = useMemo(() => {
    if (expedition?.inclusionsText && expedition.inclusionsText.trim()) {
      return expedition.inclusionsText
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [
      "1:1 IFMGA Certified Sherpa Summit Guide Ratio",
      "All government climbing permits, trash deposits & liaison officer fees",
      "Luxury Basecamp private heated dome tents with solar power & Starlink",
      "TopOut Oxygen masks, regulators & 4L Russian Poisk oxygen bottles",
      "Private helicopter transfers (Kathmandu - Basecamp - Kathmandu)",
      "High altitude gourmet expedition food prepared by certified chefs",
      "Comprehensive medical kit, pulse oximeter monitoring & Gamow bag",
    ];
  }, [expedition]);

  const costExclusions = useMemo(() => {
    if (expedition?.exclusionsText && expedition.exclusionsText.trim()) {
      return expedition.exclusionsText
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [
      "International flights to/from Kathmandu",
      "Personal mountaineering gear (harness, boots, crampons, ice axes)",
      "Mandatory high-altitude medical & rescue evacuation insurance",
      "Sherpa summit summit bonus (standard industry gratuity)",
    ];
  }, [expedition]);

  // Specific FAQs from JSONB
  const displayFaqs = useMemo(() => {
    if (expedition?.faqs && Array.isArray(expedition.faqs) && expedition.faqs.length > 0) {
      return expedition.faqs;
    }
    return [
      {
        question: "What mountaineering experience is required?",
        answer:
          "For technical peaks like Ama Dablam and Everest, previous 6,000m+ summit experience and fixed-rope technical proficiency are mandatory.",
      },
      {
        question: "What is the guide ratio during the summit push?",
        answer:
          "We provide a strict 1:1 ratio with multi-summit certified IFMGA Sherpa leaders. Your dedicated Sherpa carries backup oxygen and leads safety ropes.",
      },
      {
        question: "What medical oxygen systems are provided?",
        answer:
          "We utilize TopOut / Summit Oxygen mask systems with Russian Poisk cylinders, tested pulse oximeters, and high-altitude hyperbaric Gamow bags at basecamp.",
      },
    ];
  }, [expedition]);

  // Specific Reviews from JSONB
  const displayReviews = useMemo(() => {
    if (expedition?.reviews && Array.isArray(expedition.reviews) && expedition.reviews.length > 0) {
      return expedition.reviews;
    }
    return [
      {
        author: "Marcus Lindqvist",
        country: "Sweden",
        date: "May 2026",
        rating: 5,
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        content:
          "Summited with Mingma Sherpa. Flawless rope work, heated basecamp dome tents, and gourmet chef nutrition made the hardest climb of my life safe and successful.",
      },
      {
        author: "Sophia Zhang",
        country: "Singapore",
        date: "April 2026",
        rating: 5,
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
        content:
          "The technical ascent was breathtaking. The 1:1 Sherpa support gave me total confidence on the headwall and summit ridge.",
      },
    ];
  }, [expedition]);

  if (loading) {
    return <PackageDetailSkeleton />;
  }

  if (!expedition) {
    return notFound();
  }

  return (
    <div className="pt-20 min-h-screen bg-stone-50 text-slate-900 pb-24 font-sans">
      {/* 1. HERO BANNER */}
      <section className="relative h-96 sm:h-112 md:h-128 w-full overflow-hidden text-white">
        <div className="absolute inset-0 z-0">
          <img
            src={expedition.image}
            alt={expedition.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent" />
        </div>

        {/* Back Link */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pt-6">
          <Link
            href="/expeditions"
            className="inline-flex items-center gap-2 bg-white/95 text-slate-900 hover:bg-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full border border-slate-200 shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-slate-700" />
            <span>Back to Expeditions Catalog</span>
          </Link>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-10 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-4xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-amber-600 text-white text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-md shadow-xs">
                  {expedition.region} REGION
                </span>
                <span className="bg-white/90 border border-slate-200 text-slate-900 text-xs px-3 py-1 rounded-md font-bold">
                  {expedition.durationDays} Days
                </span>
                <span className="bg-white/90 border border-slate-200 text-slate-900 text-xs px-3 py-1 rounded-md font-bold">
                  Peak: {(expedition.peakHeightM || 6000).toLocaleString()}m
                </span>
                <span className="bg-white/90 border border-slate-200 text-slate-900 text-xs px-3 py-1 rounded-md font-bold">
                  1:1 Sherpa Ratio
                </span>
              </div>
              <h1 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-md leading-tight">
                {expedition.title}
              </h1>
            </div>

            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs sm:text-sm px-6 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 shrink-0 border border-amber-400/40"
            >
              <ShieldCheck className="w-4 h-4 text-amber-200" />
              <span>Book Expedition &bull; ${Number(expedition.priceUSD).toLocaleString()}</span>
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
                      alt: expedition.title,
                      caption: `${expedition.title} • Summit Showcase`,
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
                  alt="Expedition Showcase View"
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

            {/* High-Contrast Quick Facts Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white text-slate-900 p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="space-y-1 border-r border-slate-100 pr-4">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-heading font-extrabold flex items-center gap-1.5">
                  <Mountain className="w-3.5 h-3.5 text-amber-600" />
                  <span>Summit Apex</span>
                </span>
                <span className="text-xs sm:text-sm font-extrabold block text-amber-700">
                  {(expedition.peakHeightM || 6812).toLocaleString()}m
                </span>
              </div>
              <div className="space-y-1 sm:border-r border-slate-100 sm:px-4">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-heading font-extrabold flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-600" />
                  <span>Grade</span>
                </span>
                <span className="text-xs sm:text-sm font-extrabold block text-slate-900 truncate">
                  {expedition.climbingGrade || "Extreme Technical"}
                </span>
              </div>
              <div className="space-y-1 border-r border-slate-100 px-4">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-heading font-extrabold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>Climbing Season</span>
                </span>
                <span className="text-xs sm:text-sm font-extrabold block text-slate-900 truncate">
                  {expedition.bestSeason}
                </span>
              </div>
              <div className="space-y-1 pl-4">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-heading font-extrabold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Summit Sherpa</span>
                </span>
                <span className="text-xs sm:text-sm font-extrabold block text-slate-900">
                  1:1 Ratio
                </span>
              </div>
            </div>

            {/* Custom Tab Selector */}
            <div className="border-b border-slate-200 flex flex-wrap gap-1">
              {(
                [
                  "overview",
                  "itinerary",
                  "cost",
                  "equipment",
                  "faqs",
                ] as const
              ).map((tab) => (
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
              ))}
            </div>

            {/* Active Tab Panel */}
            <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-xs leading-relaxed">
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <h2 className="font-heading text-xl font-bold text-slate-900">
                    High-Altitude Expedition Overview
                  </h2>
                  <p className="text-slate-800 text-sm font-normal leading-relaxed">
                    {expedition.shortDesc}
                  </p>

                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <h3 className="font-heading text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Included High-Altitude Permits &amp; Checkpoints
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {expedition.permitsRequired.map((permit, idx) => (
                        <span
                          key={idx}
                          className="bg-amber-50 border border-amber-200 text-amber-950 text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-2xs"
                        >
                          {permit}
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
                    Day-By-Day Expedition &amp; Summit Plan
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

              {/* TAB 4: EQUIPMENT */}
              {activeTab === "equipment" && (
                <div className="space-y-4">
                  <h2 className="font-heading text-xl font-bold text-slate-900">
                    High-Altitude Technical Mountaineering Gear
                  </h2>
                  <p className="text-slate-800 text-xs leading-relaxed font-normal">
                    We supply TopOut oxygen sets, 8000m fixed ropes, high-altitude gas stoves, and weather station reports. Climbers must bring 8000m triple boots, down suits, and technical climbing gear.
                  </p>
                </div>
              )}

              {/* TAB 5: FAQS */}
              {activeTab === "faqs" && (
                <div className="space-y-4">
                  <h2 className="font-heading text-xl font-bold text-slate-900">
                    Expedition FAQs
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
                Summit Chronicles &amp; Explorer Reviews
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
                  Summit Rate Estimator
                </span>
                <h3 className="font-heading text-sm font-extrabold text-white">
                  Expedition Price Calculator
                </h3>
              </div>

              <div className="p-6 space-y-6">
                {/* Traveler Counter */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-heading font-extrabold tracking-wider text-slate-900">
                    <span>NUMBER OF CLIMBERS</span>
                    <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      {calculatorClimbers}{" "}
                      {calculatorClimbers === 1 ? "Climber" : "Climbers"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={calculatorClimbers <= 1}
                      onClick={() =>
                        setCalculatorClimbers(calculatorClimbers - 1)
                      }
                      className="bg-slate-100 text-slate-900 hover:bg-slate-200 disabled:opacity-40 w-11 h-11 rounded-xl flex items-center justify-center font-extrabold border border-slate-200 cursor-pointer text-lg"
                    >
                      -
                    </button>
                    <input
                      type="text"
                      readOnly
                      value={calculatorClimbers}
                      className="flex-grow bg-slate-50 border border-slate-200 text-center text-base font-extrabold rounded-xl py-2 text-slate-900 focus:outline-none"
                    />
                    <button
                      disabled={calculatorClimbers >= 8}
                      onClick={() =>
                        setCalculatorClimbers(calculatorClimbers + 1)
                      }
                      className="bg-slate-100 text-slate-900 hover:bg-slate-200 disabled:opacity-40 w-11 h-11 rounded-xl flex items-center justify-center font-extrabold border border-slate-200 cursor-pointer text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Oxygen Addon Switcher */}
                <div className="bg-stone-50 p-4 rounded-2xl border border-slate-200 flex items-start gap-3 justify-between">
                  <div className="space-y-1">
                    <span className="font-heading text-xs font-bold text-slate-900">
                      Summit Oxygen Package
                    </span>
                    <p className="text-xs text-slate-600 leading-normal font-medium">
                      TopOut mask + 4L Poisk cylinders (+$1,200/climber)
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={oxygenAddon}
                    onChange={(e) => setOxygenAddon(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded accent-amber-600 shrink-0 cursor-pointer"
                  />
                </div>

                {/* Dynamic Price Display */}
                <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                  <div>
                    <span className="text-xs text-slate-500 block font-heading font-extrabold tracking-wider">
                      TOTAL EXPEDITION COST
                    </span>
                    <span className="text-xs text-amber-700 block font-extrabold">
                      Permits &amp; 1:1 Sherpa ratio
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
                      For {calculatorClimbers} climbers
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm py-4 rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 border border-amber-500/50"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-200" />
                  <span>Secure Expedition Booking</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: OTHER PRESTIGIOUS EXPEDITIONS */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <h3 className="font-heading text-lg font-extrabold text-slate-900 mb-8">
            Other Prestigious Himalayan Expeditions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {(relatedExpeditions.length > 0
              ? relatedExpeditions
              : initialExpeditionsData
                  .filter((e) => e.slug !== expedition.slug)
                  .slice(0, 2)
            ).map((p) => (
              <Link key={p.id} href={`/expeditions/${p.slug}`}>
                <div className="bg-stone-50 border border-slate-200 rounded-2xl p-5 flex gap-4 hover:border-slate-300 transition-all cursor-pointer group shadow-xs">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-24 h-24 rounded-xl object-cover shrink-0"
                  />
                  <div className="space-y-1.5 flex-grow">
                    <span className="text-amber-700 text-xs uppercase font-extrabold tracking-widest block">
                      {p.region} &bull; {p.durationDays} DAYS
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
          title: expedition.title,
          slug: expedition.slug,
          region: expedition.region,
          durationDays: expedition.durationDays,
          maxAltitudeMeters: expedition.maxAltitudeMeters,
          priceUSD: expedition.priceUSD,
          image: expedition.image,
          categoryType: BookingPackageType.EXPEDITION,
        }}
        initialTravelers={calculatorClimbers}
      />
    </div>
  );
}
