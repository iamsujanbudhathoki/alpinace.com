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
  subtitle = "Essential details regarding preparation, route logistics, safety, and booking policies.",
}: PackageFaqsProps) {
  // First item open by default for immediate preview, null if collapsed
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="space-y-6 pb-6 sm:pb-10 font-sans">
      {/* Section Header */}
      <div className="pb-4 border-b border-stone-200">
        <span className="text-amber-800 text-xs font-semibold uppercase tracking-wider block">
          Trail Guidance &amp; Preparation
        </span>
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mt-1">
          {title}
        </h2>
        {subtitle && (
          <p className="text-stone-600 text-xs sm:text-sm font-normal leading-relaxed mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {/* Editorial Accordion List */}
      <div className="divide-y divide-stone-200 border-b border-stone-200">
        {faqs.map((f, idx) => {
          const isOpen = activeFaq === idx;
          const questionId = `faq-q-${idx}`;
          const answerId = `faq-a-${idx}`;

          return (
            <div key={f.id || idx} className="group">
              <button
                type="button"
                id={questionId}
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => setActiveFaq(isOpen ? null : idx)}
                className="w-full text-left flex items-start justify-between gap-4 py-3.5 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700/40 rounded-xs transition-colors"
              >
                <span
                  className={`font-heading text-sm sm:text-base font-bold leading-snug transition-colors pr-2 ${
                    isOpen
                      ? "text-amber-900"
                      : "text-stone-900 group-hover:text-amber-800"
                  }`}
                >
                  {f.question}
                </span>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 ${
                    isOpen
                      ? "bg-amber-100 text-amber-900 rotate-180"
                      : "bg-stone-100 text-stone-500 group-hover:bg-stone-200 group-hover:text-stone-800"
                  }`}
                >
                  <ChevronDown className="w-4 h-4 stroke-[2.2]" />
                </div>
              </button>

              <div
                id={answerId}
                role="region"
                aria-labelledby={questionId}
                className={`grid transition-[grid-template-rows,opacity] duration-250 ease-out ${
                  isOpen
                    ? "grid-rows-[1fr] opacity-100 pb-4"
                    : "grid-rows-[0fr] opacity-0 pb-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="text-stone-600 text-xs sm:text-[13px] leading-relaxed font-normal pr-6 sm:pr-8 space-y-2">
                    {typeof f.answer === "string" ? (
                      f.answer.split("\n\n").map((paragraph, pIdx) => (
                        <p key={pIdx}>{paragraph}</p>
                      ))
                    ) : (
                      <p>{f.answer}</p>
                    )}
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
