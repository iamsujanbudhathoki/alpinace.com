"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PackageSection } from "./package-section";

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
}: PackageFaqsProps) {
  const validFaqs = (faqs || []).filter(
    (f) => Boolean(f && (f.question?.trim() || (typeof f.answer === "string" ? f.answer.trim() : f.answer)))
  );

  // Set of open FAQ indices, defaulting to first item open
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set([0]));

  if (validFaqs.length === 0) return null;

  const isAllExpanded = openFaqs.size === validFaqs.length;

  const toggleAll = () => {
    if (isAllExpanded) {
      setOpenFaqs(new Set());
    } else {
      setOpenFaqs(new Set(validFaqs.map((_, idx) => idx)));
    }
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqs((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  return (
    <PackageSection
      title={title}
      action={
        validFaqs.length > 1 ? (
          <button
            type="button"
            onClick={toggleAll}
            className="btn-secondary py-1.5 px-3 min-h-[36px] text-xs font-semibold"
          >
            <span>{isAllExpanded ? "Collapse all" : "Expand all"}</span>
          </button>
        ) : undefined
      }
    >
      {/* Editorial Accordion List */}
      <div className="divide-y divide-stone-200 border-t border-b border-stone-200">
        {validFaqs.map((f, idx) => {
          const isOpen = openFaqs.has(idx);
          const questionId = `faq-q-${idx}`;
          const answerId = `faq-a-${idx}`;

          return (
            <div key={f.id || idx} className="group">
              <button
                type="button"
                id={questionId}
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => toggleFaq(idx)}
                className="w-full text-left flex items-start justify-between gap-4 py-3.5 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900/40 rounded-xs transition-colors"
              >
                <span
                  className={`text-sm sm:text-base font-medium leading-snug transition-colors pr-2 ${
                    isOpen
                      ? "text-stone-950 font-semibold"
                      : "text-stone-800 group-hover:text-stone-950"
                  }`}
                >
                  {f.question}
                </span>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 ${
                    isOpen
                      ? "bg-stone-900 text-white rotate-180"
                      : "bg-stone-100 text-stone-500 group-hover:bg-stone-200 group-hover:text-stone-800"
                  }`}
                >
                  <ChevronDown className="w-4 h-4 stroke-[2]" />
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
    </PackageSection>
  );
}
