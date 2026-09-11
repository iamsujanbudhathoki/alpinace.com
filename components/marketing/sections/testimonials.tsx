"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { ChevronLeft, ChevronRight, Star, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { adminTestimonialsApi, SettingService, TestimonialItem } from "@/lib/services/admin-service";
import { Testimonial } from "@/lib/home-data";

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "default-1",
    author: "Wannapa E.",
    role: "Adventurer",
    country: "United States",
    tripName: "Everest Base Camp Trek",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    content: "Very professional company from start to finish. Everything was well organized, and they were extremely helpful with everything along the way. Our guide, Ram, and porters were absolute lifesavers at high altitude!",
  },
  {
    id: "default-2",
    author: "Marcus Vance",
    role: "Trekker",
    country: "United Kingdom",
    tripName: "Annapurna Circuit Trek",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    content: "AlpineAce made our dream trek seamlessly comfortable and completely safe. The tea house selection was great, and the 1:1 attention from our Sherpa guide gave us total confidence over Thorong La Pass.",
  },
  {
    id: "default-3",
    author: "Elena Rostova",
    role: "Mountaineer",
    country: "Germany",
    tripName: "Mera Peak Expedition",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    content: "Climbing Mera Peak with AlpineAce was flawless. High altitude gear, satellite communication, fixed ropes, and chef team at base camp were top notch. Could not recommend them more!",
  },
  {
    id: "default-4",
    author: "David & Sarah Miller",
    role: "Explorers",
    country: "Australia",
    tripName: "Langtang Valley Trek",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    content: "From our first inquiry down to Kathmandu hotel drop-offs, the attention to detail was top tier. Warm local Sherpa hospitality, clear communication, and incredible mountain vistas throughout.",
  },
];

function getReviewHeadline(content: string, tripName?: string): string {
  if (!content) return tripName ? `Unforgettable ${tripName}` : "Exceptional Himalayan Journey";
  const cleaned = content.replace(/^["“']|["”']$/g, "").trim();
  const firstSentence = cleaned.split(/[.!?]/)[0].trim();
  if (firstSentence.length >= 12 && firstSentence.length <= 70) {
    return firstSentence;
  }
  return tripName ? `Outstanding ${tripName}` : "Very professional company with excellent guides";
}

export function TestimonialsSection() {
  const [items, setItems] = useState<(Testimonial | TestimonialItem)[]>(DEFAULT_TESTIMONIALS);

  // Continuous infinite auto scroll configuration
  const autoScroll = useRef(
    AutoScroll({ speed: 1.1, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
    },
    [autoScroll.current]
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
        const list = Array.isArray(fetched)
          ? fetched
          : Array.isArray((fetched as any)?.items)
          ? (fetched as any).items
          : [];

        if (list.length > 0) {
          if (isMounted) setItems(list);
          return;
        }

        const settings = await SettingService.getPublicAll();
        if (settings && settings.testimonials) {
          try {
            const parsed = JSON.parse(settings.testimonials);
            if (Array.isArray(parsed) && parsed.length > 0) {
              if (isMounted) setItems(parsed);
            }
          } catch (e) {
            // Ignore parse error
          }
        }
      } catch (e) {
        console.warn("Failed to load testimonials from backend, using standard showcase data:", e);
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

  // Ensure sufficient item sequence for seamless infinite loop scrolling
  const displayItems =
    items.length > 0 && items.length < 10
      ? [...items, ...items, ...items]
      : items;

  return (
    <section className="py-16 sm:py-20 bg-stone-50/70 border-b border-stone-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header with Rating Summary Bar */}
        <div className="text-center mb-10 space-y-3 max-w-3xl mx-auto">
          {/* Tripadvisor / Verified Rating Pill */}
          <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-stone-200 shadow-2xs text-xs">
            <div className="flex items-center gap-0.5 text-accent">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
              ))}
            </div>
            <span className="font-bold text-stone-900">4.9 / 5.0</span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-600 font-medium">840+ Traveler Reviews</span>
          </div>

          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 tracking-tight">
            What Our Travelers Say
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="relative group/carousel pt-2">
          {/* Navigation Arrows */}
          {displayItems.length > 1 && (
            <>
              <button
                onClick={scrollPrev}
                aria-label="Previous Testimonial"
                className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white text-stone-900 border border-stone-200/90 shadow-md items-center justify-center hover:bg-stone-950 hover:text-white hover:border-stone-950 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={scrollNext}
                aria-label="Next Testimonial"
                className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white text-stone-900 border border-stone-200/90 shadow-md items-center justify-center hover:bg-stone-950 hover:text-white hover:border-stone-950 transition-all cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Multiple Testimonials - Automatic Horizontal Embla Carousel */}
          <div className="overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y" ref={emblaRef}>
            <div className="flex -ml-6">
              {displayItems.map((item, idx) => {
                const avatarUrl = (item as any).avatar || (item as any).image;
                const headline = (item as any).title || getReviewHeadline(item.content, item.tripName);

                return (
                  <div
                    key={`${item.id}-${idx}`}
                    className="flex-[0_0_90%] sm:flex-[0_0_48%] lg:flex-[0_0_32%] min-w-0 pl-6"
                  >
                    <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-7 flex flex-col justify-between h-full shadow-2xs hover:shadow-md transition-all duration-300 group">
                      <div className="space-y-4">
                        {/* Author Profile Header */}
                        <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-stone-100">
                          <div className="flex items-center gap-3">
                            {avatarUrl ? (
                              <Image
                                src={avatarUrl}
                                alt={item.author}
                                width={44}
                                height={44}
                                className="w-11 h-11 rounded-full object-cover border border-stone-200 shrink-0 shadow-2xs"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-full bg-stone-900 text-accent font-bold flex items-center justify-center text-sm shrink-0 border border-stone-800 shadow-2xs">
                                {item.author.charAt(0)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <h3 className="font-heading text-sm font-bold text-stone-900 truncate">
                                {item.author}
                              </h3>
                              {item.country && (
                                <p className="text-xs text-stone-500 font-medium truncate">
                                  {item.country}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Star Rating */}
                          <div className="flex items-center gap-0.5 text-accent shrink-0">
                            {Array.from({ length: item.rating || 5 }).map((_, s) => (
                              <Star key={s} className="w-3.5 h-3.5 fill-accent text-accent" />
                            ))}
                          </div>
                        </div>

                        {/* Bold Review Headline */}
                        <h4 className="font-heading text-base font-bold text-stone-900 leading-snug line-clamp-2">
                          {headline}
                        </h4>

                        {/* Review Body Content */}
                        <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-normal line-clamp-4">
                          &ldquo;{item.content}&rdquo;
                        </p>
                      </div>

                      {/* Card Footer: Trip Name Pill */}
                      {item.tripName && (
                        <div className="pt-4 mt-6 border-t border-stone-100 flex items-center justify-between text-xs gap-2">
                          <span className="font-semibold text-stone-900 bg-stone-100 border border-stone-200/90 px-3 py-1 rounded-full text-xs truncate max-w-[240px]">
                            {item.tripName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
