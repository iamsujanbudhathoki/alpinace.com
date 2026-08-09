"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const processSteps = [
  {
    id: "01",
    title: "Bespoke Consultation",
    subtitle: "Initial Discovery & Physical Readiness",
    desc: "Our expedition planners connect on a 1-on-1 private video call to assess your high-altitude experience, physical fitness goals, and travel preferences.",
    deliverables: [
      "Custom Altitude Readiness & Acclimatization Assessment",
      "Personalized Medical & Insurance Guidance",
      "Private Helicopter Transfer vs. Trekking Preference Mapping",
    ],
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200",
    ctaText: "Request Private Consultation",
    ctaLink: "/contact",
  },
  {
    id: "02",
    title: "Itinerary Architecture",
    subtitle: "Day-by-Day Custom Expedition Proposal",
    desc: "We engineer a tailor-made day-by-day itinerary tailored to your exact pace, pairing luxury mountain teahouses with private Sherpa guide allocations and permit approvals.",
    deliverables: [
      "Tailored Altitude Elevation Profile & Mandatory Rest Days",
      "Official Permit Pre-Approval (NTB, TIMS & National Parks)",
      "Bespoke Teahouse & Domestic Aviation Pre-Allocations",
    ],
    image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=1200",
    ctaText: "Explore Bespoke Itineraries",
    ctaLink: "/contact",
  },
  {
    id: "03",
    title: "Guided Preparation",
    subtitle: "Gear, Training & Safety Briefings",
    desc: "Access high-altitude training protocols, custom gear packing checklists, visa assistance, and pre-departure safety briefings with active Sherpa team leaders.",
    deliverables: [
      "Mountaineer-Tested Equipment & Packing Checklist",
      "High-Altitude Aerobic Training & Acclimatization Schedule",
      "24/7 Pre-Flight Concierge & Nepal Visa Support",
    ],
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200",
    ctaText: "View Preparation Guidelines",
    ctaLink: "/contact",
  },
  {
    id: "04",
    title: "Legendary Footsteps",
    subtitle: "Arrival in Kathmandu & Trail Execution",
    desc: "Touch down in Nepal for VIP airport pickup, five-star heritage stays, and step into the high Himalayas under the care of certified IFMGA Sherpa guides.",
    deliverables: [
      "VIP Airport Transfer & Kathmandu Heritage Hospitality",
      "Certified IFMGA Sherpa Trail Leadership & Satellite Comms",
      "24/7 Helicopter Rescue Readiness & Medical Safety Net",
    ],
    image: "https://images.unsplash.com/photo-1585016495481-91613a3ab1bc?q=80&w=1200",
    ctaText: "Begin Your Expedition",
    ctaLink: "/contact",
  },
];

export function TravelProcess() {
  const [activeStep, setActiveStep] = useState(0);
  const currentStep = processSteps[activeStep];

  return (
    <section className="py-24 bg-stone-50/80 border-b border-stone-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-amber-800 text-xs font-semibold uppercase tracking-widest block">
            How It Works
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900">
            Your Journey To The Sky
          </h2>
          <p className="text-zinc-600 text-sm font-normal leading-relaxed">
            From your initial consultation call to boarding your final helicopter, we engineer every step of your Himalayan expedition.
          </p>
        </div>

        {/* Interactive Step Selector Tabs (Clean Light Theme) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-2.5 rounded-2xl border border-stone-200">
          {processSteps.map((step, idx) => {
            const isActive = activeStep === idx;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className={`flex flex-col items-start p-4 rounded-xl transition-all duration-200 cursor-pointer text-left ${
                  isActive
                    ? "bg-amber-500 text-slate-950 font-bold border border-amber-400"
                    : "bg-white hover:bg-stone-50 text-zinc-700 border border-stone-200/60"
                }`}
              >
                <span
                  className={`font-heading text-xs font-extrabold mb-1 px-2 py-0.5 rounded ${
                    isActive ? "bg-slate-950 text-amber-400" : "bg-stone-100 text-zinc-600"
                  }`}
                >
                  Step {step.id}
                </span>
                <span className="font-heading text-xs sm:text-sm font-bold truncate w-full">
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Interactive Dynamic Display Panel */}
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch transition-all duration-300">
          
          {/* Left Detail Column */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60">
                    Phase {currentStep.id} Protocol
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">
                    {currentStep.subtitle}
                  </span>
                </div>
                <h3 className="font-heading text-2xl sm:text-3xl font-bold text-zinc-900 pt-1">
                  {currentStep.title}
                </h3>
              </div>

              <p className="text-zinc-600 text-sm leading-relaxed font-normal">
                {currentStep.desc}
              </p>

              {/* Deliverables Checklist */}
              <div className="space-y-3 pt-4 border-t border-stone-100">
                <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider block mb-2">
                  Key Phase Deliverables:
                </span>
                {currentStep.deliverables.map((item, dIdx) => (
                  <div key={dIdx} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-700">
                    <CheckCircle2 className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{item}</span>
                  </div>
                ))}
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-zinc-500 font-medium">
                Step {activeStep + 1} of 4 &bull; <strong className="text-zinc-800 font-semibold">{currentStep.title}</strong>
              </span>

              <Link
                href={currentStep.ctaLink}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-700 hover:bg-amber-800 text-white font-heading text-xs font-semibold px-6 py-3.5 rounded-xl transition-all cursor-pointer group active:scale-[0.99]"
              >
                <span>{currentStep.ctaText}</span>
                <ArrowRight className="h-4 w-4 text-amber-200 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>

          {/* Right Visual Image Card (Clean Light Overlay) */}
          <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-full bg-stone-100 overflow-hidden">
            <img
              src={currentStep.image}
              alt={currentStep.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span className="text-amber-300 text-xs font-semibold block">
                {currentStep.subtitle}
              </span>
              <p className="font-heading text-sm font-bold text-white">
                Step {currentStep.id}: {currentStep.title}
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
