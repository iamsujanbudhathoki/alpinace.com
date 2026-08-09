"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Compass,
  MapPin,
  ShieldCheck,
  Mountain,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  PhoneCall,
} from "lucide-react";

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
    icon: PhoneCall,
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
    icon: Compass,
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
    icon: ShieldCheck,
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
    icon: Mountain,
  },
];

export function TravelProcess() {
  const [activeStep, setActiveStep] = useState(0);

  const currentStep = processSteps[activeStep];
  const IconComponent = currentStep.icon;

  return (
    <section className="py-24 bg-stone-50/70 border-b border-stone-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-amber-800 text-xs font-semibold uppercase tracking-widest block">
            How It Works
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900">
            Your Journey To The Sky
          </h2>
          <p className="text-zinc-600 text-sm font-normal leading-relaxed">
            From your initial consultation call to boarding your final helicopter, we engineer every step of your Himalayan expedition with precision.
          </p>
        </div>

        {/* Interactive Step Selector Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-2.5 rounded-2xl border border-stone-200">
          {processSteps.map((step, idx) => {
            const isActive = activeStep === idx;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className={`flex flex-col items-start p-4 rounded-xl transition-all duration-300 cursor-pointer text-left ${
                  isActive
                    ? "bg-zinc-900 text-white shadow-xs"
                    : "bg-stone-50/60 hover:bg-stone-100/80 text-zinc-700 border border-stone-200/50"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span
                    className={`font-heading text-xs font-extrabold px-2 py-0.5 rounded-md ${
                      isActive ? "bg-amber-400 text-zinc-950" : "bg-stone-200/70 text-zinc-800"
                    }`}
                  >
                    Phase {step.id}
                  </span>
                  {isActive && (
                    <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                  )}
                </div>
                <span className="font-heading text-xs sm:text-sm font-bold truncate w-full">
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Interactive Dynamic Display Panel */}
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch transition-all duration-500">
          
          {/* Left Detail Column */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-800 shrink-0">
                  <IconComponent className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider block">
                    Step {currentStep.id} Protocol
                  </span>
                  <h3 className="font-heading text-xl sm:text-2xl font-bold text-zinc-900">
                    {currentStep.title}
                  </h3>
                </div>
              </div>

              <p className="text-zinc-600 text-sm leading-relaxed font-normal">
                {currentStep.desc}
              </p>

              {/* Deliverables Checklist */}
              <div className="space-y-3 pt-2 border-t border-stone-100">
                <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider block mb-2">
                  Phase Deliverables:
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
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                <span>Phase {activeStep + 1} of 4</span>
                <span>&bull;</span>
                <span className="text-zinc-800 font-semibold">{currentStep.subtitle}</span>
              </div>

              <Link
                href={currentStep.ctaLink}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-heading text-xs font-semibold px-6 py-3 rounded-xl transition-all cursor-pointer group active:scale-[0.99]"
              >
                <span>{currentStep.ctaText}</span>
                <ArrowRight className="h-4 w-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>

          {/* Right Visual Image Card */}
          <div className="lg:col-span-5 relative min-h-[320px] lg:min-h-full bg-stone-100 overflow-hidden">
            <img
              src={currentStep.image}
              alt={currentStep.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transition-all duration-700 scale-105 hover:scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-zinc-950/20 to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider block">
                {currentStep.subtitle}
              </span>
              <p className="font-heading text-sm font-bold text-white drop-shadow-sm">
                Step {currentStep.id}: {currentStep.title}
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
