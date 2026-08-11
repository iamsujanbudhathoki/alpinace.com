"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone } from "lucide-react";
import { navLinks } from "@/lib/site-config";
import { useSettings } from "@/lib/settings-context";

export function SiteHeader() {
  const { settings } = useSettings();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

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
            <img
              src="/logo.jpg"
              alt="AlpineAce Logo"
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
          <nav className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? "text-slate-900 font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="hidden sm:inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              Plan My Trip
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
              <img
                src="/logo.jpg"
                alt="AlpineAce Logo"
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
            {/* Clean Vertical Navigation Links */}
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-3 px-3 rounded-lg text-xl font-medium transition-colors ${
                      isActive
                        ? "text-slate-900 font-bold bg-slate-100/80"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom Primary Action & Simple Contact */}
            <div className="pt-6 border-t border-slate-100 space-y-4 shrink-0">
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-lg bg-slate-900 text-white font-semibold text-sm py-3 px-4 hover:bg-slate-800 transition-colors shadow-xs"
              >
                Plan My Trip
              </Link>

              {(settings.contactPhone || settings.emergencyPhone) && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500 font-medium pt-1">
                  <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <div className="flex flex-wrap justify-center gap-1.5 text-[11px] font-bold text-slate-800">
                    {settings.contactPhone && (
                      <a href={`tel:${settings.contactPhone.replace(/\s+/g, "")}`} className="hover:text-amber-700 transition-colors">
                        {settings.contactPhone}
                      </a>
                    )}
                    {settings.contactPhone && settings.emergencyPhone && <span>/</span>}
                    {settings.emergencyPhone && (
                      <a href={`tel:${settings.emergencyPhone.replace(/\s+/g, "")}`} className="hover:text-amber-700 transition-colors text-slate-600">
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



