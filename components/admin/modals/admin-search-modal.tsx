"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  Settings,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AdminSearchService, AdminSearchResultItem } from "@/lib/services/admin-service";

interface AdminSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_NAV_ITEMS: AdminSearchResultItem[] = [
  { id: "quick-treks", type: "trek", typeLabel: "Packages", title: "Treks & Hiking", subtitle: "Manage all trekking packages and itineraries", route: "/admin/treks" },
  { id: "quick-tours", type: "tour", typeLabel: "Packages", title: "Tours & Sightseeing", subtitle: "Manage cultural and sightseeing tours", route: "/admin/tours" },
  { id: "quick-expeditions", type: "expedition", typeLabel: "Packages", title: "Expeditions & Climbing", subtitle: "Manage peak climbing packages", route: "/admin/expeditions" },
  { id: "quick-bookings", type: "booking", typeLabel: "Operations", title: "Customer Bookings", subtitle: "Review and manage trip reservations", route: "/admin/bookings" },
  { id: "quick-inquiries", type: "inquiry", typeLabel: "Operations", title: "Inquiries & Quotes", subtitle: "Respond to customer inquiries and quote requests", route: "/admin/inquiries" },
  { id: "quick-categories", type: "category", typeLabel: "Structure", title: "Trip Categories", subtitle: "Manage package categories & menu ordering", route: "/admin/categories" },
  { id: "quick-blogs", type: "blog", typeLabel: "Content", title: "Blog Articles", subtitle: "Create and publish travel articles and guides", route: "/admin/blogs" },
  { id: "quick-settings", type: "settings" as any, typeLabel: "System", title: "Platform Settings", subtitle: "Configure platform preferences and legal terms", route: "/admin/settings" },
];

function getEntityIcon(type: string) {
  switch (type) {
    case "trek":
      return <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
    case "tour":
      return <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />;
    case "expedition":
      return <Mountain className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />;
    case "category":
      return <FolderTree className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />;
    case "booking":
      return <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
    case "inquiry":
      return <User className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />;
    case "blog":
      return <FileText className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />;
    case "testimonial":
      return <MessageSquare className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />;
    case "team":
      return <Users className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />;
    case "faq":
      return <HelpCircle className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />;
    case "media":
      return <Images className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />;
    case "settings":
      return <Settings className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 shrink-0" />;
    default:
      return <LayoutGrid className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 shrink-0" />;
  }
}

function getEntityBadgeBg(type: string) {
  switch (type) {
    case "trek":
    case "booking":
      return "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/70 dark:border-emerald-800/40";
    case "tour":
      return "bg-blue-50 dark:bg-blue-950/40 border-blue-200/70 dark:border-blue-800/40";
    case "expedition":
      return "bg-amber-50 dark:bg-amber-950/40 border-amber-200/70 dark:border-amber-800/40";
    case "inquiry":
      return "bg-purple-50 dark:bg-purple-950/40 border-purple-200/70 dark:border-purple-800/40";
    case "blog":
      return "bg-sky-50 dark:bg-sky-950/40 border-sky-200/70 dark:border-sky-800/40";
    case "category":
      return "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/70 dark:border-indigo-800/40";
    case "testimonial":
      return "bg-teal-50 dark:bg-teal-950/40 border-teal-200/70 dark:border-teal-800/40";
    case "team":
      return "bg-violet-50 dark:bg-violet-950/40 border-violet-200/70 dark:border-violet-800/40";
    case "media":
      return "bg-rose-50 dark:bg-rose-950/40 border-rose-200/70 dark:border-rose-800/40";
    default:
      return "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700";
  }
}

export function AdminSearchModal({ isOpen, onClose }: AdminSearchModalProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<AdminSearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setDebouncedQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Debounce search input (250ms for snappy response)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);
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
          setResults(res.results || []);
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

  const activeList = useMemo(() => {
    return debouncedQuery.trim() === "" ? QUICK_NAV_ITEMS : results;
  }, [debouncedQuery, results]);

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
        setSelectedIndex((prev) =>
          activeList.length > 0 ? (prev + 1) % activeList.length : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          activeList.length > 0 ? (prev - 1 + activeList.length) % activeList.length : 0
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (activeList.length > 0 && activeList[selectedIndex]) {
          handleSelectResult(activeList[selectedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeList, selectedIndex, handleSelectResult]);

  // Scroll active item into view on keyboard navigation
  useEffect(() => {
    if (itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  let globalIndexCounter = 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[95vw] sm:max-w-2xl p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden gap-0"
      >
        <DialogTitle className="sr-only">Global Search</DialogTitle>
        <DialogDescription className="sr-only">
          Search across packages, bookings, inquiries, and platform records
        </DialogDescription>

        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 gap-3">
          {loading ? (
            <Loader2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin shrink-0" />
          ) : (
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
          )}

          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search packages, bookings, inquiries, blogs..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium focus:outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <kbd className="hidden sm:inline-flex items-center text-[10px] font-medium text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded shrink-0 select-none">
            ESC
          </kbd>
        </div>

        {/* Results & Quick Actions Body */}
        <div className="max-h-[60vh] sm:max-h-[440px] overflow-y-auto p-2">
          {loading && results.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600 dark:text-emerald-400" />
              <span>Searching AlpineAce records...</span>
            </div>
          ) : debouncedQuery.trim() === "" ? (
            <div>
              <div className="px-3 pt-2 pb-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Quick Navigation
              </div>
              <div className="space-y-0.5">
                {QUICK_NAV_ITEMS.map((item, idx) => {
                  const isHighlighted = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      ref={(el) => {
                        itemRefs.current[idx] = el;
                      }}
                      type="button"
                      onClick={() => handleSelectResult(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                        isHighlighted
                          ? "bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-md border flex items-center justify-center shrink-0 ${getEntityBadgeBg(
                            item.type
                          )}`}
                        >
                          {getEntityIcon(item.type)}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/70 dark:border-slate-700/70">
                          {item.typeLabel}
                        </span>
                        {isHighlighted && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                            <span>Jump</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              {groupedResults.map(([groupLabel, groupItems]) => (
                <div key={groupLabel}>
                  <div className="px-3 pt-1 pb-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {groupLabel} ({groupItems.length})
                  </div>
                  <div className="space-y-0.5">
                    {groupItems.map((item) => {
                      const currentIndex = globalIndexCounter++;
                      const isHighlighted = currentIndex === selectedIndex;

                      return (
                        <button
                          key={`${item.type}-${item.id}`}
                          ref={(el) => {
                            itemRefs.current[currentIndex] = el;
                          }}
                          type="button"
                          onClick={() => handleSelectResult(item)}
                          onMouseEnter={() => setSelectedIndex(currentIndex)}
                          className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                            isHighlighted
                              ? "bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`w-7 h-7 rounded-md border flex items-center justify-center shrink-0 ${getEntityBadgeBg(
                                item.type
                              )}`}
                            >
                              {getEntityIcon(item.type)}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                {item.title}
                              </p>
                              {item.subtitle && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                  {item.subtitle}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/70 dark:border-slate-700/70">
                              {item.typeLabel}
                            </span>
                            {isHighlighted && (
                              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                                <span>Open</span>
                                <ArrowRight className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center space-y-1.5">
              <Search className="w-7 h-7 text-slate-300 dark:text-slate-600 mx-auto mb-1" />
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                No results found for &ldquo;{debouncedQuery}&rdquo;
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Try searching with different keywords, destination names, or IDs.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="text-[11px]">
            {debouncedQuery.trim()
              ? `${results.length} ${results.length === 1 ? "result" : "results"}`
              : "Quick navigation"}
          </span>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 shadow-2xs">
                ↵
              </kbd>{" "}
              open
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 shadow-2xs">
                esc
              </kbd>{" "}
              close
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
