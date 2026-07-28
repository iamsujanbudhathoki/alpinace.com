"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin-auth-context";
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

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export function AdminSidebar({ onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    if (onCloseMobile) onCloseMobile();
    router.push("/admin/login");
  };

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 text-slate-900 flex flex-col shrink-0 h-full min-h-screen">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200">
        <Link href="/admin" onClick={handleNavClick} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform shadow-xs">
            <Mountain className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 block leading-none">
              Alpine<span className="text-amber-600">Ace</span>
            </span>
            <span className="text-[10px] tracking-widest text-slate-500 font-bold uppercase block mt-1">
              Admin Portal
            </span>
          </div>
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
      <div className="flex-1 py-6 px-3 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
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
              onClick={handleNavClick}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-amber-400" : "text-slate-500"
                  }`}
                />
                <span>{item.title}</span>
              </div>
              {item.badge ? (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-amber-400 text-slate-950"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {item.badge}
                </span>
              ) : (
                isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Operational Notice Box */}
      <div className="p-4 mx-3 mb-4 rounded-xl bg-slate-50 border border-slate-200 text-xs shadow-xs">
        <div className="flex items-center gap-1.5 text-amber-700 font-bold mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          <span>Lukla Weather Window</span>
        </div>
        <p className="text-slate-600 leading-relaxed text-[11px]">
          Morning flight window clear. 4 expeditions in transit to Namche.
        </p>
      </div>

      {/* Admin User Profile */}
      <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center shadow-xs">
            {user?.name ? user.name.split(" ").map(n => n[0]).join("") : "SB"}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-slate-900 truncate">
              {user?.name || "Sujan Budhathoki"}
            </div>
            <div className="text-[10px] text-slate-500 truncate font-medium">
              {user?.role || "Expedition Director"}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Sign Out of Admin"
          className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
