"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface FaqItemProp {
  id?: string;
  question: string;
  answer: string;
}

export interface PackageFaqsProps {
  faqs: FaqItemProp[];
  title?: string;
  subtitle?: string;
}

export function PackageFaqs({
  faqs,
  title = "Frequently Asked Questions",
  subtitle = "Key details regarding preparation, logistics, safety, and bookings",
}: PackageFaqsProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="space-y-6 pb-8 sm:pb-12">
      {/* Header */}
      <div className="pb-3 border-b border-stone-200">
        <h2 className="type-heading-xl">
          {title}
        </h2>
        {subtitle && (
          <p className="type-body-sm mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Editorial Accordion List */}
      <div className="divide-y divide-stone-200">
        {faqs.map((f, idx) => {
          const isOpen = activeFaq === idx;
          return (
            <div key={f.id || idx} className="py-3.5 first:pt-0 last:pb-0">
              <button
                type="button"
                onClick={() => setActiveFaq(isOpen ? null : idx)}
                className="w-full text-left flex items-center justify-between gap-3 py-0.5 cursor-pointer transition-colors group"
              >
                <span className="type-heading-md text-stone-900 group-hover:text-amber-800 transition-colors pr-2">
                  {f.question}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-stone-400 group-hover:text-stone-700 transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180 text-stone-700" : ""
                  }`}
                  strokeWidth={2}
                />
              </button>

              <div
                className={`grid transition-[grid-template-rows,opacity] duration-250 ease-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0 mt-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="pt-1.5 pb-1 type-body text-stone-700 leading-relaxed font-normal">
                    <p>{f.answer}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
