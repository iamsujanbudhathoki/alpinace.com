"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { SettingService } from "@/lib/services/admin-service";
import { Testimonial } from "@/lib/home-data";

export function TestimonialsSection() {
  const [items, setItems] = useState<Testimonial[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadTestimonials() {
      try {
        const settings = await SettingService.getAll();
        if (settings && settings.testimonials) {
          const parsed = JSON.parse(settings.testimonials);
          if (Array.isArray(parsed) && parsed.length > 0) {
            if (isMounted) setItems(parsed);
          }
        }
      } catch (e) {
        console.warn("Failed to load testimonials from backend settings:", e);
      }
    }
    loadTestimonials();
    return () => {
      isMounted = false;
    };
  }, []);

  if (items.length === 0) return null;

  const marqueeItems = [...items, ...items, ...items];

  return (
    <section className="py-20 bg-white border-y border-stone-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 space-y-1.5">
        <span className="text-amber-700 text-xs font-semibold uppercase tracking-wider block">
          Client Reviews
        </span>
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-zinc-900">
          What travellers say
        </h2>
      </div>

      {/* Infinite Horizontal Slider */}
      <div className="relative w-full overflow-hidden">
        {/* Gradient Fade Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Sliding Track */}
        <div className="animate-marquee-track flex gap-5 px-4">
          {marqueeItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="w-[300px] sm:w-[360px] shrink-0 bg-stone-50 rounded-lg border border-stone-200 p-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Stars */}
                <div className="flex gap-0.5">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-zinc-700 text-sm leading-relaxed">
                  &ldquo;{item.content}&rdquo;
                </p>
              </div>

              {/* Guest Footer */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-between mt-4">
                <div className="flex items-center gap-2.5">
                  <img
                    src={item.avatar}
                    alt={item.author}
                    className="w-9 h-9 rounded-full object-cover border border-stone-200"
                  />
                  <div>
                    <h3 className="font-heading text-xs font-bold text-zinc-900 leading-none">
                      {item.author}
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">
                      {item.role} · {item.country}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-semibold text-zinc-600 bg-white px-2 py-1 rounded border border-stone-200">
                  {item.tripName.split(" ").slice(0, 2).join(" ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
