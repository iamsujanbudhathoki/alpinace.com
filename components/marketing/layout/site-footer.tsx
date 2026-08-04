"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Send, ShieldCheck, Award } from "lucide-react";

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-white text-slate-900 pt-16 pb-8 border-t border-slate-200 font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/logo.jpg"
                alt="AlpineAce Logo"
                className="h-10 w-10 object-cover rounded-xl border border-slate-200 shadow-xs"
              />
              <span className="flex flex-col leading-none">
                <span className="font-heading text-base font-extrabold tracking-wide text-slate-900">
                  ALPINE ACE
                </span>
                <span className="text-xs font-bold tracking-[0.2em] text-slate-700 uppercase mt-0.5">
                  Nepal Trekking &amp; Expeditions
                </span>
              </span>
            </Link>

            <p className="text-slate-700 text-xs leading-relaxed font-normal">
              We organize guided treks, cultural tours, and mountain expeditions in Nepal, led by experienced local Sherpa guides with a strong focus on safety and the environment.
            </p>

            {/* Certifications and Badges */}
            <div className="pt-2 space-y-2">
              <span className="text-xs uppercase text-gold-600 font-bold tracking-wider block">
                Authorized Operator
              </span>
              <div className="flex flex-wrap gap-2">
                <div
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 flex items-center gap-1.5"
                  title="Trekking Agencies Association of Nepal"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-gold-600" />
                  <span className="font-mono text-xs uppercase tracking-wider text-slate-800 font-bold">
                    TAAN Member
                  </span>
                </div>
                <div
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 flex items-center gap-1.5"
                  title="Nepal Mountaineering Association"
                >
                  <Award className="h-3.5 w-3.5 text-gold-600" />
                  <span className="font-mono text-xs uppercase tracking-wider text-slate-800 font-bold">
                    NMA Certified
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-4">
            <h3 className="font-heading text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-700">
              <li>
                <Link href="/trekking" className="hover:text-gold-600 transition-colors">
                  Trekking in Nepal
                </Link>
              </li>
              <li>
                <Link href="/tours" className="hover:text-gold-600 transition-colors">
                  Nepal Tours
                </Link>
              </li>
              <li>
                <Link href="/expeditions" className="hover:text-gold-600 transition-colors">
                  Peak Expeditions
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gold-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-gold-600 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold-600 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Details */}
          <div className="space-y-4">
            <h3 className="font-heading text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Contact Info
            </h3>
            <ul className="space-y-3.5 text-xs text-slate-700 font-medium">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gold-600 shrink-0 mt-0.5" />
                <span>
                  Tridevi Marg, Thamel,<br />
                  Kathmandu, Nepal 44600
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gold-600 shrink-0" />
                <span className="font-mono text-xs text-slate-900 font-bold">
                  +977 1 4410988 / +977 98511 23456
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gold-600 shrink-0" />
                <span className="font-mono text-xs text-slate-900 font-bold">
                  concierge@alpineacetreks.com
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-4">
            <h3 className="font-heading text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Newsletter
            </h3>
            <p className="text-slate-700 text-xs leading-relaxed font-normal">
              Get travel tips, weather updates, and special offers for your next trip to Nepal.
            </p>

            {subscribed ? (
              <div className="bg-slate-50 border border-gold-500/40 text-slate-900 p-3 rounded-xl text-xs leading-relaxed font-semibold animate-in fade-in">
                Thank you for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs rounded-xl pl-3 pr-10 py-3 focus:outline-none focus:border-gold-600 transition-colors"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 bg-gold-500 hover:bg-gold-400 text-slate-950 p-2 rounded-lg transition-colors cursor-pointer"
                    aria-label="Subscribe to newsletter"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Divider & Bottom Bar */}
        <div className="border-t border-slate-100 pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-700 font-semibold">
          <div>
            &copy; 2026 Alpine Ace Trek &amp; Exped Pvt. Ltd. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link href="/contact" className="hover:text-gold-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-gold-600 transition-colors">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
