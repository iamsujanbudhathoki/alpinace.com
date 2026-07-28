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

   
    </div>
  );
}
