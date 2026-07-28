"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Footprints,
  Compass,
  Mountain,
  CalendarCheck,
  Users,
  FileText,
  MessageSquare,
  Settings,
  X,
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
    title: "Treks",
    href: "/admin/treks",
    icon: Footprints,
    badge: null,
  },
  {
    title: "Tours",
    href: "/admin/tours",
    icon: Compass,
    badge: null,
  },
  {
    title: "Expeditions",
    href: "/admin/expeditions",
    icon: Mountain,
    badge: null,
  },
  {
    title: "Bookings",
    href: "/admin/bookings",
    icon: CalendarCheck,
    badge: mockDashboardMetrics.pendingBookings,
  },
  {
    title: "Guides",
    href: "/admin/guides",
    icon: Users,
    badge: null,
  },
  {
    title: "Blogs & Articles",
    href: "/admin/blogs",
    icon: FileText,
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

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export function AdminSidebar({ onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-64 bg-white text-slate-900 flex flex-col shrink-0 h-full">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200 shrink-0">
        <Link href="/admin" onClick={handleNavClick} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
            <Mountain className="w-4 h-4" />
          </div>
          <span className="font-bold text-base tracking-tight text-slate-900">
            Alpine<span className="text-amber-600">Ace</span>
          </span>
        </Link>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? "bg-slate-900 text-white font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-amber-400" : "text-slate-400"
                  }`}
                />
                <span>{item.title}</span>
              </div>
              {item.badge ? (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-amber-400 text-slate-950"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
