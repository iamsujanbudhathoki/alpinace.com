"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, MountainSnow, Menu, X } from "lucide-react";
import { navLinks } from "@/lib/site-config";

export function SiteHeader() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 bg-white transition-all duration-200 ${
        isScrolled
          ? "border-b border-slate-200/90 shadow-xs py-3"
          : "border-b border-slate-200/80 py-4"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 md:px-10">
        {/* Brand Logo with Mountain Icon & TREKS & EXPED subtitle */}
        <Link href="/" className="flex items-center gap-3 group">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-amber-400 font-bold transition-transform group-hover:scale-105">
            <MountainSnow className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-heading text-base font-extrabold tracking-wide text-slate-900">
              ALPINE ACE
            </span>
            <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mt-0.5">
              TREKS &amp; EXPED
            </span>
          </span>
        </Link>

        {/* Clean Desktop Navigation Links */}
        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`py-1 text-xs font-bold uppercase tracking-wider transition-colors ${
                  isActive
                    ? "border-b-2 border-amber-600 text-amber-700"
                    : "border-b-2 border-transparent text-slate-700 hover:text-amber-700"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Button & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <Link
            href="/contact"
            className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-slate-800 shadow-xs"
          >
            <Compass className="h-3.5 w-3.5 text-amber-400" />
            <span>Plan My Trip</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-5 space-y-4">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/contact"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 shadow-xs"
            >
              <Compass className="h-4 w-4 text-amber-400" />
              <span>Plan My Trip</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
