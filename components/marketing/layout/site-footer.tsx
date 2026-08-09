"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck, Award } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-white text-zinc-900 pt-12 md:pt-16 pb-8 border-t border-stone-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 mb-12">
          {/* Column 1: Brand Info */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <img
                src="/logo.jpg"
                alt="AlpineAce Logo"
                className="h-10 w-10 object-cover rounded-xl border border-stone-200"
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

            <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed font-normal max-w-md">
              We organize guided treks, cultural tours, and mountain expeditions in Nepal, led by experienced local Sherpa guides with a strong focus on safety and the environment.
            </p>

            {/* Certifications and Badges */}
            <div className="pt-2 space-y-2">
              <span className="text-xs text-amber-700 font-medium block">
                Authorized Operator
              </span>
              <div className="flex flex-wrap gap-2">
                <div
                  className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 flex items-center gap-1.5"
                  title="Trekking Agencies Association of Nepal"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span className="text-xs text-zinc-800 font-medium">
                    TAAN Member
                  </span>
                </div>
                <div
                  className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 flex items-center gap-1.5"
                  title="Nepal Mountaineering Association"
                >
                  <Award className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span className="text-xs text-zinc-800 font-medium">
                    NMA Certified
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-4">
            <h3 className="font-heading text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
              Quick Links
            </h3>
            <ul className="grid grid-cols-2 sm:grid-cols-1 gap-2.5 text-xs sm:text-sm font-semibold text-slate-700">
              <li>
                <Link href="/trekking" className="hover:text-gold-600 transition-colors inline-block py-1">
                  Trekking in Nepal
                </Link>
              </li>
              <li>
                <Link href="/tours" className="hover:text-gold-600 transition-colors inline-block py-1">
                  Nepal Tours
                </Link>
              </li>
              <li>
                <Link href="/expeditions" className="hover:text-gold-600 transition-colors inline-block py-1">
                  Peak Expeditions
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gold-600 transition-colors inline-block py-1">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-gold-600 transition-colors inline-block py-1">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold-600 transition-colors inline-block py-1">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Details */}
          <div className="space-y-4">
            <h3 className="font-heading text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
              Contact Info
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-700 font-medium">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gold-600 shrink-0 mt-0.5" />
                <span>
                  Tridevi Marg, Thamel,<br />
                  Kathmandu, Nepal 44600
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gold-600 shrink-0" />
                <div className="flex flex-col text-xs text-slate-900 font-bold gap-0.5">
                  <a href="tel:+97714410988" className="hover:text-gold-600 transition-colors">
                    +977 1 4410988
                  </a>
                  <a href="tel:+9779851123456" className="hover:text-gold-600 transition-colors">
                    +977 98511 23456
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gold-600 shrink-0" />
                <a
                  href="mailto:concierge@alpineacetreks.com"
                  className="text-xs text-slate-900 font-bold hover:text-gold-600 transition-colors break-all"
                >
                  concierge@alpineacetreks.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider & Bottom Bar */}
        <div className="border-t border-slate-100 pt-6 sm:pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 font-semibold text-center sm:text-left">
          <div>
            &copy; {new Date().getFullYear()} Alpine Ace Trek &amp; Exped Pvt. Ltd. All rights reserved.
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/privacy" className="hover:text-amber-700 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-amber-700 transition-colors">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

