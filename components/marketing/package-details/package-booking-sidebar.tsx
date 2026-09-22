"use client";

import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  MessageSquare,
  Minus,
  Plus,
  ArrowRight,
  Check,
  Heart,
  Calendar,
} from "lucide-react";
import { PackageInquiryModal } from "./package-inquiry-modal";
import { InquiryType } from "@/lib/admin-data";
import { GroupPricingTier, getLowestGroupPrice, getMaxGroupTravelers } from "@/lib/pricing-util";

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
  basePriceUSD?: number;
  groupPricingEnabled?: boolean;
  groupPricing?: GroupPricingTier[];
  departureDates?: any[];
  onCheckAvailability?: () => void;
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
  basePriceUSD,
  groupPricingEnabled = false,
  groupPricing = [],
  departureDates = [],
  onCheckAvailability,
}: PackageBookingSidebarProps) {
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [isGroupPricingOpen, setIsGroupPricingOpen] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  const perPersonCalculated = Math.round(totalPrice / Math.max(1, travelers));

  const sortedTiers = useMemo(() => {
    if (!groupPricing || !Array.isArray(groupPricing)) return [];
    return [...groupPricing].sort(
      (a, b) => Number(a.minTravelers) - Number(b.minTravelers)
    );
  }, [groupPricing]);

  const hasGroupPricing = Boolean(groupPricingEnabled && sortedTiers.length > 0);
  const lowestPrice = useMemo(() => {
    if (!hasGroupPricing) return perPersonCalculated;
    return getLowestGroupPrice(sortedTiers, basePriceUSD || perPersonCalculated);
  }, [hasGroupPricing, sortedTiers, basePriceUSD, perPersonCalculated]);

  const standardBasePrice = basePriceUSD || perPersonCalculated;
  const showDiscount = hasGroupPricing && standardBasePrice > lowestPrice;

  const handleInquirySuccess = () => {
    onInquirySuccess?.();
  };

  return (
    <aside className="w-full">
      <div className="bg-white border border-stone-200 rounded-sm shadow-md overflow-hidden">
        {/* Pricing Header */}
        {hasGroupPricing ? (
          <div className="bg-white border-b border-stone-200 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-stone-500">
                Price from:
              </span>
              <button
                type="button"
                onClick={() => setIsLiked(!isLiked)}
                aria-label="Save to favorites"
                className="text-sky-600 hover:text-sky-700 transition-colors p-1"
              >
                <Heart
                  className={`w-5 h-5 ${isLiked ? "fill-sky-600 text-sky-600" : "text-sky-600"}`}
                />
              </button>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-emerald-600">
                US${lowestPrice.toLocaleString()}
              </span>
              {showDiscount && (
                <span className="text-base sm:text-lg line-through text-stone-400 font-medium">
                  US${standardBasePrice.toLocaleString()}
                </span>
              )}
              <span className="text-xs font-bold text-stone-500">P/P</span>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-400/10 border-b border-yellow-400/20 p-4.5 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="type-caption text-stone-900 font-bold">
                Trip Rate
              </span>
              <span className="type-caption text-stone-600 font-medium">
                {durationDays} Days Total
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-xl sm:text-2xl font-bold font-heading text-stone-900">
                ${perPersonCalculated.toLocaleString()}
              </span>
              <span className="type-caption text-stone-600">
                USD / person
              </span>
            </div>
          </div>
        )}

        {/* Booking Console Body */}
        <div className="p-4.5 sm:p-5 space-y-4">
          {/* Collapsible Group Pricing Section */}
          {hasGroupPricing && (
            <div className="border border-stone-200 rounded-sm overflow-hidden bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => setIsGroupPricingOpen(!isGroupPricingOpen)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-left font-semibold text-stone-900 text-xs sm:text-sm hover:bg-stone-50 transition-colors cursor-pointer"
              >
                <span className="font-heading font-semibold text-stone-900 text-xs sm:text-sm">
                  We offer group price
                </span>
                <span className="text-stone-500 flex items-center justify-center">
                  {isGroupPricingOpen ? (
                    <Minus className="w-3.5 h-3.5" strokeWidth={2.5} />
                  ) : (
                    <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                  )}
                </span>
              </button>

              {isGroupPricingOpen && (
                <div className="border-t border-stone-200 divide-y divide-stone-100">
                  {sortedTiers.map((tier, idx) => {
                    const isApplicable =
                      travelers >= Number(tier.minTravelers) &&
                      travelers <= Number(tier.maxTravelers);
                    const paxText =
                      Number(tier.minTravelers) === Number(tier.maxTravelers)
                        ? `${tier.minTravelers} pax`
                        : `${tier.minTravelers} - ${tier.maxTravelers} pax`;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onTravelersChange(Number(tier.minTravelers))}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs transition-colors cursor-pointer text-left ${
                          isApplicable
                            ? "bg-stone-50 text-stone-900 font-semibold"
                            : "text-stone-700 hover:bg-stone-50/60"
                        }`}
                      >
                        <span className={isApplicable ? "text-stone-900 font-semibold" : "text-stone-700 font-normal"}>
                          {paxText}
                        </span>
                        <span className={isApplicable ? "text-stone-900 font-bold" : "text-stone-900 font-medium"}>
                          US${Number(tier.pricePerPerson).toLocaleString()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Travelers Stepper */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="type-caption text-stone-900 font-bold">
                No. of Traveler
              </label>
            </div>

            <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 p-1.5 rounded-sm">
              <button
                type="button"
                disabled={travelers <= 1}
                onClick={() => onTravelersChange(Math.max(1, travelers - 1))}
                aria-label="Decrease traveler count"
                className="w-10 h-10 rounded-sm bg-white border border-stone-200 text-stone-900 font-bold hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center transition-all shadow-sm"
              >
                <Minus className="w-4 h-4" strokeWidth={2} />
              </button>

              <div className="flex-1 text-center type-heading-md text-stone-900 font-bold text-sm sm:text-base">
                {travelers} {travelers === 1 ? "Traveler" : "Travelers"}
              </div>

              <button
                type="button"
                disabled={travelers >= (hasGroupPricing ? getMaxGroupTravelers({ groupPricingEnabled, groupPricing }, 20) : 20)}
                onClick={() =>
                  onTravelersChange(
                    Math.min(
                      hasGroupPricing
                        ? getMaxGroupTravelers({ groupPricingEnabled, groupPricing }, 20)
                        : 20,
                      travelers + 1,
                    )
                  )
                }
                aria-label="Increase traveler count"
                className="w-10 h-10 rounded-sm bg-white border border-stone-200 text-stone-900 font-bold hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            {hasGroupPricing &&
              travelers >=
                getMaxGroupTravelers({ groupPricingEnabled, groupPricing }, 20) && (
                <p className="text-[11px] text-stone-500 font-medium pt-0.5">
                  Planning for a group larger than{" "}
                  {getMaxGroupTravelers({ groupPricingEnabled, groupPricing }, 20)}?{" "}
                  <button
                    type="button"
                    onClick={() => setIsInquiryModalOpen(true)}
                    className="text-emerald-700 hover:text-emerald-800 underline font-semibold cursor-pointer"
                  >
                    Send an inquiry
                  </button>{" "}
                  for custom private group rates.
                </p>
              )}
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
              <span>Rate ({travelers} {travelers === 1 ? "traveler" : "travelers"} × US${perPersonCalculated.toLocaleString()} / person)</span>
              <span className="font-semibold text-stone-900">US${totalPrice.toLocaleString()}</span>
            </div>

            <div className="flex items-baseline justify-between pt-2 border-t border-stone-200">
              <div>
                <span className="type-caption text-stone-900 font-bold block">
                  Total Price
                </span>
                <span className="type-body-sm text-stone-400">
                  Guaranteed rate
                </span>
              </div>
              <div className="text-right">
                <span className="type-heading-xl text-stone-900 font-bold">
                  US${totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs & Post-Submission Confirmation States */}
          <div className="space-y-2.5 pt-1">
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
            ) : hasGroupPricing ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={onBookClick}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xs text-xs sm:text-sm uppercase tracking-wide cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>BOOK NOW</span>
                </button>

                <button
                  type="button"
                  onClick={onBookClick}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xs text-xs sm:text-sm uppercase tracking-wide cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>ADD TO CART</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onCheckAvailability) {
                      onCheckAvailability();
                    } else {
                      const depSection = document.getElementById("departures");
                      if (depSection) {
                        depSection.scrollIntoView({ behavior: "smooth" });
                      } else {
                        onBookClick();
                      }
                    }
                  }}
                  className="w-full bg-[#1976d2] hover:bg-[#1565c0] text-white font-bold py-2.5 px-4 rounded-xs text-xs sm:text-sm uppercase tracking-wide cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>CHECK AVAILABILITY</span>
                </button>

                {isInquired ? (
                  <div className="p-3 rounded-xs bg-yellow-50 border border-yellow-200 text-xs text-stone-800 font-medium text-center">
                    Inquiry submitted! We’ll contact you shortly.
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsInquiryModalOpen(true)}
                    className="w-full bg-[#1976d2] hover:bg-[#1565c0] text-white font-bold py-2.5 px-4 rounded-xs text-xs sm:text-sm uppercase tracking-wide cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <span>SEND INQUIRY</span>
                  </button>
                )}
              </div>
            ) : (
              /* Non-group pricing default CTAs */
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={onBookClick}
                  className="btn-accent w-full text-xs sm:text-sm flex items-center justify-center gap-2 group"
                >
                  <span>{bookButtonLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                </button>

                {isInquired ? (
                  <div className="p-4 rounded-md bg-yellow-50 border border-yellow-200 space-y-2.5 animate-in fade-in duration-200">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <Check className="w-4 h-4 text-yellow-400" strokeWidth={2.5} />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-stone-900 leading-snug">
                          Thank you for your inquiry!
                        </h4>
                        <p className="text-xs text-stone-700 leading-relaxed font-medium">
                          We’ll get back to you shortly.
                        </p>
                      </div>
                    </div>
                    {onResetInquired && (
                      <button
                        type="button"
                        onClick={onResetInquired}
                        className="text-[11px] font-semibold text-stone-900 hover:underline cursor-pointer pt-1 block"
                      >
                        Send another question or inquiry
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsInquiryModalOpen(true)}
                    className="w-full bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 font-semibold text-xs py-2.5 px-4 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-stone-700" strokeWidth={1.75} />
                    <span>Ask a Question / Custom Dates</span>
                  </button>
                )}
              </div>
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
            className="bg-stone-100 hover:bg-stone-200 text-stone-900 font-semibold text-xs py-2 px-3 rounded-md transition-colors border border-stone-200 cursor-pointer min-h-10 flex items-center gap-1"
          >
            <MessageSquare className="w-3.5 h-3.5 text-stone-700 shrink-0" />
            <span className="hidden sm:inline">Inquire</span>
          </button>
          <button
            type="button"
            onClick={onBookClick}
            className="btn-accent text-xs py-2 px-4 min-h-10 flex items-center gap-1.5"
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
