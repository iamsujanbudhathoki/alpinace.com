"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SlidersHorizontal, X, Search, RotateCcw, ArrowRight, Compass } from "lucide-react";
import { TrekItem } from "@/lib/trek-data";
import { TrekService, PackageFilterService, PackageFilterOptions, CategoryService } from "@/lib/services/admin-service";
import { PackageGridSkeleton } from "@/components/marketing/skeletons/package-grid-skeleton";
import { CategoryType, PackageStatus, PackageSortOption, FILTER_ALL, TripDifficulty } from "@/lib/admin-data";

interface TrekkingCatalogClientProps {
  initialTreks: TrekItem[];
  initialFilterOptions: PackageFilterOptions | null;
}

export function TrekkingCatalogClient({
  initialTreks,
  initialFilterOptions,
}: TrekkingCatalogClientProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "All";

  const [treks, setTreks] = useState<TrekItem[]>(initialTreks);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterOptions, setFilterOptions] = useState<PackageFilterOptions | null>(initialFilterOptions);
  const [categoryList, setCategoryList] = useState<{ id: string; name: string; slug?: string }[]>([]);

  // Filter States
  const [prevCategoryParam, setPrevCategoryParam] = useState(categoryParam);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [maxDuration, setMaxDuration] = useState<number>(initialFilterOptions?.maxDuration || 30);
  const [sortBy, setSortBy] = useState<string>("rating");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync category parameter safely during render when query param changes
  if (categoryParam !== prevCategoryParam) {
    setPrevCategoryParam(categoryParam);
    setSelectedCategory(categoryParam);
  }

  // Fetch trekking categories and filter options on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [opts, cats] = await Promise.all([
          filterOptions ? Promise.resolve(filterOptions) : PackageFilterService.getOptions("Trekking"),
          CategoryService.getByType(CategoryType.TREKKING).catch(() => []),
        ]);
        if (opts) {
          setFilterOptions(opts);
          if (!initialFilterOptions && opts.maxDuration) setMaxDuration(opts.maxDuration);
        }
        if (cats && cats.length > 0) {
          setCategoryList(cats.map((c) => ({ id: c.id, name: c.name, slug: c.slug })));
        }
      } catch (e) {
        console.warn("Failed to load trekking filter metadata:", e);
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

  const isDefaultFilter =
    !debouncedSearch &&
    selectedCategory === "All" &&
    selectedDifficulty === "All" &&
    maxDuration >= (filterOptions?.maxDuration || 30) &&
    sortBy === "rating";

  useEffect(() => {
    if (isDefaultFilter && treks === initialTreks) return;

    let isCancelled = false;
    async function loadTreks() {
      setLoading(true);
      try {
        const raw = await TrekService.getPublicAll({
          search: debouncedSearch,
          category: selectedCategory === "All" ? undefined : selectedCategory,
          difficulty: selectedDifficulty === "All" ? undefined : selectedDifficulty,
          maxDuration: maxDuration < (filterOptions?.maxDuration || 30) ? maxDuration : undefined,
          sortBy,
          status: PackageStatus.ACTIVE,
        });
        const itemsList: TrekItem[] = (Array.isArray(raw) ? raw : (raw as any)?.items || []).map((p: any) => ({
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
          maxAltitudeMeters: Number(p.maxAltitudeMeters || 0),
          difficulty: p.difficulty || "Moderate",
          priceUSD: Number(p.priceUSD || 0),
          rating: Number(p.rating || 5),
          reviewsCount: Number(p.reviewsCount || 0),
          image: p.image || "",
          shortDesc: p.shortDesc || "",
          status: p.status,
        }));
        if (!isCancelled) {
          setTreks(itemsList);
        }
      } catch (e) {
        console.warn("Failed to load trek packages from backend:", e);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    loadTreks();
    return () => {
      isCancelled = true;
    };
  }, [debouncedSearch, selectedCategory, selectedDifficulty, maxDuration, sortBy, filterOptions?.maxDuration, isDefaultFilter, initialTreks]);

  const router = useRouter();
  const pathname = usePathname();

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedDifficulty("All");
    setMaxDuration(filterOptions?.maxDuration || 30);
    setSortBy("rating");
    if (typeof window !== "undefined" && window.location.search) {
      window.history.pushState({}, "", window.location.pathname);
      router.replace(pathname, { scroll: false });
    }
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "All") count++;
    if (selectedDifficulty !== "All") count++;
    if (maxDuration < (filterOptions?.maxDuration || 30)) count++;
    if (searchQuery.trim() !== "") count++;
    return count;
  }, [selectedCategory, selectedDifficulty, maxDuration, searchQuery, filterOptions?.maxDuration]);

  // Filtered Treks list
  const filteredTreks = useMemo(() => {
    let list = [...treks];

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

    if (selectedDifficulty !== "All") {
      const targetDiff = selectedDifficulty.toLowerCase();
      list = list.filter((t) => t.difficulty && String(t.difficulty).toLowerCase() === targetDiff);
    }

    if (maxDuration < (filterOptions?.maxDuration || 30)) {
      list = list.filter((t) => Number(t.durationDays) <= maxDuration);
    }

    // Sort list
    list.sort((a, b) => {
      if (sortBy === PackageSortOption.PRICE_ASC) return (a.priceUSD || 0) - (b.priceUSD || 0);
      if (sortBy === PackageSortOption.PRICE_DESC) return (b.priceUSD || 0) - (a.priceUSD || 0);
      if (sortBy === PackageSortOption.DURATION) return (a.durationDays || 0) - (b.durationDays || 0);
      return (b.rating || 5) - (a.rating || 5);
    });

    return list;
  }, [treks, debouncedSearch, selectedCategory, selectedDifficulty, maxDuration, sortBy, filterOptions?.maxDuration]);

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
      { label: "Everest Region", value: "Everest Region" },
      { label: "Annapurna Region", value: "Annapurna Region" },
      { label: "Manaslu Region", value: "Manaslu Region" },
      { label: "Langtang Region", value: "Langtang Region" },
    ];
  }, [categoryList, filterOptions?.categories]);

  // Clean Compact Dropdown Controls
  const filterControls = (
    <div className="space-y-5">
      {/* Search Input */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Search Route
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Everest, Annapurna..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-sm border border-stone-200 focus:outline-none focus:border-stone-400 bg-stone-50 font-normal text-slate-800 placeholder:text-stone-400"
          />
        </div>
      </div>

      {/* Category Dropdown Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full text-xs px-3 py-2.5 rounded-sm border border-stone-200 focus:outline-none focus:border-stone-400 bg-stone-50 font-normal text-slate-800 cursor-pointer"
        >
          <option value="All">All Categories</option>
          {normalizedCategories.map((cat, idx) => (
            <option key={`${cat.value}-${idx}`} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Grade & Difficulty Dropdown Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Grade &amp; Difficulty
        </label>
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="w-full text-xs px-3 py-2.5 rounded-sm border border-stone-200 focus:outline-none focus:border-stone-400 bg-stone-50 font-normal text-slate-800 cursor-pointer"
        >
          <option value="All">All Difficulties</option>
          <option value={TripDifficulty.EASY}>Easy</option>
          <option value={TripDifficulty.MODERATE}>Moderate</option>
          <option value={TripDifficulty.CHALLENGING}>Challenging</option>
          <option value={TripDifficulty.STRENUOUS}>Strenuous</option>
          <option value={TripDifficulty.EXTREME}>Extreme</option>
        </select>
      </div>

      {/* Duration Slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Max Duration
          </label>
          <span className="text-xs font-bold text-amber-700">
            {maxDuration} Days
          </span>
        </div>
        <input
          type="range"
          min={3}
          max={filterOptions?.maxDuration || 30}
          value={maxDuration}
          onChange={(e) => setMaxDuration(Number(e.target.value))}
          className="w-full accent-slate-900 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] font-medium text-slate-600 mt-1">
          <span>3 Days</span>
          <span>{filterOptions?.maxDuration || 30} Days</span>
        </div>
      </div>

      {/* Sort Options */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full text-xs px-3 py-2.5 rounded-sm border border-stone-200 focus:outline-none focus:border-stone-400 bg-stone-50 font-normal text-slate-800 cursor-pointer"
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
    <div className="bg-stone-50/60 min-h-screen pb-24 font-sans text-slate-900">
      {/* Hero Banner Header */}
      <section className="bg-slate-950 text-white py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1600"
            alt="Himalayan Trekking Circuits"
            className="w-full h-full object-cover opacity-25 object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-wider block">
            Sherpa-Guided Circuits
          </span>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Himalayan Trekking Routes
          </h1>
          <p className="text-stone-300 text-sm sm:text-base font-normal leading-relaxed max-w-2xl">
            Clean, high-altitude trekking itineraries organized directly from Kathmandu. Certified Sherpa guides, lodge bookings, and permit logistics.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Mobile Filter Control Bar */}
        <div className="lg:hidden mb-6 flex items-center justify-between bg-white border border-stone-200 rounded-sm p-3.5 shadow-2xs">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-2 text-xs font-bold text-slate-900 bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-sm transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700" />
            <span>Filter Routes {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
          </button>

          <span className="text-xs text-slate-700 font-semibold">
            {filteredTreks.length} Itineraries
          </span>
        </div>

        {/* Mobile Filter Drawer */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end lg:hidden">
            <div className="bg-white w-full max-w-xs h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-200">
                  <h3 className="font-heading font-bold text-sm text-slate-900">
                    Filter Trekking Routes
                  </h3>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-1 rounded-sm text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {filterControls}
              </div>

              <div className="pt-6 border-t border-stone-200 flex gap-3 mt-6">
                <button
                  onClick={() => {
                    resetFilters();
                    setIsMobileFilterOpen(false);
                  }}
                  className="w-1/2 py-2.5 rounded-sm border border-stone-300 text-slate-800 font-bold text-xs hover:bg-stone-100 cursor-pointer"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-1/2 py-2.5 rounded-sm bg-slate-950 text-white font-bold text-xs hover:bg-slate-900 cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-4 bg-white border border-stone-200 rounded-sm p-6 sticky top-24 shadow-2xs">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-200">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Filter Routes
              </h2>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs font-semibold text-amber-700 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {filterControls}
          </aside>

          {/* Main Route Catalog Grid */}
          <main className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 text-xs sm:text-sm text-slate-600 font-medium">
              <span>Showing <strong className="text-slate-900 font-bold">{loading ? "..." : filteredTreks.length}</strong> trekking routes</span>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs font-bold text-amber-700 hover:underline cursor-pointer"
                >
                  Clear filters ({activeFilterCount})
                </button>
              )}
            </div>

            {loading ? (
              <PackageGridSkeleton count={6} />
            ) : filteredTreks.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-sm p-12 text-center space-y-4 shadow-2xs max-w-md mx-auto my-6">
                <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
                  <Compass className="w-6 h-6 text-amber-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading text-base font-bold text-slate-900">
                    No Matching Routes Found
                  </h3>
                  <p className="text-slate-600 text-xs font-normal leading-relaxed">
                    We couldn&apos;t find any trekking routes matching your selected filter criteria.
                  </p>
                </div>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-950 hover:bg-slate-900 text-white px-5 py-2.5 rounded-sm transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredTreks.map((trk) => (
                  <div
                    key={trk.id}
                    className="bg-white rounded-sm border border-stone-200 overflow-hidden flex flex-col justify-between hover:border-stone-400 transition-all duration-300 group shadow-2xs"
                  >
                    <Link href={`/trekking/${trk.slug}`} className="block flex-1 flex flex-col justify-between">
                      <div>
                        {/* Clean Image Frame */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
                          <img
                            src={trk.image || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800"}
                            alt={trk.title}
                            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out opacity-95 group-hover:opacity-100"
                          />
                          {trk.region && (
                            <span className="absolute top-3 left-3 bg-slate-950/90 text-white text-[11px] font-medium px-2.5 py-0.5 rounded-sm tracking-wide">
                              {trk.region}
                            </span>
                          )}
                          {trk.durationDays && (
                            <span className="absolute top-3 right-3 bg-stone-900/90 text-amber-400 text-[11px] font-bold px-2.5 py-0.5 rounded-sm">
                              {trk.durationDays} Days
                            </span>
                          )}
                        </div>

                        {/* Scannable Card Body */}
                        <div className="p-5 space-y-3">
                          <h3 className="font-heading text-base sm:text-lg font-bold text-slate-950 group-hover:text-amber-700 transition-colors leading-snug line-clamp-1">
                            {trk.title}
                          </h3>

                          {/* Key Specs Row */}
                          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                            <span>Max Altitude: <strong className="text-slate-900 font-bold">{trk.maxAltitudeMeters ? `${trk.maxAltitudeMeters.toLocaleString()}m` : "High Altitude"}</strong></span>
                            <span>Grade: <strong className="text-slate-900 font-bold">{trk.difficulty?.replace(" Trek", "") || "Moderate"}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Row */}
                      <div className="p-5 pt-0 border-t border-stone-100 mt-2">
                        <div className="flex items-center justify-between pt-3">
                          <div>
                            <span className="text-[11px] text-slate-600 block font-medium">From</span>
                            <span className="text-base font-bold text-slate-950">
                              ${trk.priceUSD?.toLocaleString()} <span className="text-xs font-normal text-slate-600">USD</span>
                            </span>
                          </div>

                          <span className="text-xs font-bold text-amber-700 group-hover:underline flex items-center gap-1">
                            <span>Explore Route</span>
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
