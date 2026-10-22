"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ArrowRight } from "lucide-react";
import { CarouselNavButton } from "@/components/ui/carousel-nav-button";
import { BlogPost } from "@/lib/home-data";
import { BlogService } from "@/lib/services/admin-service";
import { BlogStatus, BlogArticle } from "@/lib/admin-data";

interface FeaturedBlogsProps {
  initialPosts?: BlogPost[];
}

export function FeaturedBlogs({ initialPosts = [] }: FeaturedBlogsProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);

  // Mouse drag & click prevention setup
  const [isPointerDragging, setIsPointerDragging] = useState(false);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  // Autoplay configuration (delay 5000ms, pause on hover)
  const plugins = useMemo(
    () => [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })],
    []
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
      dragFree: true,
      containScroll: false,
    },
    plugins
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const raw = await BlogService.getAll(BlogStatus.PUBLISHED);
        const mapped: BlogPost[] = raw.slice(0, 10).map((b: BlogArticle) => ({
          id: b.id,
          title: b.title,
          slug: b.slug,
          category: b.category,
          date: b.publishedDate,
          readTime: b.readTime,
          excerpt: b?.excerpt || "",
          content: b?.content || "",
          image: b?.image || "",
        }));
        if (mapped.length > 0) setPosts(mapped);
      } catch (e) {
        console.warn("Failed to fetch featured blogs:", e);
      }
    }
    if (initialPosts.length === 0) {
      loadFeatured();
    }
  }, [initialPosts]);

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

  if (posts.length === 0) {
    return null;
  }

  // Ensure sufficient item sequence if between 2 and 5 items for smooth continuous loop
  const displayPosts =
    posts.length > 1 && posts.length < 6
      ? [...posts, ...posts, ...posts]
      : posts;

  return (
    <section className="py-16 sm:py-20 bg-stone-50 border-b border-stone-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex flex-col sm:flex-row items-center justify-center mb-8 pb-5 border-b border-stone-200 min-h-[52px]">
          <div className="space-y-1 text-center flex flex-col items-center justify-center">
            <span className="text-stone-500 text-xs font-medium block">
              Articles &amp; Guides
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 leading-snug">
              Latest from our journal
            </h2>
            <div className="section-accent-line mx-auto" />
          </div>
          <div className="mt-3 sm:mt-0 sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2">
            <Link
              href="/blog"
              className="text-xs sm:text-sm font-medium text-stone-600 hover:text-stone-900 hover:underline inline-flex items-center gap-1 transition-colors shrink-0 whitespace-nowrap"
            >
              Read All Articles &rarr;
            </Link>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative pt-2 group/carousel select-none">
          {/* Navigation Arrows (Only if more than 1 item) */}
          {displayPosts.length > 1 && (
            <>
              <CarouselNavButton
                direction="prev"
                onClick={scrollPrev}
                ariaLabel="Previous Article"
              />
              <CarouselNavButton
                direction="next"
                onClick={scrollNext}
                ariaLabel="Next Article"
              />
            </>
          )}

          {/* Multiple Articles - Horizontal Embla Carousel */}
          <div
            className="overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y py-4 -my-4"
            ref={emblaRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <div className="flex -ml-6 sm:-ml-7 lg:-ml-8">
              {displayPosts.map((post, idx) => (
                <div
                  key={`${post.id}-${idx}`}
                  className="flex-[0_0_88%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333333%] min-w-0 pl-6 sm:pl-7 lg:pl-8 shrink-0"
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    onClick={handleCardClick}
                    className="block h-full"
                  >
                    <div className="bg-white rounded-lg border border-stone-200 overflow-hidden transition-all duration-300 ease-out hover:border-stone-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_-4px_rgba(0,0,0,0.14)] flex flex-col h-full cursor-pointer group">
                      {post.image && (
                        <div className="relative aspect-[16/10] overflow-hidden bg-stone-900">
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            sizes="(max-width: 640px) 88vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            draggable={false}
                          />
                          <span className="absolute top-3 left-3 bg-stone-900/90 text-white text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-sm">
                            {post.category}
                          </span>
                        </div>
                      )}
                      <div className="p-5 flex flex-col flex-grow justify-between space-y-3">
                        <div className="space-y-2">
                          <span className="text-stone-500 text-xs font-medium block">
                            {post.date}{post.readTime && ` \u2022 ${post.readTime}`}
                          </span>
                          <h3 className="font-heading text-base sm:text-lg font-bold text-stone-900 group-hover:text-stone-600 group-hover:underline transition-colors leading-snug line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed line-clamp-2">
                            {post.excerpt}
                          </p>
                        </div>

                        <span className="text-xs font-semibold text-stone-900 group-hover:underline pt-2 border-t border-stone-100 flex items-center justify-end gap-1 text-right">
                          <span>Read Article</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
