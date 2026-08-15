"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Award,
  Clock,
  PhoneCall,
  Send,
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
}: PackageBookingSidebarProps) {
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquiryLoading, setInquiryLoading] = useState(false);

  const perPersonCalculated = Math.round(totalPrice / Math.max(1, travelers));

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryEmail.trim()) return;

    setInquiryLoading(true);
    try {
      await InquiryService.create({
        guestName: inquiryName.trim(),
        email: inquiryEmail.trim(),
        phone: "+1 000-000-0000",
        country: "International",
        interestedTrip: tripTitle,
        travelDates: "Upcoming Season",
        groupSize: travelers,
        message: `${inquiryMessage || "Direct custom inquiry"} for ${tripTitle} (${travelers} travelers, Est: $${totalPrice.toLocaleString()} USD).`,
      });
      setInquirySubmitted(true);
      setTimeout(() => {
        setInquirySubmitted(false);
        setInquiryName("");
        setInquiryEmail("");
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
      icon: <ShieldCheck className="w-4 h-4 text-[#2D4536] shrink-0" />,
      text: "100% Guaranteed Departures",
    },
    {
      icon: <Award className="w-4 h-4 text-[#2D4536] shrink-0" />,
      text: "IFMGA / Expert Certified Mountain Leaders",
    },
    {
      icon: <Clock className="w-4 h-4 text-[#2D4536] shrink-0" />,
      text: "Flexible Rescheduling & Free Date Changes",
    },
  ];

  const activeTrustBadges = trustBadges || defaultTrustBadges;

  return (
    <aside className="space-y-6">
      <div className="bg-white border border-[#E0DBD0] rounded-xl shadow-xs overflow-hidden">
        {/* Header */}
        <div className="bg-[#18261F] text-white p-5">
          <span className="text-[11px] uppercase font-bold tracking-widest text-[#C28835] block">
            Trip Booking &amp; Estimate
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold font-heading">
              ${perPersonCalculated.toLocaleString()}{" "}
              <span className="text-xs font-normal text-white/70">
                / person
              </span>
            </span>
            <span className="text-xs text-white/70">
              {durationDays} Days Duration
            </span>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-5 space-y-5">
          {/* Travelers Counter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1E2420] uppercase tracking-wider block">
              Number of Travelers
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={travelers <= 1}
                onClick={() => onTravelersChange(Math.max(1, travelers - 1))}
                className="w-10 h-10 rounded-lg bg-[#FAF8F5] border border-[#E0DBD0] text-[#1E2420] font-bold hover:bg-[#EFEBE3] disabled:opacity-30 cursor-pointer flex items-center justify-center text-base"
              >
                -
              </button>
              <div className="flex-1 text-center font-bold text-[#1E2420] bg-[#FAF8F5] border border-[#E0DBD0] py-2 rounded-lg text-sm">
                {travelers} {travelers === 1 ? "Traveler" : "Travelers"}
              </div>
              <button
                type="button"
                disabled={travelers >= 16}
                onClick={() => onTravelersChange(Math.min(16, travelers + 1))}
                className="w-10 h-10 rounded-lg bg-[#FAF8F5] border border-[#E0DBD0] text-[#1E2420] font-bold hover:bg-[#EFEBE3] disabled:opacity-30 cursor-pointer flex items-center justify-center text-base"
              >
                +
              </button>
            </div>
            {travelers >= 4 && (
              <p className="text-[11px] text-[#2D4536] font-medium">
                ✓ Group discount applied ({travelers >= 8 ? "10%" : "5%"} off)
              </p>
            )}
          </div>

          {/* Add-ons */}
          {addons.length > 0 && (
            <div className="space-y-2.5">
              {addons.map((addon) => (
                <div
                  key={addon.id}
                  className="p-3.5 bg-[#FAF8F5] border border-[#EAE5DC] rounded-lg flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-xs font-bold text-[#1E2420] block">
                      {addon.label}
                    </span>
                    <span className="text-[11px] text-[#6B726C] block">
                      {addon.description} (+${addon.pricePerPerson}/person)
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={addon.checked}
                    onChange={(e) => addon.onChange(e.target.checked)}
                    className="w-4 h-4 accent-[#2D4536] rounded cursor-pointer"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Total Calculation */}
          <div className="pt-3 border-t border-[#EAE5DC] flex items-baseline justify-between">
            <div>
              <span className="text-xs font-bold text-[#6B726C] uppercase tracking-wider block">
                Total Estimate
              </span>
              <span className="text-[11px] text-[#6B726C]">
                All permits, guides &amp; accommodations
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold font-heading text-[#1E2420]">
                ${totalPrice.toLocaleString()}{" "}
                <span className="text-xs font-normal text-[#6B726C]">USD</span>
              </span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={onBookClick}
              className="w-full bg-[#C28835] hover:bg-[#AD772B] text-white font-semibold text-sm py-3.5 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {bookButtonLabel}
            </button>

            <button
              type="button"
              onClick={() => setShowInquiryForm(!showInquiryForm)}
              className="w-full bg-white hover:bg-[#FAF8F5] text-[#1E2420] border border-[#D9D3C7] font-semibold text-xs py-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#2D4536]" />
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
              className="pt-3 border-t border-[#EAE5DC] space-y-3"
            >
              {inquirySubmitted ? (
                <div className="p-3 bg-[#E5EFE8] text-[#2D4536] rounded-lg text-xs font-medium text-center">
                  Thank you! Your inquiry has been sent to our expedition team.
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-md border border-[#D9D3C7] focus:outline-none focus:border-[#2D4536] bg-white"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Your Email Address"
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-md border border-[#D9D3C7] focus:outline-none focus:border-[#2D4536] bg-white"
                  />
                  <textarea
                    placeholder="Any questions, preferred travel dates, or special requests..."
                    rows={2}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-md border border-[#D9D3C7] focus:outline-none focus:border-[#2D4536] bg-white"
                  />
                  <button
                    type="submit"
                    disabled={inquiryLoading}
                    className="w-full bg-[#18261F] hover:bg-[#2D4536] text-white text-xs font-semibold py-2.5 rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>{inquiryLoading ? "Sending..." : "Submit Inquiry"}</span>
                  </button>
                </>
              )}
            </form>
          )}

          {/* Trust points */}
          <div className="pt-4 border-t border-[#EAE5DC] space-y-2 text-xs text-[#6B726C]">
            {activeTrustBadges.map((badge, i) => (
              <div key={i} className="flex items-center gap-2">
                {badge.icon}
                <span>{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
