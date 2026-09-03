"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { FaqService } from "@/lib/services/admin-service";
import { FaqItem, FaqStatus } from "@/lib/admin-data";

export function FaqsSection() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  useEffect(() => {
    async function loadFaqs() {
      try {
        const liveFaqs = await FaqService.getPublicAll(FaqStatus.ACTIVE);
        if (liveFaqs && Array.isArray(liveFaqs)) {
          setFaqs(liveFaqs);
        }
      } catch (err) {
        console.warn("Failed to load live FAQs from backend:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFaqs();
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(faqs.map((f) => f.category).filter(Boolean)));
    return cats.length > 1 ? ["All", ...cats] : [];
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    if (selectedCategory === "All") return faqs;
    return faqs.filter((f) => f.category === selectedCategory);
  }, [faqs, selectedCategory]);

  const toggleFaq = (id: string) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  if (!loading && faqs.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-stone-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 space-y-1 pb-6 border-b border-stone-200">
          <span className="text-amber-700 text-xs font-bold uppercase tracking-wider block">
            Trail Guidance &amp; Preparation
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-stone-600 text-sm font-normal pt-1">
            Direct answers on high-altitude safety, permit processing, guide credentials, and packing.
          </p>
        </div>

        {/* Category Trigger Buttons */}
        {categories.length > 1 && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-sm font-semibold transition-colors cursor-pointer border ${
                  selectedCategory === cat
                    ? "bg-stone-900 text-white border-stone-900"
                    : "bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-300 hover:text-stone-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-stone-500">
            <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
            <span className="text-xs">Loading questions…</span>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-12 text-stone-500 text-xs">
            No questions found in this category.
          </div>
        ) : (
          <div className="divide-y divide-stone-200 border-t border-b border-stone-200">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = activeFaq === faq.id;
              const questionId = `sec-faq-q-${idx}`;
              const answerId = `sec-faq-a-${idx}`;

              return (
                <div key={faq.id} className="group">
                  <button
                    type="button"
                    id={questionId}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full py-3.5 text-left flex items-start justify-between gap-4 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700/40 rounded-xs transition-colors"
                  >
                    <span
                      className={`font-heading text-sm sm:text-base font-bold leading-snug transition-colors pr-2 ${
                        isOpen
                          ? "text-amber-900"
                          : "text-stone-900 group-hover:text-amber-800"
                      }`}
                    >
                      {faq.question}
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
                        {typeof faq.answer === "string" ? (
                          faq.answer.split("\n\n").map((paragraph, pIdx) => (
                            <p key={pIdx}>{paragraph}</p>
                          ))
                        ) : (
                          <p>{faq.answer}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

