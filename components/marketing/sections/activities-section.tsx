"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ActivityItem } from "@/lib/admin-data";
import { ActivityService } from "@/lib/services/admin-service";

interface ActivitiesSectionProps {
  initialActivities?: ActivityItem[];
}

export function ActivitiesSection({ initialActivities = [] }: ActivitiesSectionProps) {
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);
  const [loading, setLoading] = useState(initialActivities.length === 0);

  // Mouse drag & click prevention setup
  const [isPointerDragging, setIsPointerDragging] = useState(false);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  // Autoplay configuration
  const autoplay = useRef(
    Autoplay({ delay: 4500, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  // Embla Carousel with dragFree enabled for responsive inertia dragging
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
      dragFree: true,
      containScroll: false,
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
    async function loadActivities() {
      try {
        const res = await ActivityService.getPublicAll({ limit: 12, isFeatured: true });
        const items = Array.isArray(res) ? res : [];
        if (items.length > 0) {
          setActivities(items);
        } else {
          // If no featured activities, fetch all active
          const allRes = await ActivityService.getPublicAll({ limit: 12 });
          const allItems = Array.isArray(allRes) ? allRes : [];
          if (allItems.length > 0) setActivities(allItems);
        }
      } catch (e) {
        console.warn("Failed to load activities for homepage:", e);
      } finally {
        setLoading(false);
      }
    }

    if (initialActivities.length === 0) {
      loadActivities();
    }
  }, [initialActivities]);

  // Pointer drag tracking to differentiate click vs drag scroll
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    setIsPointerDragging(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerStartRef.current) return;
    const dx = Math.abs(e.clientX - pointerStartRef.current.x);
    const dy = Math.abs(e.clientY - pointerStartRef.current.y);
    if (dx > 5 || dy > 5) {
      setIsPointerDragging(true);
    }
  };

  const handlePointerUp = () => {
    pointerStartRef.current = null;
    setTimeout(() => {
      setIsPointerDragging(false);
    }, 60);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isPointerDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (!loading && activities.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 bg-stone-50 border-b border-stone-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-row items-end justify-between mb-8 gap-4 border-b border-stone-200 pb-4">
          <div className="space-y-1">
            <span className="text-stone-500 text-xs font-medium uppercase tracking-wider block">
              Curated Experiences
            </span>
            <h2 className="font-heading text-2xl sm:text-4xl font-bold text-stone-900 tracking-tight leading-snug">
              Explore by Activity
            </h2>
          </div>
          <Link
            href="/activities"
            className="text-xs font-medium text-stone-600 hover:text-stone-900 hover:underline inline-flex items-center gap-1 transition-colors shrink-0"
          >
            View All Activities &rarr;
          </Link>
        </div>

        {/* Carousel / Cards Showcase */}
        <div className="relative pt-2 group/carousel select-none">
          {/* Navigation Arrows (Only if more than 1 item) */}
          {!loading && activities.length > 1 && (
            <>
              <button
                onClick={scrollPrev}
                aria-label="Previous Activity"
                className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-sm bg-white/95 text-stone-900 border border-stone-200 shadow-sm items-center justify-center hover:bg-stone-900 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={scrollNext}
                aria-label="Next Activity"
                className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-sm bg-white/95 text-stone-900 border border-stone-200 shadow-sm items-center justify-center hover:bg-stone-900 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-sm border border-stone-200 p-4 space-y-4 animate-pulse"
                >
                  <div className="h-52 bg-stone-100 rounded-sm w-full" />
                  <div className="h-4 bg-stone-200 rounded w-1/3" />
                  <div className="h-5 bg-stone-200 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : activities.length === 1 ? (
            /* Single item clean layout */
            <div className="max-w-md">
              {activities.map((act) => (
                <Link
                  key={act.id}
                  href={`/activities/${act.slug}`}
                  className="group flex flex-col bg-white rounded-sm border border-stone-200 hover:border-stone-400 transition-all duration-300 overflow-hidden"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900">
                    <img
                      src={act.image || "/mountain-placeholder.jpg"}
                      alt={act.name}
                      className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out opacity-95 group-hover:opacity-100"
                    />
                    <span className="absolute top-3 left-3 bg-stone-900/90 text-white text-[11px] font-medium px-2.5 py-0.5 rounded-sm tracking-wide">
                      Activity Hub
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="font-heading text-base sm:text-lg font-bold text-stone-900 group-hover:text-stone-600 transition-colors leading-snug line-clamp-1">
                        {act.name}
                      </h3>
                      {act.description && (
                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed font-normal">
                          {act.description}
                        </p>
                      )}
                    </div>
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-[11px] text-stone-400 block font-medium">Explore Hub</span>
                      <span className="text-xs font-medium text-stone-900 group-hover:underline">
                        Explore Activity &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* Multi-item Embla Carousel with Mouse Drag & Hover Motion */
            <div
              className="overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
              ref={emblaRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <div className="flex -ml-6">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="flex-[0_0_88%] sm:flex-[0_0_46%] lg:flex-[0_0_31.5%] min-w-0 pl-6"
                  >
                    <Link
                      href={`/activities/${act.slug}`}
                      onClick={handleCardClick}
                      className="group flex flex-col h-full bg-white rounded-sm border border-stone-200 hover:border-stone-400 transition-all duration-300 overflow-hidden"
                    >
                      {/* Image Frame */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900">
                        <img
                          src={act.image || "/mountain-placeholder.jpg"}
                          alt={act.name}
                          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out opacity-95 group-hover:opacity-100"
                          draggable={false}
                        />
                        <span className="absolute top-3 left-3 bg-stone-900/90 text-white text-[11px] font-medium px-2.5 py-0.5 rounded-sm tracking-wide">
                          Activity Hub
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          <h3 className="font-heading text-base sm:text-lg font-bold text-stone-900 group-hover:text-stone-600 transition-colors leading-snug line-clamp-1">
                            {act.name}
                          </h3>
                          {act.description ? (
                            <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed font-normal">
                              {act.description}
                            </p>
                          ) : (
                            <p className="text-xs text-stone-400 italic font-normal">
                              Curated adventures, treks, and expeditions.
                            </p>
                          )}
                        </div>

                        {/* CTA */}
                        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                          <span className="text-[11px] text-stone-400 block font-medium">Explore Hub</span>
                          <span className="text-xs font-medium text-stone-900 group-hover:underline">
                            Explore Activity &rarr;
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

