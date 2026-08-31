"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SlidersHorizontal, X, Search, RotateCcw, ArrowRight, Compass } from "lucide-react";
import { TourItem } from "@/lib/tour-data";
import { TourService, PackageFilterService, PackageFilterOptions, CategoryService } from "@/lib/services/admin-service";
import { PackageGridSkeleton } from "@/components/marketing/skeletons/package-grid-skeleton";
import { CategoryType, PackageStatus, PackageSortOption } from "@/lib/admin-data";

interface ToursCatalogClientProps {
  initialTours: TourItem[];
  initialFilterOptions: PackageFilterOptions | null;
}

export function ToursCatalogClient({
  initialTours,
  initialFilterOptions,
}: ToursCatalogClientProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "All";

  const [tours, setTours] = useState<TourItem[]>(initialTours);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterOptions, setFilterOptions] = useState<PackageFilterOptions | null>(initialFilterOptions);
  const [categoryList, setCategoryList] = useState<{ id: string; name: string; slug?: string }[]>([]);

  // Filter States
  const [prevCategoryParam, setPrevCategoryParam] = useState(categoryParam);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const defaultMaxDuration = initialFilterOptions?.maxDuration || 14;
  const [localMaxDuration, setLocalMaxDuration] = useState<number>(defaultMaxDuration);
  const [appliedMaxDuration, setAppliedMaxDuration] = useState<number>(defaultMaxDuration);
  const [sortBy, setSortBy] = useState<string>("rating");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync category parameter safely during render when query param changes
  if (categoryParam !== prevCategoryParam) {
    setPrevCategoryParam(categoryParam);
    setSelectedCategory(categoryParam);
  }

  // Fetch tour categories and filter options on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [opts, cats] = await Promise.all([
          filterOptions ? Promise.resolve(filterOptions) : PackageFilterService.getOptions("Tour"),
          CategoryService.getByType(CategoryType.TOURS).catch(() => []),
        ]);
        if (opts) {
          setFilterOptions(opts);
          if (!initialFilterOptions && opts.maxDuration) {
            setLocalMaxDuration(opts.maxDuration);
            setAppliedMaxDuration(opts.maxDuration);
          }
        }
        if (cats && cats.length > 0) {
          setCategoryList(cats.map((c) => ({ id: c.id, name: c.name, slug: c.slug })));
        }
      } catch (e) {
        console.warn("Failed to load tour filter metadata:", e);
      }
    }
    loadData();
  }, [filterOptions, initialFilterOptions]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Debounce local slider changes so API is called after dragging stops
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedMaxDuration(localMaxDuration);
    }, 300);
    return () => clearTimeout(timer);
  }, [localMaxDuration]);

  const isDefaultFilter =
    !debouncedSearch &&
    selectedCategory === "All" &&
    appliedMaxDuration >= (filterOptions?.maxDuration || 14) &&
    sortBy === "rating";

  useEffect(() => {
    if (isDefaultFilter && tours === initialTours) return;

    let isCancelled = false;
    async function loadTours() {
      setLoading(true);
      try {
        const raw = await TourService.getPublicAll({
          search: debouncedSearch,
          category: selectedCategory === "All" ? undefined : selectedCategory,
          maxDuration: appliedMaxDuration < (filterOptions?.maxDuration || 14) ? appliedMaxDuration : undefined,
          sortBy,
          status: PackageStatus.ACTIVE,
        });
        const itemsList: TourItem[] = (Array.isArray(raw) ? raw : (raw as any)?.items || []).map((p: any) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          category: p.category,
          categorySlug: p.categorySlug,
          categoryId: p.categoryId,
          subcategory: p.subcategory,
          subcategorySlug: p.subcategorySlug,
          subcategoryId: p.subcategoryId,
          region: p.region,
          durationDays: Number(p.durationDays || 0),
          tourType: p.tourType || p.category || "Cultural",
          priceUSD: Number(p.priceUSD || 0),
          rating: Number(p.rating || 5),
          reviewsCount: Number(p.reviewsCount || 0),
          image: p.image || "",
          shortDesc: p.shortDesc || "",
          status: p.status,
        }));
        if (!isCancelled) {
          setTours(itemsList);
        }
      } catch (e) {
        console.warn("Failed to load tour packages from backend:", e);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    loadTours();
    return () => {
      isCancelled = true;
    };
  }, [debouncedSearch, selectedCategory, appliedMaxDuration, sortBy, filterOptions?.maxDuration, isDefaultFilter, initialTours]);

  const router = useRouter();
  const pathname = usePathname();

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    const defaultMax = filterOptions?.maxDuration || 14;
    setLocalMaxDuration(defaultMax);
    setAppliedMaxDuration(defaultMax);
    setSortBy("rating");
    if (typeof window !== "undefined" && window.location.search) {
      window.history.pushState({}, "", window.location.pathname);
      router.replace(pathname, { scroll: false });
    }
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "All") count++;
    if (appliedMaxDuration < (filterOptions?.maxDuration || 14)) count++;
    if (searchQuery.trim() !== "") count++;
    return count;
  }, [selectedCategory, appliedMaxDuration, searchQuery, filterOptions?.maxDuration]);

  // Filtered Tours list
  const filteredTours = useMemo(() => {
    let list = [...tours];

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.region.toLowerCase().includes(q) ||
          (t.shortDesc && t.shortDesc.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== "All") {
      const selected = selectedCategory.toLowerCase();
      list = list.filter(
        (t: any) =>
          (t.categorySlug && String(t.categorySlug).toLowerCase() === selected) ||
          (t.categoryId && String(t.categoryId).toLowerCase() === selected) ||
          (t.category && String(t.category).toLowerCase() === selected) ||
          (t.subcategorySlug && String(t.subcategorySlug).toLowerCase() === selected) ||
          (t.subcategoryId && String(t.subcategoryId).toLowerCase() === selected) ||
          (t.subcategory && String(t.subcategory).toLowerCase() === selected) ||
          (t.region && String(t.region).toLowerCase().includes(selected)) ||
          !isDefaultFilter
      );
    }

    if (appliedMaxDuration < (filterOptions?.maxDuration || 14)) {
      list = list.filter((t) => Number(t.durationDays) <= appliedMaxDuration);
    }

    // Sort list
    list.sort((a, b) => {
      if (sortBy === PackageSortOption.PRICE_ASC) return (a.priceUSD || 0) - (b.priceUSD || 0);
      if (sortBy === PackageSortOption.PRICE_DESC) return (b.priceUSD || 0) - (a.priceUSD || 0);
      if (sortBy === PackageSortOption.DURATION) return (a.durationDays || 0) - (b.durationDays || 0);
      return (b.rating || 5) - (a.rating || 5);
    });

    return list;
  }, [tours, debouncedSearch, selectedCategory, appliedMaxDuration, sortBy, filterOptions?.maxDuration, isDefaultFilter]);

  const normalizedCategories = useMemo(() => {
    if (categoryList.length > 0) {
      return categoryList.map((c) => ({ label: c.name, value: c.slug || c.name }));
    }
    if (filterOptions?.categories && Array.isArray(filterOptions.categories)) {
      return filterOptions.categories.map((c: any) => {
        if (typeof c === "string") return { label: c, value: c };
        const label = c.label || c.name || c.value || "Category";
        const val = c.value || c.slug || c.name || label;
        return { label: String(label), value: String(val) };
      });
    }
    return [
      { label: "Cultural Tours", value: "Cultural Tours" },
      { label: "Heritage Tours", value: "Heritage Tours" },
      { label: "Wildlife Safaris", value: "Wildlife Safaris" },
      { label: "Spiritual Tours", value: "Spiritual Tours" },
    ];
  }, [categoryList, filterOptions?.categories]);

  // Clean Filter Controls
  const filterControls = (
    <div className="space-y-4">
      {/* Search Input */}
      <div>
        <label className="block text-xs font-medium text-stone-700 mb-1.5">
          Search tour
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search Kathmandu, Pokhara, Chitwan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-md border border-stone-200 focus:outline-none focus:border-stone-400 bg-white font-normal text-stone-900 placeholder:text-stone-400"
          />
        </div>
      </div>

      {/* Category Dropdown Filter */}
      <div>
        <label className="block text-xs font-medium text-stone-700 mb-1.5">
          Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full text-xs px-3 py-2 rounded-md border border-stone-200 focus:outline-none focus:border-stone-400 bg-white font-normal text-stone-900 cursor-pointer"
        >
          <option value="All">All Categories</option>
          {normalizedCategories.map((cat, idx) => (
            <option key={`${cat.value}-${idx}`} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Duration Range Slider */}
      {(() => {
        const tourMinDuration = 2;
        const tourMaxDuration = filterOptions?.maxDuration || 14;
        const tourFillPct = Math.min(
          100,
          Math.max(0, ((localMaxDuration - tourMinDuration) / (tourMaxDuration - tourMinDuration)) * 100)
        );
        return (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-stone-700">
                Max duration
              </label>
              <span className="text-xs font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
                {localMaxDuration} Days
              </span>
            </div>
            <div className="py-1">
              <input
                type="range"
                min={tourMinDuration}
                max={tourMaxDuration}
                value={localMaxDuration}
                onChange={(e) => setLocalMaxDuration(Number(e.target.value))}
                onMouseUp={() => setAppliedMaxDuration(localMaxDuration)}
                onTouchEnd={() => setAppliedMaxDuration(localMaxDuration)}
                onKeyUp={() => setAppliedMaxDuration(localMaxDuration)}
                onBlur={() => setAppliedMaxDuration(localMaxDuration)}
                style={{
                  background: `linear-gradient(to right, #92400e 0%, #92400e ${tourFillPct}%, #e7e5e4 ${tourFillPct}%, #e7e5e4 100%)`,
                }}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-700/30 touch-none"
              />
            </div>
            <div className="flex justify-between text-[10px] text-stone-500 font-medium">
              <span>{tourMinDuration} Days</span>
              <span>{tourMaxDuration} Days</span>
            </div>
          </div>
        );
      })()}

      {/* Sort Options */}
      <div>
        <label className="block text-xs font-medium text-stone-700 mb-1.5">
          Sort by
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full text-xs px-3 py-2 rounded-md border border-stone-200 focus:outline-none focus:border-stone-400 bg-white font-normal text-stone-900 cursor-pointer"
        >
          <option value={PackageSortOption.RATING}>Top Rated</option>
          <option value={PackageSortOption.PRICE_ASC}>Price: Low to High</option>
          <option value={PackageSortOption.PRICE_DESC}>Price: High to Low</option>
          <option value={PackageSortOption.DURATION}>Shortest Duration</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="bg-stone-50/60 min-h-screen pb-20 font-sans text-stone-900">
      {/* Clean Hero Banner Header */}
      <section className="bg-amber-50/70 border-b border-stone-200 pt-24 pb-10 sm:pt-28 sm:pb-12 relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          <h1 className="font-heading text-2xl sm:text-4xl font-bold tracking-tight text-stone-900">
            Tour Packages
          </h1>
          <p className="text-stone-600 text-sm font-normal leading-relaxed max-w-2xl">
            Guided heritage tours, Chitwan wildlife safaris, and Pokhara scenic journeys across Nepal.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Mobile Filter Control Bar */}
        <div className="lg:hidden mb-6 flex items-center justify-between bg-white border border-stone-200 rounded-md p-3">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-2 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 px-3.5 py-2 rounded-md transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-800" />
            <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
          </button>

          <span className="text-xs text-stone-600 font-medium">
            {filteredTours.length} Tours
          </span>
        </div>

        {/* Mobile Filter Drawer */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs flex justify-end lg:hidden">
            <div className="bg-white w-full max-w-xs h-full p-5 overflow-y-auto flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between pb-3 mb-5 border-b border-stone-200">
                  <h3 className="font-heading font-semibold text-sm text-stone-900">
                    Filter Tours
                  </h3>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-1 rounded text-stone-500 hover:text-stone-900 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {filterControls}
              </div>

              <div className="pt-4 border-t border-stone-200 flex gap-3 mt-6">
                <button
                  onClick={() => {
                    resetFilters();
                    setIsMobileFilterOpen(false);
                  }}
                  className="w-1/2 py-2 rounded-md border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-100 cursor-pointer"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-1/2 py-2 rounded-md bg-amber-800 text-white font-semibold text-xs hover:bg-amber-900 cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-4 bg-white border border-stone-200 rounded-md p-5 sticky top-24">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200">
              <h2 className="text-sm font-semibold text-stone-900">
                Filters
              </h2>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs font-semibold text-amber-800 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {filterControls}
          </aside>

          {/* Main Tour Catalog Grid */}
          <main className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 text-xs sm:text-sm text-stone-600 font-medium">
              <span>Showing <strong className="text-stone-900 font-semibold">{loading ? "..." : filteredTours.length}</strong> tour packages</span>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs font-semibold text-amber-800 hover:underline cursor-pointer"
                >
                  Clear filters ({activeFilterCount})
                </button>
              )}
            </div>

            {loading ? (
              <PackageGridSkeleton count={6} />
            ) : filteredTours.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-md p-10 text-center space-y-3 max-w-md mx-auto my-4">
                <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
                  <Compass className="w-5 h-5 text-amber-800" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading text-sm font-semibold text-stone-900">
                    {activeFilterCount > 0
                      ? "No tours match your selected filters."
                      : "No tours found"}
                  </h3>
                  <p className="text-stone-500 text-xs font-normal leading-relaxed">
                    {activeFilterCount > 0
                      ? "Try adjusting or clearing your filters to see more results."
                      : "There are currently no tour packages available."}
                  </p>
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-md transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Filters</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredTours.map((tour) => (
                  <div
                    key={tour.id}
                    className="bg-white rounded-md border border-stone-200 overflow-hidden flex flex-col justify-between hover:border-stone-400 transition-colors group"
                  >
                    <Link href={`/tours/${tour.slug}`} className="block flex-1 flex flex-col justify-between">
                      <div>
                        {/* Clean Image Frame */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-950">
                          <img
                            src={tour.image || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800"}
                            alt={tour.title}
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300 ease-out opacity-95 group-hover:opacity-100"
                          />
                          {tour.region && (
                            <span className="absolute top-3 left-3 bg-stone-950/80 text-white text-[11px] font-medium px-2.5 py-0.5 rounded">
                              {tour.region}
                            </span>
                          )}
                          {tour.durationDays && (
                            <span className="absolute top-3 right-3 bg-stone-900/80 text-amber-300 text-[11px] font-semibold px-2.5 py-0.5 rounded">
                              {tour.durationDays} Days
                            </span>
                          )}
                        </div>

                        {/* Scannable Card Body */}
                        <div className="p-4 space-y-2">
                          <h3 className="font-heading text-base font-semibold text-stone-900 group-hover:text-amber-900 transition-colors line-clamp-1">
                            {tour.title}
                          </h3>

                          {/* Key Specs Row */}
                          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                            <span>Type: <strong className="text-stone-900 font-semibold">{tour.tourType || "Guided Tour"}</strong></span>
                            <span>Region: <strong className="text-stone-900 font-semibold">{tour.region || "Nepal"}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Row */}
                      <div className="p-4 pt-0 border-t border-stone-100 mt-2">
                        <div className="flex items-center justify-between pt-2.5">
                          <div>
                            <span className="text-[11px] text-stone-500 block">From</span>
                            <span className="text-base font-bold text-stone-900">
                              ${tour.priceUSD?.toLocaleString()} <span className="text-xs font-normal text-stone-500">USD</span>
                            </span>
                          </div>

                          <span className="text-xs font-semibold text-amber-800 group-hover:underline flex items-center gap-1">
                            <span>View Details</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
}
