"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, CheckCircle2, ChevronRight } from "lucide-react";

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

  const handleNext = () => {
    setActiveStep((prev) => (prev < processSteps.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setActiveStep((prev) => (prev > 0 ? prev - 1 : processSteps.length - 1));
  };

  return (
    <section className="py-24 bg-stone-50/70 border-b border-stone-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-amber-800 text-xs font-semibold block">
            How It Works
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-900">
            Your Journey To The Sky
          </h2>
          <p className="text-zinc-600 text-sm font-normal leading-relaxed">
            From your initial consultation call to boarding your final helicopter, we engineer every step of your Himalayan expedition.
          </p>
        </div>

        {/* Timeline Stepper Nodes */}
        <div className="relative">
          {/* Connector Bar */}
          <div className="hidden md:block absolute top-5 left-12 right-12 h-0.5 bg-stone-200 -z-0" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            {processSteps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(idx)}
                  className="flex flex-col items-center text-center group cursor-pointer"
                >
                  {/* Step Node Circle */}
                  <div
                    className={`w-10 h-10 rounded-full font-heading text-xs font-semibold flex items-center justify-center transition-all duration-200 mb-3 ${
                      isActive
                        ? "bg-amber-800 text-white ring-4 ring-amber-100 border-2 border-amber-800 scale-110"
                        : "bg-white text-zinc-600 border-2 border-stone-300 group-hover:border-amber-600 group-hover:text-amber-800"
                    }`}
                  >
                    {step.id}
                  </div>
                  
                  {/* Step Title Label */}
                  <span
                    className={`font-heading text-xs sm:text-sm transition-colors ${
                      isActive
                        ? "font-semibold text-zinc-900"
                        : "font-medium text-zinc-500 group-hover:text-zinc-800"
                    }`}
                  >
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Step Detail Display Card */}
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Details */}
          <div className="lg:col-span-7 space-y-8 flex flex-col justify-between min-h-[380px]">
            
            <div className="space-y-6">
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60">
                    Step {currentStep.id} of 04
                  </span>
                  <span className="text-xs text-zinc-500 font-normal">
                    {currentStep.subtitle}
                  </span>
                </div>
                <h3 className="font-heading text-2xl sm:text-4xl font-semibold text-zinc-900 pt-1">
                  {currentStep.title}
                </h3>
              </div>

              <p className="text-zinc-600 text-sm sm:text-base leading-relaxed font-normal">
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

            {/* Controls & Action Buttons */}
            <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Previous / Next Stepper Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200/70 border border-stone-200 flex items-center justify-center text-zinc-700 transition-colors cursor-pointer"
                  title="Previous Step"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200/70 border border-stone-200 flex items-center justify-center text-zinc-700 transition-colors cursor-pointer"
                  title="Next Step"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
                <span className="text-xs text-zinc-500 font-medium ml-2">
                  {activeStep + 1} / {processSteps.length}
                </span>
              </div>

              {/* Primary CTA */}
              <Link
                href={currentStep.ctaLink}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-800 hover:bg-amber-900 text-white font-heading text-xs font-semibold px-6 py-3.5 rounded-xl transition-all cursor-pointer group active:scale-[0.99]"
              >
                <span>{currentStep.ctaText}</span>
                <ChevronRight className="h-4 w-4 text-amber-200 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>

          {/* Right Image Showcase */}
          <div className="lg:col-span-5 relative aspect-4/3 sm:aspect-16/10 lg:aspect-square rounded-2xl overflow-hidden border border-stone-200 bg-stone-100">
            <img
              src={currentStep.image}
              alt={currentStep.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white">
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
