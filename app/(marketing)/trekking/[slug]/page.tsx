"use client";

import { useState, useMemo, useEffect, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Star,
  Loader2,
  Maximize2,
  Calendar,
  ShieldCheck,
  Compass,
  MapPin,
  Mountain,
  Users,
  Utensils,
  BedDouble,
  FileText,
  HelpCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { TrekItem, initialTreksData } from "@/lib/trek-data";
import {
  TrekService,
  InquiryService,
  FaqService,
  SettingService,
} from "@/lib/services/admin-service";
import { FaqItem, FaqStatus, BookingPackageType } from "@/lib/admin-data";
import { Testimonial } from "@/lib/home-data";
import { PackageDetailSkeleton } from "@/components/marketing/skeletons/package-detail-skeleton";
import { PublicBookingModal } from "@/components/marketing/modals/public-booking-modal";
import { openLightbox } from "@/lib/utils/lightbox";

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
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [activeFaqId, setActiveFaqId] = useState<string | null>(null);

  // Dynamic Reviews from backend settings
  const [reviews, setReviews] = useState<Testimonial[]>([]);

  // Dynamic Related Treks from backend
  const [relatedTreks, setRelatedTreks] = useState<TrekItem[]>([]);

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Interactive tab state
  const [activeTab, setActiveTab] = useState<
    "overview" | "itinerary" | "cost" | "equipment" | "faqs"
  >("overview");
  const [openItineraryDay, setOpenItineraryDay] = useState<number>(1);
  const [calculatorTravelers, setCalculatorTravelers] = useState<number>(2);
  const [helicopterAddon, setHelicopterAddon] = useState<boolean>(false);

  // Lead inquiry state
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquiryLoading, setInquiryLoading] = useState(false);

  // Load all dynamic data from backend APIs
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

        // 2. Fetch Live FAQs
        const liveFaqs = await FaqService.getAll(FaqStatus.ACTIVE);
        if (liveFaqs && liveFaqs.length > 0) {
          setFaqs(liveFaqs);
        }

        // 3. Fetch Live Testimonials / Reviews from Settings
        const settings = await SettingService.getAll();
        if (settings?.testimonials) {
          try {
            const parsed = JSON.parse(settings.testimonials);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setReviews(parsed);
            }
          } catch (e) {
            console.warn("Failed to parse dynamic testimonials:", e);
          }
        }

        // 4. Fetch All Active Treks for Related Section
        const allTreks = await TrekService.getAll();
        if (allTreks && allTreks.length > 0) {
          setRelatedTreks(
            allTreks
              .filter((t) => t.slug !== resolvedParams.slug)
              .slice(0, 2),
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

  // Gallery images with high-resolution mountain photography
  const gallery = useMemo(() => {
    if (!trek) return [];
    return [
      trek.image ||
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1585409677983-0f6c41ca913b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    ];
  }, [trek]);

  const [activePhoto, setActivePhoto] = useState<string>("");

  useEffect(() => {
    if (gallery.length > 0) {
      setActivePhoto(gallery[0]);
    }
  }, [gallery]);

  // Dynamic Inclusions
  const costIncludes = useMemo(() => {
    if (trek?.inclusionsText && trek.inclusionsText.trim()) {
      return trek.inclusionsText
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [
      "All domestic airport transfers & scenic mountain flights",
      "100% certified IFMGA Sherpa master expedition leader",
      "1 Porter per client carrying up to 15kg high-altitude duffle",
      "Luxury boutique lodges & tea house suites with heated blankets",
      "Three gourmet organic meals daily with fresh barista coffee",
      "Twice-daily pulse oximeter physiological biometric monitoring",
      "Comprehensive medical first-aid kit & supplemental emergency oxygen",
      `All official government permits (${trek?.permitsRequired?.join(", ") || "National Park & TIMS"})`,
    ];
  }, [trek]);

  // Dynamic Exclusions
  const costExclusions = useMemo(() => {
    if (trek?.exclusionsText && trek.exclusionsText.trim()) {
      return trek.exclusionsText
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [
      "International flights to and from Kathmandu (KTM)",
      "Nepal tourist entry visa ($50 USD payable at airport)",
      "Personal travel & high-altitude medical evacuation insurance",
      "Personal alcoholic beverages, bottled sodas, and confectionary",
      "Personal trekking equipment (down sleeping bags & boots)",
      "Gratuities for Sherpa guides and porter team (discretionary)",
    ];
  }, [trek]);

  // Dynamic Itinerary Generator based on actual duration and region
  const itineraryDays = useMemo(() => {
    if (!trek) return [];
    const totalDays = Math.max(3, Number(trek.durationDays) || 12);
    const region = trek.region || "Everest";
    const altitude = trek.maxAltitudeMeters || 5364;

    const days = [];
    // Day 1
    days.push({
      day: 1,
      title: "Arrival in Kathmandu & Executive Heritage Transfer",
      description:
        "Welcome to Nepal! Upon landing at Tribhuvan International Airport, meet our private airport escort for transfer to your luxury heritage hotel in Kathmandu. In the evening, enjoy a welcome feast and comprehensive briefing with your lead IFMGA Sherpa guide.",
      overnight: "Boutique Heritage Hotel, Kathmandu",
      meals: "Welcome Dinner",
    });

    // Day 2
    days.push({
      day: 2,
      title: `Scenic Flight to Mountain Gateway & Trailhead Commencement`,
      description:
        `Board an early morning mountain flight to the regional airstrip. Meet your dedicated porter team, inspect equipment, and begin your trek traversing rhododendron valleys and suspension bridges along the mountain river.`,
      overnight: "Luxury Mountain Lodge",
      meals: "Breakfast, Lunch, Dinner",
    });

    // Middle days
    const middleDaysCount = totalDays - 4;
    for (let i = 1; i <= middleDaysCount; i++) {
      const currentDay = i + 2;
      const isAcclimatization = i === 2 || (middleDaysCount > 6 && i === 5);
      const isSummitDay = i === middleDaysCount - 1;

      if (isAcclimatization) {
        days.push({
          day: currentDay,
          title: `Active Altitude Acclimatization & Ridge View Exploration`,
          description:
            `Conservative ascent day designed for optimal oxygen saturation. Hike to higher panoramic viewpoints before descending back to your luxury heated lodge. Evening pulse-oximeter health check by your guide.`,
          overnight: "Boutique Alpine Lodge",
          meals: "Breakfast, Lunch, Dinner",
        });
      } else if (isSummitDay) {
        days.push({
          day: currentDay,
          title: `Ultimate Ascent Goal: Reaching Maximum Altitude (${altitude.toLocaleString()}m)`,
          description:
            `Dawn departure for the crowning highlight of the journey. Traverse high alpine moraines to reach ${altitude.toLocaleString()}m with unobstructed 360-degree panoramas of the Himalayan peaks. Return to camp for celebratory banquet.`,
          overnight: "High Alpine Camp / Lodge",
          meals: "Breakfast, Lunch, Dinner",
        });
      } else {
        days.push({
          day: currentDay,
          title: `Trekking Through ${region} Valley & Traditional Sherpa Settlements (Day ${currentDay})`,
          description:
            `Follow pristine high-altitude trails past ancient Buddhist monasteries, mani stone walls, and glacier viewpoints. Savor fresh organic cuisine prepared by certified lodge chefs.`,
          overnight: "Handpicked Mountain Lodge",
          meals: "Breakfast, Lunch, Dinner",
        });
      }
    }

    // Second to last day
    days.push({
      day: totalDays - 1,
      title: "Descent to Airstrip & Scenic Return Flight to Kathmandu",
      description:
        "Complete the final trail stretch back to the mountain gateway. Board your scenic mountain flight (or optional private helicopter charter) returning to Kathmandu. Free afternoon for spa recovery and souvenir shopping.",
      overnight: "Boutique Heritage Hotel, Kathmandu",
      meals: "Breakfast, Farewell Dinner",
    });

    // Last day
    days.push({
      day: totalDays,
      title: "International Departure & Himalayan Farewell",
      description:
        "Savor a leisurely breakfast at the courtyard garden. Our concierge private chauffeur provides executive transport to Tribhuvan International Airport for your homeward flight.",
      overnight: "Homeward Bound",
      meals: "Breakfast",
    });

    return days;
  }, [trek]);

  // Specific Reviews from trek JSONB (or global testimonials fallback)
  const displayReviews = useMemo(() => {
    if (trek?.reviews && Array.isArray(trek.reviews) && trek.reviews.length > 0) {
      return trek.reviews.map((r, i) => ({
        id: r.id || `trek-rev-${i}`,
        author: r.author,
        country: r.country,
        tripName: trek.title,
        content: r.content,
        avatar:
          r.avatar ||
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        rating: r.rating || 5,
      }));
    }
    if (reviews && reviews.length > 0) return reviews;
    return [
      {
        id: "rev-1",
        author: "Jonathan Vance",
        country: "United States",
        tripName: "Everest Luxury Lodge Trek",
        content:
          "The 1:1 Sherpa guide ratio and basecamp luxury made our journey unforgettable. Heated blankets and pulse-oximeter monitoring every single evening set the gold standard in high-altitude adventure.",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        rating: 5,
      },
      {
        id: "rev-2",
        author: "Elena Rostova",
        country: "Germany",
        tripName: "Annapurna Sanctuary Circuit",
        content:
          "Organic fine dining at 4,000 meters! The Sherpa team looked after our safety seamlessly. Every single detail from airport pickup to helicopter transfer was flawless.",
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
        rating: 5,
      },
      {
        id: "rev-3",
        author: "Jean-Pierre Dubois",
        country: "France",
        tripName: "Manaslu Wilderness Expedition",
        content:
          "Bespoke planning from start to finish. Our private helicopter transfer from the high pass back to Kathmandu was breathtaking. Alpine Ace is truly in a league of its own.",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        rating: 5,
      },
    ];
  }, [trek?.reviews, reviews, trek?.title]);

  // Specific FAQs from trek JSONB (or global FAQs fallback)
  const displayFaqs = useMemo(() => {
    if (trek?.faqs && Array.isArray(trek.faqs) && trek.faqs.length > 0) {
      return trek.faqs.map((f, i) => ({
        id: `trek-faq-${i}`,
        question: f.question,
        answer: f.answer,
        category: "Trip Specific",
        status: FaqStatus.ACTIVE,
        order: i + 1,
      }));
    }
    if (faqs && faqs.length > 0) return faqs;
    return [
      {
        id: "faq-1",
        question: "How do you manage high-altitude medical safety and AMS?",
        answer:
          "Every trek is led by certified IFMGA Sherpa leaders equipped with pulse oximeters, specialized medical kits, portable supplemental oxygen, and 24/7 standby emergency helicopter evacuation coverage.",
        category: "Safety & Medical",
        status: FaqStatus.ACTIVE,
        order: 1,
      },
      {
        id: "faq-2",
        question: "What is the standard of your luxury mountain lodges?",
        answer:
          "We partner exclusively with premium boutique lodges (such as Yeti Mountain Home and Ker & Downey) featuring private attached bathrooms, electric mattress warmers, hot showers, and chef-curated dining.",
        category: "Lodges & Comfort",
        status: FaqStatus.ACTIVE,
        order: 2,
      },
      {
        id: "faq-3",
        question: "Can I customize the departure dates or request private helicopter transfers?",
        answer:
          "Yes! Our adventure directors create bespoke departures tailored to your timeframe, private helicopter transfers, and personalized dietary requirements.",
        category: "Customization & Booking",
        status: FaqStatus.ACTIVE,
        order: 3,
      },
    ];
  }, [trek?.faqs, faqs]);

  // Price calculations
  const baseCostPerPerson = trek?.priceUSD || 0;
  const helicopterCostPerPerson = 450;
  const totalPrice = useMemo(() => {
    let perPerson = baseCostPerPerson;
    if (helicopterAddon) perPerson += helicopterCostPerPerson;
    let discount = 1;
    if (calculatorTravelers >= 4) discount = 0.95;
    if (calculatorTravelers >= 8) discount = 0.9;
    return Math.round(perPerson * calculatorTravelers * discount);
  }, [calculatorTravelers, helicopterAddon, baseCostPerPerson]);

  if (loading) {
    return <PackageDetailSkeleton />;
  }

  if (!trek) {
    return notFound();
  }

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryEmail.trim()) return;

    setInquiryLoading(true);
    try {
      await InquiryService.create({
        guestName: inquiryName.trim(),
        email: inquiryEmail.trim(),
        phone: "+1 555-0100",
        country: "International",
        interestedTrip: trek.title,
        travelDates: "Upcoming Season",
        groupSize: calculatorTravelers,
        message: `Direct inquiry for ${trek.title} (${calculatorTravelers} hikers, Est: $${totalPrice.toLocaleString()} USD). ${helicopterAddon ? "Requested helicopter shuttle return option." : ""}`,
      });
      setInquirySubmitted(true);
      setTimeout(() => {
        setInquirySubmitted(false);
        setInquiryName("");
        setInquiryEmail("");
      }, 6000);
    } catch (err) {
      console.error("Inquiry submission error:", err);
    } finally {
      setInquiryLoading(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-stone-50 text-slate-900 pb-24 font-sans">
      {/* 1. HERO BANNER */}
      <section className="relative h-96 sm:h-112 md:h-128 w-full overflow-hidden text-white">
        <div className="absolute inset-0 z-0">
          <img
            src={trek.image}
            alt={trek.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent" />
        </div>

        {/* Back Link */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pt-6">
          <Link
            href="/trekking"
            className="inline-flex items-center gap-2 bg-white/95 text-slate-900 hover:bg-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full border border-slate-200 shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-slate-700" />
            <span>Back to Trekking Catalog</span>
          </Link>
        </div>

        {/* Title Overlay & Hero CTAs */}
        <div className="absolute bottom-10 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-4xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-amber-600 text-white text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-md shadow-xs">
                  {trek.region} REGION
                </span>
                <span className="bg-white/90 border border-slate-200 text-slate-900 text-xs px-3 py-1 rounded-md font-bold">
                  {trek.durationDays} Days
                </span>
                <span className="bg-white/90 border border-slate-200 text-slate-900 text-xs px-3 py-1 rounded-md font-bold capitalize">
                  {trek.difficulty}
                </span>
                <span className="bg-white/90 border border-slate-200 text-slate-900 text-xs px-3 py-1 rounded-md font-bold">
                  Max: {(trek.maxAltitudeMeters || 5364).toLocaleString()}m
                </span>
              </div>
              <h1 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-md leading-tight">
                {trek.title}
              </h1>
            </div>

            {/* Quick Hero CTA Button */}
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs sm:text-sm px-6 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 shrink-0 border border-amber-400/40"
            >
              <ShieldCheck className="w-4 h-4 text-amber-200" />
              <span>Book This Trek &bull; ${Number(trek.priceUSD).toLocaleString()}</span>
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
                      alt: trek.title,
                      caption: `${trek.title} • High-Resolution Mountain View`,
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
                  alt="Trek Showcase View"
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
                  <span>Max Altitude</span>
                </span>
                <span className="text-xs sm:text-sm font-extrabold block text-amber-700">
                  {(trek.maxAltitudeMeters || 5364).toLocaleString()} meters
                </span>
              </div>
              <div className="space-y-1 sm:border-r border-slate-100 sm:px-4">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-heading font-extrabold flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-600" />
                  <span>Grade</span>
                </span>
                <span className="text-xs sm:text-sm font-extrabold block text-slate-900 capitalize">
                  {trek.difficulty}
                </span>
              </div>
              <div className="space-y-1 border-r border-slate-100 px-4">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-heading font-extrabold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>Best Season</span>
                </span>
                <span className="text-xs sm:text-sm font-extrabold block text-slate-900 truncate">
                  {trek.bestSeason || "March - May & Sept - Nov"}
                </span>
              </div>
              <div className="space-y-1 pl-4">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-heading font-extrabold flex items-center gap-1.5">
                  <BedDouble className="w-3.5 h-3.5 text-amber-600" />
                  <span>Lodging</span>
                </span>
                <span className="text-xs sm:text-sm font-extrabold block text-slate-900 truncate">
                  {trek.accommodation || "Luxury Lodges"}
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
                <div className="space-y-8">
                  <div className="space-y-3">
                    <h2 className="font-heading text-xl font-bold text-slate-900">
                      Expedition Overview
                    </h2>
                    <p className="text-slate-800 text-sm font-normal leading-relaxed">
                      {trek.shortDesc}
                    </p>
                  </div>

                  {/* Trip Features Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div className="bg-stone-50 border border-slate-200 p-4 rounded-2xl space-y-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        <span>Start &amp; End Point</span>
                      </span>
                      <p className="text-xs font-bold text-slate-900">
                        {trek.startEndLocation || "Kathmandu to Kathmandu"}
                      </p>
                    </div>

                    <div className="bg-stone-50 border border-slate-200 p-4 rounded-2xl space-y-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-amber-600" />
                        <span>Meals &amp; Nutrition</span>
                      </span>
                      <p className="text-xs font-bold text-slate-900">
                        {trek.meals || "Full Board (Breakfast, Lunch, Dinner)"}
                      </p>
                    </div>

                    <div className="bg-stone-50 border border-slate-200 p-4 rounded-2xl space-y-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-amber-600" />
                        <span>Group Size</span>
                      </span>
                      <p className="text-xs font-bold text-slate-900">
                        {trek.groupSizeRange || "2 to 12 Explorers (Private Custom Available)"}
                      </p>
                    </div>

                    <div className="bg-stone-50 border border-slate-200 p-4 rounded-2xl space-y-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                        <span>Guide Ratio</span>
                      </span>
                      <p className="text-xs font-bold text-slate-900">
                        1:1 Certified IFMGA Master Sherpa Ratio
                      </p>
                    </div>
                  </div>

                  {/* Included Permits */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <h3 className="font-heading text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Included Government Permits &amp; Checkposts
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {trek.permitsRequired && trek.permitsRequired.length > 0 ? (
                        trek.permitsRequired.map((permit, idx) => (
                          <span
                            key={idx}
                            className="bg-amber-50 border border-amber-200 text-amber-950 text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-2xs"
                          >
                            {permit}
                          </span>
                        ))
                      ) : (
                        <span className="bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold px-3.5 py-1.5 rounded-xl">
                          Sagarmatha NP Permit &bull; Khumbu Pasang Lhamu Entry
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ITINERARY ACCORDION */}
              {activeTab === "itinerary" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h2 className="font-heading text-xl font-bold text-slate-900">
                      Day-By-Day Expedition Itinerary
                    </h2>
                    <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                      {itineraryDays.length} Total Days
                    </span>
                  </div>

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
                            className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer hover:bg-stone-100/70 transition-colors"
                          >
                            <span className="font-heading text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-3">
                              <span className="bg-slate-900 text-amber-400 w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                                D{day.day}
                              </span>
                              <span>{day.title}</span>
                            </span>
                            <ChevronDown
                              className={`h-4 w-4 text-slate-600 transition-transform duration-300 shrink-0 ${
                                isOpen ? "rotate-180 text-amber-700" : ""
                              }`}
                            />
                          </button>

                          {isOpen && (
                            <div className="p-6 bg-white border-t border-slate-200 space-y-4 text-xs sm:text-sm text-slate-800 font-normal leading-relaxed animate-in fade-in duration-150">
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
                          <span className="text-emerald-600 font-black shrink-0">
                            &check;
                          </span>
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
                          <span className="text-slate-400 font-bold shrink-0">
                            &bull;
                          </span>
                          <span>{exc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 4: EQUIPMENT */}
              {activeTab === "equipment" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="font-heading text-xl font-bold text-slate-900">
                      Recommended Gear &amp; Equipment Checklist
                    </h2>
                    <p className="text-slate-700 text-xs leading-relaxed font-normal">
                      We supply heavy-duty 800-fill down expedition jackets, -20&deg;C rated sleeping bags, and 100L waterproof duffle bags. Explorers only need personal trekking layers and broken-in boots.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-stone-50 border border-slate-200 p-5 rounded-2xl space-y-2">
                      <h4 className="font-bold text-slate-900">Provided by Alpine Ace</h4>
                      <ul className="space-y-1.5 text-slate-700">
                        <li>&bull; 800-Fill Goose Down Expedition Parka</li>
                        <li>&bull; -20&deg;C High-Altitude Sleeping Bag &amp; Liner</li>
                        <li>&bull; 100L Waterproof Mountain Duffle Bag</li>
                        <li>&bull; Supplemental Medical Oxygen &amp; Pulse Oximeter</li>
                      </ul>
                    </div>

                    <div className="bg-stone-50 border border-slate-200 p-5 rounded-2xl space-y-2">
                      <h4 className="font-bold text-slate-900">Recommended Personal Gear</h4>
                      <ul className="space-y-1.5 text-slate-700">
                        <li>&bull; Waterproof Broken-In Trekking Boots</li>
                        <li>&bull; Merino Wool Thermal Base Layers</li>
                        <li>&bull; UV400 Polarized Mountain Sunglasses</li>
                        <li>&bull; Water Filtration Bottle &amp; Headlamp</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: DYNAMIC FAQS */}
              {activeTab === "faqs" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h2 className="font-heading text-xl font-bold text-slate-900">
                      Frequently Asked Questions
                    </h2>
                    <span className="text-xs font-bold text-slate-500">
                      {displayFaqs.length} Questions Answered
                    </span>
                  </div>

                  <div className="space-y-3">
                    {displayFaqs.map((f) => {
                      const isOpen = activeFaqId === f.id;
                      return (
                        <div
                          key={f.id}
                          className="border border-slate-200 rounded-2xl overflow-hidden bg-stone-50/60"
                        >
                          <button
                            onClick={() =>
                              setActiveFaqId(isOpen ? null : f.id)
                            }
                            className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer hover:bg-stone-100/70 transition-colors"
                          >
                            <span className="font-heading text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2.5">
                              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>{f.question}</span>
                            </span>
                            <ChevronDown
                              className={`h-4 w-4 text-slate-500 transition-transform duration-300 shrink-0 ${
                                isOpen ? "rotate-180 text-amber-700" : ""
                              }`}
                            />
                          </button>

                          {isOpen && (
                            <div className="p-5 bg-white border-t border-slate-200 text-xs sm:text-sm text-slate-800 font-normal leading-relaxed animate-in fade-in duration-150">
                              <p>{f.answer}</p>
                              {f.category && (
                                <span className="inline-block mt-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                  Topic: {f.category}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Client Chronicles & Dynamic Reviews Pane */}
            <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-heading text-lg font-bold text-slate-900">
                    Client Chronicles &amp; Explorer Reviews
                  </h3>
                  <p className="text-slate-500 text-xs font-normal">
                    Verified firsthand accounts from our high-altitude travelers
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 text-xs font-extrabold text-amber-900">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>5.0 / 5.0 Rating</span>
                </div>
              </div>

              <div className="space-y-6 divide-y divide-slate-100">
                {displayReviews.map((rev, idx) => (
                  <div key={idx} className="pt-6 first:pt-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.avatar}
                          alt={rev.author}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">
                            {rev.author}
                          </h4>
                          <span className="text-xs text-slate-500 font-medium leading-none">
                            {rev.country} {rev.tripName ? `\u2022 ${rev.tripName}` : ""}
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
                  Bespoke Rate Estimator
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

                {/* Helicopter Addon Switcher */}
                <div className="bg-stone-50 p-4 rounded-2xl border border-slate-200 flex items-start gap-3 justify-between">
                  <div className="space-y-1">
                    <span className="font-heading text-xs font-bold text-slate-900">
                      Helicopter Shuttle Return
                    </span>
                    <p className="text-xs text-slate-600 leading-normal font-medium">
                      Fly back from high camp directly to Kathmandu (+$450/person)
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={helicopterAddon}
                    onChange={(e) => setHelicopterAddon(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded accent-amber-600 shrink-0 cursor-pointer"
                  />
                </div>

                {/* Dynamic Price Display */}
                <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                  <div>
                    <span className="text-xs text-slate-500 block font-heading font-extrabold tracking-wider">
                      TOTAL ESTIMATE
                    </span>
                    <span className="text-xs text-amber-700 block font-extrabold">
                      Lodges, Sherpas &amp; Permits
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

                {/* PRIMARY CTA: OPEN SECURE BOOKING MODAL */}
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
                    Inquiry Received
                  </h3>
                  <p className="text-slate-600 text-xs leading-normal font-normal">
                    Your request has been logged. Our expedition director will email your custom proposal within 4 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-heading text-sm font-bold text-slate-900">
                      Request Custom Itinerary Proposal
                    </h3>
                    <p className="text-slate-600 text-xs leading-normal font-normal">
                      Need custom dates or private guides? Submit a free concierge inquiry.
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
                    disabled={inquiryLoading}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    {inquiryLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <>
                        <span>Submit Free Inquiry</span>
                        <ArrowRight className="w-4 h-4 text-amber-400" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: OTHER PRESTIGIOUS HIMALAYAN ITINERARIES */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <h3 className="font-heading text-lg font-extrabold text-slate-900 mb-8">
            Other Prestigious Himalayan Itineraries
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {(relatedTreks.length > 0
              ? relatedTreks
              : initialTreksData.filter((t) => t.slug !== trek.slug).slice(0, 2)
            ).map((p) => (
              <Link key={p.id} href={`/trekking/${p.slug}`}>
                <div className="bg-stone-50 border border-slate-200 rounded-2xl p-5 flex gap-4 hover:border-slate-300 transition-all cursor-pointer group shadow-xs">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-24 h-24 rounded-xl object-cover shrink-0"
                  />
                  <div className="space-y-1.5 flex-grow">
                    <span className="text-amber-700 text-xs uppercase font-extrabold tracking-widest block">
                      {p.region} REGION &bull; {p.durationDays} DAYS
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

      {/* 3. SECURE PUBLIC BOOKING MODAL */}
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
        initialHelicopter={helicopterAddon}
      />
    </div>
  );
}
