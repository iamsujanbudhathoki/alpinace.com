"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Plus,
  ExternalLink,
  CloudSnow,
  X,
  Menu,
} from "lucide-react";

interface AdminHeaderProps {
  onToggleMobileSidebar?: () => void;
}

export function AdminHeader({ onToggleMobileSidebar }: AdminHeaderProps) {
  const [showNotification, setShowNotification] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between gap-3 sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {/* Mobile Hamburger Toggle Button */}
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search guest, trip ID, guide..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
          />
        </div>
      </div>

      {/* Right Side Widgets */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Weather Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <CloudSnow className="w-4 h-4 text-sky-500 animate-pulse" />
          <span>EBC Basecamp: <strong className="text-slate-900">-8°C Clear</strong></span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotification(!showNotification)}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1.5 right-1.5 ring-2 ring-white" />
          </button>

          {showNotification && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-900">Operational Alerts</span>
                <button
                  onClick={() => setShowNotification(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-3 space-y-2.5">
                <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-200 text-xs">
                  <div className="font-semibold text-amber-900 flex items-center justify-between">
                    <span>New Booking Received</span>
                    <span className="text-[10px] text-amber-700 font-normal">10m ago</span>
                  </div>
                  <p className="text-slate-600 mt-1">
                    Marcus Vance booked Everest Luxury Helicopter Trek.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs">
                  <div className="font-semibold text-emerald-900 flex items-center justify-between">
                    <span>Permit Approved</span>
                    <span className="text-[10px] text-emerald-700 font-normal">1h ago</span>
                  </div>
                  <p className="text-slate-600 mt-1">
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
          className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-xs"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">New Reservation</span>
          <span className="sm:hidden">New</span>
        </Link>

        {/* External Link to Public Website */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors pl-2 border-l border-slate-200"
        >
          <span>View Site</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </header>
  );
}
