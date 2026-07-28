"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
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
        {/* Brand Logo with Custom logo.jpg */}
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/logo.jpg"
            alt="AlpineAce Logo"
            className="h-10 w-10 object-cover rounded-xl border border-slate-200 shadow-xs group-hover:scale-105 transition-transform"
          />
          <span className="flex flex-col leading-none">
            <span className="font-heading text-base font-extrabold tracking-tight text-slate-900">
              ALPINE ACE
            </span>
          </span>
        </Link>

        {/* Desktop Navigation Links with Gold Active & Hover */}
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
                    ? "border-b-2 border-amber-600 text-amber-700 font-bold"
                    : "border-b-2 border-transparent text-slate-700 hover:text-amber-700"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Button - Gold only on Hover */}
        <div className="flex items-center gap-4">
          <Link
            href="/contact"
            className="hidden sm:inline-flex items-center justify-center rounded-xl bg-slate-900 border border-slate-900 px-4.5 py-2 text-xs font-bold uppercase tracking-wider text-white transition-all duration-300 hover:bg-gold-500 hover:text-slate-950 hover:border-gold-400 hover:shadow-md cursor-pointer"
          >
            <span>Plan My Trip</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-6 space-y-4 animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                    isActive
                      ? "bg-slate-900 text-gold-400 font-bold"
                      : "text-slate-700 hover:bg-slate-100 hover:text-amber-700"
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
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 border border-slate-900 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-gold-500 hover:text-slate-950 hover:border-gold-400 transition-all shadow-sm"
            >
              <span>Plan My Trip</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
