"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  RotateCcw,
  Sparkles,
  Clock,
  TrendingUp,
  Calendar,
  Star,
  ArrowRight,
  Check,
} from "lucide-react";
import { initialTreksData, TrekItem } from "@/lib/trek-data";

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
    <div className="min-h-screen bg-[#fcfcf9] text-slate-900 pt-20 pb-20">
      {/* Dark Mountain Hero Header */}
      <section className="relative bg-[#0d1117] text-white py-16 px-6 md:px-12 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#261f10] border border-[#7d5e23]/50 text-amber-400 px-3.5 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Luxury Mountain Lodges &amp; Elite Guides</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
            Himalayan Trekking Journeys
          </h1>

          <p className="text-slate-300 text-sm md:text-base max-w-3xl font-medium leading-relaxed">
            Walk ancient trails lined with prayer flags, stay in premium boutique lodges with heated beds, and marvel at the world&apos;s highest peaks with local Sherpa legends.
          </p>
        </div>
      </section>

      {/* Main Catalog Workspace */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar Filter Column (4 cols) */}
          <aside className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Filter Expeditions</span>
              </h2>
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 uppercase tracking-wider transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Search Packages
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Everest, Annapurna"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                />
              </div>
            </div>

            {/* Difficulty Level */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Difficulty Level
              </label>
              <div className="space-y-1.5">
                {[
                  { label: "All", value: "All" },
                  { label: "Moderate Trek", value: "Moderate Trek" },
                  { label: "Challenging Trek", value: "Challenging Trek" },
                  { label: "Strenuous Trek", value: "Strenuous Trek" },
                ].map((item) => {
                  const isSelected = selectedDifficulty === item.value;
                  return (
                    <button
                      key={item.value}
                      onClick={() => setSelectedDifficulty(item.value)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-slate-950 text-white shadow-xs"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100"
                      }`}
                    >
                      <span>{item.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Max Duration Range */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                  Max Duration
                </label>
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
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
              <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                <span>5 Days</span>
                <span>30 Days</span>
              </div>
            </div>

            {/* Sort Results By */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Sort Results By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
              >
                <option value="rating">Highly Rated (Reviews)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="duration">Duration: Short to Long</option>
              </select>
            </div>
          </aside>

          {/* Right Main Catalog Content Column (8 cols) */}
          <main className="lg:col-span-8 space-y-6">
            {/* Counter Header Banner */}
            <div className="bg-white border border-slate-200/80 rounded-xl px-5 py-3.5 flex items-center justify-between text-xs shadow-xs">
              <div className="text-slate-700 font-medium">
                Showing <strong className="text-slate-900 font-bold">{filteredTreks.length}</strong> luxurious trekking itineraries
              </div>
            </div>

            {/* Treks Grid */}
            {filteredTreks.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
                <p className="text-slate-500 text-xs font-semibold">
                  No trekking itineraries found matching your selected filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="text-xs font-bold text-amber-700 underline cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredTreks.map((trk) => (
                  <div
                    key={trk.id}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all"
                  >
                    <div>
                      {/* Image Header with Badges */}
                      <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                        <img
                          src={trk.image}
                          alt={trk.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Rating Badge Top Left */}
                        <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span>{trk.rating} ({trk.reviewsCount})</span>
                        </div>
                        {/* Category Badge Top Right */}
                        <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
                          {trk.category}
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-5 space-y-3">
                        <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-amber-700 transition-colors">
                          {trk.title}
                        </h3>

                        <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2">
                          {trk.shortDesc}
                        </p>

                        {/* Specs Grid */}
                        <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600 font-semibold">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{trk.durationDays} Days Journey</span>
                            </span>
                            <span className="flex items-center gap-1.5 text-slate-800">
                              <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                              <span>{trk.difficulty.replace(" Trek", "")}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">Best: {trk.bestSeason}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price & Action Buttons Footer */}
                    <div className="p-5 pt-0 border-t border-slate-100/80 mt-2">
                      <div className="flex items-center justify-between pt-3">
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Starting From
                          </div>
                          <div className="text-lg font-extrabold text-slate-900">
                            ${trk.priceUSD.toLocaleString()}{" "}
                            <span className="text-xs font-medium text-slate-500">USD</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link href="/contact">
                            <button className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200">
                              Details
                            </button>
                          </Link>
                          <Link href="/contact">
                            <button className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-950 text-white hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer shadow-xs">
                              <span>Book</span>
                              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
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

        {/* Bottom Customized Trek CTA Section */}
        <div className="mt-16 bg-[#0d1117] text-white rounded-3xl p-8 md:p-10 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 max-w-2xl relative z-10">
            <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Seeking A Customized Off-the-Beaten Path Trek?
            </h3>
            <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed">
              We specialize in restricted regions like Mustang, Manaslu, Dolpo, and Kanchenjunga. Our adventure directors will coordinate specialized permits and private helicopter logistics.
            </p>
          </div>

          <Link href="/contact" className="relative z-10 shrink-0">
            <button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl cursor-pointer transition-colors shadow-lg">
              Inquire Now
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
