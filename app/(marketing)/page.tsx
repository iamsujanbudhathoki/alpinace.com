"use client";

import Link from "next/link";
import { Hero } from "@/components/marketing/sections/hero";
import {
  Compass,
  Footprints,
  Mountain,
  ShieldCheck,
  Award,
  HeartHandshake,
  Clock,
  ArrowRight,
} from "lucide-react";
import { initialTreksData } from "@/lib/trek-data";

export default function Home() {
  return (
    <div className="bg-[#fafaf9] text-slate-900">
      {/* Video Hero */}
      <Hero />

      {/* Trust & Safety Highlights Bar */}
      <section className="bg-white border-y border-slate-200 py-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 text-slate-900">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0 border border-amber-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">100% Certified Guides</h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">IFMGA &amp; NMA licensed Sherpa summit leaders.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0 border border-amber-200">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Luxury Boutique Lodges</h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">Handpicked premium stays with heated beds.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0 border border-amber-200">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Small Group Ratios</h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">Max 8 trekkers for maximum safety and care.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0 border border-amber-200">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Government Registered</h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">Official Nepal Tourism Board license #34981.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Trekking Packages Section */}
      <section className="py-16 px-6 md:px-10 max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider">
              <Footprints className="w-4 h-4 text-amber-600" />
              <span>Himalayan Expeditions</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              Featured Trekking Routes
            </h2>
            <p className="text-xs md:text-sm text-slate-600 font-medium max-w-xl">
              Curated itineraries across Everest, Annapurna, and Manaslu combining traditional Sherpa hospitality and safety.
            </p>
          </div>

          <Link href="/trekking">
            <button className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shrink-0 cursor-pointer shadow-xs">
              <span>View All Routes</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </Link>
        </div>

        {/* 3 Featured Trek Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {initialTreksData.slice(0, 3).map((trk) => (
            <div
              key={trk.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all"
            >
              <div>
                <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                  <img
                    src={trk.image}
                    alt={trk.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {trk.region}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-amber-700 transition-colors">
                    {trk.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2">
                    {trk.shortDesc}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{trk.durationDays} Days</span>
                    </span>
                    <span className="text-slate-900 font-bold">
                      ${trk.priceUSD.toLocaleString()} USD
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link href="/trekking" className="block">
                  <button className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                    <span>Explore Itinerary</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Regional Exploration Cards */}
      <section className="bg-white border-t border-slate-200 py-16 px-6 md:px-10">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              Explore By Himalayan Region
            </h2>
            <p className="text-xs md:text-sm text-slate-600 font-medium">
              Each valley in Nepal offers a distinct landscape, culture, and mountain elevation profile.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                region: "Everest Region",
                peaks: "Mt. Everest (8,848m), Ama Dablam",
                desc: "Iconic Sherpa capital of Namche Bazaar, Kala Patthar, and turquoise Gokyo Lakes.",
                image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
              },
              {
                region: "Annapurna Region",
                peaks: "Annapurna I, Machhapuchhre (Fishtail)",
                desc: "Diverse climates from subtropical forests to Thorong La high alpine pass.",
                image: "https://images.unsplash.com/photo-1585409677983-0f6c41ca913b?auto=format&fit=crop&w=600&q=80",
              },
              {
                region: "Langtang Region",
                peaks: "Langtang Lirung (7,227m)",
                desc: "Pristine mountain valley close to Kathmandu with Tamang culture & sacred lakes.",
                image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
              },
              {
                region: "Manaslu Region",
                peaks: "Mt. Manaslu (8,163m)",
                desc: "Restricted wilderness trek around the world's 8th highest peak.",
                image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80",
              },
            ].map((reg, idx) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden space-y-3 group hover:border-slate-300 transition-all p-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-36 w-full rounded-xl overflow-hidden bg-slate-200">
                    <img src={reg.image} alt={reg.region} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{reg.region}</h3>
                    <p className="text-[10px] font-semibold text-amber-700 mt-0.5">{reg.peaks}</p>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">{reg.desc}</p>
                  </div>
                </div>

                <Link href="/trekking">
                  <span className="text-xs font-bold text-slate-900 hover:text-amber-700 flex items-center gap-1 transition-colors pt-2">
                    <span>Explore Routes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tailor Made Expedition Footer Card */}
      <section className="py-16 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border border-slate-800 shadow-xl">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 text-amber-400 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Mountain className="w-3.5 h-3.5" />
              <span>Tailor-Made Trekking Expeditions</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
              Ready to Plan Your Himalayan Journey?
            </h2>
            <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed">
              Our licensed Sherpa team will craft a custom itinerary around your timeframe, fitness level, and preferred mountain region.
            </p>
          </div>

          <Link href="/contact" className="shrink-0">
            <button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider px-7 py-4 rounded-xl cursor-pointer transition-colors shadow-lg flex items-center gap-2">
              <span>Start Planning</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
