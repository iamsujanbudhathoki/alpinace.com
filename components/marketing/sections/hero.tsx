"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Compass,
  Mountain,
  MapPin,
  ChevronRight,
  ChevronDown,
  Loader2,
  DollarSign,
  Clock,
  RotateCcw,
} from "lucide-react";
import { TravelPackage } from "@/lib/home-data";
import { PublicSearchService } from "@/lib/services/admin-service";
import { PackageStatus } from "@/lib/admin-data";

export interface HeroSearchItem {
  id: string;
  title: string;
  slug: string;
  type: "Trek" | "Tour" | "Expedition";
  category?: string;
  region?: string;
  durationDays?: number;
  priceUSD?: number;
  difficulty?: string;
  image?: string;
  status?: PackageStatus;
}

interface HeroProps {
  initialTreks?: TravelPackage[];
  initialTours?: TravelPackage[];
  initialExpeditions?: TravelPackage[];
}

const PRICE_OPTIONS = [
  { value: "all", label: "Any price", minPrice: undefined, maxPrice: undefined },
  { value: "under-500", label: "Under $500", minPrice: undefined, maxPrice: 500 },
  { value: "500-1000", label: "$500–$1,000", minPrice: 500, maxPrice: 1000 },
  { value: "1000-2000", label: "$1,000–$2,000", minPrice: 1000, maxPrice: 2000 },
  { value: "2000-3000", label: "$2,000–$3,000", minPrice: 2000, maxPrice: 3000 },
  { value: "3000-plus", label: "$3,000+", minPrice: 3000, maxPrice: undefined },
];

const DURATION_OPTIONS = [
  { value: "all", label: "Any duration", minDuration: undefined, maxDuration: undefined },
  { value: "1-3", label: "1–3 days", minDuration: 1, maxDuration: 3 },
  { value: "4-7", label: "4–7 days", minDuration: 4, maxDuration: 7 },
  { value: "8-14", label: "8–14 days", minDuration: 8, maxDuration: 14 },
  { value: "15-21", label: "15–21 days", minDuration: 15, maxDuration: 21 },
  { value: "22-plus", label: "22+ days", minDuration: 22, maxDuration: undefined },
];

export function Hero({
  initialTreks = [],
  initialTours = [],
  initialExpeditions = [],
}: HeroProps) {
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | "Trek" | "Tour" | "Expedition">("All");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [durationRange, setDurationRange] = useState<string>("all");

  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<HeroSearchItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const parsedFilters = useMemo(() => {
    const priceOpt = PRICE_OPTIONS.find((p) => p.value === priceRange);
    const durationOpt = DURATION_OPTIONS.find((d) => d.value === durationRange);

    return {
      minPrice: priceOpt?.minPrice,
      maxPrice: priceOpt?.maxPrice,
      minDuration: durationOpt?.minDuration,
      maxDuration: durationOpt?.maxDuration,
    };
  }, [priceRange, durationRange]);

  const isAnyFilterActive = useMemo(() => {
    return (
      query.trim().length > 0 ||
      selectedCategory !== "All" ||
      priceRange !== "all" ||
      durationRange !== "all"
    );
  }, [query, selectedCategory, priceRange, durationRange]);

  const handleResetFilters = () => {
    setQuery("");
    setSelectedCategory("All");
    setPriceRange("all");
    setDurationRange("all");
    setIsOpen(false);
    setSearchResults([]);
  };

  // Debounced search effect - Hits backend search API with query & combined filters
  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2 && !isAnyFilterActive) {
      setSearchResults([]);
      setIsOpen(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const res = await PublicSearchService.search(
          trimmedQuery,
          selectedCategory,
          15,
          parsedFilters
        );
        if (res && Array.isArray(res.results)) {
          setSearchResults(res.results);
          setIsOpen(true);
        } else {
          setSearchResults([]);
        }
      } catch (e) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, selectedCategory, parsedFilters, isAnyFilterActive]);

  // Combined client filtering to guarantee accuracy on price & duration ranges
  const filteredResults = useMemo(() => {
    return searchResults.filter((item) => {
      // 1. Category check
      if (selectedCategory !== "All" && item.type !== selectedCategory) return false;

      // 2. Price check
      const price = item.priceUSD || 0;
      if (parsedFilters.minPrice !== undefined && price < parsedFilters.minPrice) return false;
      if (parsedFilters.maxPrice !== undefined && price > parsedFilters.maxPrice) return false;

      // 3. Duration check
      const days = item.durationDays || 0;
      if (parsedFilters.minDuration !== undefined && days < parsedFilters.minDuration) return false;
      if (parsedFilters.maxDuration !== undefined && days > parsedFilters.maxDuration) return false;

      return true;
    });
  }, [searchResults, selectedCategory, parsedFilters]);

  // Click outside handler to dismiss search suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPackageUrl = (item: HeroSearchItem) => {
    switch (item.type) {
      case "Trek":
        return `/trekking/${item.slug}`;
      case "Tour":
        return `/tours/${item.slug}`;
      case "Expedition":
        return `/expeditions/${item.slug}`;
      default:
        return `/trekking/${item.slug}`;
    }
  };

  const handleSelectResult = (item: HeroSearchItem) => {
    setIsOpen(false);
    const targetUrl = getPackageUrl(item);
    router.push(targetUrl);
  };

  const handleSearchSubmit = () => {
    setIsOpen(false);
    const params = new URLSearchParams();

    if (query.trim()) params.set("search", query.trim());
    if (selectedCategory !== "All") params.set("category", selectedCategory);
    if (parsedFilters.minPrice !== undefined) params.set("minPrice", String(parsedFilters.minPrice));
    if (parsedFilters.maxPrice !== undefined) params.set("maxPrice", String(parsedFilters.maxPrice));
    if (parsedFilters.minDuration !== undefined) params.set("minDuration", String(parsedFilters.minDuration));
    if (parsedFilters.maxDuration !== undefined) params.set("maxDuration", String(parsedFilters.maxDuration));

    let targetPath = "/trekking";
    if (selectedCategory === "Tour") targetPath = "/tours";
    if (selectedCategory === "Expedition") targetPath = "/expeditions";

    const queryString = params.toString();
    router.push(queryString ? `${targetPath}?${queryString}` : targetPath);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" && (query.trim().length >= 2 || isAnyFilterActive)) {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredResults.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredResults.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filteredResults.length) {
        handleSelectResult(filteredResults[selectedIndex]);
      } else {
        handleSearchSubmit();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <section className="relative isolate flex min-h-[90vh] sm:min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-stone-100 text-stone-900">
      {/* Background Natural Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-90"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Minimal Overlay for Maximum Video Detail */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-stone-950/15 via-transparent to-stone-950/30 pointer-events-none"
        aria-hidden="true"
      />

      {/* Centered Content Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 flex flex-col items-center text-center">
        {/* Editorial Heading */}
        <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl text-stone-900 mb-6 max-w-3xl leading-tight">
          Explore guided treks, tours &amp; expeditions.
        </h1>

        {/* Floating Search & Filter Bar */}
        <div
          ref={searchContainerRef}
          className="relative z-30 w-full max-w-4xl"
        >
          <div className="relative">
            <div className="bg-white/95 backdrop-blur-xl border border-stone-200/90 rounded-2xl sm:rounded-3xl shadow-[0_16px_40px_-12px_rgba(0,0,0,0.12)] p-2.5 sm:p-3 flex flex-col md:flex-row items-stretch md:items-center gap-2 transition-all duration-300 focus-within:border-stone-400">

              {/* Keyword Text Input */}
              <div className="flex-1 min-w-[200px] flex items-center bg-stone-50/80 rounded-xl border border-stone-200/60 px-3 py-1.5 focus-within:bg-white focus-within:border-stone-400 transition-colors">
                <MapPin className="h-4 w-4 text-stone-500 shrink-0 mr-2" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(-1);
                  }}
                  onFocus={() => {
                    if (query.trim().length >= 2 || isAnyFilterActive) {
                      setIsOpen(true);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Where do you want to explore?"
                  className="w-full bg-transparent text-stone-900 placeholder-stone-400 text-xs sm:text-sm font-normal py-1 focus:outline-none"
                  aria-label="Search destination or trip"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      inputRef.current?.focus();
                    }}
                    className="p-1 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                    aria-label="Clear keyword"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Category Select Dropdown */}
              <div className="relative min-w-[130px] flex items-center bg-stone-50/80 rounded-xl border border-stone-200/60 px-3 py-1.5 focus-within:bg-white focus-within:border-stone-400 transition-colors">
                <Compass className="h-4 w-4 text-stone-500 shrink-0 mr-2" />
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value as any);
                    setSelectedIndex(-1);
                  }}
                  className="w-full bg-transparent text-stone-900 text-xs sm:text-sm font-normal py-1 focus:outline-none cursor-pointer appearance-none pr-4"
                  aria-label="Filter by Category"
                >
                  <option value="All">All Categories</option>
                  <option value="Trek">Trekking</option>
                  <option value="Tour">Tours</option>
                  <option value="Expedition">Expeditions</option>
                </select>
                <ChevronDown className="h-3.5 w-3.5 text-stone-400 pointer-events-none absolute right-3" />
              </div>

              {/* Price Range Select Dropdown */}
              <div className="relative min-w-[120px] flex items-center bg-stone-50/80 rounded-xl border border-stone-200/60 px-3 py-1.5 focus-within:bg-white focus-within:border-stone-400 transition-colors">
                <DollarSign className="h-4 w-4 text-stone-500 shrink-0 mr-1" />
                <select
                  value={priceRange}
                  onChange={(e) => {
                    setPriceRange(e.target.value);
                    setSelectedIndex(-1);
                  }}
                  className="w-full bg-transparent text-stone-900 text-xs sm:text-sm font-normal py-1 focus:outline-none cursor-pointer appearance-none pr-4"
                  aria-label="Filter by Price"
                >
                  {PRICE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-3.5 w-3.5 text-stone-400 pointer-events-none absolute right-3" />
              </div>

              {/* Duration Range Select Dropdown */}
              <div className="relative min-w-[120px] flex items-center bg-stone-50/80 rounded-xl border border-stone-200/60 px-3 py-1.5 focus-within:bg-white focus-within:border-stone-400 transition-colors">
                <Clock className="h-4 w-4 text-stone-500 shrink-0 mr-1.5" />
                <select
                  value={durationRange}
                  onChange={(e) => {
                    setDurationRange(e.target.value);
                    setSelectedIndex(-1);
                  }}
                  className="w-full bg-transparent text-stone-900 text-xs sm:text-sm font-normal py-1 focus:outline-none cursor-pointer appearance-none pr-4"
                  aria-label="Filter by Duration"
                >
                  {DURATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-3.5 w-3.5 text-stone-400 pointer-events-none absolute right-3" />
              </div>

              {/* Primary Search Submit Button */}
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="inline-flex items-center justify-center rounded-xl bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all shadow-md shrink-0 gap-2 cursor-pointer group"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin text-stone-300" />
                ) : (
                  <Search className="h-4 w-4 text-stone-200 group-hover:scale-110 transition-transform" />
                )}
                <span>Search</span>
              </button>

              {/* Reset Filters Button */}
              {isAnyFilterActive && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  title="Reset filters"
                  className="inline-flex items-center justify-center p-2.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer shrink-0"
                  aria-label="Reset filters"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Search Suggestions / Popular Destination Chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-stone-600">
            <span className="font-medium text-stone-500">Popular:</span>
            {["Everest Base Camp", "Annapurna Circuit", "Manaslu Trek", "Lobuche East"].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setQuery(chip);
                  setIsOpen(true);
                  inputRef.current?.focus();
                }}
                className="bg-white/80 hover:bg-white text-stone-700 hover:text-stone-900 border border-stone-200/80 rounded-full px-3 py-1 font-medium transition-all shadow-xs hover:shadow-sm cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Dynamic Search Suggestions Popover Dropdown */}
          {isOpen && (query.trim().length >= 2 || isAnyFilterActive) && (
            <div className="absolute left-0 right-0 top-full mt-3 bg-white border border-stone-200 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in-50 slide-in-from-top-2 duration-150 text-left">

              {/* Active Filter Summary Bar */}
              <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-700">Active filters:</span>
                  <span className="bg-stone-200/70 text-stone-800 px-2 py-0.5 rounded-md font-medium">
                    {selectedCategory === "All" ? "All Categories" : selectedCategory}
                  </span>
                  {priceRange !== "all" && (
                    <span className="bg-stone-200/70 text-stone-800 px-2 py-0.5 rounded-md font-medium">
                      {PRICE_OPTIONS.find((p) => p.value === priceRange)?.label}
                    </span>
                  )}
                  {durationRange !== "all" && (
                    <span className="bg-stone-200/70 text-stone-800 px-2 py-0.5 rounded-md font-medium">
                      {DURATION_OPTIONS.find((d) => d.value === durationRange)?.label}
                    </span>
                  )}
                </div>
                {isAnyFilterActive && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-stone-600 hover:text-stone-900 underline text-xs font-medium cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Results List */}
              <div className="max-h-[360px] overflow-y-auto divide-y divide-stone-100 custom-scrollbar">
                {isSearching ? (
                  <div className="p-8 text-center text-stone-500 flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-stone-600" />
                    <span className="text-xs font-medium">Searching matching trips…</span>
                  </div>
                ) : filteredResults.length > 0 ? (
                  filteredResults.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={`${item.type}-${item.id}-${idx}`}
                        onClick={() => handleSelectResult(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`group p-3 sm:p-4 flex items-center justify-between cursor-pointer transition-colors text-left ${
                          isSelected
                            ? "bg-stone-100 text-stone-900"
                            : "hover:bg-stone-50 text-stone-800"
                        }`}
                      >
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 pr-3">
                          {/* Item Thumbnail / Featured Image */}
                          <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-lg bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center shrink-0 relative">
                            {item.image && !failedImages[item.id] ? (
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                sizes="48px"
                                className="object-cover"
                                onError={() => {
                                  setFailedImages((prev) => ({ ...prev, [item.id]: true }));
                                }}
                              />
                            ) : (
                              <div className="flex items-center justify-center text-stone-600 bg-stone-100 h-full w-full">
                                {item.type === "Expedition" ? (
                                  <Mountain className="h-5 w-5" />
                                ) : item.type === "Tour" ? (
                                  <Compass className="h-5 w-5" />
                                ) : (
                                  <MapPin className="h-5 w-5" />
                                )}
                              </div>
                            )}
                          </div>

                          {/* Title & Metadata */}
                          <div className="min-w-0">
                            <h4 className="text-sm sm:text-base font-medium text-stone-900 group-hover:text-stone-950 transition-colors truncate">
                              {item.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-stone-500 mt-0.5">
                              {item.region && <span>{item.region}</span>}
                              {item.durationDays ? (
                                <>
                                  <span>&bull;</span>
                                  <span>{item.durationDays} Days</span>
                                </>
                              ) : null}
                              {item.difficulty ? (
                                <>
                                  <span>&bull;</span>
                                  <span className="text-stone-600">{item.difficulty}</span>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        {/* Category Badge & Price */}
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                          {item.priceUSD ? (
                            <span className="text-xs sm:text-sm font-medium text-stone-700 hidden sm:inline">
                              ${item.priceUSD.toLocaleString()} USD
                            </span>
                          ) : null}

                          {/* Minimal Neutral Type Badge */}
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
                            {item.type}
                          </span>

                          <ChevronRight className="h-4 w-4 text-stone-400 group-hover:text-stone-800 transition-colors hidden sm:block" />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-stone-500">
                    <Compass className="h-8 w-8 text-stone-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-stone-700">
                      No matching trips found for selected filters
                    </p>
                  </div>
                )}
              </div>

              {/* Popover Footer Info */}
              <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
                <span>
                  Showing {filteredResults.length} {filteredResults.length === 1 ? "result" : "results"}
                </span>
                <span className="hidden sm:inline text-stone-400">
                  ↑ ↓ to navigate &bull; Enter to select &bull; Esc to dismiss
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
