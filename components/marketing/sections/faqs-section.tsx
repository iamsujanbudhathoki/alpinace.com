"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { FaqService } from "@/lib/services/admin-service";
import { FaqItem, FaqStatus } from "@/lib/admin-data";

const DEFAULT_FAQS: FaqItem[] = [
  {
    id: "faq-1",
    question: "What permits are required for trekking in Nepal?",
    answer:
      "Most treks in Nepal require a TIMS (Trekker's Information Management System) card and specific Conservation Area or National Park Entry Permits (e.g., Sagarmatha National Park Permit for Everest, ACAP for Annapurna). Restricted regions like Upper Mustang or Manaslu require special limited permits. Alpine Ace manages all permit documentation for our guests prior to arrival.",
    category: "Permits & Logistics",
    status: FaqStatus.ACTIVE,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "faq-2",
    question: "How do you handle high altitude sickness and emergency evacuations?",
    answer:
      "Safety is our single highest priority. Our itineraries feature gradual ascent schedules and built-in acclimatization days. Guides are certified Wilderness First Aid responders equipped with pulse oximeters, emergency oxygen, and satellite communications. If acute altitude sickness occurs, we initiate prompt descent and helicopter evacuation, coordinated directly with your travel insurance.",
    category: "Safety & Medical",
    status: FaqStatus.ACTIVE,
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "faq-3",
    question: "What physical fitness level is required for high-altitude treks?",
    answer:
      "Moderate treks require a baseline of cardiovascular fitness achievable with regular hiking or jogging. High-altitude treks like Everest Base Camp or Annapurna Circuit require good endurance for walking 5–7 hours daily with a daypack. We recommend starting aerobic and leg-strengthening exercises 6–8 weeks before your trip.",
    category: "Preparation & Fitness",
    status: FaqStatus.ACTIVE,
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "faq-4",
    question: "What is included in the tea house accommodation and meals?",
    answer:
      "Teahouse accommodations provide twin-share rooms with clean beds, blankets, and communal dining areas heated by wood stoves. Meals are freshly cooked and include local staples like Dal Bhat, noodle soups, momos, porridge, eggs, and hot beverage choices.",
    category: "Accommodation & Meals",
    status: FaqStatus.ACTIVE,
    order: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "faq-5",
    question: "When is the best season for trekking in Nepal?",
    answer:
      "The prime trekking seasons are Autumn (September to November) and Spring (March to May). Autumn brings crisp, clear mountain skies and stable weather after the monsoons. Spring brings warmer temperatures and vibrant blooming rhododendron forests across the valleys.",
    category: "Best Seasons",
    status: FaqStatus.ACTIVE,
    order: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function FaqsSection() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  useEffect(() => {
    async function loadFaqs() {
      try {
        const liveFaqs = await FaqService.getPublicAll(FaqStatus.ACTIVE);
        const faqList = Array.isArray(liveFaqs)
          ? liveFaqs
          : Array.isArray((liveFaqs as any)?.items)
          ? (liveFaqs as any).items
          : [];

        if (faqList.length > 0) {
          setFaqs(faqList);
        } else {
          setFaqs(DEFAULT_FAQS);
        }
      } catch (err) {
        console.warn("Failed to load live FAQs from backend:", err);
        setFaqs(DEFAULT_FAQS);
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
          <span className="text-stone-500 text-xs font-medium uppercase tracking-wider block">
            Trail Guidance &amp; Preparation
          </span>
          <h2 className="font-heading text-2xl sm:text-4xl font-bold text-stone-900 tracking-tight leading-snug">
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
                className={`text-xs px-3 py-1.5 rounded-sm font-medium transition-colors cursor-pointer border ${
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
            <Loader2 className="w-4 h-4 animate-spin text-stone-600" />
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
                    className="w-full py-3.5 text-left flex items-start justify-between gap-4 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 rounded-xs transition-colors"
                  >
                    <span
                      className={`font-heading text-sm sm:text-base font-normal leading-snug transition-colors pr-2 ${
                        isOpen
                          ? "text-stone-900 font-medium"
                          : "text-stone-800 group-hover:text-stone-900"
                      }`}
                    >
                      {faq.question}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 ${
                        isOpen
                          ? "bg-stone-900 text-white rotate-180"
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

