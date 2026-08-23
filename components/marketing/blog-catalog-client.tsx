"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, Loader2, BookOpen, Mountain, X } from "lucide-react";
import { BlogPost } from "@/lib/home-data";
import { BlogService, CategoryService } from "@/lib/services/admin-service";
import { BlogStatus, CategoryType } from "@/lib/admin-data";
import { BlogGridSkeleton } from "@/components/marketing/skeletons/blog-grid-skeleton";

interface BlogCatalogClientProps {
  initialPosts: BlogPost[];
  initialCategories: { id: string; name: string }[];
}

export function BlogCatalogClient({
  initialPosts,
  initialCategories,
}: BlogCatalogClientProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("categoryId") || "All";

  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(initialCategories);
  const [initialLoading, setInitialLoading] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [prevCategoryParam, setPrevCategoryParam] = useState(categoryParam);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categoryParam);

  // Sync categoryId safely during render when query param changes
  if (categoryParam !== prevCategoryParam) {
    setPrevCategoryParam(categoryParam);
    setSelectedCategoryId(categoryParam);
  }

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch dynamic categories if not provided initially
  useEffect(() => {
    if (initialCategories && initialCategories.length > 1) return;
    async function loadCategories() {
      try {
        const blogCats = await CategoryService.getByType(CategoryType.BLOGS);
        if (blogCats && blogCats.length > 0) {
          setCategories([
            { id: "All", name: "All Blogs" },
            ...blogCats.map((c) => ({ id: c.id, name: c.name })),
          ]);
        }
      } catch (err) {
        console.warn("Failed to load blog categories:", err);
      }
    }
    loadCategories();
  }, [initialCategories]);

  // Refetch blogs when filter criteria change (skip on initial mount if criteria default)
  const isDefaultFilter = !debouncedSearch && selectedCategoryId === "All";

  const fetchBlogs = useCallback(async (catId: string, search: string) => {
    setIsSearching(true);
    try {
      const raw = await BlogService.getAll(
        BlogStatus.PUBLISHED,
        catId === "All" ? undefined : catId,
        search.trim() ? search.trim() : undefined
      );
      const mapped: BlogPost[] = raw.map((b) => ({
        id: b.id,
        title: b.title,
        slug: b.slug,
        category: b.category,
        date: b.publishedDate,
        readTime: b.readTime,
        excerpt: b.excerpt || "",
        content: b.content || "",
        image: b.image || "",
      }));
      setPosts(mapped);
    } catch (e) {
      console.warn("Failed to fetch blog posts from backend:", e);
    } finally {
      setInitialLoading(false);
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (isDefaultFilter && posts === initialPosts) return;
    fetchBlogs(selectedCategoryId, debouncedSearch);
  }, [selectedCategoryId, debouncedSearch, fetchBlogs, isDefaultFilter, initialPosts, posts]);

  const handleCategorySelect = (categoryId: string) => {
    if (selectedCategoryId === categoryId) return;
    setSelectedCategoryId(categoryId);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setDebouncedSearch("");
  };

  return (
    <div className="pt-24 min-h-screen bg-stone-50/60 pb-24 font-sans text-slate-900">
      {/* Editorial Header */}
      <section className="py-16 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1600"
            alt="Trekking team in the Himalayas"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/65 to-slate-950/90" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider block mb-2">
            Journal
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Articles &amp; Guides
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl font-normal leading-relaxed">
            Route briefings, gear advice, packing lists, and trail notes from our Sherpa guides.
          </p>
        </div>
      </section>

      {/* Grid List & Dynamic Backend Filters */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filter Controls Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8 bg-white p-3.5 rounded-xl border border-stone-200">
          {/* Dynamic Category filter buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-800 mr-1 hidden sm:inline-block">
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategoryId === cat.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-stone-100 hover:bg-stone-200/80 text-slate-700 border border-stone-200/60"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Input with backend query */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, topic, excerpt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 text-slate-900 placeholder:text-slate-400 text-xs rounded-xl pl-10 pr-9 py-2.5 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-3 h-4 w-4 text-amber-500 animate-spin" />
            )}
            {!isSearching && searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Stable Content Grid Container */}
        <div className="relative min-h-[480px]">
          {/* Initial Loading Skeleton State */}
          {initialLoading && <BlogGridSkeleton count={6} />}

          {/* Empty State */}
          {!initialLoading && posts.length === 0 && (
            <div className="bg-white rounded-xl border border-stone-200 p-12 text-center max-w-md mx-auto my-8 animate-in fade-in duration-300">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-900 mb-1.5">
                No Blogs Found
              </h3>
              <p className="text-slate-600 text-xs font-normal leading-relaxed mb-6">
                {searchTerm
                  ? `No blogs matching "${searchTerm}". Try another search term or reset filters.`
                  : "No blog articles found in this category."}
              </p>
              {(searchTerm || selectedCategoryId !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    handleClearSearch();
                    setSelectedCategoryId("All");
                  }}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          )}

          {/* Active Grid */}
          {!initialLoading && posts.length > 0 && (
            <div
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-opacity duration-300 ${
                isSearching ? "opacity-60 pointer-events-none" : "opacity-100"
              }`}
            >
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug || post.id}`}
                  className="bg-white rounded-xl overflow-hidden border border-stone-200 hover:border-stone-300 transition-all duration-200 flex flex-col h-full cursor-pointer group"
                >
                  {post.image ? (
                    <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                      <img
                        src={post.image}
                        alt={post.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3.5 left-3.5 bg-slate-950/85 backdrop-blur-xs text-amber-400 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs">
                        {post.category}
                      </span>
                    </div>
                  ) : (
                    <div className="relative aspect-16/10 bg-slate-100 flex items-center justify-center text-slate-400">
                      <Mountain className="w-10 h-10 text-slate-300" />
                      <span className="absolute top-3.5 left-3.5 bg-slate-950/85 text-amber-400 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                        {post.category}
                      </span>
                    </div>
                  )}

                  <div className="p-6 flex flex-col flex-grow justify-between space-y-3">
                    <div>
                      <div className="text-slate-500 text-xs font-semibold flex items-center gap-2 mb-2">
                        <span>{post.date || "Blog"}</span>
                        {post.readTime && (
                          <>
                            <span>&bull;</span>
                            <span>{post.readTime}</span>
                          </>
                        )}
                      </div>
                      <h3 className="font-heading text-base font-bold text-slate-950 group-hover:text-amber-600 transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-slate-600 text-xs leading-relaxed font-normal line-clamp-3 mt-2">
                          {post.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-stone-100 text-xs font-bold text-amber-600 group-hover:text-amber-700 flex items-center gap-1">
                      <span>Read Full Article &rarr;</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
