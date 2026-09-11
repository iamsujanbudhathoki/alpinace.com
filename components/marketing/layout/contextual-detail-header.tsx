"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { PackageTabsNav } from "@/components/marketing/package-details/package-tabs-nav";
import { DetailNavData } from "@/lib/detail-nav-context";

export interface ContextualDetailHeaderProps {
  settings: { siteLogo?: string; siteName?: string };
  detailNav: DetailNavData;
  onTabChange: (key: string) => void;
  mobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

export function ContextualDetailHeader({
  settings,
  detailNav,
  onTabChange,
  mobileMenuOpen,
  onMobileMenuToggle,
}: ContextualDetailHeaderProps) {
  return (
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 w-full animate-in fade-in duration-200">
      {/* Brand Logo Visual Anchor for Detail Nav */}
      <Link href="/" className="flex items-center gap-2 group shrink-0 min-w-0 mr-1 sm:mr-2 cursor-pointer">
        <Image
          src={settings.siteLogo || "/logo.jpg"}
          alt={settings.siteName || "AlpineAce Logo"}
          width={36}
          height={36}
          priority
          unoptimized={Boolean(settings.siteLogo && (settings.siteLogo.startsWith("http") || settings.siteLogo.startsWith("data:")))}
          className="h-8 w-8 sm:h-9 sm:w-9 object-cover rounded-md border border-stone-200 bg-white shrink-0"
        />
        <span className="hidden sm:inline font-heading text-xs sm:text-sm font-bold text-stone-900 transition-colors truncate tracking-tight">
          {settings.siteName || "Alpine Ace"}
        </span>
      </Link>

      {/* Modular Detail Tab Navigation Component */}
      <PackageTabsNav
        tabs={detailNav.tabs}
        activeTab={detailNav.activeTab}
        onTabChange={onTabChange}
        variant="header"
      />

      {/* Right Column Action Controls */}
      <div className="shrink-0 flex items-center gap-3">
       
        {detailNav.onBookClick && (
          <button
            type="button"
            onClick={detailNav.onBookClick}
            className="btn-accent shrink-0 shadow-2xs"
          >
            <span className="hidden sm:inline">{detailNav.bookButtonLabel || "Book Now"}</span>
            <span className="sm:hidden">Book</span>
          </button>
        )}
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="p-2 text-stone-700 hover:text-stone-900 lg:hidden rounded-md cursor-pointer transition-colors"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu-panel"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
