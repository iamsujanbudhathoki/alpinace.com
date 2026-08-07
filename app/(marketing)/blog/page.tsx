"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, Sparkles } from "lucide-react";
import { BlogPost } from "@/lib/home-data";
import { BlogService } from "@/lib/services/admin-service";

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    async function loadBlogs() {
      try {
        const raw = await BlogService.getAll();
        const mapped: BlogPost[] = raw.map((b) => ({
          id: b.id,
          title: b.title,
          slug: b.slug,
          category: b.category,
          date: (b as any).publishedDate,
          readTime: b.readTime,
          excerpt: (b as any).excerpt,
          content: (b as any).content,
          image: (b as any).image,
          author: {
            name: (b as any).author,
            role: (b as any).authorRole,
            avatar: (b as any).authorAvatar,
          },
        }));
        setPosts(mapped);
      } catch (e) {
        console.warn("Failed to fetch blog posts from backend:", e);
      } finally {
        setLoading(false);
      }
    }
    loadBlogs();
  }, []);

  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(posts.map((post) => post.category)))];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [posts, searchTerm, selectedCategory]);


  return (
    <div className="pt-24 min-h-screen bg-stone-50 pb-20 font-sans">

      {/* Editorial Header */}
      <section className="py-16 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1600"
            alt="Trekking team with backpacks"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/60 to-slate-950/85" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-400/20 text-gold-300 text-xs font-semibold px-4 py-2 rounded-full mb-4">
            <Sparkles className="h-4 w-4" />
            <span>The Mountain Journals</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            The Himalayan Dispatch
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl mx-auto font-light leading-relaxed">
            Expert safety briefings, preparation tips, packing lists, and stories from active mountaineering and Sherpa guides on the trails.
          </p>
        </div>
      </section>

      {/* Grid List & Filters */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Category filters & Search Bar */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          {/* Category filter buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mr-2 hidden sm:inline-block">Filter Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-heading font-semibold tracking-wider transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-gold-500 text-slate-950 border border-gold-400"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search journals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg pl-9 pr-3 py-3 focus:outline-none focus:border-gold-500"
            />
          </div>
        </div>

        {/* Blog Post List */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-xs">
            <p className="text-slate-600 text-sm font-light">No articles match your search criteria. Try another filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md border border-slate-200 transition-all duration-300 flex flex-col h-full cursor-pointer group"
              >
                <div className="relative aspect-16/10 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <span className="absolute top-4 left-4 bg-gold-500 text-slate-950 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                    {post.category}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <span className="text-slate-700 text-xs uppercase font-semibold font-mono tracking-widest block mb-2">
                    {post.date} &mdash; {post.readTime}
                  </span>
                  <h3 className="font-heading text-base font-bold text-slate-900 group-hover:text-gold-600 transition-colors mb-2 leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-slate-700 text-xs leading-relaxed font-normal line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>

                  {/* Author Row */}
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-auto">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover border border-gold-300"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{post.author.name}</h4>
                      <p className="text-xs text-slate-700 leading-none">{post.author.role}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </section>
    </div>
  );
}
