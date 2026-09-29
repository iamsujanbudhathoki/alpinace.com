"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "@bprogress/next";
import {
  Search,
  X,
  Compass,
  Mountain,
  MapPin,
  ChevronDown,
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

const HERO_PHRASES = [
  "Next Adventure.",
  "Next Trek.",
  "Next Expedition.",
  "Next Journey.",
];

/* Filter pill: soft glass on the video, solid white when active */
function FilterSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) {
  const active = value !== "all";
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className={`h-10 appearance-none rounded-full pl-4 pr-9 text-sm font-medium cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${
          active
            ? "bg-white text-stone-900"
            : "bg-white/15 text-white backdrop-blur-md hover:bg-white/25"
        }`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="text-stone-900">
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
          active ? "text-stone-700" : "text-white/80"
        }`}
        strokeWidth={2}
      />
    </div>
  );
}

export function Hero(_props: HeroProps) {
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [priceRange, setPriceRange] = useState("all");
  const [durationRange, setDurationRange] = useState("all");

  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<HeroSearchItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Headline animation
  type MaskAnimStep = "prep" | "entering" | "visible" | "exiting";
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [animStep, setAnimStep] = useState<MaskAnimStep>("visible");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handleChange = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    let timer: NodeJS.Timeout;

    if (animStep === "visible") {
      timer = setTimeout(() => setAnimStep("exiting"), 2600);
    } else if (animStep === "exiting") {
      timer = setTimeout(() => {
        setPhraseIndex((prev) => (prev + 1) % HERO_PHRASES.length);
        setAnimStep("prep");
      }, 500);
    } else if (animStep === "prep") {
      timer = setTimeout(() => setAnimStep("entering"), 30);
    } else if (animStep === "entering") {
      timer = setTimeout(() => setAnimStep("visible"), 600);
    }
    return () => clearTimeout(timer);
  }, [animStep, prefersReducedMotion]);

  const parsedFilters = useMemo(() => {
    const p = PRICE_OPTIONS.find((o) => o.value === priceRange);
    const d = DURATION_OPTIONS.find((o) => o.value === durationRange);
    return {
      minPrice: p?.minPrice,
      maxPrice: p?.maxPrice,
      minDuration: d?.minDuration,
      maxDuration: d?.maxDuration,
    };
  }, [priceRange, durationRange]);

  const hasFilters = priceRange !== "all" || durationRange !== "all";
  const isAnyFilterActive = query.trim().length > 0 || hasFilters;

  const handleResetFilters = () => {
    setQuery("");
    setPriceRange("all");
    setDurationRange("all");
    setIsOpen(false);
    setSearchResults([]);
    setSelectedIndex(-1);
  };

  // Debounced backend search (all trip types)
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2 && !hasFilters) {
      setSearchResults([]);
      setIsOpen(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const res = await PublicSearchService.search(trimmed, "All", 15, parsedFilters);
        if (res && Array.isArray(res.results)) {
          setSearchResults(res.results);
          setIsOpen(true);
        } else {
          setSearchResults([]);
        }
        setSelectedIndex(-1);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, parsedFilters, hasFilters]);

  // Client-side check so price/duration ranges are always accurate
  const filteredResults = useMemo(() => {
    return searchResults.filter((item) => {
      const price = item.priceUSD || 0;
      if (parsedFilters.minPrice !== undefined && price < parsedFilters.minPrice) return false;
      if (parsedFilters.maxPrice !== undefined && price > parsedFilters.maxPrice) return false;

      const days = item.durationDays || 0;
      if (parsedFilters.minDuration !== undefined && days < parsedFilters.minDuration) return false;
      if (parsedFilters.maxDuration !== undefined && days > parsedFilters.maxDuration) return false;

      return true;
    });
  }, [searchResults, parsedFilters]);

  // Close dropdown on outside click
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
    router.push(getPackageUrl(item));
  };

  const handleSearchSubmit = () => {
    setIsOpen(false);
    const params = new URLSearchParams();

    if (query.trim()) params.set("search", query.trim());
    if (parsedFilters.minPrice !== undefined) params.set("minPrice", String(parsedFilters.minPrice));
    if (parsedFilters.maxPrice !== undefined) params.set("maxPrice", String(parsedFilters.maxPrice));
    if (parsedFilters.minDuration !== undefined) params.set("minDuration", String(parsedFilters.minDuration));
    if (parsedFilters.maxDuration !== undefined) params.set("maxDuration", String(parsedFilters.maxDuration));

    const qs = params.toString();
    router.push(qs ? `/trekking?${qs}` : "/trekking");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isOpen && selectedIndex >= 0 && selectedIndex < filteredResults.length) {
        handleSelectResult(filteredResults[selectedIndex]);
      } else {
        handleSearchSubmit();
      }
      return;
    }

    if (e.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!isOpen) {
        if (isAnyFilterActive) setIsOpen(true);
        return;
      }
      e.preventDefault();
      const last = filteredResults.length - 1;
      setSelectedIndex((prev) =>
        e.key === "ArrowDown"
          ? prev < last ? prev + 1 : 0
          : prev > 0 ? prev - 1 : last
      );
    }
  };

  return (
    <section className="relative z-10 flex min-h-[90svh] sm:min-h-screen w-full flex-col items-center justify-center bg-stone-100 text-stone-900">
      {/* Background media */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-90"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/15 via-stone-950/45 to-stone-950/70" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 flex flex-col items-center text-center">
        {/* Headline */}
        <h1 className="font-heading font-bold text-white mb-4 sm:mb-5 max-w-4xl leading-[1.15] text-center drop-shadow-md">
          <span className="block text-3xl sm:text-4xl lg:text-5xl text-white/95 font-medium tracking-tight">
            Discover your
          </span>
          <span className="relative block h-[1.3em] overflow-hidden align-middle text-4xl sm:text-6xl lg:text-7xl xl:text-8xl mt-1.5 sm:mt-2">
            <span
              className={`block text-accent font-bold ${
                animStep === "prep"
                  ? "translate-y-[110%] opacity-0 transition-none"
                  : animStep === "entering" || animStep === "visible"
                  ? "translate-y-0 opacity-100 transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  : "-translate-y-[110%] opacity-0 transition-all duration-500 ease-[cubic-bezier(0.7,0,0.84,0)]"
              }`}
            >
              {HERO_PHRASES[phraseIndex]}
            </span>
          </span>
        </h1>

        <p className="text-white/75 text-sm sm:text-base max-w-md mx-auto mb-8 sm:mb-10 leading-relaxed">
          Guided treks, cultural tours &amp; high-altitude expeditions across Nepal.
        </p>

        {/* Search */}
        <div ref={searchContainerRef} className="relative z-30 w-full max-w-3xl">
          <div className="flex items-center gap-3 rounded-full bg-white px-5 sm:px-7 py-1 shadow-lg shadow-black/20 focus-within:shadow-xl focus-within:shadow-black/30 transition-shadow">
            {isSearching ? (
              <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 shrink-0 animate-spin text-stone-400" />
            ) : (
              <Search className="h-5 w-5 sm:h-6 sm:w-6 shrink-0 text-stone-400" />
            )}

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(-1);
              }}
              onFocus={() => {
                if (isAnyFilterActive && searchResults.length > 0) setIsOpen(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search Everest, Annapurna, Langtang…"
              className="h-14 sm:h-16 w-full min-w-0 bg-transparent text-base sm:text-lg text-stone-900 placeholder:text-stone-400 focus:outline-none truncate"
              aria-label="Search destination or trip"
              autoComplete="off"
              enterKeyHint="search"
            />

            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="shrink-0 rounded-full p-2 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Price + Duration only: light pills, no container */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <FilterSelect
              value={priceRange}
              onChange={(v) => {
                setPriceRange(v);
                setSelectedIndex(-1);
              }}
              options={PRICE_OPTIONS}
              label="Filter by price"
            />
            <FilterSelect
              value={durationRange}
              onChange={(v) => {
                setDurationRange(v);
                setSelectedIndex(-1);
              }}
              options={DURATION_OPTIONS}
              label="Filter by duration"
            />
            {isAnyFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-10 px-3 text-sm font-medium text-white/80 hover:text-white underline underline-offset-4 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Results */}
          {isOpen && isAnyFilterActive && (
            <div
              className="absolute left-0 right-0 top-full mt-3 z-50 overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/30 text-left animate-in fade-in-50 slide-in-from-top-2 duration-150"
              role="listbox"
            >
              <div className="max-h-[50vh] sm:max-h-[380px] overflow-y-auto p-2 custom-scrollbar">
                {isSearching ? (
                  <div className="flex items-center justify-center gap-2 py-10 text-sm text-stone-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching…
                  </div>
                ) : filteredResults.length > 0 ? (
                  filteredResults.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        key={`${item.type}-${item.id}-${idx}`}
                        onClick={() => handleSelectResult(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex w-full items-center gap-3 rounded-2xl p-2.5 sm:p-3 text-left transition-colors cursor-pointer ${
                          isSelected ? "bg-stone-100" : "hover:bg-stone-50"
                        }`}
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                          {item.image && !failedImages[item.id] ? (
                            <Image
                              src={item.image}
                              alt=""
                              fill
                              sizes="48px"
                              className="object-cover"
                              onError={() =>
                                setFailedImages((prev) => ({ ...prev, [item.id]: true }))
                              }
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-stone-500">
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

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm sm:text-base font-medium text-stone-900">
                            {item.title}
                          </p>
                          <p className="truncate text-xs sm:text-sm text-stone-500">
                            {[
                              item.type,
                              item.region,
                              item.durationDays ? `${item.durationDays} days` : null,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>

                        {item.priceUSD ? (
                          <span className="shrink-0 text-sm font-semibold text-stone-900">
                            ${item.priceUSD.toLocaleString()}
                          </span>
                        ) : null}
                      </button>
                    );
                  })
                ) : (
                  <div className="py-10 px-4 text-center">
                    <p className="text-sm font-medium text-stone-700">No trips match yet</p>
                    <p className="mt-1 text-xs text-stone-500">
                      Try a different keyword or loosen the filters.
                    </p>
                  </div>
                )}
              </div>

              {filteredResults.length > 0 && !isSearching && (
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="w-full border-t border-stone-100 px-4 py-3.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  See all results
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}