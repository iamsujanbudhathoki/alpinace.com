"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ExpeditionItem } from "@/lib/expedition-data";
import { ExpeditionService } from "@/lib/services/admin-service";

export default function ExpeditionsPage() {
  const [expeditions, setExpeditions] = useState<ExpeditionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("All");
  const [minPeakHeight, setMinPeakHeight] = useState<number>(6000);
  const [sortBy, setSortBy] = useState<string>("rating");

  useEffect(() => {
    async function loadExpeditions() {
      try {
        const raw = await ExpeditionService.getAll();
        const mapped: ExpeditionItem[] = raw.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          category: "EXPEDITION",
          rating: Number(p.rating),
          reviewsCount: Number(p.reviewsCount ?? p.totalBookings),
          image: p.image ?? "",
          shortDesc: p.shortDesc ?? "",
          durationDays: Number(p.durationDays),
          peakHeightM: Number(p.maxAltitudeMeters),
          climbingGrade: p.difficulty as any,
          bestSeason: p.bestSeason ?? "",
          priceUSD: Number(p.priceUSD),
          permitsRequired: p.permitsRequired,
          status: p.status as any,
          region: p.region as any,
        }));
        setExpeditions(mapped);
      } catch (e) {
        console.warn("Failed to load expedition packages from backend:", e);
      } finally {
        setLoading(false);
      }
    }
    loadExpeditions();
  }, []);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedGrade("All");
    setMinPeakHeight(6000);
    setSortBy("rating");
  };

  const filteredExpeditions = useMemo(() => {
    return expeditions
      .filter((exp) => {
        const matchesSearch =
          exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exp.region.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesGrade =
          selectedGrade === "All" || exp.climbingGrade === selectedGrade;

        const matchesHeight = exp.peakHeightM >= minPeakHeight;

        return matchesSearch && matchesGrade && matchesHeight;
      })
      .sort((a, b) => {
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "price-low") return a.priceUSD - b.priceUSD;
        if (sortBy === "price-high") return b.priceUSD - a.priceUSD;
        if (sortBy === "height") return b.peakHeightM - a.peakHeightM;
        return 0;
      });
  }, [expeditions, searchQuery, selectedGrade, minPeakHeight, sortBy]);


  return (
    <div className="min-h-screen bg-stone-50 text-slate-900 pt-20 pb-20 font-sans">
      {/* Clean Hero Header */}
      <section className="bg-white border-b border-slate-200 py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Nepal Peak Expeditions
          </p>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            High-Altitude Mountaineering Expeditions
          </h1>

          <p className="text-slate-600 text-sm max-w-2xl font-normal leading-relaxed pt-1">
            From introductory trekking peaks to 8,000m summit attempts, led by IFMGA-certified expedition leaders with full basecamp medical and safety support.
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
                Filter Expeditions
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
              <label className="block text-xs font-bold text-slate-800">
                Search Expeditions
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search region or peak..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-all"
              />
            </div>

            {/* Climbing Grade */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Peak Category
              </label>
              <div className="space-y-1">
                {[
                  { label: "All Grades", value: "All" },
                  { label: "Non-Technical Trekking Peak", value: "Non-Technical Trekking Peak" },
                  { label: "Technical Alpine Grade", value: "Technical Alpine Grade" },
                  { label: "Extreme Technical Grade", value: "Extreme Technical Grade" },
                ].map((item) => {
                  const isSelected = selectedGrade === item.value;
                  return (
                    <button
                      key={item.value}
                      onClick={() => setSelectedGrade(item.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${isSelected
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

            {/* Min Peak Height Range */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-800 text-xs">
                  Max Duration
                </label>
                <span className="font-semibold text-slate-900 text-xs">
                  {minPeakHeight.toLocaleString()}m
                </span>
              </div>
              <input
                type="range"
                min="6000"
                max="8849"
                step="100"
                value={minPeakHeight}
                onChange={(e) => setMinPeakHeight(Number(e.target.value))}
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
                <option value="height">Peak Height: Highest First</option>
              </select>
            </div>
          </aside>

          {/* Right Main Catalog Content Column (8 cols) */}
          <main className="lg:col-span-8 space-y-5">
            <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>Showing {filteredExpeditions.length} peak expeditions</span>
            </div>

            {filteredExpeditions.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-2">
                <p className="text-slate-500 text-xs font-medium">
                  No matching expeditions found.
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
                {filteredExpeditions.map((exp) => (
                  <div
                    key={exp.id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs group"
                  >
                    {/* Clickable Card Header & Body */}
                    <Link href={`/expeditions/${exp.slug}`} className="block">
                      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                        <img
                          src={exp.image}
                          alt={exp.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          {exp.region} • {exp.durationDays} DAYS
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-gold-600 transition-colors">
                          {exp.title}
                        </h3>

                        <p className="text-xs text-slate-700 leading-relaxed line-clamp-2">
                          {exp.shortDesc}
                        </p>

                        <div className="pt-2 text-xs text-slate-700 font-semibold border-t border-slate-100 flex items-center justify-between">
                          <span>Summit: {exp.peakHeightM.toLocaleString()}m</span>
                          <span>Rating: {exp.rating}★</span>
                        </div>
                      </div>
                    </Link>

                    {/* Footer Row with Details and Gold Book Button */}
                    <div className="p-4 pt-0 border-t border-slate-100 mt-2">
                      <div className="flex items-center justify-between pt-3">
                        <div>
                          <span className="text-xs text-slate-700 uppercase font-bold">Starting from</span>
                          <div className="text-base font-bold text-slate-900">
                            ${exp.priceUSD.toLocaleString()} <span className="text-xs font-semibold text-slate-700">USD</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link href={`/expeditions/${exp.slug}`}>
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
        <div className="mt-14 bg-white text-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1 max-w-xl">
            <h3 className="text-base md:text-lg font-bold text-slate-900">
              Planning an Independent or Multi-Peak Expedition?
            </h3>
            <p className="text-xs text-slate-600 font-normal leading-relaxed">
              We organize private expedition logistics, restricted peak permits, custom acclimatization rotations, and dedicated Sherpa climbing crews for any Himalayan objective.
            </p>
          </div>

          <Link href="/contact" className="shrink-0">
            <button className="bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl border border-gold-400 cursor-pointer transition-all shadow-xs hover:shadow-md">
              Consult Expedition Planner
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
