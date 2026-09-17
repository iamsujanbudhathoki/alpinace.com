"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  MapPin,
  Mountain,
  Compass,
  Calendar,
  User,
  FolderTree,
  FileText,
  Images,
  ArrowRight,
  LayoutGrid,
  Loader2,
  MessageSquare,
  Users,
  HelpCircle,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AdminSearchService, AdminSearchResultItem } from "@/lib/services/admin-service";

interface AdminSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function getEntityIcon(type: string) {
  switch (type) {
    case "trek":
      return <MapPin className="w-3.5 h-3.5 text-slate-800 shrink-0" />;
    case "tour":
      return <Compass className="w-3.5 h-3.5 text-slate-800 shrink-0" />;
    case "expedition":
      return <Mountain className="w-3.5 h-3.5 text-slate-800 shrink-0" />;
    case "category":
      return <FolderTree className="w-3.5 h-3.5 text-slate-800 shrink-0" />;
    case "booking":
      return <Calendar className="w-3.5 h-3.5 text-slate-800 shrink-0" />;
    case "inquiry":
      return <User className="w-3.5 h-3.5 text-slate-800 shrink-0" />;
    case "blog":
      return <FileText className="w-3.5 h-3.5 text-slate-800 shrink-0" />;
    case "testimonial":
      return <MessageSquare className="w-3.5 h-3.5 text-slate-800 shrink-0" />;
    case "team":
      return <Users className="w-3.5 h-3.5 text-slate-800 shrink-0" />;
    case "faq":
      return <HelpCircle className="w-3.5 h-3.5 text-slate-800 shrink-0" />;
    case "media":
      return <Images className="w-3.5 h-3.5 text-slate-800 shrink-0" />;
    default:
      return <LayoutGrid className="w-3.5 h-3.5 text-slate-800 shrink-0" />;
  }
}

export function AdminSearchModal({ isOpen, onClose }: AdminSearchModalProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<AdminSearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setDebouncedQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Perform API search when debouncedQuery changes
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      setSelectedIndex(0);
      return;
    }

    let isCancelled = false;
    async function executeSearch() {
      setLoading(true);
      try {
        const res = await AdminSearchService.globalSearch(trimmed);
        if (!isCancelled) {
          setResults(res.results);
          setSelectedIndex(0);
        }
      } catch (e) {
        if (!isCancelled) {
          setResults([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    executeSearch();
    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery]);

  // Group results by entity typeLabel
  const groupedResults = useMemo(() => {
    const map = new Map<string, AdminSearchResultItem[]>();
    results.forEach((item) => {
      const label = item.typeLabel || "Other";
      if (!map.has(label)) {
        map.set(label, []);
      }
      map.get(label)!.push(item);
    });
    return Array.from(map.entries());
  }, [results]);

  const handleSelectResult = useCallback(
    (item: AdminSearchResultItem) => {
      onClose();
      router.push(item.route);
    },
    [onClose, router]
  );

  // Keyboard navigation (ArrowUp, ArrowDown, Enter)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (results.length > 0 && results[selectedIndex]) {
          handleSelectResult(results[selectedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, handleSelectResult]);

  let globalIndexCounter = 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-3xl lg:max-w-4xl p-0 bg-white border border-slate-300 rounded-2xl shadow-2xl overflow-hidden [&>button]:hidden">
        <DialogTitle className="sr-only">Search Admin Panel</DialogTitle>

        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-slate-200 bg-white gap-3.5">
          {loading ? (
            <Loader2 className="w-5 h-5 text-slate-800 animate-spin shrink-0" />
          ) : (
            <Search className="w-5 h-5 text-slate-700 shrink-0" />
          )}
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search categories, treks, tours, expeditions, bookings, inquiries..."
            className="w-full bg-transparent text-sm sm:text-base font-semibold text-slate-950 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded text-slate-500 hover:text-slate-950 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-xs font-bold text-slate-700 border border-slate-300 bg-slate-100 px-2 py-1 rounded shrink-0 select-none">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-[65vh] sm:max-h-[520px] overflow-y-auto divide-y divide-slate-100">
          {loading && results.length === 0 ? (
            <div className="py-16 flex items-center justify-center text-sm font-semibold text-slate-900 gap-2.5">
              <Loader2 className="w-5 h-5 text-slate-800 animate-spin" />
            </div>
          ) : debouncedQuery.trim() === "" ? (
            <div className="py-16 text-center space-y-2">
              <p className="text-sm font-bold text-slate-950">Type to search...</p>
              <p className="text-xs text-slate-500 font-medium">Search across treks, tours, expeditions, categories, bookings, inquiries, blogs &amp; testimonials</p>
            </div>
          ) : results.length > 0 ? (
            groupedResults.map(([groupLabel, groupItems]) => (
              <div key={groupLabel}>
                <div className="px-5 py-2 text-xs font-semibold text-slate-800 bg-slate-100/90 backdrop-blur-xs border-y border-slate-200 sticky top-0 z-10">
                  {groupLabel}
                </div>
                <div className="divide-y divide-slate-100">
                  {groupItems.map((item) => {
                    const currentIndex = globalIndexCounter++;
                    const isHighlighted = currentIndex === selectedIndex;

                    return (
                      <button
                        key={`${item.type}-${item.id}`}
                        onClick={() => handleSelectResult(item)}
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                        className={`w-full text-left px-5 py-3.5 flex items-center justify-between transition-colors cursor-pointer ${
                          isHighlighted ? "bg-slate-100 text-slate-950 font-bold" : "text-slate-950 hover:bg-slate-50 font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="p-1 rounded-md bg-slate-100 text-slate-800 shrink-0">
                            {getEntityIcon(item.type)}
                          </span>
                          <span className="truncate text-sm font-bold text-slate-950">{item.title}</span>
                          {item.subtitle && (
                            <span className="truncate text-xs text-slate-600 font-medium shrink-0 max-w-xs sm:max-w-md lg:max-w-lg">
                              {item.subtitle}
                            </span>
                          )}
                        </div>
                        <ArrowRight
                          className={`w-4 h-4 shrink-0 transition-opacity ${
                            isHighlighted ? "opacity-100 text-slate-950" : "opacity-0"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center space-y-2">
              <p className="text-sm font-bold text-slate-950">No results found for &ldquo;{debouncedQuery}&rdquo;</p>
              <p className="text-xs text-slate-500 font-medium">Try searching with a different keyword or category name.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-700">
          <span>
            <span className="font-bold text-slate-950">Global Search</span> • AlpineAce Admin
          </span>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-800">
            <span><kbd className="bg-white border border-slate-300 text-slate-950 px-2 py-0.5 rounded font-bold shadow-2xs">↑↓</kbd> Navigate</span>
            <span><kbd className="bg-white border border-slate-300 text-slate-950 px-2 py-0.5 rounded font-bold shadow-2xs">↵</kbd> Select</span>
            <span><kbd className="bg-white border border-slate-300 text-slate-950 px-2 py-0.5 rounded font-bold shadow-2xs">ESC</kbd> Close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
