"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { adminTestimonialsApi, SettingService, TestimonialItem } from "@/lib/services/admin-service";
import { Testimonial } from "@/lib/home-data";

export function TestimonialsSection() {
  const [items, setItems] = useState<(Testimonial | TestimonialItem)[]>([]);

  // Autoplay plugin configuration for automatic horizontal movement
  const autoplay = useRef(
    Autoplay({ delay: 4200, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
      containScroll: "trimSnaps",
    },
    [autoplay.current]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    let isMounted = true;
    async function loadTestimonials() {
      try {
        const fetched = await adminTestimonialsApi.getPublicAll({ status: "active" });
        if (fetched && fetched.length > 0) {
          if (isMounted) setItems(fetched);
          return;
        }

        const settings = await SettingService.getPublicAll();
        if (settings && settings.testimonials) {
          const parsed = JSON.parse(settings.testimonials);
          if (Array.isArray(parsed) && parsed.length > 0) {
            if (isMounted) setItems(parsed);
          }
        }
      } catch (e) {
        console.warn("Failed to load testimonials from backend:", e);
      }
    }
    loadTestimonials();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
    }
  }, [items, emblaApi]);

  if (items.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-stone-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-8 space-y-1 pb-6 border-b border-stone-200">
          <span className="text-amber-700 text-xs font-semibold uppercase tracking-wider block">
            Testimonials
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Trekker Experiences &amp; Reviews
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="relative group/carousel pt-2">
          {/* Navigation Arrows (Only if more than 1 item) */}
          {items.length > 1 && (
            <>
              <button
                onClick={scrollPrev}
                aria-label="Previous Testimonial"
                className="hidden md:flex absolute -left-4 top-1/2 z-20 w-10 h-10 rounded-sm bg-white/95 text-stone-900 border border-stone-200 shadow-sm items-center justify-center hover:bg-stone-900 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={scrollNext}
                aria-label="Next Testimonial"
                className="hidden md:flex absolute -right-4 top-1/2 z-20 w-10 h-10 rounded-sm bg-white/95 text-stone-900 border border-stone-200 shadow-sm items-center justify-center hover:bg-stone-900 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {items.length === 1 ? (
            /* Single Testimonial Item - Static Layout */
            <div className="max-w-md">
              {items.map((item, idx) => {
                const avatarUrl = (item as any).avatar || (item as any).image;
                return (
                  <div
                    key={`${item.id}-${idx}`}
                    className="bg-stone-50 rounded-sm border border-stone-200 p-6 flex flex-col justify-between"
                  >
                    <p className="text-stone-700 text-sm leading-relaxed font-normal">
                      &ldquo;{item.content}&rdquo;
                    </p>
                    <div className="pt-4 border-t border-stone-200 flex items-center justify-between mt-6">
                      <div className="flex items-center gap-3">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={item.author}
                            className="w-10 h-10 rounded-full object-cover border border-stone-300 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {item.author.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-heading text-xs font-bold text-stone-900">
                            {item.author}
                          </h3>
                          <p className="text-[11px] text-stone-500">
                            {item.country || "Himalayan Trekker"}
                          </p>
                        </div>
                      </div>
                      {item.tripName && (
                        <span className="text-xs font-medium text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200/80 shrink-0">
                          {item.tripName}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Multiple Testimonials - Automatic Horizontal Embla Carousel */
            <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
              <div className="flex gap-6">
                {items.map((item, idx) => {
                  const avatarUrl = (item as any).avatar || (item as any).image;

                  return (
                    <div
                      key={`${item.id}-${idx}`}
                      className="flex-[0_0_88%] sm:flex-[0_0_46%] lg:flex-[0_0_31.5%] min-w-0"
                    >
                      <div className="bg-stone-50 rounded-sm border border-stone-200 p-6 flex flex-col justify-between h-full">
                        <div className="space-y-4">
                          <p className="text-stone-700 text-sm leading-relaxed font-normal">
                            &ldquo;{item.content}&rdquo;
                          </p>
                        </div>

                        <div className="pt-4 border-t border-stone-200 flex items-center justify-between mt-6">
                          <div className="flex items-center gap-3">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={item.author}
                                className="w-10 h-10 rounded-full object-cover border border-stone-300 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-xs shrink-0">
                                {item.author.charAt(0)}
                              </div>
                            )}
                            <div>
                              <h3 className="font-heading text-xs font-bold text-stone-900">
                                {item.author}
                              </h3>
                              <p className="text-[11px] text-stone-500">
                                {item.country || "Himalayan Trekker"}
                              </p>
                            </div>
                          </div>

                          {item.tripName && (
                            <span className="text-xs font-medium text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200/80 shrink-0">
                              {item.tripName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
