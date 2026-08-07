"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, SlidersHorizontal, X, Search, RotateCcw } from "lucide-react";
import { TrekItem } from "@/lib/trek-data";
import { TrekService } from "@/lib/services/admin-service";

export default function TrekkingPage() {
  const [treks, setTreks] = useState<TrekItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [maxDuration, setMaxDuration] = useState<number>(30);
  const [sortBy, setSortBy] = useState<string>("rating");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    async function loadTreks() {
      try {
        const data = await TrekService.getAll();
        setTreks(data);
      } catch (e) {
        console.warn("Failed to load trek packages from backend:", e);
      } finally {
        setLoading(false);
      }
    }
    loadTreks();
  }, []);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedDifficulty("All");
    setMaxDuration(30);
    setSortBy("rating");
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim() !== "") count++;
    if (selectedDifficulty !== "All") count++;
    if (maxDuration < 30) count++;
    if (sortBy !== "rating") count++;
    return count;
  }, [searchQuery, selectedDifficulty, maxDuration, sortBy]);

  const filteredTreks = useMemo(() => {
    return treks
      .filter((trk) => {
        const matchesSearch =
          trk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trk.region.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDifficulty =
          selectedDifficulty === "All" || trk.difficulty === selectedDifficulty;

        const matchesDuration = trk.durationDays <= maxDuration;

        return matchesSearch && matchesDifficulty && matchesDuration;
      })
      .sort((a, b) => {
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "price-low") return a.priceUSD - b.priceUSD;
        if (sortBy === "price-high") return b.priceUSD - a.priceUSD;
        if (sortBy === "duration") return a.durationDays - b.durationDays;
        return 0;
      });
  }, [treks, searchQuery, selectedDifficulty, maxDuration, sortBy]);

  const filterControls = (
    <div className="space-y-5">
      {/* Search Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-800">
          Search Packages
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search region or route..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-all"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Difficulty Level */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-800">
          Difficulty Grade
        </label>
        <div className="space-y-1">
          {[
            { label: "All Difficulties", value: "All" },
            { label: "Moderate Trek", value: "Moderate Trek" },
            { label: "Challenging Trek", value: "Challenging Trek" },
            { label: "Strenuous Trek", value: "Strenuous Trek" },
          ].map((item) => {
            const isSelected = selectedDifficulty === item.value;
            return (
              <button
                key={item.value}
                onClick={() => setSelectedDifficulty(item.value)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-gold-500 text-slate-950 font-bold border border-gold-400 shadow-xs"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-transparent"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Max Duration Range */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-slate-800 text-xs">
            Max Duration
          </label>
          <span className="font-semibold text-slate-900 text-xs">
            {maxDuration} Days
          </span>
        </div>
        <input
          type="range"
          min="5"
          max="30"
          step="1"
          value={maxDuration}
          onChange={(e) => setMaxDuration(Number(e.target.value))}
          className="w-full accent-gold-600 cursor-pointer"
        />
      </div>

      {/* Sort Results By */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <label className="block text-xs font-bold text-slate-800">
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium rounded-lg px-3 py-2 focus:outline-none cursor-pointer"
        >
          <option value="rating">Guest Rating</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="duration">Duration: Short to Long</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-900 pt-16 sm:pt-20 pb-20 font-sans">
      {/* Clean Hero Header */}
      <section className="bg-white border-b border-slate-200 py-8 sm:py-12 px-4 sm:px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Nepal Expeditions &amp; Treks
          </p>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Himalayan Trekking Journeys
          </h1>

          <p className="text-slate-600 text-xs sm:text-sm max-w-2xl font-normal leading-relaxed pt-1">
            Curated trekking routes across Everest, Annapurna, Langtang, and Manaslu. Led by licensed mountain guides with boutique tea house and lodge accommodations.
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
              placeholder="Search trek name or region..."
              className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-all shadow-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-gold-600" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-gold-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
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
                  <SlidersHorizontal className="w-4 h-4 text-gold-600" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    Filter Routes
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
                  className="w-full bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold text-xs py-3 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Show {filteredTreks.length} Routes
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar Filter Column (Desktop only lg:col-span-4) */}
          <aside className="hidden lg:block lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs sticky top-24">
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Filter Routes
              </h2>
              <button
                onClick={resetFilters}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {filterControls}
          </aside>

          {/* Right Main Catalog Content Column */}
          <main className="lg:col-span-8 space-y-5">
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between text-xs text-slate-600 font-medium shadow-xs">
              <span>Showing <strong>{filteredTreks.length}</strong> trekking itineraries</span>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-gold-600 font-semibold hover:underline cursor-pointer"
                >
                  Clear filters ({activeFilterCount})
                </button>
              )}
            </div>

            {filteredTreks.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-3">
                <p className="text-slate-500 text-xs font-medium">
                  No matching trekking routes found.
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
                {filteredTreks.map((trk) => (
                  <div
                    key={trk.id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs hover:shadow-md group"
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
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          {trk.region} • {trk.durationDays} DAYS
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-gold-600 transition-colors">
                          {trk.title}
                        </h3>

                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {trk.shortDesc}
                        </p>

                        <div className="pt-2 text-[11px] text-slate-600 font-semibold border-t border-slate-100 flex items-center justify-between">
                          <span>Difficulty: {trk.difficulty.replace(" Trek", "")}</span>
                          <span className="text-slate-800 font-bold">★ {trk.rating}</span>
                        </div>
                      </div>
                    </Link>

                    {/* Footer Row with Details and Gold Book Button */}
                    <div className="p-4 pt-0 border-t border-slate-100 mt-2">
                      <div className="flex items-center justify-between pt-3">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Starting from</span>
                          <div className="text-base font-extrabold text-slate-900">
                            ${trk.priceUSD.toLocaleString()} <span className="text-xs font-normal text-slate-500">USD</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link href={`/trekking/${trk.slug}`}>
                            <button className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer">
                              Details
                            </button>
                          </Link>

                          <Link href="/contact">
                            <button className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gold-500 text-slate-950 border border-gold-400 hover:bg-gold-400 transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1">
                              <span>Book</span>
                              <ArrowRight className="w-3 h-3" />
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
              Custom &amp; Private Tailor-Made Treks
            </h3>
            <p className="text-xs text-slate-600 font-normal leading-relaxed">
              We organize private family treks, restricted region permits (Mustang, Dolpo, Manaslu), and helicopter supported routes.
            </p>
          </div>

          <Link href="/contact" className="shrink-0 w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl border border-gold-400 cursor-pointer transition-all shadow-xs hover:shadow-md">
              Contact Agency
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}

