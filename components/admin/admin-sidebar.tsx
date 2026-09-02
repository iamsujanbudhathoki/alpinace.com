"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  MapPin,
  Compass,
  Mountain,
  FolderTree,
  ChevronDown,
  Images,
  FileText,
  Calendar,
  Inbox,
  HelpCircle,
  Users,
  Info,
  Sliders,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquareQuote,
  Bell,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number | null;
}

const navGroups: { items: NavItem[] }[] = [
  {
    items: [
      {
        title: "Overview",
        href: "/admin",
        icon: LayoutGrid,
      },
    ],
  },
  {
    items: [
      {
        title: "Treks",
        href: "/admin/treks",
        icon: MapPin,
      },
      {
        title: "Tours",
        href: "/admin/tours",
        icon: Compass,
      },
      {
        title: "Expeditions",
        href: "/admin/expeditions",
        icon: Mountain,
      },
      {
        title: "Categories",
        href: "/admin/categories",
        icon: FolderTree,
      },
    ],
  },
  {
    items: [
      {
        title: "Bookings",
        href: "/admin/bookings",
        icon: Calendar,
      },
      {
        title: "Inquiries",
        href: "/admin/inquiries",
        icon: Inbox,
      },
      {
        title: "Media Library",
        href: "/admin/media",
        icon: Images,
      },
      {
        title: "Blogs & Articles",
        href: "/admin/blogs",
        icon: FileText,
      },
      {
        title: "FAQs & Guides",
        href: "/admin/faqs",
        icon: HelpCircle,
      },
      {
        title: "Team Members",
        href: "/admin/teams",
        icon: Users,
      },
      {
        title: "Testimonials",
        href: "/admin/testimonials",
        icon: MessageSquareQuote,
      },
      {
        title: "About Us",
        href: "/admin/about",
        icon: Info,
      },
    ],
  },
  {
    items: [
      {
        title: "Notifications",
        href: "/admin/notifications",
        icon: Bell,
      },
      {
        title: "Settings",
        href: "/admin/settings",
        icon: Sliders,
      },
    ],
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
  const [categoriesOpen, setCategoriesOpen] = useState(
    pathname?.startsWith("/admin/categories") || false
  );
  const [settingsOpen, setSettingsOpen] = useState(
    pathname?.startsWith("/admin/settings") || false
  );

  useEffect(() => {
    if (pathname?.startsWith("/admin/categories")) {
      setCategoriesOpen(true);
    }
    if (pathname?.startsWith("/admin/settings")) {
      setSettingsOpen(true);
    }
  }, [pathname]);

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-full bg-white text-slate-900 flex flex-col shrink-0 h-full select-none border-r border-slate-200">
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
          title="AlpineAce Admin Console"
        >
          <img
            src="/logo.jpg"
            alt="AlpineAce Logo"
            className="w-8 h-8 object-cover rounded-lg border border-slate-200 shrink-0 shadow-2xs"
          />
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 leading-none">
              <span className="font-bold text-sm text-slate-900 tracking-tight truncate">
                AlpineAce
              </span>
              <span className="text-[10px] font-semibold text-slate-700 truncate mt-0.5">
                Admin Console
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Links */}
      <div
        className={`flex-1 py-3 px-3 space-y-3 ${
          isCollapsed ? "overflow-y-auto hover:overflow-visible" : "overflow-y-auto"
        }`}
      >
        {navGroups.map((group, gIdx) => (
          <div
            key={gIdx}
            className={`space-y-1 ${gIdx > 0 ? "pt-3 border-t border-slate-200" : ""}`}
          >
            {group.items.map((item) => {
              const Icon = item.icon;
              const isCategories = item.href === "/admin/categories";
              const isSettings = item.href === "/admin/settings";
              const isActive = isCategories
                ? pathname?.startsWith("/admin/categories")
                : isSettings
                ? pathname?.startsWith("/admin/settings")
                : pathname === item.href ||
                  (item.href !== "/admin" && pathname?.startsWith(item.href));

              // Collapsed sidebar: icon-only with tooltip
              if (isCollapsed) {
                return (
                  <div key={item.href} className="relative group flex justify-center">
                    <Link
                      href={item.href}
                      onClick={handleNavClick}
                      title={item.title}
                      className={`w-9 h-9 rounded-md flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-slate-900 text-amber-400 font-semibold shadow-xs"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          isActive
                            ? "text-amber-400"
                            : "text-slate-600 group-hover:text-slate-900"
                        }`}
                      />
                    </Link>
                    <div className="absolute left-full ml-2.5 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-md shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 flex items-center gap-2 top-1/2 -translate-y-1/2 -translate-x-1 group-hover:translate-x-0">
                      <span>{item.title}</span>
                    </div>
                  </div>
                );
              }

              // Categories collapsible
              if (isCategories) {
                return (
                  <div key="categories-group" className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setCategoriesOpen((prev) => !prev)}
                      className={`w-full group flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                        isActive
                          ? "bg-slate-900 text-white shadow-xs"
                          : "text-slate-800 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive
                              ? "text-amber-400"
                              : "text-slate-600 group-hover:text-slate-900"
                          }`}
                        />
                        <span className="truncate">Categories</span>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          categoriesOpen ? "rotate-180" : ""
                        } ${isActive ? "text-white" : "text-slate-500"}`}
                      />
                    </button>

                    {categoriesOpen && (
                      <div className="pl-6 space-y-1 pt-0.5">
                        <Link
                          href="/admin/categories"
                          onClick={handleNavClick}
                          className={`block px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors ${
                            pathname === "/admin/categories"
                              ? "bg-slate-800 text-amber-400"
                              : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                          }`}
                        >
                          All Categories
                        </Link>
                        <Link
                          href="/admin/categories/ordering"
                          onClick={handleNavClick}
                          className={`block px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors ${
                            pathname === "/admin/categories/ordering"
                              ? "bg-slate-800 text-amber-400"
                              : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                          }`}
                        >
                          Menu Ordering
                        </Link>
                      </div>
                    )}
                  </div>
                );
              }

              // Settings collapsible
              if (isSettings) {
                return (
                  <div key="settings-group" className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setSettingsOpen((prev) => !prev)}
                      className={`w-full group flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                        isActive
                          ? "bg-slate-900 text-white shadow-xs"
                          : "text-slate-800 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive
                              ? "text-amber-400"
                              : "text-slate-600 group-hover:text-slate-900"
                          }`}
                        />
                        <span className="truncate">Settings</span>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          settingsOpen ? "rotate-180" : ""
                        } ${isActive ? "text-white" : "text-slate-500"}`}
                      />
                    </button>

                    {settingsOpen && (
                      <div className="pl-6 space-y-1 pt-0.5">
                        <Link
                          href="/admin/settings"
                          onClick={handleNavClick}
                          className={`block px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors ${
                            pathname === "/admin/settings"
                              ? "bg-slate-800 text-amber-400"
                              : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                          }`}
                        >
                          General Settings
                        </Link>
                        <Link
                          href="/admin/settings/privacy-policy"
                          onClick={handleNavClick}
                          className={`block px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors ${
                            pathname === "/admin/settings/privacy-policy"
                              ? "bg-slate-800 text-amber-400"
                              : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                          }`}
                        >
                          Privacy Policy
                        </Link>
                        <Link
                          href="/admin/settings/terms-and-conditions"
                          onClick={handleNavClick}
                          className={`block px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors ${
                            pathname === "/admin/settings/terms-and-conditions"
                              ? "bg-slate-800 text-amber-400"
                              : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                          }`}
                        >
                          Terms &amp; Conditions
                        </Link>
                      </div>
                    )}
                  </div>
                );
              }

              // Regular nav item
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={`group flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-800 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? "text-amber-400"
                          : "text-slate-600 group-hover:text-slate-900"
                      }`}
                    />
                    <span className="truncate">{item.title}</span>
                  </div>
                  {item.badge ? (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                        isActive
                          ? "bg-white/20 text-white"
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
        ))}
      </div>

      {/* Bottom Collapse Trigger */}
      {onToggleCollapse && (
        <div className="p-2.5 border-t border-slate-200 shrink-0 hidden md:block">
          <button
            onClick={onToggleCollapse}
            className={`w-full py-1.5 rounded-md text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center ${
              isCollapsed ? "justify-center px-0" : "px-2.5 justify-between"
            }`}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {!isCollapsed && <span>Collapse sidebar</span>}
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-slate-700" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      )}
    </aside>
  );
}
