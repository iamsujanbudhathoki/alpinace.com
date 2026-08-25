"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, ChevronRight, ArrowRight } from "lucide-react";
import { navLinks, NavLink } from "@/lib/site-config";
import { useSettings } from "@/lib/settings-context";
import { useDetailNav } from "@/lib/detail-nav-context";
import { categoryCache } from "@/lib/services/category-cache";
import { CategoryItem, CategoryType } from "@/lib/admin-data";



export function SiteHeader() {
  const { settings } = useSettings();
  const { detailNav } = useDetailNav();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDetailNav, setShowDetailNav] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const detailTabsContainerRef = useRef<HTMLDivElement>(null);

  // Desktop Dropdown & Prefetch State
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [categoriesMap, setCategoriesMap] = useState<Record<string, CategoryItem[]>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [hoveredCategoryMap, setHoveredCategoryMap] = useState<Record<string, string>>({});
  const [hoveredSubcategoryMap, setHoveredSubcategoryMap] = useState<Record<string, string>>({});

  // Mobile Accordion State
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({});
  const [mobileCategoryExpanded, setMobileCategoryExpanded] = useState<Record<string, boolean>>({});

  // Timers for hover intent and graceful mouse leave
  const hoverIntentTimerRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 10);

      if (!detailNav) {
        setShowDetailNav(false);
        return;
      }

      // Check the actual in-page tabs bar position
      const tabsAnchor = document.getElementById("detail-page-tabs-bar");
      if (tabsAnchor) {
        const rect = tabsAnchor.getBoundingClientRect();
        // Contextual tabs take over ONLY when in-page tabs reach top of viewport (<= 60px)
        setShowDetailNav(rect.top <= 60);
      } else {
        setShowDetailNav(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [detailNav]);

  // Auto-scroll active tab into view in the top header tabs row
  useEffect(() => {
    if (showDetailNav && detailNav?.activeTab && detailTabsContainerRef.current) {
      const activeBtn = detailTabsContainerRef.current.querySelector<HTMLElement>(
        `[data-tab-key="${detailNav.activeTab}"]`
      );
      if (activeBtn) {
        const container = detailTabsContainerRef.current;
        const buttonLeft = activeBtn.offsetLeft;
        const buttonWidth = activeBtn.offsetWidth;
        const containerWidth = container.offsetWidth;
        const scrollLeft = buttonLeft - containerWidth / 2 + buttonWidth / 2;

        container.scrollTo({
          left: Math.max(0, scrollLeft),
          behavior: "smooth",
        });
      }
    }
  }, [showDetailNav, detailNav?.activeTab]);

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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Prevent background scroll when mobile navigation is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
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

  // Desktop Hover-Intent Handlers
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
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

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

  const handleMobileCategoryToggle = (catId: string) => {
    setMobileCategoryExpanded((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const getCategoryLink = (baseHref: string, cat: { slug?: string; id?: string }) => {
    return `${baseHref}?category=${encodeURIComponent(cat.slug || cat.id || "")}`;
  };

  const handleDetailTabClick = (key: string) => {
    if (detailNav?.onTabChange) {
      detailNav.onTabChange(key);
    }
    const section = document.getElementById(key);
    if (section) {
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 80;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 bg-white/95 backdrop-blur-sm transition-all duration-200 ${
          isScrolled
            ? "border-b border-stone-200 shadow-sm py-2 sm:py-2.5"
            : "border-b border-stone-100 py-3 sm:py-3.5"
        }`}
      >
        {showDetailNav && detailNav ? (
          /* 1. CONTEXTUAL DETAIL TAB NAVIGATION (Replaces main navbar when scrolling details page) */
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 md:px-8 w-full animate-in fade-in duration-200">
            <div
              ref={detailTabsContainerRef}
              className="flex-1 min-w-0 flex items-center overflow-x-auto scrollbar-none py-0.5 touch-pan-x"
            >
              <div className="flex items-center gap-1 sm:gap-1.5">
                {detailNav.tabs.map((tab) => {
                  const isActive = detailNav.activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      data-tab-key={tab.key}
                      type="button"
                      onClick={() => handleDetailTabClick(tab.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                        isActive
                          ? "bg-amber-100/80 text-amber-900 font-bold border border-amber-300/60 shadow-2xs"
                          : "text-stone-600 hover:text-amber-900 hover:bg-stone-100/70"
                      }`}
                    >
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              {detailNav.priceUSD !== undefined && (
                <div className="text-right hidden sm:block">
                  <span className="type-caption text-stone-600 block text-[10px]">
                    From
                  </span>
                  <span className="type-heading-md text-stone-900 block leading-tight">
                    ${detailNav.priceUSD.toLocaleString()} USD
                  </span>
                </div>
              )}
              {detailNav.onBookClick && (
                <button
                  type="button"
                  onClick={detailNav.onBookClick}
                  className="bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <span>{detailNav.bookButtonLabel || "Book Now"}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* 2. STANDARD WEBSITE NAVIGATION BAR */
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 sm:gap-6 px-4 sm:px-6 md:px-10 animate-in fade-in duration-200">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
              <Image
                src="/logo.jpg"
                alt="AlpineAce Logo"
                width={36}
                height={36}
                priority
                className="h-8 w-8 sm:h-9 sm:w-9 object-cover rounded-sm border border-stone-200"
              />
              <span className="font-heading text-sm sm:text-base font-bold text-zinc-900 group-hover:text-amber-700 transition-colors">
                {settings.siteName || "Alpine Ace"}
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden items-center gap-5 xl:gap-7 lg:flex relative">
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

                    {/* Desktop Subcategories Mega-Menu */}
                    {hasDropdown && isDropdownOpen && (
                      <div
                        onMouseEnter={handleDropdownMouseEnter}
                        onMouseLeave={handleDropdownMouseLeave}
                        className={`absolute top-full pt-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150 ease-out ${
                          link.items && link.items.length > 0
                            ? "right-0"
                            : link.label === "Trekking"
                            ? "-left-28 xl:-left-24"
                            : link.label === "Tours"
                            ? "-left-[360px] xl:-left-[320px]"
                            : link.label === "Expeditions"
                            ? "-left-[580px] xl:-left-[540px]"
                            : "left-0"
                        }`}
                      >
                        <div
                          className={`bg-white rounded-xl border border-stone-200/90 shadow-xl shadow-stone-900/5 p-6 sm:p-8 overflow-hidden ${
                            link.items && link.items.length > 0
                              ? "w-[320px]"
                              : "w-[1040px] max-w-[calc(100vw-32px)]"
                          }`}
                        >
                          {link.items && link.items.length > 0 ? (
                            /* Simple Sub-Items (e.g. Resources: Blog, Contact) */
                            <div>
                              <div className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2 px-1">
                                Resources
                              </div>
                              <div className="space-y-1">
                                {link.items.map((subItem) => (
                                  <Link
                                    key={subItem.href}
                                    href={subItem.href}
                                    onClick={() => setActiveDropdown(null)}
                                    className="group/item flex items-center justify-between p-2.5 rounded-md hover:bg-stone-50 transition-colors cursor-pointer"
                                  >
                                    <div className="space-y-0.5 pr-2">
                                      <div className="text-xs sm:text-sm font-semibold text-stone-900 group-hover/item:text-stone-900 transition-colors">
                                        {subItem.label}
                                      </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover/item:text-stone-900 transition-transform group-hover/item:translate-x-0.5 shrink-0" />
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ) : (
                            /* Subcategory Mega Menu */
                            <div>
                              {isLoading ? (
                                <div className="grid grid-cols-12 gap-8 p-2 animate-pulse">
                                  <div className="col-span-4 space-y-3">
                                    <div className="h-3 w-20 bg-stone-200 rounded" />
                                    <div className="h-8 bg-stone-100 rounded-md" />
                                    <div className="h-8 bg-stone-100 rounded-md" />
                                    <div className="h-8 bg-stone-100 rounded-md" />
                                  </div>
                                  <div className="col-span-8 space-y-3">
                                    <div className="h-3 w-28 bg-stone-200 rounded" />
                                    <div className="h-10 bg-stone-100 rounded-md" />
                                    <div className="h-10 bg-stone-100 rounded-md" />
                                  </div>
                                </div>
                              ) : categories.length === 0 ? (
                                <div className="py-8 px-4 text-center text-xs text-stone-500 font-medium">
                                  No categories available.
                                </div>
                              ) : (
                                (() => {
                                  const activeParentId =
                                    hoveredCategoryMap[catType] || categories[0]?.id;
                                  const selectedParent =
                                    categories.find((c) => c.id === activeParentId) ||
                                    categories[0];
                                  const subcategories = selectedParent?.children || [];
                                  const activeSubId =
                                    hoveredSubcategoryMap[selectedParent.id] ||
                                    subcategories[0]?.id;
                                  const selectedSubCat =
                                    subcategories.find((s) => s.id === activeSubId) ||
                                    subcategories[0];

                                  // Get ONLY subcategories of selectedParent that HAVE a real image string directly from the API
                                  const subcategoriesWithImages = subcategories.filter(
                                    (s) =>
                                      s.image &&
                                      typeof s.image === "string" &&
                                      s.image.trim().length > 0
                                  );
                                  const hasSubCatImages = subcategoriesWithImages.length > 0;

                                  return (
                                    <div className="flex flex-col gap-5">
                                      <div className="grid grid-cols-12 gap-8 divide-x divide-stone-100">
                                        {/* Column 1: Main Navigation Categories (col-span-3) */}
                                        <div className="col-span-3 pr-2 space-y-3">
                                          <div className="text-xs font-bold text-stone-900 uppercase tracking-wider px-1">
                                            Categories
                                          </div>
                                          <div className="space-y-1">
                                            {categories.map((cat) => {
                                              const isSelected = cat.id === selectedParent.id;
                                              return (
                                                <div
                                                  key={cat.id}
                                                  onMouseEnter={() =>
                                                    setHoveredCategoryMap((prev) => ({
                                                      ...prev,
                                                      [catType]: cat.id,
                                                    }))
                                                  }
                                                  className={`group/cat px-3.5 py-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-between ${
                                                    isSelected
                                                      ? "bg-stone-900 text-white font-semibold shadow-xs"
                                                      : "hover:bg-stone-100/80 text-stone-900 font-medium"
                                                  }`}
                                                >
                                                  <Link
                                                    href={getCategoryLink(link.href, cat)}
                                                    onClick={() => setActiveDropdown(null)}
                                                    className="flex-1 min-w-0 pr-2"
                                                  >
                                                    <div className="text-xs sm:text-sm truncate">
                                                      {cat.name}
                                                    </div>
                                                  </Link>
                                                  <ChevronRight
                                                    className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                                                      isSelected
                                                        ? "text-white translate-x-0.5 opacity-100"
                                                        : "text-stone-400 opacity-0 group-hover/cat:opacity-100"
                                                    }`}
                                                  />
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>

                                        {/* Column 2: Relevant Subcategories Text Navigation */}
                                        <div
                                          className={`${
                                            hasSubCatImages ? "col-span-4 px-3" : "col-span-9 pl-6"
                                          } space-y-3 flex flex-col justify-between`}
                                        >
                                          <div>
                                            <div className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3 px-1">
                                              {selectedParent.name} Subcategories
                                            </div>

                                            {subcategories.length > 0 ? (
                                              <div
                                                className={`gap-1.5 ${
                                                  hasSubCatImages
                                                    ? "flex flex-col space-y-1 max-h-[340px] overflow-y-auto pr-1"
                                                    : "grid grid-cols-3 gap-x-6 gap-y-2"
                                                }`}
                                              >
                                                {subcategories.map((subCat) => {
                                                  const isSubHovered =
                                                    subCat.id === selectedSubCat?.id;

                                                  return (
                                                    <Link
                                                      key={subCat.id}
                                                      href={getCategoryLink(link.href, subCat)}
                                                      onClick={() => setActiveDropdown(null)}
                                                      onMouseEnter={() =>
                                                        setHoveredSubcategoryMap((prev) => ({
                                                          ...prev,
                                                          [selectedParent.id]: subCat.id,
                                                        }))
                                                      }
                                                      className={`group/sub p-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                                        isSubHovered
                                                          ? "bg-stone-100 text-stone-900 font-semibold"
                                                          : "hover:bg-stone-50 text-stone-900"
                                                      }`}
                                                    >
                                                      <span className="text-xs sm:text-sm font-semibold text-stone-900 group-hover/sub:text-stone-900 transition-colors truncate">
                                                        {subCat.name}
                                                      </span>
                                                      {subCat.itemCount > 0 && (
                                                        <span className="text-xs text-stone-600 font-medium shrink-0">
                                                          ({subCat.itemCount})
                                                        </span>
                                                      )}
                                                    </Link>
                                                  );
                                                })}
                                              </div>
                                            ) : (
                                              <div className="py-4 px-1">
                                                <Link
                                                  href={getCategoryLink(link.href, selectedParent)}
                                                  onClick={() => setActiveDropdown(null)}
                                                  className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-900 hover:text-stone-700 pt-1"
                                                >
                                                  <span>Explore {selectedParent.name}</span>
                                                  <ArrowRight className="w-3.5 h-3.5" />
                                                </Link>
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {/* Column 3: Subcategories Visual Exploration Grid (Subcategory Images + Natural Hover Name Overlay) */}
                                        {hasSubCatImages && (
                                          <div className="col-span-5 pl-5 flex flex-col justify-between">
                                            <div>
                                              <div className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">
                                                Subcategory Visuals
                                              </div>

                                              <div className="grid grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
                                                {subcategoriesWithImages.map((subCat) => {
                                                  const isSubHovered =
                                                    subCat.id === selectedSubCat?.id;

                                                  return (
                                                    <Link
                                                      key={subCat.id}
                                                      href={getCategoryLink(link.href, subCat)}
                                                      onClick={() => setActiveDropdown(null)}
                                                      onMouseEnter={() =>
                                                        setHoveredSubcategoryMap((prev) => ({
                                                          ...prev,
                                                          [selectedParent.id]: subCat.id,
                                                        }))
                                                      }
                                                      className={`group/imgcard relative h-36 sm:h-40 rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer block ${
                                                        isSubHovered
                                                          ? "border-stone-900 ring-2 ring-stone-900/40 shadow-md"
                                                          : "border-stone-200 hover:border-stone-400"
                                                      }`}
                                                    >
                                                      <Image
                                                        src={subCat.image!}
                                                        alt={subCat.name}
                                                        fill
                                                        className="object-cover group-hover/imgcard:scale-105 transition-transform duration-300"
                                                        sizes="240px"
                                                      />
                                                      {/* Default subtle gradient shade + Hover overlay revealing subcategory name naturally */}
                                                      <div
                                                        className={`absolute inset-0 transition-all duration-200 flex flex-col justify-end p-3.5 ${
                                                          isSubHovered
                                                            ? "bg-stone-950/80 backdrop-blur-[2px]"
                                                            : "bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent group-hover/imgcard:bg-stone-950/80 group-hover/imgcard:backdrop-blur-[2px]"
                                                        }`}
                                                      >
                                                        <span className="text-xs sm:text-sm font-semibold text-white line-clamp-2 leading-snug">
                                                          {subCat.name}
                                                        </span>
                                                        {subCat.itemCount > 0 && (
                                                          <span className="text-[11px] text-stone-300 font-medium mt-1">
                                                            {subCat.itemCount}{" "}
                                                            {subCat.itemCount === 1
                                                              ? "trip"
                                                              : "trips"}
                                                          </span>
                                                        )}
                                                      </div>
                                                    </Link>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {/* Bottom Bar: High-Contrast Pure Navigation Link */}
                                      <div className="pt-3.5 border-t border-stone-200 flex items-center justify-end">
                                        <Link
                                          href={link.href}
                                          onClick={() => setActiveDropdown(null)}
                                          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-900 hover:text-stone-700 transition-colors group/all"
                                        >
                                          <span>View All {link.label}</span>
                                          <ArrowRight className="w-3.5 h-3.5 text-stone-900 transition-transform group-hover/all:translate-x-0.5" />
                                        </Link>
                                      </div>
                                    </div>
                                  );
                                })()
                              )}
                            </div>
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
              <Link
                href="/contact"
                className="hidden sm:inline-flex items-center gap-2 rounded-md bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 text-xs font-semibold shadow-xs transition-all duration-200 cursor-pointer group"
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
        )}
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
                {settings.siteName || "AlpineAce"}
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
                      <Link
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex-1 py-3 px-3.5 text-lg font-medium ${
                          isActive ? "font-bold text-amber-800" : "text-slate-700"
                        }`}
                      >
                        {link.label}
                      </Link>

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

                    {hasDropdown && isExpanded && (
                      <div className="pl-3 pr-2 py-2 space-y-1.5 bg-stone-50/70 rounded-xl mt-1 mb-2 border border-stone-200/60 animate-in fade-in duration-150">
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
                                    <p className="text-xs text-slate-500 line-clamp-1">
                                      {subItem.description}
                                    </p>
                                  )}
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              </Link>
                            ))}
                          </>
                        ) : (
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
                                {categories.map((cat) => {
                                  const subcategories = cat.children || [];
                                  const isCategoryOpen = !!mobileCategoryExpanded[cat.id];

                                  return (
                                    <div key={cat.id} className="space-y-1">
                                      <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-stone-200/80">
                                        <Link
                                          href={getCategoryLink(link.href, cat)}
                                          onClick={() => setMobileMenuOpen(false)}
                                          className="font-semibold text-xs text-stone-900 flex-1 min-w-0 pr-2"
                                        >
                                          {cat.name}
                                        </Link>

                                        {subcategories.length > 0 && (
                                          <button
                                            type="button"
                                            onClick={() => handleMobileCategoryToggle(cat.id)}
                                            className="p-1 text-stone-500 hover:text-amber-800 cursor-pointer"
                                          >
                                            <ChevronDown
                                              className={`w-3.5 h-3.5 transition-transform ${
                                                isCategoryOpen ? "rotate-180 text-amber-700" : ""
                                              }`}
                                            />
                                          </button>
                                        )}
                                      </div>

                                      {/* Subcategories Accordion List */}
                                      {subcategories.length > 0 && isCategoryOpen && (
                                        <div className="pl-3 space-y-1 border-l-2 border-amber-300 ml-2 py-1">
                                          {subcategories.map((subCat) => (
                                            <Link
                                              key={subCat.id}
                                              href={getCategoryLink(link.href, subCat)}
                                              onClick={() => setMobileMenuOpen(false)}
                                              className="block p-1.5 text-xs font-semibold text-stone-700 hover:text-amber-800 hover:bg-amber-50 rounded"
                                            >
                                              {subCat.name}
                                            </Link>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}

                                <div className="pt-1.5 mt-1 border-t border-stone-200/60">
                                  <Link
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-between p-2 text-xs font-bold text-amber-800 hover:underline"
                                  >
                                    <span>View All {link.label}</span>
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

            <div className="pt-6 border-t border-slate-100 mt-6 space-y-4">
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-md bg-amber-800 text-white py-3 px-4 font-semibold text-sm shadow-md transition-colors"
              >
                <span>Plan Your Trip</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
