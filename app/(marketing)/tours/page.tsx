"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { initialToursData } from "@/lib/tour-data";

export default function ToursPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [maxDuration, setMaxDuration] = useState<number>(10);
  const [sortBy, setSortBy] = useState<string>("rating");

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedType("All");
    setMaxDuration(10);
    setSortBy("rating");
  };

  const filteredTours = useMemo(() => {
    return initialToursData
      .filter((tour) => {
        const matchesSearch =
          tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tour.region.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType =
          selectedType === "All" || tour.tourType === selectedType;

        const matchesDuration = tour.durationDays <= maxDuration;

        return matchesSearch && matchesType && matchesDuration;
      })
      .sort((a, b) => {
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "price-low") return a.priceUSD - b.priceUSD;
        if (sortBy === "price-high") return b.priceUSD - a.priceUSD;
        if (sortBy === "duration") return a.durationDays - b.durationDays;
        return 0;
      });
  }, [searchQuery, selectedType, maxDuration, sortBy]);

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900 pt-20 pb-20 font-sans">
      {/* Clean Hero Header */}
      <section className="bg-white border-b border-slate-200 py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Nepal Luxury Tours &amp; Retreats
          </p>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Cultural, Wildlife &amp; Wellness Journeys
          </h1>

          <p className="text-slate-600 text-sm max-w-2xl font-normal leading-relaxed pt-1">
            Sip premium tea overlooking ancient pagoda palaces, take private lakeside cruises, fly close to Everest, and rejuvenate in world-class wellness resorts.
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
                Filter Tours
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
                Search Tours
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search region or tour..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-all"
              />
            </div>

            {/* Tour Type */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Tour Type
              </label>
              <div className="space-y-1">
                {[
                  { label: "All Types", value: "All" },
                  { label: "Cultural Heritage", value: "Cultural Heritage" },
                  { label: "Wildlife Safari", value: "Wildlife Safari" },
                  { label: "Wellness Retreat", value: "Wellness Retreat" },
                  { label: "Scenic & Adventure", value: "Scenic & Adventure" },
                ].map((item) => {
                  const isSelected = selectedType === item.value;
                  return (
                    <button
                      key={item.value}
                      onClick={() => setSelectedType(item.value)}
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
                min="1"
                max="10"
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
          </aside>

          {/* Right Main Catalog Content Column (8 cols) */}
          <main className="lg:col-span-8 space-y-5">
            <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>Showing {filteredTours.length} luxury tours</span>
            </div>

            {filteredTours.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-2">
                <p className="text-slate-500 text-xs font-medium">
                  No matching tours found.
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
                {filteredTours.map((tour) => (
                  <div
                    key={tour.id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs group"
                  >
                    {/* Clickable Card Header & Body */}
                    <Link href={`/tours/${tour.slug}`} className="block">
                      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                        <img
                          src={tour.image}
                          alt={tour.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          {tour.region} • {tour.durationDays} {tour.durationDays === 1 ? "DAY" : "DAYS"}
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-gold-600 transition-colors">
                          {tour.title}
                        </h3>

                        <p className="text-xs text-slate-700 leading-relaxed line-clamp-2">
                          {tour.shortDesc}
                        </p>

                        <div className="pt-2 text-xs text-slate-700 font-semibold border-t border-slate-100 flex items-center justify-between">
                          <span>{tour.tourType}</span>
                          <span>Rating: {tour.rating}★</span>
                        </div>
                      </div>
                    </Link>

                    {/* Footer Row with Details and Gold Book Button */}
                    <div className="p-4 pt-0 border-t border-slate-100 mt-2">
                      <div className="flex items-center justify-between pt-3">
                        <div>
                          <span className="text-xs text-slate-700 uppercase font-bold">Starting from</span>
                          <div className="text-base font-bold text-slate-900">
                            ${tour.priceUSD.toLocaleString()} <span className="text-xs font-semibold text-slate-700">USD</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link href={`/tours/${tour.slug}`}>
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
              Looking for a Fully Bespoke Family Vacation?
            </h3>
            <p className="text-xs text-slate-600 font-normal leading-relaxed">
              We design custom tours featuring luxury wildlife safaris, private mountain flight charters, scenic helicopter drop-offs, and tailor-made cultural itineraries.
            </p>
          </div>

          <Link href="/contact" className="shrink-0">
            <button className="bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl border border-gold-400 cursor-pointer transition-all shadow-xs hover:shadow-md">
              Consult Destination Designer
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
