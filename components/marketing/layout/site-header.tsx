"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, ChevronRight, FolderTree } from "lucide-react";
import { navLinks, NavLink } from "@/lib/site-config";
import { useSettings } from "@/lib/settings-context";
import { useDetailNav } from "@/lib/detail-nav-context";
import { categoryCache } from "@/lib/services/category-cache";
import { CategoryItem, CategoryType, CategoryStatus } from "@/lib/admin-data";

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

  // Mobile Accordion State
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({});

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

  useEffect(() => {
    async function loadAllNavbarCategories() {
      const types = [CategoryType.TREKKING, CategoryType.TOURS, CategoryType.EXPEDITIONS];

      try {
        const navTree = await categoryCache.getNavMenu();

        if (navTree && navTree.length > 0) {
          const newMap: Record<string, CategoryItem[]> = {};

          navTree.forEach((cat) => {
            const catType = cat.type;
            if (!newMap[catType]) newMap[catType] = [];
            newMap[catType].push(cat);
          });

          // Ensure types present
          types.forEach((type) => {
            if (!newMap[type]) newMap[type] = [];
          });

          setCategoriesMap(newMap);
        } else {
          // Fallback to per-type prefetch
          const results = await Promise.all(
            types.map(async (type) => {
              const data = await categoryCache.prefetch(type);
              return { type, data };
            })
          );
          const newMap: Record<string, CategoryItem[]> = {};
          results.forEach(({ type, data }) => {
            if (data && data.length > 0) {
              newMap[type] = data;
            }
          });
          if (Object.keys(newMap).length > 0) {
            setCategoriesMap((prev) => ({ ...prev, ...newMap }));
          }
        }
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

  // Set default hovered parent category for a dropdown menu tab
  const handleMouseEnter = (link: NavLink) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    const catType = link.categoryType || "";
    if (catType && categoriesMap[catType] && categoriesMap[catType].length > 0) {
      if (!hoveredCategoryMap[catType]) {
        const firstParent = categoriesMap[catType][0];
        setHoveredCategoryMap((prev) => ({
          ...prev,
          [catType]: firstParent.id,
        }));
      }
    }

    if (activeDropdown !== link.label) {
      if (hoverIntentTimerRef.current) clearTimeout(hoverIntentTimerRef.current);
      hoverIntentTimerRef.current = setTimeout(() => {
        setActiveDropdown(link.label);
      }, 50);
    }
  };

  const handleMouseLeave = () => {
    if (hoverIntentTimerRef.current) {
      clearTimeout(hoverIntentTimerRef.current);
      hoverIntentTimerRef.current = null;
    }
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const toggleMobileExpanded = (label: string) => {
    setMobileExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };

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
    }, 200);
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
    if (cached && cached.length > 0) {
      setCategoriesMap((prev) => ({ ...prev, [catType]: cached }));
      setLoadingMap((prev) => ({ ...prev, [catType]: false }));
    } else {
      setLoadingMap((prev) => ({ ...prev, [catType]: true }));
      try {
        const data = await categoryCache.prefetch(catType);
        if (data && data.length > 0) {
          setCategoriesMap((prev) => ({ ...prev, [catType]: data }));
        }
      } finally {
        setLoadingMap((prev) => ({ ...prev, [catType]: false }));
      }
    }
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
          /* 1. CONTEXTUAL DETAIL TAB NAVIGATION */
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 md:px-8 w-full animate-in fade-in duration-200">
            <div
              ref={detailTabsContainerRef}
              className="flex-1 min-w-0 flex items-center overflow-x-auto scrollbar-none touch-pan-x self-stretch"
            >
              <div className="flex items-stretch h-full">
                {detailNav.tabs.map((tab) => {
                  const isActive = detailNav.activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      data-tab-key={tab.key}
                      type="button"
                      onClick={() => handleDetailTabClick(tab.key)}
                      className={`
                        relative px-2.5 sm:px-3.5 py-0 text-[11px] sm:text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer
                        transition-colors duration-200 border-b-2 h-full flex items-center
                        ${isActive
                          ? "border-amber-700 text-amber-900 font-semibold"
                          : "border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300"
                        }
                      `}
                    >
                      {tab.label}
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
                  className="bg-slate-950 hover:bg-slate-900 text-white font-semibold text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-sm transition-colors cursor-pointer shrink-0"
                >
                  <span className="hidden sm:inline">{detailNav.bookButtonLabel || "Book Now"}</span>
                  <span className="sm:hidden">Book</span>
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
              <span className="font-heading text-sm sm:text-base font-bold text-slate-950 transition-colors">
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
                const fetched = categoriesMap[catType];
                const categories = fetched || [];
                const isLoading = !!loadingMap[catType] && categories.length === 0;

                return (
                  <div
                    key={link.label}
                    className="relative flex items-center py-2"
                    onMouseEnter={() => handleMouseEnter(link)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setActiveDropdown(null)}
                      className={`relative pb-1 text-sm font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                        isActive
                          ? "text-slate-950 font-bold"
                          : "text-slate-600 hover:text-slate-950"
                      }`}
                    >
                      <span>{link.label}</span>
                      {hasDropdown && (
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 text-stone-400 group-hover:text-slate-950 ${
                            isDropdownOpen ? "rotate-180 text-slate-950" : ""
                          }`}
                        />
                      )}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-950 rounded-full" />
                      )}
                    </Link>

                    {/* Desktop 2-Column Split Dropdown (Clean, Human, Spacious Travel UX) */}
                    {hasDropdown && isDropdownOpen && (
                      <div
                        onMouseEnter={handleDropdownMouseEnter}
                        onMouseLeave={handleDropdownMouseLeave}
                        className={`absolute top-full pt-2 z-50 animate-in fade-in duration-150 ease-out ${
                          link.items && link.items.length > 0
                            ? "right-0"
                            : link.label === "Trekking"
                            ? "-left-16 xl:-left-12"
                            : link.label === "Tours"
                            ? "-left-32"
                            : link.label === "Expeditions"
                            ? "-left-48"
                            : "left-0"
                        }`}
                      >
                        <div
                          className={`bg-white rounded-lg shadow-xl shadow-stone-900/10 p-6 overflow-hidden ${
                            link.items && link.items.length > 0
                              ? "w-[280px]"
                              : "w-[720px] sm:w-[780px]"
                          }`}
                        >
                          {link.items && link.items.length > 0 ? (
                            /* Simple Resources Dropdown Links */
                            <div className="space-y-1">
                              {link.items.map((subItem) => (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  onClick={() => setActiveDropdown(null)}
                                  className="flex items-center justify-between p-2.5 rounded-md hover:bg-stone-50 transition-colors text-slate-900 hover:text-amber-700 font-semibold text-sm cursor-pointer"
                                >
                                  <span>{subItem.label}</span>
                                  <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                                </Link>
                              ))}
                            </div>
                          ) : (
                            /* Category -> Subcategory Human Editorial Navigation Menu */
                            <div>
                              {isLoading ? (
                                <div className="grid grid-cols-12 gap-6 animate-pulse">
                                  <div className="col-span-4 space-y-2">
                                    <div className="h-9 bg-stone-100 rounded-md" />
                                    <div className="h-9 bg-stone-100 rounded-md" />
                                    <div className="h-9 bg-stone-100 rounded-md" />
                                  </div>
                                  <div className="col-span-8 grid grid-cols-2 gap-3.5">
                                    <div className="h-32 bg-stone-100 rounded-md" />
                                    <div className="h-32 bg-stone-100 rounded-md" />
                                  </div>
                                </div>
                              ) : (
                                (() => {
                                  if (categories.length === 0) {
                                    return (
                                      <div className="py-12 text-center text-xs text-stone-500 font-medium space-y-2">
                                        <FolderTree className="w-6 h-6 text-stone-400 mx-auto opacity-60" />
                                        <p className="font-semibold text-slate-800">No categories available</p>
                                      </div>
                                    );
                                  }

                                  const activeParentId =
                                    hoveredCategoryMap[catType] || categories[0]?.id;
                                  const selectedParent =
                                    categories.find((c) => c.id === activeParentId) ||
                                    categories[0];
                                  const subcategories = Array.isArray(selectedParent?.children)
                                    ? selectedParent.children
                                    : [];

                                  return (
                                    <div className="grid grid-cols-12 gap-8 min-h-[260px]">
                                      {/* Left Column: Category Navigation List (col-span-4) */}
                                      <div className="col-span-4 space-y-1">
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
                                              className={`px-3.5 py-2.5 rounded-md transition-colors cursor-pointer flex items-center justify-between ${
                                                isSelected
                                                  ? "bg-slate-950 text-white font-semibold shadow-xs"
                                                  : "hover:bg-stone-100 text-slate-800 font-medium"
                                              }`}
                                            >
                                              <Link
                                                href={getCategoryLink(link.href, cat)}
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex-1 min-w-0"
                                              >
                                                <span className="text-sm font-semibold truncate block">
                                                  {cat.name}
                                                </span>
                                              </Link>
                                              <ChevronRight
                                                className={`w-4 h-4 shrink-0 transition-opacity ${
                                                  isSelected
                                                    ? "text-white opacity-100"
                                                    : "text-stone-400 opacity-0"
                                                }`}
                                              />
                                            </div>
                                          );
                                        })}
                                      </div>

                                      {/* Right Column: Wide Subcategory Destination Tiles or Clean Empty State (col-span-8) */}
                                      <div className="col-span-8 flex flex-col justify-start">
                                        {subcategories.length > 0 ? (
                                          <div className="grid grid-cols-2 gap-3.5 max-h-[380px] overflow-y-auto pr-1 w-full content-start">
                                            {subcategories.map((subCat) => {
                                              const hasImage = Boolean(
                                                subCat.image &&
                                                  typeof subCat.image === "string" &&
                                                  subCat.image.trim().length > 0
                                              );

                                              if (hasImage) {
                                                return (
                                                  <Link
                                                    key={subCat.id}
                                                    href={getCategoryLink(link.href, subCat)}
                                                    onClick={() => setActiveDropdown(null)}
                                                    className="group/tile relative h-32 sm:h-36 w-full rounded-md overflow-hidden block cursor-pointer bg-slate-900"
                                                  >
                                                    {/* Landscape Background Image */}
                                                    <Image
                                                      src={subCat.image!}
                                                      alt={subCat.name}
                                                      fill
                                                      unoptimized
                                                      className="object-cover group-hover/tile:scale-103 transition-transform duration-300 ease-out"
                                                      sizes="320px"
                                                    />

                                                    {/* Natural Overlay & Centered Subcategory Name INSIDE Image */}
                                                    <div className="absolute inset-0 bg-slate-950/35 group-hover/tile:bg-slate-950/20 transition-colors duration-300 flex items-center justify-center p-3 text-center">
                                                      <span className="text-sm sm:text-base font-semibold text-white tracking-wide leading-snug drop-shadow-md">
                                                        {subCat.name}
                                                      </span>
                                                    </div>
                                                  </Link>
                                                );
                                              }

                                              /* Clean Text Navigation Item when subcategory has no image */
                                              return (
                                                <Link
                                                  key={subCat.id}
                                                  href={getCategoryLink(link.href, subCat)}
                                                  onClick={() => setActiveDropdown(null)}
                                                  className="p-3 rounded-md hover:bg-stone-50 text-slate-900 hover:text-amber-700 font-semibold text-sm flex items-center justify-between border border-stone-100 transition-colors"
                                                >
                                                  <span className="truncate">{subCat.name}</span>
                                                  <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                                                </Link>
                                              );
                                            })}
                                          </div>
                                        ) : (
                                          <div className="h-full min-h-[240px] border border-dashed border-stone-200 rounded-md p-6 flex flex-col items-center justify-center text-center space-y-2.5 bg-stone-50/50">
                                            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                                              <FolderTree className="w-5 h-5" />
                                            </div>
                                            <div className="space-y-1 max-w-xs">
                                              <p className="text-sm font-bold text-slate-900">No subcategories found</p>
                                              <p className="text-xs text-slate-500 font-normal leading-relaxed">
                                                There are no subcategories listed under {selectedParent?.name || "this category"}.
                                              </p>
                                            </div>
                                            {selectedParent && (
                                              <Link
                                                href={getCategoryLink(link.href, selectedParent)}
                                                onClick={() => setActiveDropdown(null)}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-slate-950 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs mt-1"
                                              >
                                                <span>Explore {selectedParent.name}</span>
                                                <ChevronRight className="w-3.5 h-3.5" />
                                              </Link>
                                            )}
                                          </div>
                                        )}
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
                className="hidden sm:inline-flex items-center justify-center bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-sm transition-colors shadow-2xs"
              >
                Inquire &amp; Book
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-stone-700 hover:text-stone-950 lg:hidden rounded-sm cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Drawer Overlay & Content */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-slate-950/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-sm h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-200">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <Image
                    src="/logo.jpg"
                    alt="Logo"
                    width={32}
                    height={32}
                    className="rounded-sm border border-stone-200"
                  />
                  <span className="font-heading text-base font-bold text-slate-950">
                    {settings.siteName || "Alpine Ace"}
                  </span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-slate-600 hover:text-slate-900 rounded-sm cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="space-y-3">
                {navLinks.map((link) => {
                  const hasDropdown = Boolean(
                    link.categoryType || (link.items && link.items.length > 0)
                  );
                  const isExpanded = !!mobileExpanded[link.label];
                  const catType = link.categoryType || "";
                  const fetched = categoriesMap[catType];
                  const categories = fetched || [];
                  const isLoading = !!loadingMap[catType] && categories.length === 0;

                  return (
                    <div key={link.label} className="border-b border-stone-100 pb-3">
                      <div className="flex items-center justify-between">
                        <Link
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-sm font-bold text-slate-950 hover:text-amber-700 transition-colors"
                        >
                          {link.label}
                        </Link>
                        {hasDropdown && (
                          <button
                            type="button"
                            onClick={() => handleMobileToggle(link)}
                            className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${
                                isExpanded ? "rotate-180 text-amber-700" : ""
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {/* Mobile Accordion Content */}
                      {hasDropdown && isExpanded && (
                        <div className="mt-3 pl-3 space-y-2 border-l-2 border-amber-600/30">
                          {link.items && link.items.length > 0 ? (
                            link.items.map((subItem) => (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block text-xs font-semibold text-slate-700 hover:text-slate-950 py-1"
                              >
                                {subItem.label}
                              </Link>
                            ))
                          ) : isLoading ? (
                            <div className="text-xs text-slate-400 py-1">Loading...</div>
                          ) : (
                            categories.map((cat) => (
                              <Link
                                key={cat.id}
                                href={getCategoryLink(link.href, cat)}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block text-xs font-semibold text-slate-700 hover:text-slate-950 py-1.5"
                              >
                                {cat.name}
                              </Link>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer Inquiry CTA */}
            <div className="pt-6 border-t border-stone-200">
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs py-3 rounded-sm transition-colors text-center shadow-2xs"
              >
                Inquire &amp; Book Trip
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
