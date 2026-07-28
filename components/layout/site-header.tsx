"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, MessageCircle, MountainSnow } from "lucide-react";
import { contact, navLinks } from "@/lib/site-config";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-gradient-to-b from-charcoal-950/85 via-charcoal-950/40 to-transparent">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5 md:px-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-offwhite-50 text-charcoal-950">
            <MountainSnow className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-heading text-base font-bold tracking-wide text-offwhite-50">
              ALPINE ACE
            </span>
            <span className="text-[10px] font-medium tracking-[0.2em] text-offwhite-300/70">
              TREKS &amp; EXPED
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`pb-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
                  isActive
                    ? "border-b-2 border-gold-400 text-gold-400"
                    : "border-b-2 border-transparent text-offwhite-100/80 hover:text-gold-300"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-6 md:flex">
         
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-charcoal-950 transition-colors hover:bg-gold-400"
          >
            <Compass className="h-3.5 w-3.5" />
            Plan My Trip
          </Link>
        </div>
      </div>
    </header>
  );
}
