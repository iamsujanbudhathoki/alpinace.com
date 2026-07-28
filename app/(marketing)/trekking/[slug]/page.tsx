"use client";

import { useState, useMemo, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock,
  Mountain,
  Calendar,
  Star,
  DollarSign,
  MapPin,
  Check,
  X,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Send,
  Plane,
} from "lucide-react";
import { initialTreksData } from "@/lib/trek-data";

interface TrekDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function TrekDetailPage({ params }: TrekDetailPageProps) {
  const resolvedParams = use(params);
  const trek = initialTreksData.find((t) => t.slug === resolvedParams.slug);

  if (!trek) {
    notFound();
  }

  // Interactive tab state
  const [activeTab, setActiveTab] = useState<"overview" | "itinerary" | "cost" | "equipment" | "faqs">("overview");
  const [openItineraryDay, setOpenItineraryDay] = useState<number>(1);
  const [calculatorTravelers, setCalculatorTravelers] = useState<number>(2);
  const [helicopterAddon, setHelicopterAddon] = useState<boolean>(true);
  
  // Gallery state
  const gallery = [
    trek.image,
    "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1585409677983-0f6c41ca913b?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
  ];
  const [activePhoto, setActivePhoto] = useState<string>(gallery[0]);

  // Lead inquiry state
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  // Price calculations
  const baseCostPerPerson = trek.priceUSD;
  const helicopterCostPerPerson = 450;
  const totalPrice = useMemo(() => {
    let perPerson = baseCostPerPerson;
    if (helicopterAddon) perPerson += helicopterCostPerPerson;
    let discount = 1;
    if (calculatorTravelers >= 4) discount = 0.95;
    if (calculatorTravelers >= 8) discount = 0.9;
    return Math.round(perPerson * calculatorTravelers * discount);
  }, [calculatorTravelers, helicopterAddon, baseCostPerPerson]);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inquiryName && inquiryEmail) {
      setInquirySubmitted(true);
      setTimeout(() => {
        setInquirySubmitted(false);
        setInquiryName("");
        setInquiryEmail("");
      }, 6000);
    }
  };

  // Mock day-by-day itinerary data
  const itineraryDays = [
    {
      day: 1,
      title: "Arrival in Kathmandu & Transfer to Boutique Heritage Hotel",
      description: "Welcome to Nepal! Upon arrival at Tribhuvan International Airport, meet our private escort for executive transfer to your luxury heritage hotel in Thamel. Evening briefing with your IFMGA Sherpa guide.",
      overnight: "Boutique Heritage Hotel",
      meals: "Welcome Dinner",
    },
    {
      day: 2,
      title: "Scenic Flight to Lukla & Trek to Phakding (2,610m)",
      description: "Take a breathtaking early morning mountain flight to Lukla (2,860m). Meet your porter crew and begin a gentle 3-hour descent along the Dudh Koshi river to Phakding lodge.",
      overnight: "Yeti Mountain Home Lodge",
      meals: "Breakfast, Lunch, Dinner",
    },
    {
      day: 3,
      title: "Trek to Namche Bazaar (3,440m) & Sagarmatha National Park",
      description: "Cross iconic suspension bridges draped in prayer flags, entering Sagarmatha National Park at Monjo. Ascend the steep climb to Namche Bazaar with your first glimpse of Mt. Everest.",
      overnight: "Hotel Everest View / Luxury Lodge",
      meals: "Breakfast, Lunch, Dinner",
    },
    {
      day: 4,
      title: "Acclimatization Day at Namche Bazaar & Everest View Hike",
      description: "Active acclimatization day. Hike to Syangboche (3,780m) for panoramic views of Mt. Everest, Lhotse, and Ama Dablam. Visit the Sherpa Cultural Museum and local artisan market.",
      overnight: "Luxury Lodge, Namche",
      meals: "Breakfast, Lunch, Dinner",
    },
  ];

  // Inclusions vs Exclusions
  const costIncludes = [
    "All domestic flights (Kathmandu - Lukla - Kathmandu)",
    "Private helicopter shuttle options if selected",
    "100% certified IFMGA Sherpa expedition leader",
    "1 Porter per client carrying up to 15kg duffle",
    "Luxury mountain lodge accommodations with heated mattress pads",
    "Pulse oximeter medical oxygen monitoring twice daily",
    "All required permits (Sagarmatha NP & Khumbu Pasang Lhamu)",
  ];

  const costExclusions = [
    "International airfare to and from Kathmandu",
    "Nepal tourist visa fees ($50 USD at airport)",
    "Personal travel & medical insurance (helicopter rescue coverage required)",
    "Personal alcoholic beverages & bottled mineral water",
    "Gratuities for Sherpa guides and porters",
  ];

  return (
    <div className="pt-20 min-h-screen bg-[#fafaf9] text-slate-900 pb-20 font-sans">
      {/* 1. HERO BANNER WITH BACK LINK */}
      <section className="relative h-[55vh] min-h-[380px] w-full overflow-hidden text-white">
        <div className="absolute inset-0 z-0">
          <img
            src={trek.image}
            alt={trek.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/30 to-transparent" />
        </div>

        {/* Back Link */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pt-6">
          <Link
            href="/trekking"
            className="inline-flex items-center gap-2 bg-white/95 text-slate-900 hover:bg-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full border border-slate-200 shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Trekking Catalog</span>
          </Link>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-10 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="bg-gold-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-md">
                {trek.region} REGION
              </span>
              <span className="bg-white/90 border border-slate-200 text-slate-900 text-xs px-3 py-1 rounded-md font-bold">
                {trek.durationDays} Days
              </span>
              <span className="bg-white/90 border border-slate-200 text-slate-900 text-xs px-3 py-1 rounded-md font-bold">
                {trek.difficulty}
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-md leading-tight max-w-4xl">
              {trek.title}
            </h1>
          </div>
        </div>
      </section>

      {/* 2. SPLIT LAYOUT */}
      <section className="py-12 max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Main Content Block */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Gallery Showcase */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={activePhoto}
                  alt="Trek Showcase View"
                  className="w-full h-full object-cover transition-all duration-300"
                />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {gallery.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhoto(photo)}
                    className={`relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      activePhoto === photo
                        ? "border-gold-500 shadow-xs"
                        : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img src={photo} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Facts Bar (Crisp Light Palette) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white text-slate-900 p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="space-y-1 border-r border-slate-100 pr-4">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-semibold">Max Altitude</span>
                <span className="text-xs sm:text-sm font-extrabold block text-gold-600">5,364 meters</span>
              </div>
              <div className="space-y-1 sm:border-r border-slate-100 sm:px-4">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-semibold">Grade</span>
                <span className="text-xs sm:text-sm font-extrabold block text-slate-900">{trek.difficulty}</span>
              </div>
              <div className="space-y-1 border-r border-slate-100 px-4">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-semibold">Best Season</span>
                <span className="text-xs sm:text-sm font-extrabold block text-slate-900 truncate">{trek.bestSeason}</span>
              </div>
              <div className="space-y-1 pl-4">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-semibold">Lodges</span>
                <span className="text-xs sm:text-sm font-extrabold block text-slate-900">Luxury Lodges</span>
              </div>
            </div>

            {/* Custom Tab Selector */}
            <div className="border-b border-slate-200 flex flex-wrap gap-1">
              {(["overview", "itinerary", "cost", "equipment", "faqs"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 font-heading text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer capitalize ${
                    activeTab === tab
                      ? "border-gold-500 text-slate-900"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Active Tab Panel */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs leading-relaxed">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <h2 className="font-heading text-lg font-bold text-slate-900">Expedition Overview</h2>
                  <p className="text-slate-600 text-sm font-normal leading-relaxed">
                    {trek.shortDesc} This luxury trekking experience combines world-famous Himalayan trails with handpicked mountain lodges featuring attached heated bathrooms, electric blankets, and organic dining prepared by expert chefs.
                  </p>

                  <div className="pt-4 border-t border-slate-100">
                    <h3 className="font-heading text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">
                      Included High-Altitude Permits
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {trek.permitsRequired.map((permit, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
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
                  <h2 className="font-heading text-lg font-bold text-slate-900 mb-4">Detailed Day-By-Day Itinerary</h2>

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
                              <span className="bg-slate-900 text-white w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs shrink-0 font-bold">
                                D{day.day}
                              </span>
                              {day.title}
                            </span>
                            <ChevronDown
                              className={`h-4.5 w-4.5 text-slate-700 transition-transform duration-300 shrink-0 ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {isOpen && (
                            <div className="p-6 bg-white border-t border-slate-200 space-y-3 text-xs sm:text-sm text-slate-600 font-normal">
                              <p>{day.description}</p>
                              <div className="flex flex-wrap gap-4 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-500 font-mono">
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
                    <h3 className="font-heading text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Check className="h-4 w-4 text-emerald-600" />
                      Cost Includes
                    </h3>
                    <ul className="space-y-2.5 text-xs text-slate-600 font-normal">
                      {costIncludes.map((inc, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">&check;</span>
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-heading text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                      <X className="h-4 w-4 text-rose-600" />
                      Cost Excludes
                    </h3>
                    <ul className="space-y-2.5 text-xs text-slate-600 font-normal">
                      {costExclusions.map((exc, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-rose-600 font-bold">&times;</span>
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
                  <h2 className="font-heading text-lg font-bold text-slate-900">Recommended Gear List</h2>
                  <p className="text-slate-600 text-xs leading-relaxed font-normal">
                    We supply heavy-duty down jackets, thermal sleeping bags, and duffle bags. Explorers are recommended to bring waterproof trekking boots, moisture-wicking layers, personal medications, and polarized sunglasses.
                  </p>
                </div>
              )}

              {/* TAB 5: FAQS */}
              {activeTab === "faqs" && (
                <div className="space-y-4">
                  <h2 className="font-heading text-lg font-bold text-slate-900">Trip FAQs</h2>
                  <div className="space-y-3 text-xs text-slate-600 font-normal">
                    <p className="font-bold text-slate-900">Q: What is the medical safety coverage?</p>
                    <p>A: All treks include 1:1 certified IFMGA Sherpas with pulse oximeter checks, medical oxygen, and 24/7 rescue helicopter standby coverage.</p>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Right Interactive Trip Calculator & Lead Inquiry Box (Crisp Light Palette) */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            
            {/* Live Calculator Box */}
            <div className="bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gold-500 p-4 text-slate-950 border-b border-gold-400">
                <span className="text-[10px] uppercase font-extrabold tracking-wider block">Bespoke Proposal Generator</span>
                <h3 className="font-heading text-sm font-extrabold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 shrink-0" />
                  Live Trip Calculator
                </h3>
              </div>

              <div className="p-6 space-y-6">
                {/* Traveler Counter */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono text-slate-600 font-bold">
                    <span>NUMBER OF TRAVELERS</span>
                    <span className="text-slate-900 font-extrabold">{calculatorTravelers} {calculatorTravelers === 1 ? "Person" : "People"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={calculatorTravelers <= 1}
                      onClick={() => setCalculatorTravelers(calculatorTravelers - 1)}
                      className="bg-slate-100 text-slate-900 hover:bg-slate-200 disabled:opacity-40 w-10 h-10 rounded-lg flex items-center justify-center font-bold font-mono border border-slate-200 cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="text"
                      readOnly
                      value={calculatorTravelers}
                      className="flex-grow bg-slate-50 border border-slate-200 text-center text-sm font-extrabold font-mono rounded-lg py-2.5 text-slate-900 focus:outline-none"
                    />
                    <button
                      disabled={calculatorTravelers >= 12}
                      onClick={() => setCalculatorTravelers(calculatorTravelers + 1)}
                      className="bg-slate-100 text-slate-900 hover:bg-slate-200 disabled:opacity-40 w-10 h-10 rounded-lg flex items-center justify-center font-bold font-mono border border-slate-200 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Helicopter Addon Switcher */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-3 justify-between">
                  <div className="space-y-1">
                    <span className="font-heading text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Plane className="h-4 w-4 text-gold-600 shrink-0" />
                      Helicopter Shuttle Return
                    </span>
                    <p className="text-[10px] text-slate-500 leading-normal font-medium">
                      Fly back from high camps directly to Kathmandu. (+$450/person)
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={helicopterAddon}
                    onChange={(e) => setHelicopterAddon(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded accent-gold-600 shrink-0 cursor-pointer"
                  />
                </div>

                {/* Dynamic Price Display */}
                <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-mono font-semibold">TOTAL ESTIMATED TRIP PRICE</span>
                    <span className="text-[10px] text-gold-600 block font-bold">Includes luxury lodges &amp; crew</span>
                  </div>
                  <div className="text-right">
                    <span className="font-heading text-2xl sm:text-3xl font-black text-slate-900 flex items-center justify-end">
                      <DollarSign className="h-5 w-5 text-gold-600 shrink-0 -mr-1" />
                      {totalPrice.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono font-medium">For {calculatorTravelers} travelers</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form Box */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              {inquirySubmitted ? (
                <div className="text-center py-6 space-y-3">
                  <div className="bg-gold-100 text-gold-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto border border-gold-300 font-bold">
                    &check;
                  </div>
                  <h3 className="font-heading text-sm font-bold text-slate-900">Inquiry Transmitted</h3>
                  <p className="text-slate-600 text-xs leading-normal font-normal">
                    Your request has been logged. Our concierge desk will email your formal PDF proposal within 4 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-heading text-sm font-bold text-slate-900">Secure Booking Inquiry</h3>
                    <p className="text-slate-600 text-[11px] leading-normal font-normal">
                      Hold permits &amp; luxury lodges for {calculatorTravelers} hikers on this tour.
                    </p>
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-gold-600"
                  />

                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-gold-600"
                  />

                  <button
                    type="submit"
                    className="w-full bg-gold-500 hover:bg-gold-400 text-slate-950 border border-gold-400 font-extrabold text-xs py-3 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Inquire for {calculatorTravelers} Travelers</span>
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>
      </section>
    </div>
  );
}
