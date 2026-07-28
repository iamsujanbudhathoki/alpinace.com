"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Send, ShieldCheck, Award } from "lucide-react";
import { contact } from "@/lib/site-config";

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
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-8 border-t border-slate-900 font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/logo.jpg"
                alt="AlpineAce Logo"
                className="h-10 w-10 object-cover rounded-xl border border-slate-800 shadow-xs"
              />
              <span className="flex flex-col leading-none">
                <span className="font-heading text-base font-extrabold tracking-wide text-white">
                  ALPINE ACE
                </span>
                <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mt-0.5">
                  TREK &amp; EXPED
                </span>
              </span>
            </Link>

            <p className="text-slate-400 text-xs leading-relaxed font-normal">
              Crafting bespoke luxury treks, cultural tours, and high-altitude mountaineering expeditions in Nepal. Built on local Sherpa expertise, supreme safety standards, and environmental stewardship.
            </p>

            {/* Certifications and Badges */}
            <div className="pt-2 space-y-2">
              <span className="text-[10px] uppercase text-gold-400 font-bold tracking-wider block">
                Authorized Operator
              </span>
              <div className="flex flex-wrap gap-2">
                <div
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 flex items-center gap-1.5"
                  title="Trekking Agencies Association of Nepal"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-gold-400" />
                  <span className="font-mono text-[9px] uppercase tracking-wider text-slate-200">
                    TAAN Member
                  </span>
                </div>
                <div
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 flex items-center gap-1.5"
                  title="Nepal Mountaineering Association"
                >
                  <Award className="h-3.5 w-3.5 text-gold-400" />
                  <span className="font-mono text-[9px] uppercase tracking-wider text-slate-200">
                    NMA Certified
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-4">
            <h3 className="font-heading text-xs font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-2">
              Explore Journeys
            </h3>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link href="/trekking" className="hover:text-gold-400 transition-colors">
                  Himalayan Trekking
                </Link>
              </li>
              <li>
                <Link href="/tours" className="hover:text-gold-400 transition-colors">
                  Cultural &amp; Luxury Tours
                </Link>
              </li>
              <li>
                <Link href="/expeditions" className="hover:text-gold-400 transition-colors">
                  Peak Climbing &amp; Expeditions
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gold-400 transition-colors">
                  Our Mission &amp; Team
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-gold-400 transition-colors">
                  Mountain Journals &amp; Tips
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold-400 transition-colors">
                  Contact &amp; Custom Trips
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Details */}
          <div className="space-y-4">
            <h3 className="font-heading text-xs font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-2">
              Headquarters
            </h3>
            <ul className="space-y-3.5 text-xs text-slate-400 font-medium">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gold-400 shrink-0 mt-0.5" />
                <span>
                  Tridevi Marg, Thamel,<br />
                  Kathmandu, Nepal 44600
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gold-400 shrink-0" />
                <span className="font-mono text-[11px] text-slate-300">
                  +977 1 4410988 / +977 98511 23456
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gold-400 shrink-0" />
                <span className="font-mono text-[11px] text-slate-300">
                  concierge@alpineacetreks.com
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-4">
            <h3 className="font-heading text-xs font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-2">
              The Dispatch
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed font-normal">
              Subscribe to receive high-altitude weather updates, expert gear lists, and exclusive early-booking benefits directly in your inbox.
            </p>

            {subscribed ? (
              <div className="bg-slate-900 border border-gold-500/30 text-gold-300 p-3 rounded-xl text-xs leading-relaxed font-semibold animate-in fade-in">
                Thank you! You are now subscribed to our luxury travel journals dispatch.
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
                    className="w-full bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs rounded-xl pl-3 pr-10 py-3 focus:outline-none focus:border-gold-500 transition-colors"
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
        <div className="border-t border-slate-900 pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div>
            &copy; 2026 Alpine Ace Trek &amp; Exped Pvt. Ltd. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link href="/contact" className="hover:text-gold-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-gold-400 transition-colors">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
