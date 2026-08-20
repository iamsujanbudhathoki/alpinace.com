"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Footprints,
  Compass,
  Mountain,
  CalendarCheck,
  FileText,
  MessageSquare,
  Settings,
  HelpCircle,
  X,
  Layers,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { mockDashboardMetrics } from "@/lib/admin-data";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number | null;
}

const navItems: NavItem[] = [
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
    title: "Categories",
    href: "/admin/categories",
    icon: Layers,
    badge: null,
  },
  {
    title: "Media Library",
    href: "/admin/media",
    icon: ImageIcon,
    badge: null,
  },
  {
    title: "Bookings",
    href: "/admin/bookings",
    icon: CalendarCheck,
    // badge: mockDashboardMetrics.pendingBookings,
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
    // badge: mockDashboardMetrics.pendingInquiries,
  },
  {
    title: "FAQs & Consultations",
    href: "/admin/faqs",
    icon: HelpCircle,
    badge: null,
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
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminSidebar({
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-full bg-white text-slate-900 flex flex-col shrink-0 h-full select-none">
      {/* Brand Header */}
      <div
        className={`h-16 flex items-center border-b border-slate-200 shrink-0 transition-all ${
          isCollapsed ? "px-3 justify-center" : "px-5 justify-between"
        }`}
      >
        <Link
          href="/admin"
          onClick={handleNavClick}
          className="flex items-center gap-2.5 min-w-0"
          title="AlpineAce Admin"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold shadow-xs shrink-0">
            <Mountain className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-base tracking-tight text-slate-900 truncate">
              Alpine<span className="text-amber-600">Ace</span>
            </span>
          )}
        </Link>
      </div>

      {/* Navigation Links */}
      <div
        className={`flex-1 py-4 px-2.5 space-y-1.5 ${
          isCollapsed ? "overflow-y-auto hover:overflow-visible" : "overflow-y-auto"
        }`}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname?.startsWith(item.href));

          if (isCollapsed) {
            return (
              <div key={item.href} className="relative group flex justify-center">
                <Link
                  href={item.href}
                  onClick={handleNavClick}
                  title={item.title}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? "bg-slate-950 text-amber-400 font-extrabold shadow-sm"
                      : "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-amber-400" : "text-amber-600"
                    }`}
                  />
                </Link>

                {/* Sleek Floating Hover Tooltip with Caret Arrow when Collapsed */}
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 flex items-center gap-2 top-1/2 -translate-y-1/2 -translate-x-2 group-hover:translate-x-0">
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
                  <span>{item.title}</span>
                  {item.badge ? (
                    <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-slate-950 text-white font-extrabold shadow-sm"
                  : "text-slate-900 hover:text-slate-950 hover:bg-slate-100/90"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-amber-400" : "text-amber-600"
                  }`}
                />
                <span className="truncate">{item.title}</span>
              </div>
              {item.badge ? (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    isActive
                      ? "bg-amber-400 text-slate-950"
                      : "bg-slate-100 text-slate-800 border border-slate-200"
                  }`}
                >
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>

      {/* Bottom Footer Collapse Action */}
      {onToggleCollapse && (
        <div className="p-2 border-t border-slate-200 shrink-0 hidden md:block">
          <button
            onClick={onToggleCollapse}
            className={`w-full py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center ${
              isCollapsed ? "justify-center px-0" : "px-3 justify-between"
            }`}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {!isCollapsed && <span className="text-slate-500 font-semibold">Collapse sidebar</span>}
            {isCollapsed ? (
              <PanelLeftOpen className="w-5 h-5 text-amber-600" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      )}
    </aside>
  );
}
