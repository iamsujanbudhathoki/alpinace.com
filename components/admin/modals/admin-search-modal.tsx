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
      return <MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0" />;
    case "tour":
      return <Compass className="w-3.5 h-3.5 text-slate-600 shrink-0" />;
    case "expedition":
      return <Mountain className="w-3.5 h-3.5 text-slate-600 shrink-0" />;
    case "category":
      return <FolderTree className="w-3.5 h-3.5 text-slate-600 shrink-0" />;
    case "booking":
      return <Calendar className="w-3.5 h-3.5 text-slate-600 shrink-0" />;
    case "inquiry":
      return <User className="w-3.5 h-3.5 text-slate-600 shrink-0" />;
    case "blog":
      return <FileText className="w-3.5 h-3.5 text-slate-600 shrink-0" />;
    case "testimonial":
      return <MessageSquare className="w-3.5 h-3.5 text-slate-600 shrink-0" />;
    case "team":
      return <Users className="w-3.5 h-3.5 text-slate-600 shrink-0" />;
    case "faq":
      return <HelpCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />;
    case "media":
      return <Images className="w-3.5 h-3.5 text-slate-600 shrink-0" />;
    default:
      return <LayoutGrid className="w-3.5 h-3.5 text-slate-600 shrink-0" />;
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
      <DialogContent className="w-[94vw] sm:max-w-2xl p-0 bg-white border border-slate-300 rounded-xl shadow-2xl overflow-hidden [&>button]:hidden">
        <DialogTitle className="sr-only">Search Admin Panel</DialogTitle>

        {/* Search Input Bar */}
        <div className="flex items-center px-3.5 py-2.5 border-b border-slate-200 bg-white gap-2.5">
          {loading ? (
            <Loader2 className="w-4 h-4 text-slate-600 animate-spin shrink-0" />
          ) : (
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
          )}
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search categories, treks, tours, bookings..."
            className="w-full bg-transparent text-xs font-medium text-slate-950 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-0.5 rounded text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="text-[10px] font-semibold text-slate-700 border border-slate-300 bg-slate-100 px-1.5 py-0.5 rounded shrink-0 select-none">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {loading && results.length === 0 ? (
            <div className="py-8 flex items-center justify-center text-xs font-medium text-slate-700 gap-2">
              <Loader2 className="w-4 h-4 text-slate-600 animate-spin" />
              <span>Searching database...</span>
            </div>
          ) : debouncedQuery.trim() === "" ? (
            <div className="py-8 text-center text-xs space-y-1">
              <p className="text-slate-900 font-bold">Type to search admin database...</p>
              <p className="text-[11px] text-slate-600 font-medium">Search treks, tours, expeditions, categories, bookings &amp; inquiries</p>
            </div>
          ) : results.length > 0 ? (
            groupedResults.map(([groupLabel, groupItems]) => (
              <div key={groupLabel}>
                <div className="px-3.5 py-1.5 text-[11px] font-bold text-slate-800 uppercase tracking-wider bg-slate-100/90 border-y border-slate-200/80 sticky top-0">
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
                        className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                          isHighlighted ? "bg-slate-100/90 text-slate-950 font-semibold" : "text-slate-900 hover:bg-slate-50 font-normal"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {getEntityIcon(item.type)}
                          <span className="truncate text-slate-950 font-semibold">{item.title}</span>
                          {item.subtitle && (
                            <span className="truncate text-[11px] text-slate-600 font-medium shrink-0 max-w-xs sm:max-w-md">
                              {item.subtitle}
                            </span>
                          )}
                        </div>
                        <ArrowRight
                          className={`w-3.5 h-3.5 shrink-0 transition-opacity ${
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
            <div className="py-8 text-center text-xs space-y-1">
              <p className="text-slate-900 font-bold">No results found for &ldquo;{debouncedQuery}&rdquo;</p>
              <p className="text-[11px] text-slate-600 font-medium">Try searching for a different keyword.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-3.5 py-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-700">
          <span>
            <span className="font-bold text-slate-950">Global Search</span> • AlpineAce Admin
          </span>
          <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-700">
            <span><kbd className="bg-white border border-slate-300 text-slate-900 px-1.5 py-0.5 rounded font-bold">↑↓</kbd> Navigate</span>
            <span><kbd className="bg-white border border-slate-300 text-slate-900 px-1.5 py-0.5 rounded font-bold">↵</kbd> Select</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
