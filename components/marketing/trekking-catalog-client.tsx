"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, SlidersHorizontal, X, Search, RotateCcw, Check } from "lucide-react";
import { TrekItem } from "@/lib/trek-data";
import { TrekService, PackageFilterService, PackageFilterOptions } from "@/lib/services/admin-service";
import { PackageGridSkeleton } from "@/components/marketing/skeletons/package-grid-skeleton";
import { FilterSidebarSkeleton } from "@/components/marketing/skeletons/filter-sidebar-skeleton";
import { PublicBookingModal } from "@/components/marketing/modals/public-booking-modal";
import { BookingPackageType, PackageStatus } from "@/lib/admin-data";
import { SearchableCategorySelect } from "@/components/marketing/searchable-category-select";

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
  const [loadingOptions, setLoadingOptions] = useState<boolean>(!initialFilterOptions);
  const [selectedBookingTrip, setSelectedBookingTrip] = useState<TrekItem | null>(null);
  const [submittedSlugs, setSubmittedSlugs] = useState<string[]>([]);

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

  // Fetch filter options if not provided initially
  useEffect(() => {
    if (filterOptions) return;
    async function loadOptions() {
      try {
        const opts = await PackageFilterService.getOptions("Trekking");
        if (opts) {
          setFilterOptions(opts);
          if (opts.maxDuration) setMaxDuration(opts.maxDuration);
        }
      } catch (e) {
        console.warn("Failed to load filter options from backend:", e);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, [filterOptions]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Refetch treks when filter criteria change (skip on initial mount if criteria default)
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
        const data = await TrekService.getAll({
          search: debouncedSearch,
          category: selectedCategory === "All" ? undefined : selectedCategory,
          difficulty: selectedDifficulty === "All" ? undefined : selectedDifficulty,
          maxDuration: maxDuration < (filterOptions?.maxDuration || 30) ? maxDuration : undefined,
          sortBy,
          status: PackageStatus.ACTIVE,
        });
        if (!isCancelled) {
          setTreks(data);
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
  }, [debouncedSearch, selectedCategory, selectedDifficulty, maxDuration, sortBy, filterOptions?.maxDuration]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedDifficulty("All");
    setMaxDuration(filterOptions?.maxDuration || 30);
    setSortBy("rating");
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
        (t) =>
          (t.categoryId && t.categoryId.toLowerCase() === selected) ||
          (t.category && t.category.toLowerCase() === selected) ||
          (t.categorySlug && t.categorySlug.toLowerCase() === selected)
      );
    }

    if (selectedDifficulty !== "All") {
      list = list.filter(
        (t) => t.difficulty.toLowerCase() === selectedDifficulty.toLowerCase()
      );
    }

    if (maxDuration < (filterOptions?.maxDuration || 30)) {
      list = list.filter((t) => t.durationDays <= maxDuration);
    }

    if (sortBy === "priceAsc") {
      list.sort((a, b) => a.priceUSD - b.priceUSD);
    } else if (sortBy === "priceDesc") {
      list.sort((a, b) => b.priceUSD - a.priceUSD);
    } else if (sortBy === "duration") {
      list.sort((a, b) => a.durationDays - b.durationDays);
    } else if (sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [treks, debouncedSearch, selectedCategory, selectedDifficulty, maxDuration, sortBy, filterOptions?.maxDuration]);

  const filterControls = (
    <div className="space-y-6">
      {/* Search Input */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Search Routes
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Everest, Annapurna..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-sm border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 bg-white font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Searchable Category Dropdown */}
      <SearchableCategorySelect
        label="Trek Category"
        categories={filterOptions?.categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(val) => setSelectedCategory(val)}
        totalCount={treks.length}
        loadingOptions={loadingOptions}
        placeholder="Search trek category..."
      />

      {/* Difficulty Filter */}
      <div>
        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
          Difficulty Level
        </label>
        <div className="space-y-0.5">
          {["All", "Moderate", "Challenging", "Strenuous"].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`w-full text-left text-xs px-2.5 py-1.5 transition-all flex items-center justify-between cursor-pointer ${
                selectedDifficulty === diff
                  ? "border-l-2 border-amber-700 text-amber-900 font-bold bg-amber-50/60 pl-3"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
              }`}
            >
              <span>{diff === "All" ? "All Difficulties" : diff}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Max Duration Slider */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          <span>Max Duration</span>
          <span className="text-amber-800">{maxDuration} Days</span>
        </div>
        <input
          type="range"
          min={3}
          max={filterOptions?.maxDuration || 30}
          value={maxDuration}
          onChange={(e) => setMaxDuration(Number(e.target.value))}
          className="w-full accent-amber-700 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-1">
          <span>3 Days</span>
          <span>{filterOptions?.maxDuration || 30} Days</span>
        </div>
      </div>

      {/* Sort By Dropdown */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full text-xs px-3 py-2.5 rounded-sm border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 bg-white font-medium cursor-pointer"
        >
          <option value="rating">Top Rated</option>
          <option value="priceAsc">Price: Low to High</option>
          <option value="priceDesc">Price: High to Low</option>
          <option value="duration">Shortest Duration</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Page Header */}
      <section className="bg-slate-900 text-white py-10 sm:py-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white mb-2">
            Himalayan Trekking Routes
          </h1>
          <p className="text-sm text-stone-200 max-w-2xl font-normal leading-relaxed">
            Guided circuits across Khumbu, Annapurna, Manaslu, and Langtang organized directly by our team in Kathmandu.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Mobile Filter Toggle Bar */}
        <div className="lg:hidden mb-6 flex items-center justify-between bg-white border border-stone-200 rounded-sm p-3 shadow-sm">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-2 text-xs font-bold text-stone-800 bg-stone-100 hover:bg-stone-200 px-3.5 py-2 rounded-sm transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700" />
            <span>Filter Routes {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
          </button>

          <span className="text-xs text-slate-800 font-semibold">
            {filteredTreks.length} Treks Found
          </span>
        </div>

        {/* Mobile Filter Drawer */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end lg:hidden">
            <div className="bg-white w-full max-w-xs h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
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

              <div className="pt-6 border-t border-slate-200 flex gap-3 mt-6">
                <button
                  onClick={() => {
                    resetFilters();
                    setIsMobileFilterOpen(false);
                  }}
                  className="w-1/2 py-2.5 rounded-sm border border-stone-300 text-stone-800 font-bold text-xs hover:bg-stone-100 cursor-pointer"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-1/2 py-2.5 rounded-sm bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar Filter Column */}
          <aside className="hidden lg:block lg:col-span-4 bg-white border border-stone-200 rounded-sm p-5 sticky top-24">
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Filter Routes
              </h2>
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {filterControls}
          </aside>

          {/* Right Main Catalog Content Column */}
          <main className="lg:col-span-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 text-xs sm:text-sm text-slate-700 font-medium">
              <span>Showing <strong className="text-slate-900 font-bold">{loading ? "..." : filteredTreks.length}</strong> trekking itineraries</span>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs font-bold text-amber-800 hover:underline cursor-pointer"
                >
                  Clear filters ({activeFilterCount})
                </button>
              )}
            </div>

            {loading ? (
              <PackageGridSkeleton count={6} />
            ) : filteredTreks.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-sm p-10 text-center space-y-3">
                <p className="text-slate-700 text-xs font-semibold">
                  No matching trekking routes found.
                </p>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-sm text-stone-900 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset all filters</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {filteredTreks.map((trk) => (
                  <div
                    key={trk.id}
                    className="bg-white rounded-sm border border-stone-200 overflow-hidden flex flex-col justify-between hover:border-stone-300 transition-all shadow-sm hover:shadow-md group"
                  >
                    {/* Clickable Card Header & Body */}
                    <Link href={`/trekking/${trk.slug}`} className="block">
                      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100">
                        <img
                          src={trk.image}
                          alt={trk.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                          {trk.region} • {trk.durationDays} DAYS
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-amber-700 transition-colors">
                          {trk.title}
                        </h3>

                        <p className="text-xs text-slate-700 leading-relaxed font-medium line-clamp-2">
                          {(trk.shortDesc || "").replace(/<[^>]*>?/gm, "")}
                        </p>

                        <div className="pt-2 text-xs text-slate-800 font-semibold border-t border-slate-100 flex items-center justify-between">
                          <span>Difficulty: {trk.difficulty?.replace(" Trek", "")}</span>
                          <span className="text-slate-900 font-bold">★ {trk.rating}</span>
                        </div>
                      </div>
                    </Link>

                    {/* Footer Row with Details and Book Button */}
                    <div className="p-4 pt-0 border-t border-slate-100 mt-2">
                      <div className="flex items-center justify-between pt-3">
                        <div>
                          <span className="text-xs text-slate-700 uppercase font-bold block">Starting from</span>
                          <div className="text-base font-extrabold text-slate-900">
                            ${trk.priceUSD?.toLocaleString()} <span className="text-xs font-bold text-slate-700">USD</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link href={`/trekking/${trk.slug}`}>
                            <button className="px-3 py-1.5 rounded-sm text-xs font-semibold bg-stone-100 border border-stone-200 text-stone-700 hover:bg-stone-200 transition-all cursor-pointer">
                              Details
                            </button>
                          </Link>

                          {submittedSlugs.includes(trk.slug) ? (
                            <div className="px-3.5 py-1.5 rounded-sm text-xs font-bold bg-emerald-700 text-white flex items-center gap-1 shadow-sm">
                              <span>Requested</span>
                              <Check className="w-3 h-3" />
                            </div>
                          ) : (
                            <button
                              onClick={() => setSelectedBookingTrip(trk)}
                              className="px-3.5 py-1.5 rounded-sm text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer flex items-center gap-1.5"
                            >
                              <span>Book</span>
                              <ArrowRight className="w-3 h-3 text-amber-500" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>

        {/* Bottom Custom Trip Section */}
        <div className="mt-12 sm:mt-14 bg-white text-stone-900 rounded-sm p-6 sm:p-8 border border-stone-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1 max-w-xl">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Custom &amp; Private Tailor-Made Treks
            </h3>
            <p className="text-xs text-slate-600 font-normal leading-relaxed">
              We organize private family treks, restricted region permits (Mustang, Dolpo, Manaslu), and helicopter supported routes.
            </p>
          </div>

          <Link href="/contact" className="shrink-0 w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs px-5 py-2.5 rounded-sm cursor-pointer transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2">
              <span>Contact Agency</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
            </button>
          </Link>
        </div>
      </section>

      {/* Public Booking Modal */}
      {selectedBookingTrip && (
        <PublicBookingModal
          isOpen={!!selectedBookingTrip}
          onClose={() => setSelectedBookingTrip(null)}
          onSuccess={() => {
            if (selectedBookingTrip) {
              setSubmittedSlugs((prev) => [...prev, selectedBookingTrip.slug]);
            }
          }}
          trip={{
            title: selectedBookingTrip.title,
            slug: selectedBookingTrip.slug,
            region: selectedBookingTrip.region,
            durationDays: selectedBookingTrip.durationDays,
            priceUSD: selectedBookingTrip.priceUSD,
            maxAltitudeMeters: selectedBookingTrip.maxAltitudeMeters,
            difficulty: selectedDifficulty,
            categoryType: BookingPackageType.TREKKING,
          }}
        />
      )}
    </div>
  );
}
