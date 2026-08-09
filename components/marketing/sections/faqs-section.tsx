"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { COMPANY_FAQS } from "@/lib/home-data";

export function FaqsSection() {
  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  return (
    <section className="py-24 bg-white border-b border-stone-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-2">
          <span className="text-amber-700 text-sm font-medium block">
            Have Questions?
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-zinc-900">
            Pre-Trip Consultations
          </h2>
          <p className="text-zinc-700 text-sm font-normal leading-relaxed">
            Clear answers regarding safety, bookings, high-altitude preparation, and expedition compliance.
          </p>
        </div>

        <div className="space-y-4">
          {COMPANY_FAQS.map((faq) => {
            const isOpen = activeFaq === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-stone-50/80 border border-stone-200 rounded-xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-100/60 transition-colors"
                >
                  <span className="font-heading text-sm sm:text-base font-bold text-zinc-900">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-amber-700 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-96 border-t border-stone-200" : "max-h-0"
                  }`}
                >
                  <div className="p-6 pt-4 text-zinc-700 text-xs sm:text-sm leading-relaxed font-normal bg-white">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
