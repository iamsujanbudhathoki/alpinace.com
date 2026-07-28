"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { initialTreksData } from "@/lib/trek-data";

export default function TrekkingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [maxDuration, setMaxDuration] = useState<number>(30);
  const [sortBy, setSortBy] = useState<string>("rating");

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedDifficulty("All");
    setMaxDuration(30);
    setSortBy("rating");
  };

  const filteredTreks = useMemo(() => {
    return initialTreksData
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
  }, [searchQuery, selectedDifficulty, maxDuration, sortBy]);

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-900 pt-20 pb-20 font-sans">
      {/* Clean Human Hero Header */}
      <section className="bg-white border-b border-slate-200 py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Nepal Expeditions &amp; Treks
          </p>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Himalayan Trekking Journeys
          </h1>

          <p className="text-slate-600 text-sm max-w-2xl font-normal leading-relaxed pt-1">
            Curated trekking routes across Everest, Annapurna, Langtang, and Manaslu. Led by licensed mountain guides with boutique tea house and lodge accommodations.
          </p>
        </div>
      </section>

      {/* Main Content Workspace */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar Filter Column (4 cols) */}
          <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Filter Routes
              </h2>
              <button
                onClick={resetFilters}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>

            {/* Search Input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-600">
                Search Packages
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search region or route..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-all"
              />
            </div>

            {/* Difficulty Level */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-600">
                Difficulty Level
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
                          ? "bg-slate-900 text-white font-semibold"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100"
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
                <label className="font-semibold text-slate-600 text-[11px]">
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
                className="w-full accent-slate-900 cursor-pointer"
              />
            </div>

            {/* Sort Results By */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-semibold text-slate-600">
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
          </aside>

          {/* Right Main Catalog Content Column (8 cols) */}
          <main className="lg:col-span-8 space-y-5">
            <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>Showing {filteredTreks.length} trekking itineraries</span>
            </div>

            {filteredTreks.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-2">
                <p className="text-slate-500 text-xs font-medium">
                  No matching trekking routes found.
                </p>
                <button
                  onClick={resetFilters}
                  className="text-xs font-semibold text-slate-900 underline cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {filteredTreks.map((trk) => (
                  <div
                    key={trk.id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all"
                  >
                    <div>
                      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                        <img
                          src={trk.image}
                          alt={trk.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {trk.region} REGION • {trk.durationDays} DAYS
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 leading-snug">
                          {trk.title}
                        </h3>

                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {trk.shortDesc}
                        </p>

                        <div className="pt-2 text-[11px] text-slate-500 font-medium border-t border-slate-100 flex items-center justify-between">
                          <span>Difficulty: {trk.difficulty.replace(" Trek", "")}</span>
                          <span>Rating: {trk.rating}★</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0 border-t border-slate-100 mt-2">
                      <div className="flex items-center justify-between pt-3">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">From</span>
                          <div className="text-base font-bold text-slate-900">
                            ${trk.priceUSD.toLocaleString()} <span className="text-xs font-normal text-slate-500">USD</span>
                          </div>
                        </div>

                        <Link href="/contact">
                          <button className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer">
                            View Itinerary
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>

        {/* Bottom Custom Trip Section */}
        <div className="mt-14 bg-white text-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1 max-w-xl">
            <h3 className="text-base md:text-lg font-bold text-slate-900">
              Custom &amp; Private Tailor-Made Treks
            </h3>
            <p className="text-xs text-slate-600 font-normal leading-relaxed">
              We organize private family treks, restricted region permits (Mustang, Dolpo, Manaslu), and helicopter supported routes.
            </p>
          </div>

          <Link href="/contact" className="shrink-0">
            <button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 py-2.5 rounded-lg cursor-pointer transition-colors">
              Contact Agency
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
