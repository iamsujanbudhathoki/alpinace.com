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
import { CategoryItem, CategoryType } from "@/lib/admin-data";

export function SiteHeader() {
  const { settings } = useSettings();
  const { detailNav } = useDetailNav();
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [showDetailNav, setShowDetailNav] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(64);

  const headerRef = useRef<HTMLElement>(null);
  const detailTabsContainerRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef<number>(0);

  // WhatsApp setup
  const rawPhone = settings.whatsappNumber || "+977 9764398491";
  const cleanPhone = rawPhone.replace(/\D/g, "");
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        "Hello Alpine Ace! I would like to inquire about a trek or tour in Nepal."
      )}`
    : "/contact";

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

  // Track scroll position for header styling & detail tab threshold
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 10);

      if (!detailNav) {
        setShowDetailNav(false);
        return;
      }

      const tabsAnchor = document.getElementById("detail-page-tabs-bar");
      if (tabsAnchor) {
        const rect = tabsAnchor.getBoundingClientRect();
        setShowDetailNav(rect.top <= 64);
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

  // Page Scroll Lock when Mobile Navigation is opened
  useEffect(() => {
    if (mobileMenuOpen) {
      const scrollY = window.scrollY || window.pageYOffset;
      scrollPosRef.current = scrollY;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      if (document.body.style.position === "fixed") {
        const savedY = scrollPosRef.current;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
        window.scrollTo(0, savedY);
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  // Clean up scroll lock on unmount
  useEffect(() => {
    return () => {
      if (document.body.style.position === "fixed") {
        const savedY = scrollPosRef.current;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
        window.scrollTo(0, savedY);
      }
    };
  }, []);

  // Measure dynamic header height
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.getBoundingClientRect().height);
      }
    };
    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight, { passive: true });
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, [isScrolled, mobileMenuOpen, showDetailNav]);

  // Auto-scroll active tab into view in detail tab row
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

  // Load category tree on mount
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

          types.forEach((type) => {
            if (!newMap[type]) newMap[type] = [];
          });

          setCategoriesMap(newMap);
        } else {
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
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-50 bg-slate-950 border-b border-stone-800/90 shadow-md py-4 sm:py-4.5 md:py-5 transition-all duration-200"
      >
        {showDetailNav && detailNav ? (
          /* CONTEXTUAL DETAIL TAB NAVIGATION */
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 md:px-8 w-full animate-in fade-in duration-200">
            <div
              ref={detailTabsContainerRef}
              className="flex-1 min-w-0 flex items-center overflow-x-auto scrollbar-none touch-pan-x self-stretch"
            >
              <div className="flex items-stretch h-full gap-1">
                {detailNav.tabs.map((tab) => {
                  const isActive = detailNav.activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      data-tab-key={tab.key}
                      type="button"
                      onClick={() => handleDetailTabClick(tab.key)}
                      className={`
                        relative px-3.5 py-2 text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer rounded-md
                        transition-colors duration-150
                        ${
                          isActive
                            ? "bg-stone-800 text-white font-semibold border border-stone-700/80"
                            : "text-stone-400 hover:text-white hover:bg-stone-900"
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
                  <span className="type-caption text-stone-400 block text-[10px] font-medium">
                    From
                  </span>
                  <span className="type-heading-md text-white block leading-tight font-bold">
                    ${detailNav.priceUSD.toLocaleString()} USD
                  </span>
                </div>
              )}
              {detailNav.onBookClick && (
                <button
                  type="button"
                  onClick={detailNav.onBookClick}
                  className="bg-[#eab308] hover:bg-yellow-400 text-stone-950 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-md transition-colors cursor-pointer shrink-0 shadow-2xs"
                >
                  <span className="hidden sm:inline">{detailNav.bookButtonLabel || "Book Now"}</span>
                  <span className="sm:hidden">Book</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-stone-300 hover:text-white lg:hidden rounded-md cursor-pointer transition-colors"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu-panel"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        ) : (
          /* STANDARD THREE-PART SOLID BLACK TRAVEL NAVBAR: Logo (Left) -> Nav (Center) -> WhatsApp CTA (Right) */
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 md:px-8">
            
            {/* 1. LEFT: Brand Logo Visual Anchor */}
            <Link href="/" className="flex items-center gap-3 group shrink-0 min-w-0">
              <Image
                src={settings.siteLogo || "/logo.jpg"}
                alt={settings.siteName || "AlpineAce Logo"}
                width={48}
                height={48}
                priority
                unoptimized={Boolean(settings.siteLogo && (settings.siteLogo.startsWith("http") || settings.siteLogo.startsWith("data:")))}
                className="h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 object-cover rounded-md border border-stone-700 bg-white shrink-0"
              />
              <span className="font-heading text-base sm:text-lg md:text-xl font-bold text-white transition-colors truncate tracking-tight">
                {settings.siteName || "Alpine Ace"}
              </span>
            </Link>

            {/* 2. CENTER: Main Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2 relative justify-center">
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
                    className="relative flex items-center py-1"
                    onMouseEnter={() => handleMouseEnter(link)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setActiveDropdown(null)}
                      className={`relative px-3.5 py-2 text-sm transition-colors flex items-center gap-1.5 rounded-md cursor-pointer ${
                        isActive
                          ? "bg-stone-800 text-white font-semibold border border-stone-700/80 shadow-2xs"
                          : "text-stone-300 font-medium hover:text-white hover:bg-stone-900"
                      }`}
                    >
                      <span>{link.label}</span>
                      {hasDropdown && (
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isActive
                              ? "text-white"
                              : isDropdownOpen
                              ? "rotate-180 text-white"
                              : "text-stone-400 group-hover:text-white"
                          }`}
                        />
                      )}
                    </Link>

                    {/* Desktop Dropdown Panel */}
                    {hasDropdown && isDropdownOpen && (
                      <div
                        onMouseEnter={handleDropdownMouseEnter}
                        onMouseLeave={handleDropdownMouseLeave}
                        className={`absolute top-full pt-3 z-50 animate-in fade-in duration-150 ease-out ${
                          link.items && link.items.length > 0
                            ? "right-0"
                            : link.label === "Trekking"
                            ? "-left-12 xl:-left-8"
                            : link.label === "Tours"
                            ? "-left-28"
                            : link.label === "Expeditions"
                            ? "-left-44"
                            : "left-0"
                        }`}
                      >
                        <div
                          className={`bg-white text-slate-950 rounded-xl shadow-2xl border border-stone-200 p-5 overflow-hidden ${
                            link.items && link.items.length > 0
                              ? "w-[260px]"
                              : "w-[680px] sm:w-[740px]"
                          }`}
                        >
                          {link.items && link.items.length > 0 ? (
                            /* Simple Sub-Items Dropdown */
                            <div className="space-y-1">
                              {link.items.map((subItem) => (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  onClick={() => setActiveDropdown(null)}
                                  className="flex items-center justify-between p-2.5 rounded-md hover:bg-stone-100 transition-colors text-slate-800 hover:text-slate-950 font-medium text-sm cursor-pointer"
                                >
                                  <span>{subItem.label}</span>
                                  <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                                </Link>
                              ))}
                            </div>
                          ) : (
                            /* Category Tree Split Navigation Menu */
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
                                      <div className="py-10 text-center text-xs text-stone-500 font-medium space-y-2">
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
                                    <div className="grid grid-cols-12 gap-6 min-h-[250px]">
                                      {/* Left Column: Parent Categories */}
                                      <div className="col-span-4 space-y-1 pr-1 border-r border-stone-100">
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
                                              className={`px-3 py-2 rounded-md transition-colors cursor-pointer flex items-center justify-between ${
                                                isSelected
                                                  ? "bg-slate-950 text-white font-semibold"
                                                  : "hover:bg-stone-100 text-slate-800 font-medium"
                                              }`}
                                            >
                                              <Link
                                                href={getCategoryLink(link.href, cat)}
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex-1 min-w-0"
                                              >
                                                <span className="text-sm truncate block">
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

                                      {/* Right Column: Subcategory Destination Cards */}
                                      <div className="col-span-8 flex flex-col justify-start">
                                        {subcategories.length > 0 ? (
                                          <div className="grid grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1 w-full content-start">
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
                                                    className="group/tile relative h-28 sm:h-32 w-full rounded-md overflow-hidden block cursor-pointer bg-slate-900 border border-stone-200"
                                                  >
                                                    <Image
                                                      src={subCat.image!}
                                                      alt={subCat.name}
                                                      fill
                                                      unoptimized
                                                      className="object-cover group-hover/tile:scale-105 transition-transform duration-300 ease-out opacity-90"
                                                      sizes="300px"
                                                    />
                                                    <div className="absolute inset-0 bg-slate-950/40 group-hover/tile:bg-slate-950/25 transition-colors duration-300 flex items-center justify-center p-3 text-center">
                                                      <span className="text-sm font-semibold text-white leading-snug drop-shadow-sm">
                                                        {subCat.name}
                                                      </span>
                                                    </div>
                                                  </Link>
                                                );
                                              }

                                              return (
                                                <Link
                                                  key={subCat.id}
                                                  href={getCategoryLink(link.href, subCat)}
                                                  onClick={() => setActiveDropdown(null)}
                                                  className="p-3 rounded-md hover:bg-stone-50 text-slate-800 hover:text-slate-950 font-medium text-sm flex items-center justify-between border border-stone-200 transition-colors"
                                                >
                                                  <span className="truncate">{subCat.name}</span>
                                                  <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                                                </Link>
                                              );
                                            })}
                                          </div>
                                        ) : (
                                          <div className="h-full min-h-[220px] border border-dashed border-stone-200 rounded-md p-6 flex flex-col items-center justify-center text-center space-y-2.5 bg-stone-50/50">
                                            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                                              <FolderTree className="w-5 h-5" />
                                            </div>
                                            <div className="space-y-1 max-w-xs">
                                              <p className="text-sm font-bold text-slate-900">No subcategories listed</p>
                                              <p className="text-xs text-slate-500 leading-relaxed">
                                                Explore all trips available under {selectedParent?.name || "this category"}.
                                              </p>
                                            </div>
                                            {selectedParent && (
                                              <Link
                                                href={getCategoryLink(link.href, selectedParent)}
                                                onClick={() => setActiveDropdown(null)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-950 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs mt-1"
                                              >
                                                <span>View {selectedParent.name}</span>
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

            {/* 3. RIGHT: WhatsApp Contact CTA & Mobile Menu Toggle */}
            <div className="flex items-center gap-3 shrink-0">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Chat with us on WhatsApp at ${rawPhone}`}
                className="hidden sm:inline-flex items-center gap-2.5 bg-[#eab308] hover:bg-yellow-400 text-stone-950 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-md transition-colors shadow-2xs cursor-pointer shrink-0"
              >
                <svg className="w-4 h-4 fill-stone-950 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.205 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span className="tracking-tight">{rawPhone}</span>
              </a>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-stone-300 hover:text-white lg:hidden rounded-md cursor-pointer transition-colors"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu-panel"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="fixed inset-x-0 bottom-0 z-40 lg:hidden flex flex-col"
          style={{ top: `${headerHeight}px` }}
        >
          {/* Backdrop Overlay */}
          <div
            className="absolute inset-0 bg-slate-950/70 transition-opacity duration-200"
            onClick={() => setMobileMenuOpen(false)}
            onTouchMove={(e) => e.preventDefault()}
            aria-hidden="true"
          />

          {/* Menu Panel Content */}
          <div className="relative z-10 bg-slate-950 text-white w-full h-full overflow-y-auto overscroll-contain flex flex-col justify-between p-5 sm:p-6 shadow-xl border-t border-stone-800">
            <div className="space-y-4">
              {/* Mobile Header Logo */}
              <div className="flex items-center gap-3 pb-3 border-b border-stone-800">
                <Image
                  src={settings.siteLogo || "/logo.jpg"}
                  alt={settings.siteName || "AlpineAce Logo"}
                  width={36}
                  height={36}
                  priority
                  unoptimized={Boolean(settings.siteLogo && (settings.siteLogo.startsWith("http") || settings.siteLogo.startsWith("data:")))}
                  className="h-9 w-9 object-cover rounded-md border border-stone-700 bg-white"
                />
                <span className="font-heading text-base font-bold text-white">
                  {settings.siteName || "Alpine Ace"}
                </span>
              </div>

              {/* Mobile Navigation Links Accordion */}
              <nav className="space-y-1" aria-label="Mobile navigation links">
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
                    <div key={link.label} className="border-b border-stone-800/70 py-1">
                      <div className="flex items-center justify-between min-h-[44px]">
                        <Link
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-sm font-semibold text-stone-200 hover:text-yellow-400 transition-colors py-2 flex-1"
                        >
                          {link.label}
                        </Link>
                        {hasDropdown && (
                          <button
                            type="button"
                            onClick={() => handleMobileToggle(link)}
                            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-stone-400 hover:text-white cursor-pointer -mr-2"
                            aria-label={`Toggle ${link.label} subcategories`}
                            aria-expanded={isExpanded}
                          >
                            <ChevronDown
                              className={`w-5 h-5 transition-transform duration-200 ${
                                isExpanded ? "rotate-180 text-white" : ""
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {/* Mobile Accordion Content */}
                      {hasDropdown && isExpanded && (
                        <div className="mt-1 pl-3.5 space-y-1.5 border-l-2 border-stone-800 py-1">
                          {link.items && link.items.length > 0 ? (
                            link.items.map((subItem) => (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block text-xs font-semibold text-stone-300 hover:text-white py-2 min-h-[40px] flex items-center"
                              >
                                {subItem.label}
                              </Link>
                            ))
                          ) : isLoading ? (
                            <div className="text-xs text-stone-400 py-2">Loading categories...</div>
                          ) : categories.length === 0 ? (
                            <div className="text-xs text-stone-400 py-2">No categories available</div>
                          ) : (
                            categories.map((cat) => (
                              <div key={cat.id} className="space-y-1">
                                <Link
                                  href={getCategoryLink(link.href, cat)}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="block text-xs font-bold text-stone-100 hover:text-yellow-400 py-1.5 min-h-[36px] flex items-center"
                                >
                                  {cat.name}
                                </Link>
                                {Array.isArray(cat.children) && cat.children.length > 0 && (
                                  <div className="pl-3 space-y-1 border-l border-stone-800 my-1">
                                    {cat.children.map((subCat) => (
                                      <Link
                                        key={subCat.id}
                                        href={getCategoryLink(link.href, subCat)}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block text-[11px] font-medium text-stone-400 hover:text-white py-1 min-h-[32px] flex items-center"
                                      >
                                        {subCat.name}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer WhatsApp Action CTA */}
            <div className="pt-4 border-t border-stone-800 mt-6 shrink-0 space-y-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Chat with us on WhatsApp at ${rawPhone}`}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#eab308] hover:bg-yellow-400 text-stone-950 font-bold text-sm py-3 rounded-md transition-colors text-center shadow-xs cursor-pointer"
              >
                <svg className="w-4 h-4 fill-stone-950 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.205 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span className="tracking-tight">{rawPhone}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
