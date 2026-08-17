"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, SlidersHorizontal, X, Search, RotateCcw } from "lucide-react";
import { ClimbingGrade, ExpeditionItem } from "@/lib/expedition-data";
import { ExpeditionService, PackageFilterService, PackageFilterOptions } from "@/lib/services/admin-service";
import { PackageGridSkeleton } from "@/components/marketing/skeletons/package-grid-skeleton";
import { FilterSidebarSkeleton } from "@/components/marketing/skeletons/filter-sidebar-skeleton";

function ExpeditionsPageContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("categoryId") || "All";

  const [expeditions, setExpeditions] = useState<ExpeditionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterOptions, setFilterOptions] = useState<PackageFilterOptions | null>(null);
  const [loadingOptions, setLoadingOptions] = useState<boolean>(true);

  // Filter States
  const [prevCategoryParam, setPrevCategoryParam] = useState(categoryParam);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("All");
  const [minPeakHeight, setMinPeakHeight] = useState<number>(6000);
  const [sortBy, setSortBy] = useState<string>("rating");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync categoryId safely during render when query param changes without triggering cascading effect renders
  if (categoryParam !== prevCategoryParam) {
    setPrevCategoryParam(categoryParam);
    setSelectedCategory(categoryParam);
  }

  // Fetch filter options from backend
  useEffect(() => {
    async function loadOptions() {
      try {
        const opts = await PackageFilterService.getOptions("Expedition");
        if (opts) {
          setFilterOptions(opts);
          if (opts.minAltitude) setMinPeakHeight(opts.minAltitude);
        }
      } catch (e) {
        console.warn("Failed to load expedition filter options from backend:", e);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch from backend whenever filters change
  useEffect(() => {
    let isCancelled = false;
    async function loadExpeditions() {
      setLoading(true);
      try {
        const raw = await ExpeditionService.getAll({
          search: debouncedSearch,
          categoryId: selectedCategory === "All" ? undefined : selectedCategory,
          difficulty: selectedGrade === "All" ? undefined : selectedGrade,
          sortBy,
          status: "active",
        });
        const mapped: ExpeditionItem[] = raw.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          category: p.category,
          rating: Number(p.rating),
          reviewsCount: Number(p.reviewsCount),
          image: p.image || "",
          shortDesc: p.shortDesc || "",
          durationDays: Number(p.durationDays),
          peakHeightM: Number(p.peakHeightM || p.maxAltitudeMeters || 0),
          climbingGrade: p.climbingGrade || (p.difficulty as unknown as ClimbingGrade),
          bestSeason: p.bestSeason || "",
          priceUSD: Number(p.priceUSD),
          permitsRequired: p.permitsRequired || [],
          status: p.status,
          region: p.region,
        }));
        if (!isCancelled) {
          setExpeditions(mapped);
        }
      } catch (e) {
        console.warn("Failed to load expedition packages from backend:", e);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    loadExpeditions();
    return () => {
      isCancelled = true;
    };
  }, [debouncedSearch, selectedCategory, selectedGrade, minPeakHeight, sortBy]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedGrade("All");
    setMinPeakHeight(filterOptions?.minAltitude || 5500);
    setSortBy("rating");
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim() !== "") count++;
    if (selectedCategory !== "All") count++;
    if (selectedGrade !== "All") count++;
    if (minPeakHeight > (filterOptions?.minAltitude || 5500)) count++;
    if (sortBy !== "rating") count++;
    return count;
  }, [searchQuery, selectedCategory, selectedGrade, minPeakHeight, sortBy, filterOptions?.minAltitude]);

  const filteredExpeditions = expeditions;

  // Dynamic Options from backend
  const difficulties = filterOptions?.difficulties || [
    { label: "All Alpine Grades", value: "All" },
    { label: "PD (Slightly Difficult)", value: "Alpine PD" },
    { label: "AD (Fairly Difficult)", value: "Alpine AD" },
    { label: "D (Difficult / Technical)", value: "Alpine D" },
    { label: "ED (Extremely Difficult)", value: "Alpine ED" },
  ];

  const sortOptions = filterOptions?.sortOptions || [
    { label: "Guest Rating", value: "rating" },
    { label: "Price: Low to High", value: "price-low" },
    { label: "Price: High to Low", value: "price-high" },
    { label: "Peak Elevation: High to Low", value: "altitude" },
  ];

  const minAltitudeLimit = filterOptions?.minAltitude || 5500;
  const maxAltitudeLimit = filterOptions?.maxAltitude || 8848;

  const filterControls = loadingOptions ? (
    <FilterSidebarSkeleton />
  ) : (
    <div className="space-y-5">
      {/* Search Input */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-900">
          Search Expeditions
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Island Peak, Mera Peak, Lobuche..."
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Climbing Difficulty Level */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-900">
          Alpine Climbing Grade
        </label>
        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-lg px-3 py-2.5 focus:outline-none focus:bg-white focus:border-slate-400 cursor-pointer"
        >
          {!difficulties.some((d) => d.value === "All") && (
            <option value="All">All Grades</option>
          )}
          {difficulties.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {/* Min Peak Height */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-900">
            Min Summit Height
          </label>
          <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
            {minPeakHeight.toLocaleString()}m
          </span>
        </div>
        <input
          type="range"
          min={minAltitudeLimit}
          max={maxAltitudeLimit}
          step="100"
          value={minPeakHeight}
          onChange={(e) => setMinPeakHeight(Number(e.target.value))}
          className="w-full accent-amber-600 cursor-pointer"
        />
      </div>

      {/* Sort Results By */}
      <div className="space-y-1.5 pt-3 border-t border-slate-100">
        <label className="block text-sm font-semibold text-slate-900">
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-lg px-3 py-2.5 focus:outline-none focus:bg-white focus:border-slate-400 cursor-pointer"
        >
          {sortOptions.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-900 pt-16 sm:pt-20 pb-20 font-sans">
      {/* Hero Header */}
      <section className="bg-white border-b border-slate-200 py-8 sm:py-12 px-4 sm:px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-2">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-widest">
            Nepal Mountaineering &amp; Climbing
          </p>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Himalayan Peak Expeditions
          </h1>

          <p className="text-slate-600 text-xs sm:text-sm max-w-2xl font-normal leading-relaxed pt-1">
            Mountaineering ascents across Island Peak, Mera Peak, Lobuche East, Ama Dablam, and Himlung Himal. Directed by certified IFMGA Sherpa Masters with fixed rope logistics, 1:1 summit ratios, and satellite safety communications.
          </p>
        </div>
      </section>

      {/* Main Content Workspace */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6 sm:mt-8">
        {/* Mobile Filter Bar & Search Trigger (< lg) */}
        <div className="lg:hidden mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search peak expedition..."
              className="w-full text-sm bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-all shadow-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-600" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-slate-900 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Drawer Overlay */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div
              className="fixed inset-0"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <div className="relative z-10 bg-white w-full rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto space-y-4 border-t border-slate-200 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 sticky top-0 bg-white z-10 pt-1">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                  <h2 className="text-base font-bold text-slate-900">
                    Filter Expeditions
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={resetFilters}
                    className="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {filterControls}

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-3 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Show {filteredExpeditions.length} Expeditions
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar Filter Column (Desktop only lg:col-span-4) */}
          <aside className="hidden lg:block lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs sticky top-24">
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Filter Expeditions
              </h2>
              <button
                onClick={resetFilters}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {filterControls}
          </aside>

          {/* Right Main Catalog Content Column */}
          <main className="lg:col-span-8 space-y-5">
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between text-sm text-slate-600 font-medium shadow-xs">
              <span>Showing <strong className="text-slate-900">{loading ? "..." : filteredExpeditions.length}</strong> peak expeditions</span>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-sm text-amber-700 font-semibold hover:underline cursor-pointer"
                >
                  Clear filters ({activeFilterCount})
                </button>
              )}
            </div>

            {loading ? (
              <PackageGridSkeleton count={6} />
            ) : filteredExpeditions.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-3">
                <p className="text-slate-500 text-xs font-medium">
                  No matching mountaineering expeditions found.
                </p>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl text-slate-900 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset all filters</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {filteredExpeditions.map((exp) => (
                  <div
                    key={exp.id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs hover:shadow-md group"
                  >
                    {/* Clickable Card Header & Body */}
                    <Link href={`/expeditions/${exp.slug}`} className="block">
                      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100">
                        <img
                          src={exp.image}
                          alt={exp.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          {exp.region} • {exp.durationDays} DAYS
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-amber-700 transition-colors">
                          {exp.title}
                        </h3>

                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {(exp.shortDesc || "").replace(/<[^>]*>?/gm, "")}
                        </p>

                        <div className="pt-2 text-[11px] text-slate-600 font-semibold border-t border-slate-100 flex items-center justify-between">
                          <span>Summit: {exp.peakHeightM.toLocaleString()}m</span>
                          <span className="text-slate-800 font-bold">★ {exp.rating}</span>
                        </div>
                      </div>
                    </Link>

                    {/* Footer Row with Details and Book Button */}
                    <div className="p-4 pt-0 border-t border-slate-100 mt-2">
                      <div className="flex items-center justify-between pt-3">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Starting from</span>
                          <div className="text-base font-extrabold text-slate-900">
                            ${exp.priceUSD.toLocaleString()} <span className="text-xs font-normal text-slate-500">USD</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link href={`/expeditions/${exp.slug}`}>
                            <button className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer">
                              Details
                            </button>
                          </Link>

                          <Link href="/contact">
                            <button className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5">
                              <span>Book</span>
                              <ArrowRight className="w-3 h-3 text-amber-400" />
                            </button>
                          </Link>
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
        <div className="mt-12 sm:mt-14 bg-white text-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1 max-w-xl">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Planning an Independent or Multi-Peak Expedition?
            </h3>
            <p className="text-xs text-slate-600 font-normal leading-relaxed">
              We organize private expedition logistics, restricted peak permits, custom acclimatization rotations, and dedicated Sherpa climbing crews for any Himalayan objective.
            </p>
          </div>

          <Link href="/contact" className="shrink-0 w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2">
              <span>Consult Expedition Planner</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default function ExpeditionsPage() {
  return (
    <Suspense fallback={<PackageGridSkeleton count={6} />}>
      <ExpeditionsPageContent />
    </Suspense>
  );
}
