"use client";

import React, { useState } from "react";
import { MessageSquare, Send, Check, Loader2, Calendar, Users, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InquiryService } from "@/lib/services/admin-service";
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

      const formattedMessage = [
        inquiryMessage.trim(),
        "",
        "--- Trip Inquiry Context ---",
        `Trip Title: ${tripTitle}`,
        `Package Domain: ${packageType}`,
        `Duration: ${durationDays} Days`,
        `Travelers Count: ${travelers}`,
        `Selected Upgrades: ${addonsSummary}`,
        `Estimated Rate: $${totalPrice.toLocaleString()} USD`,
      ]
        .filter((line) => line !== undefined)
        .join("\n")
        .trim();

      const notesSummary = `[Type: ${packageType}] | [Duration: ${durationDays}D] | [Upgrades: ${addonsSummary}] | [Est Total: $${totalPrice.toLocaleString()} USD]`;

      await InquiryService.create({
        guestName: inquiryName.trim(),
        email: inquiryEmail.trim(),
        phone: inquiryPhone.trim(),
        country: "N/A",
        interestedTrip: tripTitle,
        travelDates: "Flexible",
        groupSize: travelers,
        message: formattedMessage,
        notes: notesSummary,
      });

      setIsSubmitted(true);
      setFormErrors({});
      setInquiryName("");
      setInquiryEmail("");
      setInquiryPhone("");
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
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 pr-10">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Direct Specialist Inquiry</span>
          </div>
          <DialogTitle className="font-heading text-base sm:text-lg font-bold text-white leading-snug">
            {tripTitle}
          </DialogTitle>
          <DialogDescription className="text-xs text-stone-300 mt-1 font-medium leading-normal">
            Ask a mountain specialist about custom dates, private departures, or trip details. Replies within 12 hours.
          </DialogDescription>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
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
              {/* Full Name */}
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
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none transition-all font-medium ${
                    formErrors.name
                      ? "border-rose-400 bg-rose-50/20 text-rose-950 focus:ring-1 focus:ring-rose-500"
                      : "border-stone-300 focus:ring-1 focus:ring-stone-900 focus:border-stone-900 bg-white"
                  }`}
                />
                {formErrors.name && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Email Address */}
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
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none transition-all font-medium ${
                    formErrors.email
                      ? "border-rose-400 bg-rose-50/20 text-rose-950 focus:ring-1 focus:ring-rose-500"
                      : "border-stone-300 focus:ring-1 focus:ring-stone-900 focus:border-stone-900 bg-white"
                  }`}
                />
                {formErrors.email && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1">{formErrors.email}</p>
                )}
              </div>

              {/* Phone / WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-stone-900 mb-1">
                  Phone / WhatsApp Number <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +1 555-019-2834"
                  value={inquiryPhone}
                  onChange={(e) => {
                    setInquiryPhone(e.target.value);
                    if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none transition-all font-medium ${
                    formErrors.phone
                      ? "border-rose-400 bg-rose-50/20 text-rose-950 focus:ring-1 focus:ring-rose-500"
                      : "border-stone-300 focus:ring-1 focus:ring-stone-900 focus:border-stone-900 bg-white"
                  }`}
                />
                {formErrors.phone && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1">{formErrors.phone}</p>
                )}
              </div>

              {/* Question or Inquiry Message */}
              <div>
                <label className="block text-xs font-bold text-stone-900 mb-1">
                  Question or Inquiry Message <span className="text-rose-500 font-bold">*</span>
                </label>
                <textarea
                  placeholder="Any custom dates, fitness questions, or special requests..."
                  rows={3}
                  value={inquiryMessage}
                  onChange={(e) => {
                    setInquiryMessage(e.target.value);
                    if (formErrors.message) setFormErrors((prev) => ({ ...prev, message: undefined }));
                  }}
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none resize-none transition-all font-medium ${
                    formErrors.message
                      ? "border-rose-400 bg-rose-50/20 text-rose-950 focus:ring-1 focus:ring-rose-500"
                      : "border-stone-300 focus:ring-1 focus:ring-stone-900 focus:border-stone-900 bg-white"
                  }`}
                />
                {formErrors.message && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1">{formErrors.message}</p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting} className="text-xs font-semibold cursor-pointer">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-xs transition-colors"
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
