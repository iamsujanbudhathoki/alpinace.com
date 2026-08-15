"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { BlogPost } from "@/lib/home-data";
import { BlogService } from "@/lib/services/admin-service";
import { BlogStatus } from "@/lib/admin-data";

export function FeaturedBlogs() {
  const [posts, setPosts] = useState<BlogPost[]>([]);

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
        setPosts(mapped);
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
    <section className="py-24 bg-stone-50/80 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-amber-700 text-sm font-medium block mb-1">
              Mountain Chronicles
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-zinc-900">
              The Himalayan Dispatch
            </h2>
          </div>
          <Link
            href="/blog"
            className="text-zinc-900 hover:text-amber-700 font-heading text-sm font-semibold flex items-center gap-1 mt-4 md:mt-0 transition-colors cursor-pointer"
          >
            <span>Read All Chronicles</span>
            <ChevronRight className="h-4 w-4 text-amber-600" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <div className="bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-amber-400/60 transition-all duration-300 flex flex-col h-full cursor-pointer group">
                {post.image && (
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <span className="absolute top-4 left-4 bg-zinc-900 text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-md z-10">
                      {post.category}
                    </span>
                  </div>
                )}
                <div className="p-6 flex flex-col flex-grow">
                  <span className="text-zinc-600 text-xs font-semibold block mb-2">
                    {post.date} {post.readTime && `— ${post.readTime}`}
                  </span>
                  <h3 className="font-heading text-base font-bold text-zinc-900 group-hover:text-amber-700 transition-colors mb-2 leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-zinc-600 text-xs leading-relaxed font-normal line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
