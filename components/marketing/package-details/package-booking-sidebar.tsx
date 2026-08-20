"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Award,
  Clock,
  MessageSquare,
  Send,
  Check,
  Minus,
  Plus,
  ArrowRight,
} from "lucide-react";
import { InquiryService } from "@/lib/services/admin-service";

export interface BookingAddonItem {
  id: string;
  label: string;
  description: string;
  pricePerPerson: number;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export interface PackageBookingSidebarProps {
  tripTitle: string;
  durationDays: number;
  travelers: number;
  onTravelersChange: (count: number) => void;
  addons?: BookingAddonItem[];
  totalPrice: number;
  onBookClick: () => void;
  priceLabel?: string;
  bookButtonLabel?: string;
  trustBadges?: { icon?: React.ReactNode; text: string }[];
  packageType?: "Trekking" | "Tour" | "Expedition";
}

export function PackageBookingSidebar({
  tripTitle,
  durationDays,
  travelers,
  onTravelersChange,
  addons = [],
  totalPrice,
  onBookClick,
  bookButtonLabel = "Book This Expedition",
  trustBadges,
  packageType,
}: PackageBookingSidebarProps) {
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryCountry, setInquiryCountry] = useState("");
  const [inquiryTravelDates, setInquiryTravelDates] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquiryLoading, setInquiryLoading] = useState(false);

  const perPersonCalculated = Math.round(totalPrice / Math.max(1, travelers));

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryEmail.trim()) return;

    setInquiryLoading(true);
    try {
      const activeAddons = addons.filter((a) => a.checked).map((a) => a.label);
      const addonsSummary = activeAddons.length > 0 ? activeAddons.join(", ") : "None";

      const formattedMessage = [
        inquiryMessage.trim(),
        "",
        "--- Trip Inquiry Context ---",
        `Trip Title: ${tripTitle}`,
        `Package Domain: ${packageType || "Adventure Package"}`,
        `Duration: ${durationDays} Days`,
        `Travelers Count: ${travelers}`,
        `Selected Upgrades: ${addonsSummary}`,
        `Estimated Rate: $${totalPrice.toLocaleString()} USD`,
      ]
        .filter((line) => line !== undefined)
        .join("\n")
        .trim();

      const notesSummary = `[Type: ${packageType || "Adventure"}] | [Duration: ${durationDays}D] | [Upgrades: ${addonsSummary}] | [Est Total: $${totalPrice.toLocaleString()} USD]`;

      await InquiryService.create({
        guestName: inquiryName.trim(),
        email: inquiryEmail.trim(),
        phone: inquiryPhone.trim() || "+1 000-000-0000",
        country: inquiryCountry.trim() || "International",
        interestedTrip: tripTitle,
        travelDates: inquiryTravelDates.trim() || "Upcoming Season",
        groupSize: travelers,
        message: formattedMessage,
        notes: notesSummary,
      });

      setInquirySubmitted(true);
      setTimeout(() => {
        setInquirySubmitted(false);
        setInquiryName("");
        setInquiryEmail("");
        setInquiryPhone("");
        setInquiryCountry("");
        setInquiryTravelDates("");
        setInquiryMessage("");
        setShowInquiryForm(false);
      }, 5000);
    } catch (err) {
      console.error("Inquiry submission error:", err);
    } finally {
      setInquiryLoading(false);
    }
  };

  const defaultTrustBadges = [
    {
      icon: <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0" strokeWidth={1.75} />,
      text: "100% Guaranteed Departures",
    },
    {
      icon: <Award className="w-4 h-4 text-emerald-800 shrink-0" strokeWidth={1.75} />,
      text: "Licensed High-Altitude Guides",
    },
    {
      icon: <Clock className="w-4 h-4 text-emerald-800 shrink-0" strokeWidth={1.75} />,
      text: "Flexible Date Rescheduling",
    },
  ];

  const activeTrustBadges = trustBadges || defaultTrustBadges;

  return (
    <aside className="w-full">
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Pricing Header */}
        <div className="bg-stone-900 text-white p-4.5 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="type-caption text-amber-400">
              Trip Rate
            </span>
            <span className="type-caption text-stone-300">
              {durationDays} Days Total
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-xl sm:text-2xl font-bold font-heading tracking-tight text-white">
              ${perPersonCalculated.toLocaleString()}
            </span>
            <span className="type-caption text-stone-300">
              USD / person
            </span>
          </div>
          <p className="type-body-sm text-stone-400 mt-0.5">
            Includes all guided logistics, permits, and accommodations
          </p>
        </div>

        {/* Booking Console Body */}
        <div className="p-4.5 sm:p-5 space-y-4">
          {/* Travelers Stepper */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="type-caption text-stone-900 font-bold">
                Travelers
              </label>
            </div>

            <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 p-1.5 rounded-xl">
              <button
                type="button"
                disabled={travelers <= 1}
                onClick={() => onTravelersChange(Math.max(1, travelers - 1))}
                aria-label="Decrease traveler count"
                className="w-8 h-8 rounded-lg bg-white border border-stone-200 text-stone-900 font-bold hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center transition-all shadow-2xs"
              >
                <Minus className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
              
              <div className="flex-1 text-center type-heading-md text-stone-900">
                {travelers} {travelers === 1 ? "Traveler" : "Travelers"}
              </div>

              <button
                type="button"
                disabled={travelers >= 16}
                onClick={() => onTravelersChange(Math.min(16, travelers + 1))}
                aria-label="Increase traveler count"
                className="w-8 h-8 rounded-lg bg-white border border-stone-200 text-stone-900 font-bold hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center transition-all shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Add-ons */}
          {addons.length > 0 && (
            <div className="space-y-1.5">
              <span className="type-caption text-stone-900 font-bold block">
                Upgrades
              </span>
              <div className="space-y-1.5">
                {addons.map((addon) => (
                  <label
                    key={addon.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 cursor-pointer transition-all ${
                      addon.checked
                        ? "bg-stone-50 border-stone-400"
                        : "bg-white border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <span className="type-heading-md text-stone-900 block">
                        {addon.label}
                      </span>
                      <span className="type-body-sm text-stone-500 block truncate">
                        {addon.description} (+${addon.pricePerPerson}/person)
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={addon.checked}
                      onChange={(e) => addon.onChange(e.target.checked)}
                      className="w-3.5 h-3.5 accent-stone-900 rounded cursor-pointer shrink-0"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Calculation Breakdown */}
          <div className="pt-3 border-t border-stone-200 space-y-1.5">
            <div className="flex items-center justify-between type-body-sm text-stone-500">
              <span>Base Rate ({travelers} × ${perPersonCalculated.toLocaleString()})</span>
              <span className="font-semibold text-stone-900">${totalPrice.toLocaleString()} USD</span>
            </div>
            
            <div className="flex items-baseline justify-between pt-2 border-t border-stone-200">
              <div>
                <span className="type-caption text-stone-900 font-bold block">
                  Total Investment
                </span>
                <span className="type-body-sm text-stone-400">
                  Guaranteed rate
                </span>
              </div>
              <div className="text-right">
                <span className="type-heading-xl text-stone-900">
                  ${totalPrice.toLocaleString()}{" "}
                  <span className="text-xs font-normal text-stone-500">USD</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-0.5">
            <button
              type="button"
              onClick={onBookClick}
              className="w-full bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>{bookButtonLabel}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
            </button>

            <button
              type="button"
              onClick={() => setShowInquiryForm(!showInquiryForm)}
              className="w-full bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 font-semibold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-stone-700" strokeWidth={1.75} />
              <span>
                {showInquiryForm
                  ? "Hide Custom Inquiry Form"
                  : "Ask a Question / Custom Dates"}
              </span>
            </button>
          </div>

          {/* Inquiry Form */}
          {showInquiryForm && (
            <form
              onSubmit={handleInquirySubmit}
              className="pt-4 border-t border-stone-200 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900">
                  Direct Specialist Inquiry
                </span>
                <span className="text-xs text-stone-500">Replies in &lt; 12 hrs</span>
              </div>

              {inquirySubmitted ? (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-medium text-center flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>Inquiry received! Our team will contact you shortly.</span>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name *"
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 bg-white transition-all font-medium"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Address *"
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 bg-white transition-all font-medium"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone / WhatsApp (with country code) *"
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 bg-white transition-all font-medium"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Country"
                      value={inquiryCountry}
                      onChange={(e) => setInquiryCountry(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 bg-white transition-all font-medium"
                    />
                    <input
                      type="text"
                      placeholder="Preferred Dates"
                      value={inquiryTravelDates}
                      onChange={(e) => setInquiryTravelDates(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 bg-white transition-all font-medium"
                    />
                  </div>
                  <textarea
                    placeholder="Questions, custom requests, or itinerary preferences..."
                    rows={3}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 bg-white resize-none transition-all font-medium"
                  />
                  <button
                    type="submit"
                    disabled={inquiryLoading}
                    className="w-full btn-primary py-2.5"
                  >
                    <Send className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>{inquiryLoading ? "Sending..." : "Send Inquiry"}</span>
                  </button>
                </>
              )}
            </form>
          )}

          {/* Trust Guarantees */}
          <div className="pt-4 border-t border-stone-200 space-y-2.5 text-xs text-stone-600">
            {activeTrustBadges.map((badge, i) => (
              <div key={i} className="flex items-center gap-2.5">
                {badge.icon}
                <span className="leading-snug">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
