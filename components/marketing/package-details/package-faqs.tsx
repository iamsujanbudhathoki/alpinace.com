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
  subtitle = "Key details regarding preparation, permits, safety, and bookings",
}: PackageFaqsProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-[#1E2420]">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-[#6B726C] mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="space-y-3">
        {faqs.map((f, idx) => {
          const isOpen = activeFaq === idx;
          return (
            <div
              key={f.id || idx}
              className="border border-[#EAE5DC] rounded-xl overflow-hidden bg-white shadow-2xs"
            >
              <button
                onClick={() => setActiveFaq(isOpen ? null : idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#FAF8F5] transition-colors"
              >
                <span className="font-heading text-sm sm:text-base font-semibold text-[#1E2420]">
                  {f.question}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-[#6B726C] transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180 text-[#2D4536]" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-sm text-[#3A423C] border-t border-[#F0EBE1] bg-[#FCFAF7] leading-relaxed">
                  <p>{f.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
