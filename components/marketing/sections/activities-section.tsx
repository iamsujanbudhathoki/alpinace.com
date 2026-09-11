"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
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
        const res = await ActivityService.getPublicAll({ limit: 50 });
        const items = Array.isArray(res) ? res : [];

        // Sort featured activities first, then by menuOrder
        const sorted = [...items].sort((a, b) => {
          if (a.isFeatured !== b.isFeatured) {
            return a.isFeatured ? -1 : 1;
          }
          return (a.menuOrder ?? 0) - (b.menuOrder ?? 0);
        });

        if (sorted.length > 0) {
          setActivities(sorted);
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

  const getTripCountLabel = (act: ActivityItem) => {
    const count = act.tripCount ?? (act as any).itemCount ?? (act as any).packagesCount;
    if (typeof count === "number" && count >= 0) {
      return `${count} ${count === 1 ? "Trip" : "Trips"}`;
    }
    return null;
  };

  if (!loading && activities.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 bg-stone-50 border-b border-stone-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 leading-snug">
            Activities we offer
          </h2>
          <div className="section-accent-line mx-auto" />
        </div>

        {/* Carousel / Cards Showcase */}
        <div className="relative pt-2 group/carousel select-none">
          {/* Navigation Arrows (Only if more than 1 item) */}
          {!loading && activities.length > 1 && (
            <>
              <button
                onClick={scrollPrev}
                aria-label="Previous Activity"
                className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 text-stone-900 border border-stone-200 shadow-sm items-center justify-center hover:bg-stone-900 hover:text-white transition-all cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={scrollNext}
                aria-label="Next Activity"
                className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 text-stone-900 border border-stone-200 shadow-sm items-center justify-center hover:bg-stone-900 hover:text-white transition-all cursor-pointer"
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
                  className="bg-white rounded-lg border border-stone-200 p-0 overflow-hidden space-y-0 animate-pulse"
                >
                  <div className="aspect-[16/11] bg-stone-200 w-full" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 bg-stone-200 rounded w-3/4" />
                    <div className="h-4 bg-stone-100 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 1 ? (
            /* Single item clean layout */
            <div className="max-w-sm sm:max-w-md">
              {activities.map((act) => {
                const tripLabel = getTripCountLabel(act);
                return (
                  <Link
                    key={act.id}
                    href={`/activities/${act.slug}`}
                    className="group flex flex-col h-full bg-white rounded-lg border border-stone-200 overflow-hidden transition-all duration-300 ease-out hover:border-stone-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_-4px_rgba(0,0,0,0.14)]"
                  >
                    {/* Image Frame with contained zoom */}
                    <div className="relative aspect-[16/11] w-full overflow-hidden bg-stone-100">
                      <Image
                        src={act.image || "/mountain-placeholder.jpg"}
                        alt={act.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      {/* Trip Count Badge */}
                      {tripLabel && (
                        <span className="absolute top-3 right-3 bg-yellow-400 text-stone-950 font-bold text-xs px-3 py-1 rounded-md shadow-xs pointer-events-none">
                          {tripLabel}
                        </span>
                      )}
                    </div>

                    {/* Card Content: Title Only */}
                    <div className="p-4 sm:p-5 bg-white border-t border-stone-100">
                      <h3 className="font-heading text-base sm:text-lg font-bold text-stone-900 leading-snug line-clamp-1">
                        {act.name}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            /* Multi-item Embla Carousel with Substantial 3-Card Desktop Grid */
            <div
              className="overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y py-4 -my-4"
              ref={emblaRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <div className="flex -ml-6 sm:-ml-7 lg:-ml-8">
                {activities.map((act) => {
                  const tripLabel = getTripCountLabel(act);
                  return (
                    <div
                      key={act.id}
                      className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333333%] min-w-0 pl-6 sm:pl-7 lg:pl-8 shrink-0"
                    >
                      <Link
                        href={`/activities/${act.slug}`}
                        onClick={handleCardClick}
                        className="group flex flex-col h-full bg-white rounded-2xl border border-stone-200/90 overflow-hidden transition-all duration-300 ease-out hover:border-stone-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12)]"
                      >
                        {/* Taller Image Frame with contained zoom */}
                        <div className="relative aspect-[16/11] w-full overflow-hidden bg-stone-100">
                          <Image
                            src={act.image || "/mountain-placeholder.jpg"}
                            alt={act.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                            draggable={false}
                          />
                          {/* Trip Count Badge */}
                          {tripLabel && (
                            <span className="absolute top-3.5 right-3.5 bg-yellow-400 text-stone-950 font-bold text-xs px-3 py-1 rounded-md shadow-xs pointer-events-none">
                              {tripLabel}
                            </span>
                          )}
                        </div>

                        {/* Card Content: Title & CTA */}
                        <div className="p-5 sm:p-6 bg-white flex-1 flex flex-col justify-between space-y-4 border-t border-stone-100">
                          <div>
                            <h3 className="font-heading text-base sm:text-lg font-bold text-stone-900 group-hover:text-stone-700 transition-colors leading-snug line-clamp-1">
                              {act.name}
                            </h3>
                          </div>

                          <div className="pt-3.5 border-t border-stone-100 flex items-center justify-between text-xs sm:text-sm font-semibold text-stone-900 group-hover:underline">
                            <span>Explore Activity</span>
                            <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                          </div>
                        </div>
                      </Link>
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


