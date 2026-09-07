"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, Loader2, BookOpen, Mountain, X, ArrowRight } from "lucide-react";
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
  const categoryParam = searchParams.get("category") || "All";

  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [categories, setCategories] = useState<{ id: string; name: string; slug?: string }[]>(initialCategories);
  const [initialLoading, setInitialLoading] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [prevCategoryParam, setPrevCategoryParam] = useState(categoryParam);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categoryParam);

  const isMounted = useRef(false);

  // Sync category parameter safely during render when query param changes
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
            ...blogCats.map((c) => ({ id: c.slug || c.id, name: c.name, slug: c.slug })),
          ]);
        }
      } catch (err) {
        console.warn("Failed to load blog categories:", err);
      }
    }
    loadCategories();
  }, [initialCategories]);

  // Refetch blogs ONLY when filter criteria change (prevents infinite API loops)
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
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    fetchBlogs(selectedCategoryId, debouncedSearch);
  }, [selectedCategoryId, debouncedSearch, fetchBlogs]);

  const handleClearSearch = () => {
    setSearchTerm("");
    setDebouncedSearch("");
  };

  return (
    <div className="bg-stone-50/60 min-h-screen pb-20 font-sans text-stone-900">
      {/* Clean Hero Banner Header */}
      <section className="bg-stone-100 border-b border-stone-200 pt-24 pb-10 sm:pt-28 sm:pb-12 relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          <h1 className="font-heading text-2xl sm:text-4xl font-bold tracking-tight text-stone-900">
            Travel Blog &amp; Guides
          </h1>
          <p className="text-stone-600 text-sm font-normal leading-relaxed max-w-2xl">
            Trekking advice, high-altitude preparation guides, packing lists, and trail insights from Himalayan leaders.
          </p>
        </div>
      </section>

      {/* Main Container & Filter Controls */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 bg-white p-3.5 rounded-md border border-stone-200 shadow-2xs">
          {/* Category Dropdown */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <label htmlFor="blog-category-select" className="text-xs font-semibold text-stone-700 shrink-0">
              Category:
            </label>
            <select
              id="blog-category-select"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full sm:w-48 text-xs px-3 py-2 rounded-md border border-stone-200 focus:outline-none focus:border-stone-400 bg-white font-medium text-stone-900 cursor-pointer shadow-2xs"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search by title, excerpt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-stone-200 text-stone-900 placeholder:text-stone-400 text-xs rounded-md pl-9 pr-8 py-2 font-normal focus:outline-none focus:border-stone-400 transition-colors"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-2.5 h-4 w-4 text-stone-600 animate-spin" />
            )}
            {!isSearching && searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Stable Content Grid Container */}
        <div className="relative min-h-[440px]">
          {/* Initial Loading Skeleton State */}
          {initialLoading && <BlogGridSkeleton count={6} />}

          {/* Empty State */}
          {!initialLoading && posts.length === 0 && (
            <div className="bg-white border border-stone-200 rounded-md p-10 text-center max-w-md mx-auto my-6 space-y-3">
              <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
                <BookOpen className="w-5 h-5 text-stone-700" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading text-sm font-semibold text-stone-900">
                  No Articles Found
                </h3>
                <p className="text-stone-500 text-xs font-normal leading-relaxed">
                  {searchTerm
                    ? `No articles matching "${searchTerm}". Try another search term or reset filters.`
                    : "No blog articles found in this category."}
                </p>
              </div>
              {(searchTerm || selectedCategoryId !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    handleClearSearch();
                    setSelectedCategoryId("All");
                  }}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors cursor-pointer mt-2"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          )}

          {/* Unified Article Cards Grid */}
          {!initialLoading && posts.length > 0 && (
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${
                isSearching ? "opacity-60 pointer-events-none" : "opacity-100"
              }`}
            >
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-lg border border-stone-200 overflow-hidden flex flex-col justify-between hover:border-stone-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_-4px_rgba(0,0,0,0.14)] transition-all duration-300 ease-out group"
                >
                  <Link
                    href={`/blog/${post.slug || post.id}`}
                    className="block flex-1 flex flex-col justify-between h-full"
                  >
                    <div>
                      {/* Image Frame */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900">
                        {post.image ? (
                          <img
                            src={post.image}
                            alt={post.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <Mountain className="w-10 h-10 text-stone-300" />
                          </div>
                        )}
                        {post.category && (
                          <span className="absolute top-3 left-3 bg-stone-900/90 text-white text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-sm">
                            {post.category}
                          </span>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className="p-5 flex flex-col flex-grow justify-between space-y-3">
                        <div className="space-y-2">
                          <span className="text-stone-500 text-xs font-medium block">
                            {post.date || "Blog"}{post.readTime && ` \u2022 ${post.readTime}`}
                          </span>
                          <h3 className="font-heading text-base sm:text-lg font-bold text-stone-900 group-hover:text-stone-600 group-hover:underline transition-colors leading-snug line-clamp-2">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed line-clamp-2">
                              {post.excerpt}
                            </p>
                          )}
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
          )}
        </div>
      </section>
    </div>
  );
}
