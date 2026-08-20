"use client";

import React, { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InquiryService } from "@/lib/services/admin-service";
import { COUNTRY_OPTIONS } from "@/lib/country-list";
import { BookingPackageType } from "@/lib/admin-data";
import { BookingAddonItem } from "./package-booking-sidebar";

export interface PackageInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  tripTitle: string;
  durationDays: number;
  travelers: number;
  totalPrice: number;
  packageType?: BookingPackageType;
  addons?: BookingAddonItem[];
}

export function PackageInquiryModal({
  isOpen,
  onClose,
  onSuccess,
  tripTitle,
  durationDays,
  travelers,
  totalPrice,
  packageType = BookingPackageType.TREKKING,
  addons = [],
}: PackageInquiryModalProps) {
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryCountry, setInquiryCountry] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; phone?: string; message?: string }>({});

  const validateForm = () => {
    const errors: { name?: string; email?: string; phone?: string; message?: string } = {};
    if (!inquiryName.trim()) errors.name = "Full name is required";
    if (!inquiryEmail.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiryEmail.trim())) {
      errors.email = "Invalid email address";
    }
    if (!inquiryPhone.trim()) errors.phone = "Phone or WhatsApp is required";
    if (!inquiryMessage.trim()) errors.message = "Message is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const activeAddons = addons.filter((a) => a.checked).map((a) => a.label);
      const addonsSummary = activeAddons.length > 0 ? activeAddons.join(", ") : "None";

      const formattedMessage = [
        inquiryMessage.trim(),
        "",
        "--- Trip Details ---",
        `Trip: ${tripTitle}`,
        `Type: ${packageType}`,
        `Duration: ${durationDays} Days`,
        `Selected Upgrades: ${addonsSummary}`,
        inquiryCountry.trim() ? `Country: ${inquiryCountry.trim()}` : undefined,
      ]
        .filter(Boolean)
        .join("\n");

      const res = await InquiryService.create({
        guestName: inquiryName.trim(),
        email: inquiryEmail.trim(),
        phone: inquiryPhone.trim(),
        country: inquiryCountry.trim() || "N/A",
        interestedTrip: tripTitle,
        travelDates: "Flexible",
        groupSize: travelers || 1,
        message: formattedMessage,
        type: packageType,
      });

      if (res?.success) {
        toast.success("Inquiry sent successfully! Our mountain specialist team will reply within 12 hours.");
        onSuccess?.();
        setFormErrors({});
        setErrorMessage(null);
        setInquiryName("");
        setInquiryEmail("");
        setInquiryPhone("");
        setInquiryCountry("");
        setInquiryMessage("");
        onClose();
      } else {
        const msg = res?.message || "Failed to send inquiry. Please try again.";
        setErrorMessage(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      console.error("Inquiry error:", err);
      const msg = err?.message || "Failed to send inquiry. Please try again or contact us directly.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton onCloseClick={onClose} className="sm:max-w-lg w-full p-0 overflow-hidden bg-white rounded-2xl shadow-xl border border-stone-200">
        {/* Header */}
        <div className="bg-stone-50 border-b border-stone-200 px-7 py-4.5 pr-12">
          <DialogTitle className="font-heading text-base sm:text-lg font-bold text-stone-900">
            Inquire About Trip
          </DialogTitle>
          <DialogDescription className="text-xs text-stone-500 font-medium truncate mt-0.5">
            {tripTitle}
          </DialogDescription>
        </div>

        <div className="p-7">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Row 1: Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Wright"
                  value={inquiryName}
                  onChange={(e) => {
                    setInquiryName(e.target.value);
                    if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl border font-medium focus:outline-none transition-all ${
                    formErrors.name
                      ? "border-rose-400 bg-rose-50/30 text-rose-950 focus:ring-1 focus:ring-rose-500"
                      : "border-stone-300 focus:ring-1 focus:ring-amber-800 focus:border-amber-800 bg-white"
                  }`}
                />
                {formErrors.name && <p className="text-[11px] font-semibold text-rose-600 mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="alex@example.com"
                  value={inquiryEmail}
                  onChange={(e) => {
                    setInquiryEmail(e.target.value);
                    if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl border font-medium focus:outline-none transition-all ${
                    formErrors.email
                      ? "border-rose-400 bg-rose-50/30 text-rose-950 focus:ring-1 focus:ring-rose-500"
                      : "border-stone-300 focus:ring-1 focus:ring-amber-800 focus:border-amber-800 bg-white"
                  }`}
                />
                {formErrors.email && <p className="text-[11px] font-semibold text-rose-600 mt-1">{formErrors.email}</p>}
              </div>
            </div>

            {/* Row 2: Phone & Country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Phone / WhatsApp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+1 555-019-2834"
                  value={inquiryPhone}
                  onChange={(e) => {
                    setInquiryPhone(e.target.value);
                    if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl border font-medium focus:outline-none transition-all ${
                    formErrors.phone
                      ? "border-rose-400 bg-rose-50/30 text-rose-950 focus:ring-1 focus:ring-rose-500"
                      : "border-stone-300 focus:ring-1 focus:ring-amber-800 focus:border-amber-800 bg-white"
                  }`}
                />
                {formErrors.phone && <p className="text-[11px] font-semibold text-rose-600 mt-1">{formErrors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Country <span className="text-stone-400 font-normal">(Optional)</span>
                </label>
                <select
                  value={inquiryCountry}
                  onChange={(e) => setInquiryCountry(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-800 focus:border-amber-800 bg-white font-medium transition-all cursor-pointer"
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

            {/* Row 3: Your Message */}
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                Message <span className="text-rose-500">*</span>
              </label>
              <textarea
                placeholder="How can we help with your trip?"
                rows={3}
                value={inquiryMessage}
                onChange={(e) => {
                  setInquiryMessage(e.target.value);
                  if (formErrors.message) setFormErrors((prev) => ({ ...prev, message: undefined }));
                }}
                className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none resize-none transition-all font-medium ${
                  formErrors.message
                    ? "border-rose-400 bg-rose-50/30 text-rose-950 focus:ring-1 focus:ring-rose-500"
                    : "border-stone-300 focus:ring-1 focus:ring-amber-800 focus:border-amber-800 bg-white"
                }`}
              />
              {formErrors.message && <p className="text-[11px] font-semibold text-rose-600 mt-1">{formErrors.message}</p>}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="text-xs font-semibold cursor-pointer py-2.5 px-5 rounded-xl">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer shadow-xs transition-colors"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
