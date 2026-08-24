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

  return (
    <section className="py-16 sm:py-20 bg-stone-50/60 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 space-y-1">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Trekker Experiences
          </h2>
          <p className="text-stone-600 text-sm font-normal">
            Real feedback from travelers guided on Himalayan routes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.slice(0, 3).map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="bg-white rounded-sm border border-stone-200 p-6 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex gap-0.5">
                  {[...Array(item.rating || 5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-stone-700 text-sm leading-relaxed font-normal">
                  &ldquo;{item.content}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                  {item.avatar ? (
                    <img
                      src={item.avatar}
                      alt={item.author}
                      className="w-9 h-9 rounded-full object-cover border border-stone-200"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-xs">
                      {item.author.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-heading text-xs font-bold text-stone-900">
                      {item.author}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {item.country || "Trekker"}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-amber-800">
                  {item.tripName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
