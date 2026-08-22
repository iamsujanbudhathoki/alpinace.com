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
    <section className="py-20 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-3">
          <div>
            <span className="text-amber-700 text-xs font-semibold uppercase tracking-wider block mb-1.5">
              From the journal
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-zinc-900">
              Recent Articles
            </h2>
          </div>
          <Link
            href="/blog"
            className="text-zinc-700 hover:text-amber-700 font-heading text-sm font-semibold flex items-center gap-1 transition-colors cursor-pointer self-start md:self-auto"
          >
            <span>View all posts</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <div className="bg-white rounded-xl overflow-hidden border border-stone-200 hover:border-stone-300 transition-all duration-200 flex flex-col h-full cursor-pointer group">
                {post.image && (
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                      className="object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-zinc-900 text-white text-xs font-medium px-2 py-0.5 rounded z-10">
                      {post.category}
                    </span>
                  </div>
                )}
                <div className="p-5 flex flex-col flex-grow">
                  <span className="text-zinc-500 text-xs font-medium block mb-2">
                    {post.date}{post.readTime && ` · ${post.readTime}`}
                  </span>
                  <h3 className="font-heading text-sm font-bold text-zinc-900 group-hover:text-amber-700 transition-colors mb-2 leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-zinc-500 text-xs leading-relaxed font-normal line-clamp-3">
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
