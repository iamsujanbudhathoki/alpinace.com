"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  MessageSquare,
  Minus,
  Plus,
  ArrowRight,
  Check,
} from "lucide-react";
import { PackageInquiryModal } from "./package-inquiry-modal";
import { InquiryType } from "@/lib/admin-data";

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
  packageType?: InquiryType;
  isBooked?: boolean;
  isInquired?: boolean;
  onResetBooked?: () => void;
  onResetInquired?: () => void;
  onInquirySuccess?: () => void;
}

export function PackageBookingSidebar({
  tripTitle,
  durationDays,
  travelers,
  onTravelersChange,
  addons = [],
  totalPrice,
  onBookClick,
  priceLabel = "Starting from",
  bookButtonLabel = "Book Now",
  trustBadges,
  packageType = InquiryType.TREKKING,
  isBooked = false,
  isInquired = false,
  onResetBooked,
  onResetInquired,
  onInquirySuccess,
}: PackageBookingSidebarProps) {
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  const perPersonCalculated = Math.round(totalPrice / Math.max(1, travelers));

  const handleInquirySuccess = () => {
    onInquirySuccess?.();
  };

  return (
    <aside className="w-full">
      <div className="bg-white border border-stone-200 rounded-sm shadow-md overflow-hidden">
        {/* Pricing Header */}
        <div className="bg-amber-50/90 border-b border-amber-200/80 p-4.5 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="type-caption text-amber-800 font-bold uppercase tracking-wider">
              Trip Rate
            </span>
            <span className="type-caption text-stone-600 font-medium">
              {durationDays} Days Total
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-xl sm:text-2xl font-bold font-heading tracking-tight text-stone-900">
              ${perPersonCalculated.toLocaleString()}
            </span>
            <span className="type-caption text-stone-600">
              USD / person
            </span>
          </div>
          <p className="type-body-sm text-stone-600 mt-0.5 font-medium">
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

            <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 p-1.5 rounded-sm">
              <button
                type="button"
                disabled={travelers <= 1}
                onClick={() => onTravelersChange(Math.max(1, travelers - 1))}
                aria-label="Decrease traveler count"
                className="w-8 h-8 rounded-sm bg-white border border-stone-200 text-stone-900 font-bold hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center transition-all shadow-sm"
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
                className="w-8 h-8 rounded-sm bg-white border border-stone-200 text-stone-900 font-bold hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center transition-all shadow-sm"
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
                    className={`p-2.5 rounded-sm border flex items-center justify-between gap-2.5 cursor-pointer transition-all ${
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

          {/* Action CTAs & Independent Post-Submission Confirmation States */}
          <div className="space-y-3 pt-1">
            {/* 1. BOOKING BUTTON OR BOOKING CONFIRMATION */}
            {isBooked ? (
              <div className="p-4 rounded-sm bg-emerald-50 border border-emerald-200/80 space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-emerald-950 leading-snug">
                      Thank you for your booking!
                    </h4>
                    <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                      We’ll be in touch shortly to confirm the details.
                    </p>
                  </div>
                </div>
                {onResetBooked && (
                  <button
                    type="button"
                    onClick={onResetBooked}
                    className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 underline cursor-pointer pt-1 block"
                  >
                    Start a new booking request
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onBookClick}
                className="w-full bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>{bookButtonLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
              </button>
            )}

            {/* 2. INQUIRY BUTTON OR INQUIRY CONFIRMATION */}
            {isInquired ? (
              <div className="p-4 rounded-sm bg-amber-50 border border-amber-200/80 space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-amber-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-amber-950 leading-snug">
                      Thank you for your inquiry!
                    </h4>
                    <p className="text-xs text-amber-900 leading-relaxed font-medium">
                      We’ll get back to you shortly.
                    </p>
                  </div>
                </div>
                {onResetInquired && (
                  <button
                    type="button"
                    onClick={onResetInquired}
                    className="text-[11px] font-semibold text-amber-900 hover:text-amber-950 underline cursor-pointer pt-1 block"
                  >
                    Send another question or inquiry
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsInquiryModalOpen(true)}
                className="w-full bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 font-semibold text-xs py-2.5 px-4 rounded-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5 text-stone-700" strokeWidth={1.75} />
                <span>Ask a Question / Custom Dates</span>
              </button>
            )}
          </div>

          {/* Optional Custom Trust Badges */}
          {trustBadges && trustBadges.length > 0 && (
            <div className="pt-3 border-t border-stone-200 space-y-2 text-xs text-stone-600">
              {trustBadges.map((badge, i) => (
                <div key={i} className="flex items-center gap-2">
                  {badge.icon}
                  <span className="leading-snug font-medium">{badge.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Fixed Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 py-2.5 shadow-lg flex items-center justify-between gap-3">
        <div className="flex flex-col justify-center min-w-0">
          <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider truncate">
            {durationDays} Days · Rate
          </span>
          <div className="flex items-baseline gap-1 truncate">
            <span className="text-base sm:text-lg font-bold font-heading text-stone-900">
              ${perPersonCalculated.toLocaleString()}
            </span>
            <span className="text-[11px] text-stone-500 font-medium truncate">
              USD / person
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsInquiryModalOpen(true)}
            aria-label="Ask a question"
            className="bg-stone-100 hover:bg-stone-200 text-stone-900 font-semibold text-xs py-2 px-3 rounded-md transition-colors border border-stone-200 cursor-pointer min-h-[42px] flex items-center gap-1"
          >
            <MessageSquare className="w-4 h-4 text-stone-700 shrink-0" />
            <span className="hidden sm:inline">Inquire</span>
          </button>
          <button
            type="button"
            onClick={onBookClick}
            className="bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white font-bold text-xs py-2 px-4 rounded-md shadow-xs transition-all cursor-pointer min-h-[42px] flex items-center gap-1.5"
          >
            <span>{bookButtonLabel}</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      </div>

      {/* Direct Specialist Inquiry Modal Dialog */}
      <PackageInquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        onSuccess={handleInquirySuccess}
        tripTitle={tripTitle}
        durationDays={durationDays}
        travelers={travelers}
        totalPrice={totalPrice}
        packageType={packageType}
        addons={addons}
      />
    </aside>
  );
}
