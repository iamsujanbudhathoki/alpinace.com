"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const processSteps = [
  {
    id: "01",
    title: "1-on-1 Consultation",
    subtitle: "Initial Discovery & Physical Readiness",
    desc: "Connect on a private video call with our expedition team in Kathmandu to review your physical fitness goals, travel dates, and high-altitude aspirations.",
    deliverables: [
      "Altitude Readiness & Acclimatization Assessment",
      "Personalized Medical & Rescue Insurance Guidance",
      "Domestic Flight & Helicopter Transport Mapping",
    ],
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200",
    ctaText: "Schedule Consultation Call",
    ctaLink: "/contact",
  },
  {
    id: "02",
    title: "Custom Itinerary Design",
    subtitle: "Day-by-Day Route & Lodge Selection",
    desc: "We design a tailor-made day-by-day itinerary around your preferred trekking pace, pairing premium teahouses with dedicated Sherpa guide allocations.",
    deliverables: [
      "Tailored Elevation Profiles & Mandatory Rest Days",
      "Official Trekking Permit Approvals (NTB, TIMS & National Parks)",
      "Reserved Teahouse Accommodations & Flight Seats",
    ],
    image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=1200",
    ctaText: "Explore Custom Itineraries",
    ctaLink: "/contact",
  },
  {
    id: "03",
    title: "Gear & Fitness Readiness",
    subtitle: "Equipment Checklists & Preparation",
    desc: "Receive mountaineer-approved gear checklists, aerobic conditioning plans, visa advice, and pre-departure briefings directly from our lead Sherpa guides.",
    deliverables: [
      "Trail-Tested Equipment & Packing Checklist",
      "High-Altitude Physical Preparation Plan",
      "Nepal Visa Assistance & Pre-Flight Briefing",
    ],
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200",
    ctaText: "View Preparation Advice",
    ctaLink: "/contact",
  },
  {
    id: "04",
    title: "Arrival & Trail Execution",
    subtitle: "Kathmandu Welcome & Expedition Start",
    desc: "Touch down in Kathmandu for VIP airport reception, boutique hotel stays, and step onto the trail supported by certified Sherpa guide leaders.",
    deliverables: [
      "VIP Airport Transfers & Kathmandu Boutique Stays",
      "Certified IFMGA Sherpa Guide Leadership & Comms",
      "Emergency Helicopter Rescue Readiness on Standby",
    ],
    image: "https://images.unsplash.com/photo-1585016495481-91613a3ab1bc?q=80&w=1200",
    ctaText: "Start Your Expedition",
    ctaLink: "/contact",
  },
];

export function TravelProcess() {
  const [activeStep, setActiveStep] = useState(0);
  const currentStep = processSteps[activeStep];

  return (
    <section className="py-20 bg-stone-50/70 border-b border-stone-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2.5">
          <span className="text-amber-800 text-xs font-semibold block">
            How It Works
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900">
            Your Journey To The Sky
          </h2>
          <p className="text-zinc-600 text-sm font-normal leading-relaxed">
            From your initial consultation call to boarding your final helicopter, we engineer every step of your Himalayan expedition.
          </p>
        </div>

        {/* Interactive Step Selector Tabs (Stable 2px Borders) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-stone-100/80 p-2.5 rounded-2xl border border-stone-200">
          {processSteps.map((step, idx) => {
            const isActive = activeStep === idx;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-150 cursor-pointer text-left box-border ${
                  isActive
                    ? "bg-white text-zinc-900 border-amber-700/80 shadow-xs"
                    : "bg-white/70 hover:bg-white text-zinc-600 border-stone-200/70"
                }`}
              >
                <span
                  className={`font-heading text-xs font-medium mb-1.5 px-2 py-0.5 rounded ${
                    isActive ? "bg-amber-100 text-amber-900 font-semibold" : "bg-stone-200/80 text-zinc-600"
                  }`}
                >
                  Step {step.id}
                </span>
                <span className="font-heading text-xs sm:text-sm font-medium truncate w-full">
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Interactive Dynamic Display Panel */}
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          
          {/* Left Detail Column */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-8 min-h-[400px]">
            <div className="space-y-6">
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60">
                    Step {currentStep.id} Overview
                  </span>
                  <span className="text-xs text-zinc-500 font-normal">
                    {currentStep.subtitle}
                  </span>
                </div>
                <h3 className="font-heading text-2xl sm:text-3xl font-semibold text-zinc-900 pt-1">
                  {currentStep.title}
                </h3>
              </div>

              <p className="text-zinc-600 text-sm leading-relaxed font-normal">
                {currentStep.desc}
              </p>

              {/* Deliverables Checklist */}
              <div className="space-y-3 pt-4 border-t border-stone-100">
                <span className="text-xs font-semibold text-zinc-900 block mb-2">
                  What We Handle In This Step:
                </span>
                {currentStep.deliverables.map((item, dIdx) => (
                  <div key={dIdx} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-700">
                    <CheckCircle2 className="h-4.5 w-4.5 text-amber-700 shrink-0 mt-0.5" />
                    <span className="leading-snug font-normal">{item}</span>
                  </div>
                ))}
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-zinc-500 font-normal">
                Step {activeStep + 1} of 4 &bull; <strong className="text-zinc-800 font-medium">{currentStep.title}</strong>
              </span>

              <Link
                href={currentStep.ctaLink}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-heading text-xs font-medium px-6 py-3 rounded-xl transition-all cursor-pointer group active:scale-[0.99]"
              >
                <span>{currentStep.ctaText}</span>
                <ArrowRight className="h-4 w-4 text-stone-300 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>

          {/* Right Visual Image Card */}
          <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-full bg-stone-100 overflow-hidden">
            <img
              src={currentStep.image}
              alt={currentStep.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span className="text-amber-200 text-xs font-normal block">
                {currentStep.subtitle}
              </span>
              <p className="font-heading text-sm font-semibold text-white">
                Step {currentStep.id}: {currentStep.title}
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
