"use client";

import { useState, useMemo, useEffect, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronDown, Star, Maximize2 } from "lucide-react";
import { ExpeditionItem, initialExpeditionsData } from "@/lib/expedition-data";
import { ExpeditionService, InquiryService } from "@/lib/services/admin-service";
import { PackageDetailSkeleton } from "@/components/marketing/skeletons/package-detail-skeleton";
import { openLightbox } from "@/lib/utils/lightbox";

interface ExpeditionDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function ExpeditionDetailPage({ params }: ExpeditionDetailPageProps) {
  const resolvedParams = use(params);
  const [expedition, setExpedition] = useState<ExpeditionItem | null>(null);
  const [loading, setLoading] = useState(true);

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
            reviewsCount: Number(raw.reviewsCount ?? raw.totalBookings),
            image: raw.image ?? "",
            shortDesc: raw.shortDesc ?? "",
            durationDays: Number(raw.durationDays),
            peakHeightM: Number(raw.maxAltitudeMeters),
            climbingGrade: raw.difficulty as any,
            bestSeason: raw.bestSeason ?? "",
            priceUSD: Number(raw.priceUSD),
            permitsRequired: raw.permitsRequired,
            status: raw.status as any,
            region: raw.region as any,
          });
        } else {
          const staticMatch = initialExpeditionsData.find((e) => e.slug === resolvedParams.slug);
          setExpedition(staticMatch || null);
        }
      } catch (e) {
        console.warn("Failed to fetch expedition by slug", e);
        const staticMatch = initialExpeditionsData.find((e) => e.slug === resolvedParams.slug);
        setExpedition(staticMatch || null);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [resolvedParams.slug]);

  // Related expeditions excluding current
  const relatedExpeditions = useMemo(() => {
    if (!expedition) return [];
    return initialExpeditionsData.filter((e) => e.slug !== expedition.slug).slice(0, 2);
  }, [expedition]);

  // Interactive tab state
  const [activeTab, setActiveTab] = useState<"overview" | "itinerary" | "cost" | "equipment" | "faqs">("overview");
  const [openItineraryDay, setOpenItineraryDay] = useState<number>(1);
  const [calculatorClimbers, setCalculatorClimbers] = useState<number>(2);
  const [oxygenAddon, setOxygenAddon] = useState<boolean>(true);

  // Gallery state
  const gallery = useMemo(() => {
    return [
      expedition?.image || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1585409677983-0f6c41ca913b?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
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
    if (calculatorClimbers >= 8) discount = 0.9;
    return Math.round(perPerson * calculatorClimbers * discount);
  }, [calculatorClimbers, oxygenAddon, baseCostPerPerson]);

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
        travelDates: "Upcoming Season",
        groupSize: calculatorClimbers,
        message: `Inquiry for ${expedition.title}. Climbers: ${calculatorClimbers}. Oxygen: ${oxygenAddon ? "Yes" : "No"}. Estimated Price: $${totalPrice}`,
      });
    } catch (e) {
      console.warn("Failed to create inquiry via API:", e);
    }
    setInquirySubmitted(true);
  };

  if (loading) {
    return <PackageDetailSkeleton />;
  }

  if (!expedition) {
    return notFound();
  }

  // Day-by-day itinerary data
  const itineraryDays = [
    {
      day: 1,
      title: "Arrival in Kathmandu & Expedition Briefing",
      description: "Welcome to Nepal! Upon arrival at Tribhuvan International Airport, meet our private escort for executive transfer to your hotel. Full equipment check and expedition briefing with your IFMGA climbing leader.",
      overnight: "Boutique Heritage Hotel",
      meals: "Welcome Dinner",
    },
    {
      day: 2,
      title: "Fly to Lukla & Trek to Phakding",
      description: "Take a breathtaking early morning mountain flight to Lukla (2,860m). Meet your climbing Sherpa crew and begin the approach trek along the Dudh Koshi river to Phakding.",
      overnight: "Lodge, Phakding",
      meals: "Breakfast, Lunch, Dinner",
    },
    {
      day: 3,
      title: "Trek to Namche Bazaar & Acclimatization",
      description: "Ascend to Namche Bazaar (3,440m), the Sherpa capital of the Khumbu, with your first views of the target peak. Extra acclimatization day included before pushing higher.",
      overnight: "Lodge, Namche Bazaar",
      meals: "Breakfast, Lunch, Dinner",
    },
    {
      day: 4,
      title: "Basecamp Approach & Rotation Climbs",
      description: "Continue toward basecamp with staged acclimatization rotations. Your climbing Sherpa team fixes ropes and establishes higher camps ahead of the summit push.",
      overnight: "Expedition Basecamp",
      meals: "Breakfast, Lunch, Dinner",
    },
  ];

  // Inclusions vs Exclusions
  const costIncludes = [
    "All domestic flights (Kathmandu - Lukla - Kathmandu)",
    `${expedition.title.split(" ")[0]} climbing permit & Sagarmatha National Park fees`,
    "100% certified IFMGA expedition leader & climbing Sherpa crew",
    "1 Porter per client carrying up to 15kg duffle on approach trek",
    "Fixed rope, ice screws, and shared technical climbing gear",
    "Basecamp medical tent with pulse oximeter monitoring & oxygen",
    "All required permits and Liaison Officer fees",
  ];

  const costExclusions = [
    "International airfare to and from Kathmandu",
    "Nepal tourist visa fees ($50 USD at airport)",
    "Personal travel, medical & high-altitude rescue insurance",
    "Personal climbing gear (harness, crampons, ice axe, boots)",
    "Gratuities for Sherpa guides and porters",
  ];

  // Mock Reviews
  const reviews = [
    {
      author: "Jonathan Vance",
      country: "United States",
      date: "May 2026",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      content: "The 1:1 Sherpa climbing ratio and basecamp medical support made our summit push safe and unforgettable. AlpineAce sets the gold standard in expedition mountaineering.",
    },
    {
      author: "Elena Rostova",
      country: "Germany",
      date: "April 2026",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      content: "Fixed ropes were prepped days ahead of our rotation, and the medical desk checked oxygen saturation every evening. Extremely professional expedition operation.",
    },
  ];

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
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/25 to-transparent" />
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
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="bg-amber-600 text-white text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-md shadow-xs">
                {expedition.region} REGION
              </span>
              <span className="bg-white/90 border border-slate-200 text-slate-900 text-xs px-3 py-1 rounded-md font-bold">
                {expedition.durationDays} Days
              </span>
              <span className="bg-white/90 border border-slate-200 text-slate-900 text-xs px-3 py-1 rounded-md font-bold">
                {expedition.climbingGrade}
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-md leading-tight max-w-4xl">
              {expedition.title}
            </h1>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT LAYOUT */}
      <section className="py-12 max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left Block */}
          <div className="lg:col-span-8 space-y-10">

            {/* Gallery Showcase */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div 
                onClick={(e) => {
                  const position = Math.max(0, gallery.indexOf(activePhoto));
                  openLightbox({
                    items: gallery.map((photo) => ({
                      img: photo,
                      thumb: photo,
                      alt: expedition.title,
                      caption: `${expedition.title} • ${expedition.peakHeightM.toLocaleString()}m Peak High-Resolution View`,
                    })),
                    position,
                    el: e.currentTarget,
                  });
                }}
                className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 cursor-pointer group"
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
                    className={`relative aspect-4/3 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${activePhoto === photo
                        ? "border-slate-900 shadow-xs"
                        : "border-transparent opacity-75 hover:opacity-100"
                      }`}
                  >
                    <img src={photo} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* High-Contrast Quick Facts Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white text-slate-900 p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="space-y-1 border-r border-slate-100 pr-4">
                <span className="text-xs text-slate-700 uppercase tracking-widest font-heading font-bold">Peak Height</span>
                <span className="text-xs sm:text-sm font-extrabold block text-amber-700">{expedition.peakHeightM.toLocaleString()} meters</span>
              </div>
              <div className="space-y-1 sm:border-r border-slate-100 sm:px-4">
                <span className="text-xs text-slate-700 uppercase tracking-widest font-heading font-bold">Grade</span>
                <span className="text-xs sm:text-sm font-extrabold block text-slate-900">{expedition.climbingGrade}</span>
              </div>
              <div className="space-y-1 border-r border-slate-100 px-4">
                <span className="text-xs text-slate-700 uppercase tracking-widest font-heading font-bold">Best Season</span>
                <span className="text-xs sm:text-sm font-extrabold block text-slate-900 truncate">{expedition.bestSeason}</span>
              </div>
              <div className="space-y-1 pl-4">
                <span className="text-xs text-slate-700 uppercase tracking-widest font-heading font-bold">Support</span>
                <span className="text-xs sm:text-sm font-extrabold block text-slate-900">1:1 Sherpa Crew</span>
              </div>
            </div>

            {/* Custom Tab Selector */}
            <div className="border-b border-slate-200 flex flex-wrap gap-1">
              {(["overview", "itinerary", "cost", "equipment", "faqs"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 font-heading text-xs font-extrabold uppercase tracking-wider border-b-2 transition-colors cursor-pointer capitalize ${activeTab === tab
                      ? "border-slate-900 text-slate-900 font-extrabold"
                      : "border-transparent text-slate-600 hover:text-slate-950 font-bold"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Active Tab Panel */}
            <div className="bg-white p-8 md:p-10 rounded-2xl border border-slate-200 shadow-xs leading-relaxed">

              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <h2 className="font-heading text-xl font-bold text-slate-900">Expedition Overview</h2>
                  <p className="text-slate-800 text-sm font-normal leading-relaxed">
                    {expedition.shortDesc} This expedition combines a proven Himalayan acclimatization route with fixed-rope technical climbing support, staged rotations, and full basecamp medical monitoring.
                  </p>

                  <div className="pt-4 border-t border-slate-100">
                    <h3 className="font-heading text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">
                      Included Permits &amp; Logistics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {expedition.permitsRequired.map((permit, idx) => (
                        <span
                          key={idx}
                          className="bg-slate-100 border border-slate-200 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg"
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
                  <h2 className="font-heading text-xl font-bold text-slate-900 mb-4">Detailed Day-By-Day Itinerary</h2>

                  <div className="space-y-3">
                    {itineraryDays.map((day) => {
                      const isOpen = openItineraryDay === day.day;
                      return (
                        <div
                          key={day.day}
                          className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 transition-all"
                        >
                          <button
                            onClick={() => setOpenItineraryDay(isOpen ? 0 : day.day)}
                            className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                          >
                            <span className="font-heading text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-3">
                              <span className="bg-slate-900 text-white w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
                                D{day.day}
                              </span>
                              {day.title}
                            </span>
                            <ChevronDown
                              className={`h-4 w-4 text-slate-800 transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180" : ""
                                }`}
                            />
                          </button>

                          {isOpen && (
                            <div className="p-6 bg-white border-t border-slate-200 space-y-3 text-xs sm:text-sm text-slate-800 font-normal">
                              <p>{day.description}</p>
                              <div className="flex flex-wrap gap-4 pt-3 border-t border-slate-100 text-xs font-bold text-slate-700">
                                <span>Meals: <strong className="text-slate-900">{day.meals}</strong></span>
                                <span>Overnight: <strong className="text-slate-900">{day.overnight}</strong></span>
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
                    <h3 className="font-heading text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                      Cost Includes
                    </h3>
                    <ul className="space-y-2.5 text-xs text-slate-800 font-normal leading-relaxed">
                      {costIncludes.map((inc, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-slate-900 font-bold">&bull;</span>
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-heading text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                      Cost Excludes
                    </h3>
                    <ul className="space-y-2.5 text-xs text-slate-800 font-normal leading-relaxed">
                      {costExclusions.map((exc, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-slate-500 font-bold">&bull;</span>
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
                  <h2 className="font-heading text-xl font-bold text-slate-900">Recommended Gear List</h2>
                  <p className="text-slate-800 text-xs leading-relaxed font-normal">
                    We supply shared fixed ropes, ice screws, and basecamp climbing hardware. Climbers must bring a certified harness, crampons, ice axe, high-altitude mountaineering boots, personal down summit suit, and personal climbing helmet.
                  </p>
                </div>
              )}

              {/* TAB 5: FAQS */}
              {activeTab === "faqs" && (
                <div className="space-y-4">
                  <h2 className="font-heading text-xl font-bold text-slate-900">Expedition FAQs</h2>
                  <div className="space-y-3 text-xs text-slate-800 font-normal">
                    <p className="font-bold text-slate-900">Q: What is the medical safety coverage?</p>
                    <p className="leading-relaxed">A: All expeditions include 1:1 certified IFMGA Sherpas with pulse oximeter checks, medical oxygen, and 24/7 rescue helicopter standby coverage.</p>
                  </div>
                </div>
              )}

            </div>

            {/* Client Chronicles & Reviews Pane */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <h3 className="font-heading text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Client Chronicles &amp; Reviews
              </h3>

              <div className="space-y-6 divide-y divide-slate-100">
                {reviews.map((rev, idx) => (
                  <div key={idx} className="pt-6 first:pt-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.avatar}
                          alt={rev.author}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">{rev.author}</h4>
                          <span className="text-xs text-slate-600 font-bold leading-none">{rev.country} &mdash; {rev.date}</span>
                        </div>
                      </div>

                      <div className="flex gap-0.5 text-gold-500">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
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
            <div className="bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-900 p-4 text-white">
                <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400 block">Bespoke Proposal Generator</span>
                <h3 className="font-heading text-sm font-extrabold text-white">
                  Expedition Estimate &amp; Calculator
                </h3>
              </div>

              <div className="p-6 space-y-6">
                {/* Climber Counter */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-heading font-extrabold tracking-wider text-slate-900">
                    <span>NUMBER OF CLIMBERS</span>
                    <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">{calculatorClimbers} {calculatorClimbers === 1 ? "Person" : "People"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={calculatorClimbers <= 1}
                      onClick={() => setCalculatorClimbers(calculatorClimbers - 1)}
                      className="bg-slate-100 text-slate-900 hover:bg-slate-200 disabled:opacity-40 w-10 h-10 rounded-xl flex items-center justify-center font-extrabold border border-slate-200 cursor-pointer text-lg"
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
                      disabled={calculatorClimbers >= 12}
                      onClick={() => setCalculatorClimbers(calculatorClimbers + 1)}
                      className="bg-slate-100 text-slate-900 hover:bg-slate-200 disabled:opacity-40 w-10 h-10 rounded-xl flex items-center justify-center font-extrabold border border-slate-200 cursor-pointer text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Bottled Oxygen Addon Switcher */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-3 justify-between">
                  <div className="space-y-1">
                    <span className="font-heading text-xs font-bold text-slate-900">
                      Bottled Oxygen & Mask Kit
                    </span>
                    <p className="text-xs text-slate-700 leading-normal font-semibold">
                      Full summit-push oxygen supply with regulator and mask. (+$1,200/person)
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
                    <span className="text-xs text-slate-700 block font-heading font-extrabold tracking-wider">ESTIMATED TRIP PRICE</span>
                    <span className="text-xs text-amber-700 block font-extrabold">Includes Sherpa crew &amp; permits</span>
                  </div>
                  <div className="text-right">
                    <span className="font-heading text-2xl sm:text-3xl font-black text-slate-900">
                      ${totalPrice.toLocaleString()} <span className="text-xs font-normal text-slate-700">USD</span>
                    </span>
                    <span className="text-xs text-slate-700 block font-bold">For {calculatorClimbers} climbers</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form Box */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              {inquirySubmitted ? (
                <div className="text-center py-6 space-y-3">
                  <div className="bg-emerald-50 text-emerald-700 w-10 h-10 rounded-full flex items-center justify-center mx-auto border border-emerald-200 font-bold">
                    &check;
                  </div>
                  <h3 className="font-heading text-sm font-bold text-slate-900">Inquiry Transmitted</h3>
                  <p className="text-slate-800 text-xs leading-normal font-normal">
                    Your request has been logged. Our expedition desk will email your formal PDF proposal within 4 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-heading text-sm font-bold text-slate-900">Secure Booking Inquiry</h3>
                    <p className="text-slate-800 text-xs leading-normal font-normal">
                      Hold permits &amp; climbing Sherpa crew for {calculatorClimbers} climbers on this expedition.
                    </p>
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-slate-400"
                  />

                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-slate-400"
                  />

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <span>Inquire for {calculatorClimbers} Climbers</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 2: OTHER PRESTIGIOUS HIMALAYAN EXPEDITIONS */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <h3 className="font-heading text-lg font-extrabold text-slate-900 mb-8">
            Other Prestigious Himalayan Expeditions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {relatedExpeditions.map((p) => (
              <Link key={p.id} href={`/expeditions/${p.slug}`}>
                <div className="bg-stone-50 border border-slate-200 rounded-2xl p-5 flex gap-4 hover:border-slate-300 transition-all cursor-pointer group shadow-xs">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-24 h-24 rounded-xl object-cover shrink-0"
                  />
                  <div className="space-y-1.5 flex-grow">
                    <span className="text-gold-600 text-xs uppercase font-extrabold tracking-widest block">
                      {p.region} REGION &bull; {p.peakHeightM.toLocaleString()}M
                    </span>
                    <h4 className="font-heading text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-gold-600 transition-colors leading-snug">
                      {p.title}
                    </h4>
                    <p className="text-slate-800 text-xs line-clamp-2 leading-relaxed font-normal">
                      {p.shortDesc}
                    </p>
                    <span className="text-xs font-extrabold text-slate-900 block pt-1">
                      From ${p.priceUSD.toLocaleString()} USD
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
