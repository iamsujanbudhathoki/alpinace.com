"use client";

import React, { useState } from "react";
import { MessageSquare, Send, Check, Loader2, Calendar, Users, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InquiryService } from "@/lib/services/admin-service";
import { COUNTRY_OPTIONS } from "@/lib/country-list";
import { BookingAddonItem } from "./package-booking-sidebar";

export interface PackageInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripTitle: string;
  durationDays: number;
  travelers: number;
  totalPrice: number;
  packageType?: "Trekking" | "Tour" | "Expedition";
  addons?: BookingAddonItem[];
}

export function PackageInquiryModal({
  isOpen,
  onClose,
  tripTitle,
  durationDays,
  travelers,
  totalPrice,
  packageType = "Trekking",
  addons = [],
}: PackageInquiryModalProps) {
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryCountry, setInquiryCountry] = useState("");
  const [inquiryTravelSeason, setInquiryTravelSeason] = useState("");
  const [inquiryTravelers, setInquiryTravelers] = useState(String(travelers || 2));
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; phone?: string; message?: string }>({});

  const validateForm = () => {
    const errors: { name?: string; email?: string; phone?: string; message?: string } = {};
    if (!inquiryName.trim()) {
      errors.name = "Full name is required";
    }
    if (!inquiryEmail.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiryEmail.trim())) {
      errors.email = "Please enter a valid email address";
    }
    if (!inquiryPhone.trim()) {
      errors.phone = "Phone or WhatsApp number is required";
    }
    if (!inquiryMessage.trim()) {
      errors.message = "Question or query message is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const activeAddons = addons.filter((a) => a.checked).map((a) => a.label);
      const addonsSummary = activeAddons.length > 0 ? activeAddons.join(", ") : "None";
      const finalGroupSize = Number(inquiryTravelers) || travelers || 1;

      const formattedMessage = [
        inquiryMessage.trim(),
        "",
        "--- Trip Inquiry Details ---",
        `Trip Title: ${tripTitle}`,
        `Package Category: ${packageType}`,
        `Duration: ${durationDays} Days`,
        `Selected Upgrades: ${addonsSummary}`,
        `Estimated Total: $${totalPrice.toLocaleString()} USD`,
        inquiryCountry.trim() ? `Country: ${inquiryCountry.trim()}` : undefined,
        inquiryTravelSeason ? `Preferred Season: ${inquiryTravelSeason}` : undefined,
        `Group Size: ${finalGroupSize} Traveler(s)`,
      ]
        .filter((line) => line !== undefined)
        .join("\n")
        .trim();

      const notesSummary = `[Type: ${packageType}] | [Duration: ${durationDays}D] | [Upgrades: ${addonsSummary}] | [Est Total: $${totalPrice.toLocaleString()} USD]`;

      await InquiryService.create({
        guestName: inquiryName.trim(),
        email: inquiryEmail.trim(),
        phone: inquiryPhone.trim(),
        country: inquiryCountry.trim() || "N/A",
        interestedTrip: tripTitle,
        travelDates: inquiryTravelSeason || "Flexible",
        groupSize: finalGroupSize,
        message: formattedMessage,
        type: packageType,
        notes: notesSummary,
      });

      setIsSubmitted(true);
      setFormErrors({});
      setInquiryName("");
      setInquiryEmail("");
      setInquiryPhone("");
      setInquiryCountry("");
      setInquiryTravelSeason("");
      setInquiryMessage("");
    } catch (err) {
      console.error("Inquiry submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const activeAddonsList = addons.filter((a) => a.checked);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent showCloseButton onCloseClick={handleClose} className="sm:max-w-lg w-full p-0 overflow-hidden bg-white rounded-2xl shadow-2xl border border-stone-200">
        {/* Clean Light Header */}
        <div className="bg-stone-50 border-b border-stone-200 p-5 pr-10">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider mb-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Direct Specialist Inquiry</span>
          </div>
          <DialogTitle className="font-heading text-base sm:text-lg font-bold text-stone-900 leading-snug">
            {tripTitle}
          </DialogTitle>
          <DialogDescription className="text-xs text-stone-600 mt-1 font-medium leading-normal">
            Ask a mountain specialist about custom dates, private departures, or trip details. Replies within 12 hours.
          </DialogDescription>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Trip Summary Pill Box */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-stone-900 truncate">{tripTitle}</span>
              <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase shrink-0">
                {packageType}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-stone-600 font-medium text-[11px]">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                {durationDays} Days
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-stone-500" />
                {travelers} {travelers === 1 ? "Traveler" : "Travelers"}
              </span>
              <span className="flex items-center gap-1 font-bold text-stone-900">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                ${totalPrice.toLocaleString()} USD Est. Total
              </span>
            </div>
            {activeAddonsList.length > 0 && (
              <div className="pt-1.5 border-t border-stone-200 text-[11px] text-stone-600">
                <span className="font-bold text-stone-800">Upgrades: </span>
                {activeAddonsList.map((a) => a.label).join(", ")}
              </div>
            )}
          </div>

          {isSubmitted ? (
            <div className="py-6 px-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3 animate-in fade-in-0 duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-xs">
                <Check className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-heading font-bold text-base text-emerald-950">Inquiry Successfully Received!</h4>
                <p className="text-xs text-emerald-800 font-medium max-w-sm mx-auto mt-1 leading-relaxed">
                  Thank you! Our mountain specialist team has received your request for <strong className="text-emerald-950">{tripTitle}</strong> and will get back to you shortly via email or WhatsApp.
                </p>
              </div>
              <Button onClick={handleClose} className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-6 py-2 rounded-xl cursor-pointer shadow-xs mt-2">
                Close Dialog
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
              {/* Row 1: Full Name & Email Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-900 mb-1">
                    Full Name <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alexander Wright"
                    value={inquiryName}
                    onChange={(e) => {
                      setInquiryName(e.target.value);
                      if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    className={`w-full text-xs px-3.5 py-2 rounded-xl border focus:outline-none transition-all font-medium ${
                      formErrors.name
                        ? "border-rose-400 bg-rose-50/20 text-rose-950 focus:ring-1 focus:ring-rose-500"
                        : "border-stone-300 focus:ring-1 focus:ring-amber-800 focus:border-amber-800 bg-white"
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-900 mb-1">
                    Email Address <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. alexander@example.com"
                    value={inquiryEmail}
                    onChange={(e) => {
                      setInquiryEmail(e.target.value);
                      if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    className={`w-full text-xs px-3.5 py-2 rounded-xl border focus:outline-none transition-all font-medium ${
                      formErrors.email
                        ? "border-rose-400 bg-rose-50/20 text-rose-950 focus:ring-1 focus:ring-rose-500"
                        : "border-stone-300 focus:ring-1 focus:ring-amber-800 focus:border-amber-800 bg-white"
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1">{formErrors.email}</p>
                  )}
                </div>
              </div>

              {/* Row 2: Phone Number & Country Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-900 mb-1">
                    Phone / WhatsApp Number <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +1 (555) 019-2834"
                    value={inquiryPhone}
                    onChange={(e) => {
                      setInquiryPhone(e.target.value);
                      if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    className={`w-full text-xs px-3.5 py-2 rounded-xl border focus:outline-none transition-all font-medium ${
                      formErrors.phone
                        ? "border-rose-400 bg-rose-50/20 text-rose-950 focus:ring-1 focus:ring-rose-500"
                        : "border-stone-300 focus:ring-1 focus:ring-amber-800 focus:border-amber-800 bg-white"
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1">{formErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-900 mb-1">
                    Country of Residence <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <select
                    value={inquiryCountry}
                    onChange={(e) => setInquiryCountry(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-800 focus:border-amber-800 bg-white font-medium transition-all cursor-pointer"
                  >
                    <option value="">Select Country...</option>
                    {COUNTRY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Preferred Season & Number of Travelers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-900 mb-1">
                    Preferred Season <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <select
                    value={inquiryTravelSeason}
                    onChange={(e) => setInquiryTravelSeason(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-800 focus:border-amber-800 bg-white font-medium transition-all cursor-pointer"
                  >
                    <option value="">Flexible / Any Season</option>
                    <option value="Spring (March - May)">Spring (March - May)</option>
                    <option value="Autumn / Fall (September - November)">Autumn / Fall (September - November)</option>
                    <option value="Monsoon / Summer (June - August)">Monsoon / Summer (June - August)</option>
                    <option value="Winter (December - February)">Winter (December - February)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-900 mb-1">
                    Number of Travelers <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <select
                    value={inquiryTravelers}
                    onChange={(e) => setInquiryTravelers(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-800 focus:border-amber-800 bg-white font-medium transition-all cursor-pointer"
                  >
                    <option value="1">1 Traveler (Solo)</option>
                    <option value="2">2 Travelers (Couple/Friends)</option>
                    <option value="3">3 to 5 Travelers (Private Group)</option>
                    <option value="6">6+ Travelers (Expedition Team)</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Question or Inquiry Message */}
              <div>
                <label className="block text-xs font-bold text-stone-900 mb-1">
                  Question or Inquiry Message <span className="text-rose-500 font-bold">*</span>
                </label>
                <textarea
                  placeholder="Describe your desired altitude goals, physical preparation level, or questions..."
                  rows={3}
                  value={inquiryMessage}
                  onChange={(e) => {
                    setInquiryMessage(e.target.value);
                    if (formErrors.message) setFormErrors((prev) => ({ ...prev, message: undefined }));
                  }}
                  className={`w-full text-xs px-3.5 py-2 rounded-xl border focus:outline-none resize-none transition-all font-medium ${
                    formErrors.message
                      ? "border-rose-400 bg-rose-50/20 text-rose-950 focus:ring-1 focus:ring-rose-500"
                      : "border-stone-300 focus:ring-1 focus:ring-amber-800 focus:border-amber-800 bg-white"
                  }`}
                />
                {formErrors.message && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1">{formErrors.message}</p>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting} className="text-xs font-semibold cursor-pointer">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-xs transition-colors"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5" />
                      Send Inquiry
                    </span>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
