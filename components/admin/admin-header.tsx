"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Plus,
  ExternalLink,
  CloudSnow,
  CheckCircle,
  X,
} from "lucide-react";

export function AdminHeader() {
  const [showNotification, setShowNotification] = useState(false);

  return (
    <header className="h-16 bg-charcoal-900 border-b border-charcoal-800 px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
        <input
          type="text"
          placeholder="Search guest, trip ID, Sherpa guide, or booking..."
          className="w-full bg-charcoal-950 border border-charcoal-700 text-offwhite-100 placeholder-charcoal-400 text-xs rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-gold-500 transition-colors"
        />
      </div>

      {/* Right Side Widgets */}
      <div className="flex items-center gap-4">
        {/* Weather Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-charcoal-950 border border-charcoal-800 text-xs text-offwhite-300">
          <CloudSnow className="w-4 h-4 text-sky-400 animate-pulse" />
          <span>EBC Basecamp: <strong className="text-offwhite-50">-8°C Clear</strong></span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotification(!showNotification)}
            className="p-2 rounded-lg bg-charcoal-950 border border-charcoal-800 text-charcoal-400 hover:text-gold-400 hover:border-gold-500/40 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-gold-400 absolute top-1.5 right-1.5 ring-2 ring-charcoal-900" />
          </button>

          {showNotification && (
            <div className="absolute right-0 mt-2 w-80 bg-charcoal-900 border border-charcoal-700 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
                <span className="font-semibold text-xs text-offwhite-50">Operational Alerts</span>
                <button
                  onClick={() => setShowNotification(false)}
                  className="text-charcoal-400 hover:text-offwhite-50"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-3 space-y-3">
                <div className="p-2.5 rounded-lg bg-charcoal-950 border border-charcoal-800 text-xs">
                  <div className="font-medium text-gold-400 flex items-center justify-between">
                    <span>New Booking Received</span>
                    <span className="text-[10px] text-charcoal-400">10m ago</span>
                  </div>
                  <p className="text-charcoal-400 mt-1">
                    Marcus Vance booked Everest Luxury Helicopter Trek.
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-charcoal-950 border border-charcoal-800 text-xs">
                  <div className="font-medium text-emerald-400 flex items-center justify-between">
                    <span>Permit Approved</span>
                    <span className="text-[10px] text-charcoal-400">1h ago</span>
                  </div>
                  <p className="text-charcoal-400 mt-1">
                    TIMS permit issued for Ama Dablam team.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Action Button */}
        <Link
          href="/admin/bookings"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500 text-charcoal-950 text-xs font-bold hover:bg-gold-400 transition-colors shadow-lg shadow-gold-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>New Reservation</span>
        </Link>

        {/* External Link to Public Website */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-xs text-charcoal-400 hover:text-gold-400 transition-colors pl-2 border-l border-charcoal-800"
        >
          <span>View Site</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </header>
  );
}
