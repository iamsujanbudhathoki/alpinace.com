"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const processSteps = [
  {
    step: "01",
    title: "Initial Consultation & Route Planning",
    desc: "Speak with our team in Kathmandu to review travel dates, physical fitness, high-altitude experience, and preferred Himalayan regions.",
  },
  {
    step: "02",
    title: "Custom Itinerary & Logistics Setup",
    desc: "We build your day-by-day itinerary with mandatory acclimatization days, secure national park permits, and reserve boutique lodge accommodations.",
  },
  {
    step: "03",
    title: "Pre-Departure Preparation",
    desc: "Receive guide-approved gear checklists, high-altitude conditioning advice, domestic flight mapping, and pre-departure briefings.",
  },
  {
    step: "04",
    title: "Kathmandu Welcome & Trail Start",
    desc: "Airport reception, boutique hotel stays in Kathmandu, pre-trek gear inspection, and complete leadership from certified Sherpa guides on the trail.",
  },
];

export function TravelProcess() {
  return (
    <section className="py-16 sm:py-20 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 border-b border-stone-200 pb-5">
          <div className="space-y-1">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              How We Plan Your Trek
            </h2>
            <p className="text-stone-600 text-sm font-normal">
              From your first inquiry to your first step on the mountain — permits, guides, lodges, and safety coordination.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-950 transition-colors group"
          >
            <span>Start a Consultation</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Clean 4-Step Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {processSteps.map((item) => (
            <div key={item.step} className="space-y-2.5">
              <span className="font-heading text-xs font-bold text-amber-800 tracking-wider">
                STEP {item.step}
              </span>
              <h3 className="font-heading text-base font-bold text-stone-900 leading-snug">
                {item.title}
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-normal">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
