"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { BlogPost } from "@/lib/home-data";
import { BlogService } from "@/lib/services/admin-service";
import { BlogStatus } from "@/lib/admin-data";

interface FeaturedBlogsProps {
  initialPosts?: BlogPost[];
}

export function FeaturedBlogs({ initialPosts = [] }: FeaturedBlogsProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);

  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    loop: false,
  });

  useEffect(() => {
    async function loadFeatured() {
      try {
        const raw = await BlogService.getAll(BlogStatus.PUBLISHED);
        const mapped: BlogPost[] = raw.slice(0, 3).map((b) => ({
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
    loadFeatured();
  }, []);

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 bg-stone-50 border-b border-stone-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-row items-end justify-between mb-8 gap-3 border-b border-stone-200 pb-5">
          <div className="space-y-1">
            <span className="text-amber-700 text-xs font-bold block">
              Articles &amp; Guides
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Latest Articles
            </h2>
          </div>
          <Link
            href="/blog"
            className="text-xs font-semibold text-amber-700 hover:underline shrink-0"
          >
            Read All Articles &rarr;
          </Link>
        </div>

        {/* Mobile Swipeable Horizontal Carousel / Desktop 3-Column Grid */}
        <div className="overflow-hidden md:overflow-visible cursor-grab active:cursor-grabbing touch-pan-y" ref={emblaRef}>
          <div className="flex -ml-6 md:ml-0 md:grid md:grid-cols-3 md:gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex-[0_0_88%] sm:flex-[0_0_55%] md:flex-none min-w-0 pl-6 md:pl-0"
              >
                <Link href={`/blog/${post.slug}`} className="block h-full">
                  <div className="bg-white rounded-sm border border-stone-200 hover:border-stone-400 transition-all duration-200 flex flex-col h-full cursor-pointer group overflow-hidden">
                    {post.image && (
                      <div className="relative aspect-[16/10] overflow-hidden bg-stone-900">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 88vw, 33vw"
                          className="object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 bg-stone-900/90 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-sm">
                          {post.category}
                        </span>
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-grow justify-between space-y-3">
                      <div className="space-y-2">
                        <span className="text-stone-500 text-xs font-medium block">
                          {post.date}{post.readTime && ` &bull; ${post.readTime}`}
                        </span>
                        <h3 className="font-heading text-base font-bold text-stone-900 group-hover:text-amber-700 transition-colors leading-snug line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-stone-600 text-xs sm:text-sm leading-relaxed line-clamp-2">
                          {post.excerpt}
                        </p>
                      </div>

                      <span className="text-xs font-semibold text-amber-700 group-hover:underline pt-2 block border-t border-stone-100">
                        Read Article &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

