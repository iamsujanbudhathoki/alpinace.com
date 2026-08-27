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
}: PackageBookingSidebarProps) {
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  const perPersonCalculated = Math.round(totalPrice / Math.max(1, travelers));



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
          {/* Travelers Stepper & Presets */}
          <div className="space-y-3 bg-stone-50/80 border border-stone-200/90 rounded-2xl p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <label className="type-caption text-stone-900 font-bold block">
                  Travelers / Group Size
                </label>
                <span className="text-[11px] text-stone-500 font-medium">
                  Select party count
                </span>
              </div>
              <span className="text-[11px] font-bold text-amber-900 bg-amber-100/90 border border-amber-200/90 px-2.5 py-0.5 rounded-full shadow-2xs">
                {travelers === 1
                  ? "1 Solo Traveler"
                  : travelers === 2
                  ? "2 Duo / Couple"
                  : travelers <= 5
                  ? `${travelers} Small Group`
                  : `${travelers} Expedition Team`}
              </span>
            </div>

            {/* Stepper Bar */}
            <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl p-1.5 shadow-2xs">
              <button
                type="button"
                disabled={travelers <= 1}
                onClick={() => onTravelersChange(Math.max(1, travelers - 1))}
                aria-label="Decrease traveler count"
                className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-200/80 text-stone-900 font-bold hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center transition-all"
              >
                <Minus className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>

              <div className="flex-1 flex items-center justify-center gap-1.5 px-2">
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={travelers}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1) {
                      onTravelersChange(Math.min(99, val));
                    } else if (e.target.value === "") {
                      onTravelersChange(1);
                    }
                  }}
                  className="w-10 text-center type-heading-md text-stone-900 font-extrabold focus:outline-none focus:bg-amber-50/50 rounded py-0.5"
                />
                <span className="text-xs font-bold text-stone-600">
                  {travelers === 1 ? "Person" : "People"}
                </span>
              </div>

              <button
                type="button"
                disabled={travelers >= 99}
                onClick={() => onTravelersChange(Math.min(99, travelers + 1))}
                aria-label="Increase traveler count"
                className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-200/80 text-stone-900 font-bold hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center transition-all"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 pt-0.5">
              {[
                { count: 1, label: "1 Solo" },
                { count: 2, label: "2 Duo" },
                { count: 3, label: "3 Ppl" },
                { count: 4, label: "4 Ppl" },
                { count: 5, label: "5 Ppl" },
                { count: 6, label: "6 Ppl" },
                { count: 10, label: "10+ Team" },
              ].map((item) => (
                <button
                  key={item.count}
                  type="button"
                  onClick={() => onTravelersChange(item.count)}
                  className={`py-1.5 px-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer text-center ${
                    (item.count < 10 && travelers === item.count) || (item.count === 10 && travelers >= 10)
                      ? "bg-stone-900 text-white shadow-xs ring-1 ring-stone-900"
                      : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200/80"
                  }`}
                >
                  {item.label}
                </button>
              ))}
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
                    className={`p-2.5 rounded-sm border flex items-center justify-between gap-2.5 cursor-pointer transition-all ${addon.checked
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
            {isBooked ? (
              <div className="w-full bg-emerald-700 text-white font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-sm shadow-sm flex items-center justify-center gap-2">
                <Check className="w-4 h-4" strokeWidth={3} />
                <span>Request Submitted</span>
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

            <button
              type="button"
              onClick={() => setIsInquiryModalOpen(true)}
              className="w-full bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 font-semibold text-xs py-2.5 px-4 rounded-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5 text-stone-700" strokeWidth={1.75} />
              <span>Ask a Question / Custom Dates</span>
            </button>
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

      {/* Direct Specialist Inquiry Modal Dialog */}
      <PackageInquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
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
