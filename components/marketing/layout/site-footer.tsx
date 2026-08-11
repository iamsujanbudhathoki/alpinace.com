"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck, Award } from "lucide-react";
import { useSettings } from "@/lib/settings-context";

export function SiteFooter() {
  const { settings } = useSettings();

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
                  {settings.siteName}
                </span>
                <span className="text-[10px] font-medium text-zinc-500 mt-0.5">
                  {settings.tagline}
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

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2 text-slate-600">
              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-amber-100 hover:text-amber-700 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              )}
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-amber-100 hover:text-amber-700 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              )}
              {settings.youtubeUrl && (
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-amber-100 hover:text-amber-700 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              )}
              {settings.linkedinUrl && (
                <a
                  href={settings.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-amber-100 hover:text-amber-700 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-4">
            <h3 className="font-heading text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
              Quick Links
            </h3>
            <ul className="grid grid-cols-2 sm:grid-cols-1 gap-2.5 text-xs sm:text-sm font-semibold text-slate-700">
              <li>
                <Link href="/trekking" className="hover:text-amber-700 transition-colors inline-block py-1">
                  Trekking in Nepal
                </Link>
              </li>
              <li>
                <Link href="/tours" className="hover:text-amber-700 transition-colors inline-block py-1">
                  Nepal Tours
                </Link>
              </li>
              <li>
                <Link href="/expeditions" className="hover:text-amber-700 transition-colors inline-block py-1">
                  Peak Expeditions
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-700 transition-colors inline-block py-1">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-amber-700 transition-colors inline-block py-1">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-700 transition-colors inline-block py-1">
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
                <MapPin className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  {settings.companyAddress}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-amber-600 shrink-0" />
                <div className="flex flex-col text-xs text-slate-900 font-bold gap-0.5">
                  {settings.contactPhone && (
                    <a href={`tel:${settings.contactPhone.replace(/\s+/g, "")}`} className="hover:text-amber-700 transition-colors">
                      {settings.contactPhone}
                    </a>
                  )}
                  {settings.emergencyPhone && (
                    <a href={`tel:${settings.emergencyPhone.replace(/\s+/g, "")}`} className="hover:text-amber-700 transition-colors text-slate-600">
                      Emergency: {settings.emergencyPhone}
                    </a>
                  )}
                </div>
              </li>
              {settings.contactEmail && (
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-amber-600 shrink-0" />
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="text-xs text-slate-900 font-bold hover:text-amber-700 transition-colors break-all"
                  >
                    {settings.contactEmail}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Divider & Bottom Bar */}
        <div className="border-t border-slate-100 pt-6 sm:pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 font-semibold text-center sm:text-left">
          <div>
            &copy; {new Date().getFullYear()} {settings.siteName}. All rights reserved.
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
