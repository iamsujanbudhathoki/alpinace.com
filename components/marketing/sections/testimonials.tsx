"use client";

import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote, ShieldCheck } from "lucide-react";
import { TESTIMONIALS } from "@/lib/home-data";

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeTestimonial = TESTIMONIALS[activeIndex];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <section className="py-24 bg-[#fafaf8] border-y border-slate-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-gold-600 text-xs uppercase tracking-widest font-extrabold block">
              Pioneer Experiences
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900">
              Stories from High Altitudes
            </h2>
            <p className="text-slate-600 text-sm font-normal max-w-xl">
              Hear directly from explorers who traversed the Himalayas with our multi-summit Sherpa team.
            </p>
          </div>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-3 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white transition-all shadow-xs cursor-pointer"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-3 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white transition-all shadow-xs cursor-pointer"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Featured Showcase Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Quote text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-1 text-gold-500">
                {[...Array(activeTestimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold-500 text-gold-500" />
                ))}
              </div>

              <div className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Expedition</span>
              </div>
            </div>

            <div className="relative">
              <Quote className="w-10 h-10 text-slate-200 absolute -top-4 -left-3 -z-10" />
              <p className="text-slate-800 text-base md:text-lg font-medium leading-relaxed italic relative z-10">
                &ldquo;{activeTestimonial.content}&rdquo;
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900">
                  {activeTestimonial.author}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {activeTestimonial.role} &bull; {activeTestimonial.country}
                </p>
              </div>

              <span className="text-xs font-bold text-gold-600 bg-gold-100 px-3 py-1 rounded-lg">
                {activeTestimonial.tripName}
              </span>
            </div>
          </div>

          {/* Right Column: Explorer Avatar & Stats Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm aspect-4/3">
              <img
                src={activeTestimonial.avatar}
                alt={activeTestimonial.author}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-5 text-white">
                <div>
                  <div className="text-xs font-bold text-amber-300">
                    ★ 5.0 Explorer Review
                  </div>
                  <div className="text-sm font-bold">{activeTestimonial.author}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Tab Selectors */}
        <div className="flex flex-wrap justify-center gap-3">
          {TESTIMONIALS.map((t, idx) => (
            <button
              key={t.id}
              onClick={() => setActiveIndex(idx)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                activeIndex === idx
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {t.author} ({t.tripName.split(" ")[0]})
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
