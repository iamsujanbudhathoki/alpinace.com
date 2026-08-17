"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, ChevronDown, ChevronRight, ArrowRight, MessageCircle } from "lucide-react";
import { navLinks, NavLink } from "@/lib/site-config";
import { useSettings } from "@/lib/settings-context";
import { categoryCache } from "@/lib/services/category-cache";
import { CategoryItem, CategoryType } from "@/lib/admin-data";

export function SiteHeader() {
  const { settings } = useSettings();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Desktop Dropdown & Prefetch State
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [categoriesMap, setCategoriesMap] = useState<Record<string, CategoryItem[]>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  // Mobile Accordion State
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({});

  // Timers for hover intent and graceful mouse leave
  const hoverIntentTimerRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Pre-fetch all Trekking, Tours, and Expeditions categories immediately on page load
  useEffect(() => {
    async function loadAllNavbarCategories() {
      const types = [CategoryType.TREKKING, CategoryType.TOURS, CategoryType.EXPEDITIONS];

      // Populate from existing cache if available
      const initialMap: Record<string, CategoryItem[]> = {};
      types.forEach((type) => {
        const cached = categoryCache.getCached(type);
        if (cached) initialMap[type] = cached;
      });
      if (Object.keys(initialMap).length > 0) {
        setCategoriesMap((prev) => ({ ...prev, ...initialMap }));
      }

      // Fetch all concurrently on mount
      try {
        const results = await Promise.all(
          types.map(async (type) => {
            const data = await categoryCache.prefetch(type);
            return { type, data };
          })
        );
        const newMap: Record<string, CategoryItem[]> = {};
        results.forEach(({ type, data }) => {
          newMap[type] = data;
        });
        setCategoriesMap((prev) => ({ ...prev, ...newMap }));
      } catch (err) {
        console.error("Failed to load navbar categories on page load:", err);
      }
    }

    loadAllNavbarCategories();
  }, []);

  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close menus on route change without triggering cascading effect renders
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }

  // Lock background body scroll when full-screen mobile menu is active & listen for Escape key
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setActiveDropdown(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (hoverIntentTimerRef.current) clearTimeout(hoverIntentTimerRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Desktop Hover-Intent Handlers (Instant open since data is preloaded on mount)
  const handleMouseEnter = (link: NavLink) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    const hasDropdown = Boolean(link.categoryType || (link.items && link.items.length > 0));

    if (!hasDropdown) {
      if (hoverIntentTimerRef.current) {
        clearTimeout(hoverIntentTimerRef.current);
        hoverIntentTimerRef.current = null;
      }
      setActiveDropdown(null);
      return;
    }

    if (hoverIntentTimerRef.current) {
      clearTimeout(hoverIntentTimerRef.current);
    }

    hoverIntentTimerRef.current = setTimeout(() => {
      setActiveDropdown(link.label);
    }, 60);
  };

  const handleMouseLeave = () => {
    if (hoverIntentTimerRef.current) {
      clearTimeout(hoverIntentTimerRef.current);
      hoverIntentTimerRef.current = null;
    }

    // ~150ms buffer delay for smooth cursor transition into dropdown
    closeTimerRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const handleDropdownMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleDropdownMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 120);
  };

  // Mobile Accordion Toggle
  const handleMobileToggle = async (link: NavLink) => {
    const isCurrentlyOpen = !!mobileExpanded[link.label];

    setMobileExpanded((prev) => ({
      ...prev,
      [link.label]: !isCurrentlyOpen,
    }));

    if (!link.categoryType || isCurrentlyOpen) return;
    const catType = link.categoryType;

    const cached = categoryCache.getCached(catType);
    if (cached) {
      setCategoriesMap((prev) => ({ ...prev, [catType]: cached }));
      setLoadingMap((prev) => ({ ...prev, [catType]: false }));
    } else {
      setLoadingMap((prev) => ({ ...prev, [catType]: true }));
      try {
        const data = await categoryCache.prefetch(catType);
        setCategoriesMap((prev) => ({ ...prev, [catType]: data }));
      } finally {
        setLoadingMap((prev) => ({ ...prev, [catType]: false }));
      }
    }
  };

  const getCategoryLink = (baseHref: string, cat: CategoryItem) => {
    return `${baseHref}?categoryId=${encodeURIComponent(cat.id)}`;
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 bg-white/95 backdrop-blur-md transition-all duration-200 ${
          isScrolled
            ? "border-b border-stone-200 py-3"
            : "border-b border-stone-100 py-4"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 md:px-10">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo.jpg"
              alt="AlpineAce Logo"
              width={36}
              height={36}
              priority
              className="h-9 w-9 object-cover rounded-lg border border-stone-200"
            />
            <span className="flex flex-col leading-none">
              <span className="font-heading text-base font-bold text-zinc-900 group-hover:text-amber-700 transition-colors">
                Alpine Ace
              </span>
              <span className="text-[10px] font-medium text-zinc-500 mt-0.5">
                Nepal Trekking &amp; Expeditions
              </span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-7 lg:flex relative">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : link.items
                  ? link.items.some((item) => pathname.startsWith(item.href))
                  : pathname.startsWith(link.href);

              const hasDropdown = Boolean(link.categoryType || (link.items && link.items.length > 0));
              const isDropdownOpen = activeDropdown === link.label && hasDropdown;
              const catType = link.categoryType || "";
              const categories = categoriesMap[catType] || [];
              const isLoading = !!loadingMap[catType];

              return (
                <div
                  key={link.label}
                  className="relative flex items-center"
                  onMouseEnter={() => handleMouseEnter(link)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href={link.href}
                    onClick={() => setActiveDropdown(null)}
                    className={`relative pb-1 text-sm font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                      isActive
                        ? "text-amber-800 font-semibold"
                        : "text-slate-600 hover:text-amber-800"
                    }`}
                  >
                    <span>{link.label}</span>
                    {hasDropdown && (
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 text-stone-400 group-hover:text-amber-700 ${
                          isDropdownOpen ? "rotate-180 text-amber-700" : ""
                        }`}
                      />
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-700 rounded-full" />
                    )}
                  </Link>

                  {/* Desktop Dropdown Menu */}
                  {hasDropdown && isDropdownOpen && (
                    <div
                      onMouseEnter={handleDropdownMouseEnter}
                      onMouseLeave={handleDropdownMouseLeave}
                      className="absolute top-full left-0 pt-2 w-72 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                    >
                      <div className="bg-white rounded-xl border border-stone-200 shadow-lg shadow-stone-950/5 p-1.5 space-y-0.5">
                        {/* Static Sub-Items (e.g. Resources: Blogs, Contacts) */}
                        {link.items && link.items.length > 0 ? (
                          <div className="space-y-0.5">
                            {link.items.map((subItem) => (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                onClick={() => setActiveDropdown(null)}
                                className="group/item flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-amber-50/50 transition-colors cursor-pointer"
                              >
                                <div className="space-y-0.5 pr-2">
                                  <div className="text-xs font-semibold text-stone-800 group-hover/item:text-amber-800 transition-colors">
                                    {subItem.label}
                                  </div>
                                  {subItem.description && (
                                    <p className="text-[11px] text-stone-600 line-clamp-1 leading-snug">
                                      {subItem.description}
                                    </p>
                                  )}
                                </div>

                                <ChevronRight className="w-3.5 h-3.5 text-stone-400 opacity-0 group-hover/item:opacity-100 group-hover/item:text-amber-700 -translate-x-1 group-hover/item:translate-x-0 transition-all duration-150 shrink-0" />
                              </Link>
                            ))}
                          </div>
                        ) : (
                          /* Dynamic Categories (Trekking, Tours, Expeditions) */
                          <>
                            {isLoading ? (
                              <div className="space-y-1 p-2">
                                {[1, 2, 3].map((n) => (
                                  <div key={n} className="py-2 px-2 space-y-1.5 animate-pulse">
                                    <div className="h-3 bg-stone-200/80 rounded w-2/3" />
                                    <div className="h-2 bg-stone-100 rounded w-1/2" />
                                  </div>
                                ))}
                              </div>
                            ) : categories.length === 0 ? (
                              <div className="py-4 px-3 text-center text-xs text-stone-500 font-medium">
                                No categories available.
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                {categories.map((cat) => (
                                  <Link
                                    key={cat.id}
                                    href={getCategoryLink(link.href, cat)}
                                    onClick={() => setActiveDropdown(null)}
                                    className="group/item flex items-center justify-between px-3 py-2 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer"
                                  >
                                    <div className="space-y-0.5 pr-2">
                                      <div className="text-xs font-semibold text-stone-800 group-hover/item:text-amber-800 transition-colors">
                                        {cat.name}
                                      </div>
                                      {cat.description && (
                                        <p className="text-[11px] text-stone-600 line-clamp-1 leading-snug">
                                          {cat.description}
                                        </p>
                                      )}
                                    </div>

                                    <ChevronRight className="w-3.5 h-3.5 text-stone-400 opacity-0 group-hover/item:opacity-100 group-hover/item:text-amber-700 -translate-x-1 group-hover/item:translate-x-0 transition-all duration-150 shrink-0" />
                                  </Link>
                                ))}
                              </div>
                            )}

                            <div className="pt-1.5 border-t border-stone-100 mt-1">
                              <Link
                                href={link.href}
                                onClick={() => setActiveDropdown(null)}
                                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-stone-700 hover:text-amber-800 hover:bg-amber-50/60 transition-colors"
                              >
                                <span>All {link.label}</span>
                                <ArrowRight className="w-3 h-3 text-amber-700" />
                              </Link>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Action Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            {/* Primary Plan Your Trip CTA */}
            <Link
              href="/contact"
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 text-xs font-semibold shadow-xs transition-all duration-200 cursor-pointer group"
            >
              <span>Plan Your Trip</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-white text-slate-900 min-h-screen w-screen overflow-y-auto animate-in fade-in duration-200 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
        >
          {/* Mobile Overlay Top Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3"
            >
              <Image
                src="/logo.jpg"
                alt="AlpineAce Logo"
                width={36}
                height={36}
                className="h-9 w-9 object-cover rounded-lg border border-slate-200"
              />
              <span className="font-heading text-base font-bold text-slate-900">
                AlpineAce
              </span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close navigation menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile Overlay Content Body */}
          <div className="flex-1 flex flex-col justify-between px-6 py-8 max-w-md mx-auto w-full">
            {/* Clean Vertical Navigation Links with Expandable Accordions */}
            <nav className="flex flex-col space-y-1.5">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : link.items
                    ? link.items.some((item) => pathname.startsWith(item.href))
                    : pathname.startsWith(link.href);

                const hasDropdown = Boolean(link.categoryType || (link.items && link.items.length > 0));
                const isExpanded = !!mobileExpanded[link.label];
                const catType = link.categoryType || "";
                const categories = categoriesMap[catType] || [];
                const isLoading = !!loadingMap[catType];

                return (
                  <div key={link.label} className="flex flex-col">
                    <div
                      className={`flex items-center justify-between rounded-xl transition-colors ${
                        isActive
                          ? "bg-amber-50/80 text-amber-800"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      {/* Clicking the text navigates immediately */}
                      <Link
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex-1 py-3 px-3.5 text-lg font-medium ${
                          isActive ? "font-bold text-amber-800" : "text-slate-700"
                        }`}
                      >
                        {link.label}
                      </Link>

                      {/* Chevron button toggles the sub-items/sub-categories */}
                      {hasDropdown && (
                        <button
                          onClick={() => handleMobileToggle(link)}
                          className="p-3 text-stone-500 hover:text-amber-800 transition-colors cursor-pointer"
                          aria-label={`Toggle ${link.label} items`}
                          aria-expanded={isExpanded}
                        >
                          <ChevronDown
                            className={`w-5 h-5 transition-transform duration-200 ${
                              isExpanded ? "rotate-180 text-amber-700" : ""
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Mobile Expandable Menu */}
                    {hasDropdown && isExpanded && (
                      <div className="pl-4 pr-2 py-2 space-y-1 bg-stone-50/70 rounded-xl mt-1 mb-2 border border-stone-200/60 animate-in fade-in duration-150">
                        {/* Static Sub-Items (Resources: Blogs, Contacts) */}
                        {link.items && link.items.length > 0 ? (
                          <>
                            {link.items.map((subItem) => (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center justify-between p-2.5 rounded-lg text-sm font-medium text-slate-700 hover:text-amber-800 hover:bg-amber-50 transition-colors"
                              >
                                <div>
                                  <div className="font-semibold text-xs text-slate-800">
                                    {subItem.label}
                                  </div>
                                  {subItem.description && (
                                    <p className="text-[11px] text-slate-500 line-clamp-1">
                                      {subItem.description}
                                    </p>
                                  )}
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              </Link>
                            ))}
                          </>
                        ) : (
                          /* Dynamic Categories */
                          <>
                            {isLoading ? (
                              <div className="p-3 text-xs text-stone-500 animate-pulse">
                                Loading {link.label} categories...
                              </div>
                            ) : categories.length === 0 ? (
                              <div className="p-3 text-xs text-stone-500">
                                No subcategories available.
                              </div>
                            ) : (
                              <>
                                {categories.map((cat) => (
                                  <Link
                                    key={cat.id}
                                    href={getCategoryLink(link.href, cat)}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-between p-2.5 rounded-lg text-sm font-medium text-slate-700 hover:text-amber-800 hover:bg-amber-50 transition-colors"
                                  >
                                    <span className="font-semibold text-xs text-slate-800">
                                      {cat.name}
                                    </span>
                                    {cat.itemCount > 0 && (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-stone-600 border border-stone-200/80">
                                        {cat.itemCount}
                                      </span>
                                    )}
                                  </Link>
                                ))}

                                <div className="pt-1.5 mt-1 border-t border-stone-200/60">
                                  <Link
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-between p-2 text-xs font-bold text-amber-800 hover:underline"
                                  >
                                    <span>All {link.label}</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </Link>
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Bottom Primary Action & Contact */}
            <div className="pt-6 border-t border-slate-100 space-y-3 shrink-0">
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm py-3 px-4 transition-colors shadow-xs"
              >
                <span>Plan Your Trip</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </Link>

              {settings.whatsappNumber && (
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
                    "Hello! I am interested in planning a trek or expedition with Alpine Ace."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-sm py-2.5 px-4 transition-colors"
                  aria-label="Chat on WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                  <span>Chat on WhatsApp</span>
                </a>
              )}

              {(settings.contactPhone || settings.emergencyPhone) && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500 font-medium pt-1">
                  <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <div className="flex flex-wrap justify-center gap-1.5 text-[11px] font-bold text-slate-800">
                    {settings.contactPhone && (
                      <a
                        href={`tel:${settings.contactPhone.replace(/\s+/g, "")}`}
                        className="hover:text-amber-700 transition-colors"
                      >
                        {settings.contactPhone}
                      </a>
                    )}
                    {settings.contactPhone && settings.emergencyPhone && (
                      <span>/</span>
                    )}
                    {settings.emergencyPhone && (
                      <a
                        href={`tel:${settings.emergencyPhone.replace(/\s+/g, "")}`}
                        className="hover:text-amber-700 transition-colors text-slate-600"
                      >
                        {settings.emergencyPhone}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
