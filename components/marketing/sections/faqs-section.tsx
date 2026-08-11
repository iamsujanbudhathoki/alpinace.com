"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronDown, HelpCircle, Loader2 } from "lucide-react";
import { FaqService } from "@/lib/services/admin-service";
import { FaqItem, FaqStatus } from "@/lib/admin-data";
import { COMPANY_FAQS } from "@/lib/home-data";

export function FaqsSection() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  useEffect(() => {
    async function loadFaqs() {
      try {
        const liveFaqs = await FaqService.getAll(FaqStatus.ACTIVE);
        if (liveFaqs && liveFaqs.length > 0) {
          setFaqs(liveFaqs);
        } else {
          // Fallback to initial seed items
          setFaqs(
            COMPANY_FAQS.map((f, i) => ({
              id: f.id,
              question: f.question,
              answer: f.answer,
              category: "General",
              status: FaqStatus.ACTIVE,
              order: i + 1,
            }))
          );
        }
      } catch (err) {
        console.warn("Failed to load live FAQs, using initial data:", err);
        setFaqs(
          COMPANY_FAQS.map((f, i) => ({
            id: f.id,
            question: f.question,
            answer: f.answer,
            category: "General",
            status: FaqStatus.ACTIVE,
            order: i + 1,
          }))
        );
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

  return (
    <section className="py-24 bg-white border-b border-stone-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-3">
          <span className="text-amber-700 text-sm font-medium block">
            Have Questions?
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-zinc-900">
            Pre-Trip Consultations
          </h2>
          <p className="text-zinc-700 text-sm font-normal leading-relaxed max-w-xl mx-auto">
            Clear answers regarding safety protocols, permits, high-altitude preparation, and expedition compliance.
          </p>
        </div>

        {/* Category Pills (if more than 1 category exists) */}
        {categories.length > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-4 py-2 rounded-full font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-stone-100 text-slate-700 hover:bg-stone-200/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-stone-500">
            <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            <span className="text-xs font-medium">Loading consultations...</span>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200 text-stone-500 text-xs">
            No consultations found in this category.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq) => {
              const isOpen = activeFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-stone-50/80 border border-stone-200 rounded-2xl overflow-hidden transition-all duration-300 shadow-xs hover:border-amber-200/80"
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
        )}
      </div>
    </section>
  );
}
