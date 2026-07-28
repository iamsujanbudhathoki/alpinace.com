"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { COMPANY_FAQS } from "@/lib/home-data";

export function FaqsSection() {
  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  return (
    <section className="py-24 bg-white border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-2">
          <span className="text-gold-600 text-xs uppercase tracking-widest font-extrabold block">
            Have Questions?
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900">
            Pre-Trip Consultations
          </h2>
          <p className="text-slate-600 text-sm font-normal leading-relaxed">
            Clear answers regarding safety, bookings, high-altitude preparation, and expedition compliance.
          </p>
        </div>

        <div className="space-y-4">
          {COMPANY_FAQS.map((faq) => {
            const isOpen = activeFaq === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                >
                  <span className="font-heading text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <HelpCircle className="h-4.5 w-4.5 text-amber-600 shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-700 transition-transform duration-300 shrink-0 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    isOpen ? "max-h-96 border-t border-slate-200" : "max-h-0"
                  }`}
                >
                  <p className="p-6 text-slate-700 text-xs sm:text-sm leading-relaxed font-normal">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
