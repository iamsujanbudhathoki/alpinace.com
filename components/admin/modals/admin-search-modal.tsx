"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Footprints,
  Mountain,
  Compass,
  Calendar,
  User,
  FolderOpen,
  FileText,
  ImageIcon,
  Settings,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Navigation" | "Trekking" | "Expeditions" | "Tours" | "Bookings" | "Blogs" | "Media";
  icon: React.ReactNode;
  iconBgClass: string;
  url: string;
}

const SEARCH_ITEMS: SearchResultItem[] = [
  // Navigation
  { id: "nav-1", title: "Dashboard Overview", subtitle: "Main metrics & recent activity", category: "Navigation", icon: <Sparkles className="w-4 h-4" />, iconBgClass: "bg-amber-500/10 text-amber-600", url: "/admin" },
  { id: "nav-2", title: "Bookings & Reservations", subtitle: "Guest reservations and permits", category: "Bookings", icon: <Calendar className="w-4 h-4" />, iconBgClass: "bg-emerald-500/10 text-emerald-600", url: "/admin/bookings" },
  { id: "nav-3", title: "Treks Management", subtitle: "Trekking packages catalog", category: "Trekking", icon: <Footprints className="w-4 h-4" />, iconBgClass: "bg-amber-500/10 text-amber-600", url: "/admin/treks" },
  { id: "nav-4", title: "Expeditions List", subtitle: "Himalayan peak climbing", category: "Expeditions", icon: <Mountain className="w-4 h-4" />, iconBgClass: "bg-rose-500/10 text-rose-600", url: "/admin/expeditions" },
  { id: "nav-5", title: "Tours & Sightseeing", subtitle: "Cultural sightseeing packages", category: "Tours", icon: <Compass className="w-4 h-4" />, iconBgClass: "bg-blue-500/10 text-blue-600", url: "/admin/tours" },
  { id: "nav-6", title: "Categories Taxonomy", subtitle: "Package taxonomy & domains", category: "Navigation", icon: <FolderOpen className="w-4 h-4" />, iconBgClass: "bg-purple-500/10 text-purple-600", url: "/admin/categories" },
  { id: "nav-7", title: "Blog Articles", subtitle: "Published stories & news", category: "Blogs", icon: <FileText className="w-4 h-4" />, iconBgClass: "bg-purple-500/10 text-purple-600", url: "/admin/blogs" },
  { id: "nav-8", title: "Media Library", subtitle: "Cover photos and photo gallery", category: "Media", icon: <ImageIcon className="w-4 h-4" />, iconBgClass: "bg-teal-500/10 text-teal-600", url: "/admin/media" },
  { id: "nav-9", title: "Agency Settings", subtitle: "Business details and profile", category: "Navigation", icon: <Settings className="w-4 h-4" />, iconBgClass: "bg-slate-100 text-slate-700", url: "/admin/settings" },

  // Packages
  { id: "pkg-1", title: "Everest Base Camp Luxury Helicopter Trek", subtitle: "14 Days • Everest Region • $2,450", category: "Trekking", icon: <Footprints className="w-4 h-4" />, iconBgClass: "bg-amber-500/10 text-amber-600", url: "/admin/treks" },
  { id: "pkg-2", title: "Annapurna Sanctuary Luxury Lodge Trek", subtitle: "10 Days • Annapurna Region • $1,850", category: "Trekking", icon: <Footprints className="w-4 h-4" />, iconBgClass: "bg-amber-500/10 text-amber-600", url: "/admin/treks" },
  { id: "pkg-3", title: "Ama Dablam 6812m Climbing Expedition", subtitle: "28 Days • Everest Region • $6,800", category: "Expeditions", icon: <Mountain className="w-4 h-4" />, iconBgClass: "bg-rose-500/10 text-rose-600", url: "/admin/expeditions" },
  { id: "pkg-4", title: "Everest South Col Summit Expedition", subtitle: "60 Days • Khumbu Region • $45,000", category: "Expeditions", icon: <Mountain className="w-4 h-4" />, iconBgClass: "bg-rose-500/10 text-rose-600", url: "/admin/expeditions" },
  { id: "pkg-5", title: "Kathmandu Valley & Pokhara Resort Tour", subtitle: "7 Days • Cultural Heritage • $1,250", category: "Tours", icon: <Compass className="w-4 h-4" />, iconBgClass: "bg-blue-500/10 text-blue-600", url: "/admin/tours" },

  // Bookings & Guests
  { id: "bkg-1", title: "Marcus Vance", subtitle: "Ref: BKG-8842 • Everest Base Camp Trek", category: "Bookings", icon: <User className="w-4 h-4" />, iconBgClass: "bg-emerald-500/10 text-emerald-600", url: "/admin/bookings" },
  { id: "bkg-2", title: "Sarah Jenkins", subtitle: "Ref: BKG-9102 • Annapurna Circuit", category: "Bookings", icon: <User className="w-4 h-4" />, iconBgClass: "bg-emerald-500/10 text-emerald-600", url: "/admin/bookings" },
  { id: "bkg-3", title: "David Thorne", subtitle: "Ref: BKG-7719 • Ama Dablam Expedition", category: "Bookings", icon: <User className="w-4 h-4" />, iconBgClass: "bg-emerald-500/10 text-emerald-600", url: "/admin/bookings" },

  // Articles
  { id: "art-1", title: "Ultimate Preparation Guide for Everest Base Camp Trek", subtitle: "Blog Article • Published Aug 2026", category: "Blogs", icon: <FileText className="w-4 h-4" />, iconBgClass: "bg-purple-500/10 text-purple-600", url: "/admin/blogs" },
  { id: "art-2", title: "Acclimatization Tips for 6000m Himalayan Expeditions", subtitle: "Blog Article • Published Jul 2026", category: "Blogs", icon: <FileText className="w-4 h-4" />, iconBgClass: "bg-purple-500/10 text-purple-600", url: "/admin/blogs" },
];

interface AdminSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSearchModal({ isOpen, onClose }: AdminSearchModalProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  // Reset query on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  const filteredResults = query.trim() === ""
    ? SEARCH_ITEMS.slice(0, 7)
    : SEARCH_ITEMS.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );

  const handleSelectResult = (url: string) => {
    onClose();
    router.push(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl p-0 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden [&>button]:hidden">
        <DialogTitle className="sr-only">Search Admin Dashboard</DialogTitle>

        {/* Crisp Header Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50/80 gap-3">
          <Search className="w-4 h-4 text-amber-600 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guest, trip ID, guide, or navigate..."
            className="w-full bg-transparent text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-[10px] font-bold text-slate-700 border border-slate-300 bg-white px-2 py-0.5 rounded-md shrink-0 select-none shadow-2xs">
            ESC
          </span>
        </div>

        {/* Vibrant & Sharp Results List */}
        <div className="max-h-88 overflow-y-auto p-2">
          {filteredResults.length > 0 ? (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-extrabold text-slate-900 uppercase tracking-wider">
                {query.trim() === "" ? "Quick Shortcuts" : "Search Results"}
              </div>
              <div className="space-y-1">
                {filteredResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectResult(item.url)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100/90 transition-all flex items-center justify-between group cursor-pointer border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold ${item.iconBgClass}`}>
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate group-hover:text-amber-600 transition-colors">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-600 truncate font-semibold">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pl-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800">
                        {item.category}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-600 font-bold space-y-1">
              <p>No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-[11px] text-slate-500 font-medium">Try searching for guest name, trek title, or expedition.</p>
            </div>
          )}
        </div>

        {/* Crisp High Contrast Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-700 font-semibold">
          <span>
            Search <span className="font-bold text-slate-950">AlpineAce</span> Admin Database
          </span>
          <div className="flex items-center gap-2.5 font-bold">
            <span><kbd className="bg-white border border-slate-300 text-slate-900 px-1.5 py-0.5 rounded text-[10px]">↵</kbd> Select</span>
            <span><kbd className="bg-white border border-slate-300 text-slate-900 px-1.5 py-0.5 rounded text-[10px]">ESC</kbd> Close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
