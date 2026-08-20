"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  MessageSquare,
  Minus,
  Plus,
  ArrowRight,
} from "lucide-react";
import { PackageInquiryModal } from "./package-inquiry-modal";

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
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  const perPersonCalculated = Math.round(totalPrice / Math.max(1, travelers));



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
              onClick={() => setIsInquiryModalOpen(true)}
              className="w-full bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 font-semibold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-stone-700" strokeWidth={1.75} />
              <span>Ask a Question / Custom Dates</span>
            </button>
          </div>

          {/* Sleek Trust Guarantee Card */}
          <div className="pt-3 border-t border-stone-200">
            {trustBadges && trustBadges.length > 0 ? (
              <div className="space-y-2 text-xs text-stone-600">
                {trustBadges.map((badge, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {badge.icon}
                    <span className="leading-snug font-medium">{badge.text}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" strokeWidth={2} />
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-900 block leading-tight">
                    Verified Local Operator
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium leading-tight">
                    Direct local pricing & 24/7 specialist support
                  </span>
                </div>
              </div>
            )}
          </div>
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
