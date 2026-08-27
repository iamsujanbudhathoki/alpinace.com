"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  MapPin,
  Compass,
  Mountain,
  FolderTree,
  Images,
  FileText,
  Calendar,
  Inbox,
  HelpCircle,
  Sliders,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number | null;
}

interface NavSection {
  label?: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: "Core",
    items: [
      {
        title: "Overview",
        href: "/admin",
        icon: LayoutGrid,
      },
    ],
  },
  {
    label: "Catalog",
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
    label: "Content & Media",
    items: [
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
    ],
  },
  {
    label: "Operations",
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
        title: "FAQs & Guides",
        href: "/admin/faqs",
        icon: HelpCircle,
      },
    ],
  },
  {
    label: "Preferences",
    items: [
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
              <span className="text-[10px] font-medium text-slate-500 truncate mt-0.5">
                Admin Console
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Groups */}
      <div
        className={`flex-1 py-3 px-3 space-y-4 ${
          isCollapsed ? "overflow-y-auto hover:overflow-visible" : "overflow-y-auto"
        }`}
      >
        {navSections.map((section, idx) => (
          <div key={section.label || idx} className="space-y-1">
            {!isCollapsed && section.label && (
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2.5 mb-1.5">
                {section.label}
              </p>
            )}
            {section.items.map((item) => {
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
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-slate-900 text-amber-400 font-semibold shadow-2xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? "text-amber-400" : "text-slate-500 group-hover:text-slate-900"
                        }`}
                      />
                    </Link>

                    {/* Hover Tooltip when Collapsed */}
                    <div className="absolute left-full ml-2.5 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 flex items-center gap-2 top-1/2 -translate-y-1/2 -translate-x-1 group-hover:translate-x-0">
                      <span>{item.title}</span>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={`group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? "text-amber-400"
                          : "text-slate-500 group-hover:text-slate-900"
                      }`}
                    />
                    <span className="truncate">{item.title}</span>
                  </div>
                  {item.badge ? (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                        isActive
                          ? "bg-amber-400 text-slate-950"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
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
            className={`w-full py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center ${
              isCollapsed ? "justify-center px-0" : "px-2.5 justify-between"
            }`}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {!isCollapsed && <span>Collapse sidebar</span>}
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-slate-600" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      )}
    </aside>
  );
}
