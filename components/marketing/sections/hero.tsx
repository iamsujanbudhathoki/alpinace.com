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
  Loader2,
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

export function Hero({
  initialTreks = [],
  initialTours = [],
  initialExpeditions = [],
}: HeroProps) {
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"All" | "Trek" | "Tour" | "Expedition">("All");
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<HeroSearchItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Debounced search effect (250ms delay) - Hits backend search API directly
  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setSearchResults([]);
      setIsOpen(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const res = await PublicSearchService.search(trimmedQuery, activeTab, 10);
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
  }, [query, activeTab]);


  // Filter search results by active category tab inside popover
  const filteredResults = useMemo(() => {
    if (activeTab === "All") return searchResults;
    return searchResults.filter((item) => item.type === activeTab);
  }, [searchResults, activeTab]);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" && query.trim().length >= 2) {
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
      } else if (query.trim()) {
        setIsOpen(false);
        router.push(`/trekking?search=${encodeURIComponent(query.trim())}`);
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
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 flex flex-col items-center text-center">
        {/* Top Tagline Badge */}
      

        {/* Editorial Heading */}
        <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl  text-stone-900 tracking-tight mb-6 max-w-3xl leading-tight">
          Explore guided treks, tours &amp; expeditions.
        </h1>

      

        {/* Floating Light Search Container */}
        <div
          ref={searchContainerRef}
          className="relative z-30 w-full max-w-2xl sm:max-w-3xl"
        >
          <div className="relative">
            <div className="relative flex items-center bg-white/95 backdrop-blur-xl border border-stone-200/90 rounded-2xl shadow-[0_16px_40px_-12px_rgba(0,0,0,0.12)] p-2 sm:p-2.5 transition-all duration-300 focus-within:border-stone-400 focus-within:ring-4 focus-within:ring-stone-900/5">

              {/* Location/Search Icon Badge */}
              <div className="pl-3 sm:pl-4 pr-2 text-stone-500 flex items-center justify-center shrink-0">
                {isSearching ? (
                  <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-stone-800" />
                ) : (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-stone-700" />
                  </div>
                )}
              </div>

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(-1);
                }}
                onFocus={() => {
                  if (query.trim().length >= 2) {
                    setIsOpen(true);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Where do you want to explore? (e.g. Everest, Annapurna...)"
                className="w-full bg-transparent text-stone-900 placeholder-stone-400 text-sm sm:text-base font-normal px-2 py-2 sm:py-2.5 focus:outline-none"
                aria-label="Search treks, tours, expeditions"
              />

              {/* Clear Input Button */}
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setIsOpen(false);
                    inputRef.current?.focus();
                  }}
                  className="p-1.5 text-stone-400 hover:text-stone-700 transition-colors rounded-full hover:bg-stone-100 mr-1.5 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              )}

              {/* Primary Search Submit Button with Icon */}
              <button
                type="button"
                onClick={() => {
                  if (query.trim()) {
                    setIsOpen(false);
                    router.push(`/trekking?search=${encodeURIComponent(query.trim())}`);
                  }
                }}
                className="inline-flex items-center justify-center rounded-xl bg-stone-900 hover:bg-stone-800 text-white px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium transition-all shadow-md shrink-0 gap-2 cursor-pointer group"
              >
                <Search className="h-4 w-4 sm:h-4 sm:w-4 text-stone-200 group-hover:scale-110 transition-transform" />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Quick Search Suggestions / Destination Chips */}
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
          {isOpen && query.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-full mt-3 bg-white border border-stone-200 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in-50 slide-in-from-top-2 duration-150 text-left">

              {/* Category Filter Tabs Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-stone-50 border-b border-stone-200 text-xs sm:text-sm">
                <span className="text-stone-500 font-medium hidden sm:inline">
                  Filter category:
                </span>
                <div className="flex items-center gap-1 sm:gap-1.5 w-full sm:w-auto justify-between sm:justify-end">
                  {(["All", "Trek", "Tour", "Expedition"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab);
                        setSelectedIndex(-1);
                      }}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                        activeTab === tab
                          ? "bg-stone-900 text-white font-medium"
                          : "text-stone-600 hover:bg-stone-200/60 hover:text-stone-900"
                      }`}
                    >
                      {tab === "All" ? "All Experiences" : `${tab}s`}
                    </button>
                  ))}
                </div>
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
                      No matching trips found for &ldquo;{query}&rdquo;
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
