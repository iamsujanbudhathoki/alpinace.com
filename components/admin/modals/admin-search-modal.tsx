"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Sliders,
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

const QUICK_SHORTCUTS: AdminSearchResultItem[] = [
  { id: "nav-1", title: "Dashboard Overview", subtitle: "Main metrics & recent activity", type: "category", typeLabel: "Navigation", route: "/admin" },
  { id: "nav-2", title: "Bookings & Reservations", subtitle: "Guest reservations and permits", type: "booking", typeLabel: "Bookings", route: "/admin/bookings" },
  { id: "nav-3", title: "Treks Management", subtitle: "Trekking packages catalog", type: "trek", typeLabel: "Trekking", route: "/admin/treks" },
  { id: "nav-4", title: "Expeditions List", subtitle: "Himalayan peak climbing", type: "expedition", typeLabel: "Expeditions", route: "/admin/expeditions" },
  { id: "nav-5", title: "Tours & Sightseeing", subtitle: "Cultural sightseeing packages", type: "tour", typeLabel: "Tours", route: "/admin/tours" },
  { id: "nav-6", title: "Categories Taxonomy", subtitle: "Package taxonomy & domains", type: "category", typeLabel: "Categories", route: "/admin/categories" },
  { id: "nav-7", title: "Blog Articles", subtitle: "Published stories & news", type: "blog", typeLabel: "Blogs", route: "/admin/blogs" },
  { id: "nav-8", title: "Media Library", subtitle: "Cover photos and photo gallery", type: "media", typeLabel: "Media", route: "/admin/media" },
  { id: "nav-9", title: "Agency Settings", subtitle: "Business details and profile", type: "category", typeLabel: "Settings", route: "/admin/settings" },
];

function getEntityIcon(type: string) {
  switch (type) {
    case "trek":
      return <MapPin className="w-4 h-4 text-emerald-600" />;
    case "tour":
      return <Compass className="w-4 h-4 text-sky-600" />;
    case "expedition":
      return <Mountain className="w-4 h-4 text-purple-600" />;
    case "category":
      return <FolderTree className="w-4 h-4 text-amber-600" />;
    case "booking":
      return <Calendar className="w-4 h-4 text-blue-600" />;
    case "inquiry":
      return <User className="w-4 h-4 text-indigo-600" />;
    case "blog":
      return <FileText className="w-4 h-4 text-teal-600" />;
    case "testimonial":
      return <MessageSquare className="w-4 h-4 text-pink-600" />;
    case "team":
      return <Users className="w-4 h-4 text-orange-600" />;
    case "faq":
      return <HelpCircle className="w-4 h-4 text-violet-600" />;
    case "media":
      return <Images className="w-4 h-4 text-rose-600" />;
    default:
      return <LayoutGrid className="w-4 h-4 text-slate-600" />;
  }
}

export function AdminSearchModal({ isOpen, onClose }: AdminSearchModalProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<AdminSearchResultItem[]>(QUICK_SHORTCUTS);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setDebouncedQuery("");
      setResults(QUICK_SHORTCUTS);
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
      setResults(QUICK_SHORTCUTS);
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl p-0 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden [&>button]:hidden">
        <DialogTitle className="sr-only">Search Admin Database</DialogTitle>

        {/* Header Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 bg-slate-50/50 gap-3">
          {loading ? (
            <Loader2 className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
          ) : (
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
          )}
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search treks, bookings, guests, categories, blogs..."
            className="w-full bg-transparent text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-[10px] font-bold text-slate-500 border border-slate-200 bg-white px-1.5 py-0.5 rounded shrink-0 select-none">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-88 overflow-y-auto p-2">
          {loading && results.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-xs text-slate-500 gap-2">
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              <span>Searching admin database...</span>
            </div>
          ) : results.length > 0 ? (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>{debouncedQuery.trim() === "" ? "Quick Shortcuts" : "Search Results"}</span>
                <span>{results.length} item{results.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="space-y-0.5">
                {results.map((item, index) => {
                  const isHighlighted = index === selectedIndex;
                  return (
                    <button
                      key={`${item.type}-${item.id}-${index}`}
                      onClick={() => handleSelectResult(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full text-left p-2.5 rounded-lg transition-all flex items-center justify-between group cursor-pointer ${
                        isHighlighted ? "bg-slate-100/90 ring-1 ring-slate-300/80" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          {getEntityIcon(item.type)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 truncate group-hover:text-slate-950">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate font-medium">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pl-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700">
                          {item.typeLabel}
                        </span>
                        <ArrowRight className={`w-3.5 h-3.5 transition-colors ${
                          isHighlighted ? "text-slate-900" : "text-slate-400"
                        }`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-600 font-bold space-y-1">
              <p>No results found for &ldquo;{debouncedQuery}&rdquo;</p>
              <p className="text-[11px] text-slate-500 font-medium">
                Try searching for trek title, guest name, booking ref, or category name.
              </p>
            </div>
          )}
        </div>

        {/* High Contrast Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-700 font-semibold">
          <span>
            Search <span className="font-bold text-slate-950">AlpineAce</span> Admin Database
          </span>
          <div className="flex items-center gap-2.5 font-bold">
            <span><kbd className="bg-white border border-slate-300 text-slate-900 px-1.5 py-0.5 rounded text-[10px]">↑↓</kbd> Navigate</span>
            <span><kbd className="bg-white border border-slate-300 text-slate-900 px-1.5 py-0.5 rounded text-[10px]">↵</kbd> Select</span>
            <span><kbd className="bg-white border border-slate-300 text-slate-900 px-1.5 py-0.5 rounded text-[10px]">ESC</kbd> Close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
