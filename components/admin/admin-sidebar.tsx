"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Compass,
  Users,
  MessageSquare,
  Settings,
  Mountain,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { mockDashboardMetrics } from "@/lib/admin-data";

const navItems = [
  {
    title: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: "Bookings",
    href: "/admin/bookings",
    icon: CalendarCheck,
    badge: mockDashboardMetrics.pendingBookings,
  },
  {
    title: "Packages",
    href: "/admin/packages",
    icon: Compass,
    badge: null,
  },
  {
    title: "Sherpa Guides",
    href: "/admin/guides",
    icon: Users,
    badge: null,
  },
  {
    title: "Inquiries",
    href: "/admin/inquiries",
    icon: MessageSquare,
    badge: mockDashboardMetrics.pendingInquiries,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    badge: null,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-charcoal-900 border-r border-charcoal-800 text-offwhite-100 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-charcoal-800">
        <Link href="/admin" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400 group-hover:scale-105 transition-transform">
            <Mountain className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-offwhite-50 block leading-none">
              Alpine<span className="text-gold-400">Ace</span>
            </span>
            <span className="text-[10px] tracking-widest text-gold-500 uppercase font-semibold block mt-1">
              Admin Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-charcoal-400 uppercase">
          Management
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                  : "text-offwhite-300 hover:text-offwhite-50 hover:bg-charcoal-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-gold-400" : "text-charcoal-400"
                  }`}
                />
                <span>{item.title}</span>
              </div>
              {item.badge ? (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-gold-500 text-charcoal-950"
                      : "bg-charcoal-700 text-gold-300"
                  }`}
                >
                  {item.badge}
                </span>
              ) : (
                isActive && <ChevronRight className="w-3.5 h-3.5 text-gold-400" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Operational Notice Box */}
      <div className="p-4 mx-3 mb-4 rounded-xl bg-charcoal-950 border border-gold-500/20 text-xs">
        <div className="flex items-center gap-1.5 text-gold-400 font-semibold mb-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Lukla Flight Status</span>
        </div>
        <p className="text-charcoal-400 leading-relaxed text-[11px]">
          Morning flight window clear. 4 expeditions in transit to Namche.
        </p>
      </div>

      {/* Admin User Profile */}
      <div className="p-4 border-t border-charcoal-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gold-500 text-charcoal-950 font-bold text-xs flex items-center justify-center border border-gold-300">
            SB
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-offwhite-100 truncate">
              Sujan Budhathoki
            </div>
            <div className="text-[10px] text-gold-400 truncate">
              Expedition Director
            </div>
          </div>
        </div>
        <Link
          href="/"
          title="Exit to Marketing Site"
          className="text-charcoal-400 hover:text-gold-400 p-1 rounded-md hover:bg-charcoal-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </Link>
      </div>
    </aside>
  );
}
