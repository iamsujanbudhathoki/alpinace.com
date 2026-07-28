import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Mountain, ShieldCheck, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { initialTreksData } from "@/lib/trek-data";

interface TrekDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function TrekDetailPage({ params }: TrekDetailPageProps) {
  const resolvedParams = await params;
  const trek = initialTreksData.find((t) => t.slug === resolvedParams.slug);

  if (!trek) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-900 pt-20 pb-24 font-sans">
      {/* Top Breadcrumb Navigation */}
      <div className="bg-white border-b border-slate-200 py-4 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex items-center gap-3 text-xs font-semibold text-slate-600">
          <Link
            href="/trekking"
            className="flex items-center gap-1.5 text-slate-700 hover:text-slate-950 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Treks</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500 uppercase tracking-wider">{trek.region}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-bold truncate">{trek.title}</span>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 mt-8 space-y-10">
        {/* Title & Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="bg-slate-900 text-gold-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                {trek.region} REGION
              </span>
              <span className="bg-gold-100 text-gold-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                {trek.difficulty}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
              {trek.title}
            </h1>
            <p className="text-slate-600 text-sm md:text-base font-normal leading-relaxed">
              {trek.shortDesc}
            </p>
          </div>

          {/* Booking Card Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shrink-0 w-full lg:w-80 space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Starting Price
              </span>
              <div className="text-3xl font-extrabold text-slate-900">
                ${trek.priceUSD.toLocaleString()}{" "}
                <span className="text-xs font-normal text-slate-500">USD / person</span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-medium text-slate-600 border-t border-b border-slate-100 py-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-4 h-4 text-slate-400" /> Duration
                </span>
                <span className="font-bold text-slate-900">{trek.durationDays} Days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Mountain className="w-4 h-4 text-slate-400" /> Rating
                </span>
                <span className="font-bold text-slate-900">{trek.rating} ★ ({trek.reviewsCount} reviews)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="w-4 h-4 text-slate-400" /> Season
                </span>
                <span className="font-bold text-slate-900 text-[11px]">{trek.bestSeason}</span>
              </div>
            </div>

            <Link href="/contact" className="block w-full">
              <button className="w-full bg-slate-900 hover:bg-gold-500 hover:text-slate-950 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-xs cursor-pointer text-center">
                Book This Journey
              </button>
            </Link>
          </div>
        </div>

        {/* Hero Image Showcase */}
        <div className="relative h-[420px] w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200">
          <img
            src={trek.image}
            alt={trek.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Itinerary Highlights & Required Permits */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-3">
              Journey Overview &amp; Highlights
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              This iconic trek offers an extraordinary blend of towering high-altitude Himalayan summits, authentic Sherpa hospitality, and carefully chosen luxury mountain lodge stays. You will be accompanied by our 100% certified IFMGA Sherpa leaders equipped with pulse oximeters, medical oxygen, and satellite communications.
            </p>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Included High-Altitude Permits
              </h3>
              <div className="flex flex-wrap gap-2">
                {trek.permitsRequired.map((permit, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {permit}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-gold-600 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Safety &amp; Compliance Guarantee</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                All itineraries include comprehensive medical kits, oxygen monitoring, satellite communications, and 24/7 rescue helicopter standby coverage.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
