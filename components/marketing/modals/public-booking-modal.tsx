"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Loader2, CheckCircle2, AlertTriangle, Send } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Booking,
  BookingPackageType,
  BookingPaymentStatus,
  BookingPermitStatus,
  BookingStatus,
} from "@/lib/admin-data";
import { BookingFormValues } from "@/lib/admin-schemas";
import { BookingService } from "@/lib/services/admin-service";
import { COUNTRY_OPTIONS } from "@/lib/country-list";
import { TurnstileWidget } from "@/components/ui/turnstile-widget";

export interface PublicBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  trip: {
    title: string;
    slug: string;
    region: string;
    durationDays: number;
    maxAltitudeMeters?: number;
    difficulty?: string;
    priceUSD: number;
    image?: string;
    categoryType?: BookingPackageType;
  };
  initialTravelers?: number;
  initialDate?: string;
}

export function PublicBookingModal({
  isOpen,
  onClose,
  onSuccess,
  trip,
  initialTravelers = 2,
  initialDate,
}: PublicBookingModalProps) {
  const [travelers, setTravelers] = useState<number>(initialTravelers);

  const defaultStartDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  }, []);

  const [startDate, setStartDate] = useState<string>(initialDate || defaultStartDate);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [country, setCountry] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string | undefined>>({});
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Reset state whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setTravelers(initialTravelers && initialTravelers >= 1 ? initialTravelers : 2);
      setStartDate(initialDate && initialDate.trim() ? initialDate : defaultStartDate);
      setGuestName("");
      setGuestEmail("");
      setGuestPhone("");
      setCountry("");
      setSpecialRequests("");
      setTurnstileToken("");
      setFormErrors({});
      setConfirmedBooking(null);
      setErrorMessage(null);
      setIsSubmitting(false);
      setShowExitConfirm(false);
    }
  }, [isOpen, initialTravelers, initialDate, defaultStartDate]);

  const isDirty = useMemo(() => {
    if (confirmedBooking) return false;
    const initialDateValue = initialDate && initialDate.trim() ? initialDate : defaultStartDate;
    const initialTravValue = initialTravelers && initialTravelers >= 1 ? initialTravelers : 2;

    if (travelers !== initialTravValue) return true;
    if (startDate !== initialDateValue) return true;
    if (guestName.trim() !== "") return true;
    if (guestEmail.trim() !== "") return true;
    if (guestPhone.trim() !== "") return true;
    if (country.trim() !== "") return true;
    if (specialRequests.trim() !== "") return true;
    return false;
  }, [
    confirmedBooking,
    travelers,
    initialTravelers,
    startDate,
    initialDate,
    defaultStartDate,
    guestName,
    guestEmail,
    guestPhone,
    country,
    specialRequests,
  ]);

  const endDate = useMemo(() => {
    if (!startDate) return "";
    const nights = Math.max(1, trip.durationDays) - 1;
    const d = new Date(startDate);
    if (isNaN(d.getTime())) return "";
    d.setDate(d.getDate() + nights);
    return d.toISOString().split("T")[0];
  }, [startDate, trip.durationDays]);

  const baseCostPerPerson = trip.priceUSD || 0;

  const totalPriceUSD = useMemo(() => {
    return Math.round(baseCostPerPerson * travelers);
  }, [travelers, baseCostPerPerson]);

  const depositUSD = useMemo(() => {
    return Math.round(totalPriceUSD * 0.25);
  }, [totalPriceUSD]);

  const forceClose = useCallback(() => {
    setShowExitConfirm(false);
    setGuestName("");
    setGuestEmail("");
    setGuestPhone("");
    setCountry("");
    setSpecialRequests("");
    setTurnstileToken("");
    setConfirmedBooking(null);
    setErrorMessage(null);
    setFormErrors({});
    setIsSubmitting(false);
    onClose();
  }, [onClose]);

  const requestClose = useCallback(() => {
    if (confirmedBooking || !isDirty) {
      forceClose();
    } else {
      setShowExitConfirm(true);
    }
  }, [confirmedBooking, isDirty, forceClose]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!guestName.trim()) errors.guestName = "Full name is required";
    if (!guestEmail.trim()) {
      errors.guestEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) {
      errors.guestEmail = "Invalid email address";
    }
    if (!guestPhone.trim()) errors.guestPhone = "Phone or WhatsApp is required";
    if (!country.trim()) errors.country = "Country is required";
    if (!startDate) {
      errors.startDate = "Departure date is required";
    } else if (startDate < todayStr) {
      errors.startDate = "Departure date cannot be in the past";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) return;

    if (!turnstileToken) {
      setErrorMessage("Please complete the Turnstile CAPTCHA verification.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: BookingFormValues & { cfTurnstileToken?: string } = {
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
        guestPhone: guestPhone.trim(),
        country: country.trim(),
        packageName: trip.title,
        packageType: trip.categoryType || BookingPackageType.TREKKING,
        startDate,
        endDate,
        groupSize: travelers,
        totalAmountUSD: totalPriceUSD,
        paymentStatus: BookingPaymentStatus.PENDING,
        bookingStatus: BookingStatus.IN_REVIEW,
        permitStatus: BookingPermitStatus.PROCESSING,
        specialRequests: specialRequests.trim(),
        cfTurnstileToken: turnstileToken,
      };

      const res = await BookingService.create(payload);
      if (res.success && res.data) {
        toast.success(`Booking request submitted successfully! (Reference: ${res.data.reference})`);
        onSuccess?.();
        setConfirmedBooking(res.data);
      } else {
        const msg = res.message || "Failed to submit booking request. Please try again.";
        setErrorMessage(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      const msg = err?.message || "Something went wrong while sending your request.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && requestClose()}>
      <DialogContent
        showCloseButton
        onCloseClick={requestClose}
        className="sm:max-w-xl md:max-w-2xl w-full max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white rounded-2xl shadow-xl border border-stone-200"
      >
        {/* Header */}
        <div className="bg-stone-50 border-b border-stone-200 px-5 sm:px-7 py-4 sm:py-4.5 pr-12 shrink-0">
          <DialogTitle className="font-heading text-base sm:text-lg font-bold text-stone-900">
            {confirmedBooking ? "Booking Confirmation" : "Book This Trip"}
          </DialogTitle>
          <DialogDescription className="text-xs text-stone-500 font-medium truncate mt-0.5">
            {trip.title} ({trip.durationDays} Days · {trip.region})
          </DialogDescription>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto max-h-[calc(90vh-70px)] p-5 sm:p-7 space-y-4">
          {showExitConfirm ? (
            <div className="text-center space-y-4 py-2">
            <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading text-base font-bold text-stone-900">
                Discard Booking Request?
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed max-w-xs mx-auto">
                You have unsaved changes in your booking form. If you leave now, your entered details will be lost.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowExitConfirm(false)}
                className="text-xs font-semibold py-2.5 px-5 rounded-xl border-stone-300 hover:bg-stone-50 text-stone-700"
              >
                Continue Editing
              </Button>
              <Button
                type="button"
                onClick={forceClose}
                className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer"
              >
                Discard & Leave
              </Button>
            </div>
          </div>
        ) : confirmedBooking ? (
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <h3 className="font-heading text-lg font-bold text-stone-900">
                Booking Request Submitted!
              </h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                Thank you for choosing Alpine Ace! We&apos;ve received your request for{" "}
                <strong className="text-stone-900">{trip.title}</strong>. A confirmation copy has been sent to{" "}
                <strong className="text-stone-900">{confirmedBooking.guestEmail || guestEmail}</strong>.
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4.5 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-dashed border-stone-200 pb-3">
                <span className="font-semibold text-stone-500 uppercase tracking-wider text-[11px]">
                  Booking Reference
                </span>
                <span className="font-mono font-bold text-amber-900 bg-amber-100/80 px-2.5 py-1 rounded-md border border-amber-200/80">
                  {confirmedBooking.reference}
                </span>
              </div>

              <div className="space-y-2 text-stone-700">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Lead Traveler</span>
                  <span className="font-semibold text-stone-900">{confirmedBooking.guestName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Departure &amp; Return</span>
                  <span className="font-medium text-stone-900">
                    {confirmedBooking.startDate} → {confirmedBooking.endDate}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Group Size</span>
                  <span className="font-medium text-stone-900">
                    {confirmedBooking.groupSize} {confirmedBooking.groupSize === 1 ? "Traveler" : "Travelers"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-stone-200 pt-2 font-bold text-stone-900">
                  <span>Estimated Total</span>
                  <span className="text-sm font-bold text-amber-900">
                    ${Number(confirmedBooking.totalAmountUSD || totalPriceUSD).toLocaleString()} USD
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3.5 text-xs text-stone-700 leading-relaxed">
              <p className="font-semibold text-amber-950 mb-1">What Happens Next?</p>
              We are checking lodge rooms and permits for your dates. Our team will email you within 12 hours to confirm your reservation details.
            </div>

            <Button
              type="button"
              onClick={forceClose}
              className="w-full bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs py-3 rounded-xl cursor-pointer shadow-xs transition-colors"
            >
              Done
            </Button>
          </div>
        ) : (
          <div>
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Row 1: Departure Date & Travelers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Departure Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (formErrors.startDate) setFormErrors((prev) => ({ ...prev, startDate: undefined }));
                    }}
                    className={`w-full text-xs px-3.5 py-2.5 rounded-xl border font-medium focus:outline-none transition-all ${
                      formErrors.startDate
                        ? "border-rose-400 bg-rose-50/30 text-rose-950 focus:ring-1 focus:ring-rose-500"
                        : "border-stone-300 focus:ring-1 focus:ring-amber-800 focus:border-amber-800 bg-white text-stone-900"
                    }`}
                  />
                  {formErrors.startDate ? (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1">{formErrors.startDate}</p>
                  ) : startDate ? (
                    <p className="text-[11px] text-stone-500 mt-1 font-medium">
                      Returns: <span className="text-stone-700 font-semibold">{endDate}</span> ({trip.durationDays} Days)
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Travelers <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={travelers <= 1}
                      onClick={() => setTravelers((prev) => Math.max(1, prev - 1))}
                      className="w-10 h-[38px] flex items-center justify-center rounded-xl border border-stone-300 text-stone-800 font-bold text-base hover:bg-stone-100 active:bg-stone-200 disabled:opacity-30 cursor-pointer transition-colors"
                    >
                      -
                    </button>
                    <div className="flex-1 h-[38px] flex items-center justify-center rounded-xl border border-stone-300 bg-stone-50 text-xs font-semibold text-stone-800">
                      {travelers} {travelers === 1 ? "Traveler" : "Travelers"}
                    </div>
                    <button
                      type="button"
                      disabled={travelers >= 12}
                      onClick={() => setTravelers((prev) => Math.min(12, prev + 1))}
                      className="w-10 h-[38px] flex items-center justify-center rounded-xl border border-stone-300 text-stone-800 font-bold text-base hover:bg-stone-100 active:bg-stone-200 disabled:opacity-30 cursor-pointer transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 2: Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Wright"
                    value={guestName}
                    onChange={(e) => {
                      setGuestName(e.target.value);
                      if (formErrors.guestName) setFormErrors((prev) => ({ ...prev, guestName: undefined }));
                    }}
                    className={`w-full text-xs px-3.5 py-2.5 rounded-xl border font-medium focus:outline-none transition-all ${
                      formErrors.guestName
                        ? "border-rose-400 bg-rose-50/30 text-rose-950 focus:ring-1 focus:ring-rose-500"
                        : "border-stone-300 focus:ring-1 focus:ring-amber-800 focus:border-amber-800 bg-white text-stone-900"
                    }`}
                  />
                  {formErrors.guestName && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1">{formErrors.guestName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="alex@example.com"
                    value={guestEmail}
                    onChange={(e) => {
                      setGuestEmail(e.target.value);
                      if (formErrors.guestEmail) setFormErrors((prev) => ({ ...prev, guestEmail: undefined }));
                    }}
                    className={`w-full text-xs px-3.5 py-2.5 rounded-xl border font-medium focus:outline-none transition-all ${
                      formErrors.guestEmail
                        ? "border-rose-400 bg-rose-50/30 text-rose-950 focus:ring-1 focus:ring-rose-500"
                        : "border-stone-300 focus:ring-1 focus:ring-amber-800 focus:border-amber-800 bg-white text-stone-900"
                    }`}
                  />
                  {formErrors.guestEmail && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1">{formErrors.guestEmail}</p>
                  )}
                </div>
              </div>

              {/* Row 3: Phone & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Phone / WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 555-019-2834"
                    value={guestPhone}
                    onChange={(e) => {
                      setGuestPhone(e.target.value);
                      if (formErrors.guestPhone) setFormErrors((prev) => ({ ...prev, guestPhone: undefined }));
                    }}
                    className={`w-full text-xs px-3.5 py-2.5 rounded-xl border font-medium focus:outline-none transition-all ${
                      formErrors.guestPhone
                        ? "border-rose-400 bg-rose-50/30 text-rose-950 focus:ring-1 focus:ring-rose-500"
                        : "border-stone-300 focus:ring-1 focus:ring-amber-800 focus:border-amber-800 bg-white text-stone-900"
                    }`}
                  />
                  {formErrors.guestPhone && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1">{formErrors.guestPhone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Country <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      if (formErrors.country) setFormErrors((prev) => ({ ...prev, country: undefined }));
                    }}
                    className={`w-full text-xs px-3.5 py-2.5 rounded-xl border font-medium focus:outline-none transition-all cursor-pointer ${
                      formErrors.country
                        ? "border-rose-400 bg-rose-50/30 text-rose-950 focus:ring-1 focus:ring-rose-500"
                        : "border-stone-300 focus:ring-1 focus:ring-amber-800 focus:border-amber-800 bg-white text-stone-900"
                    }`}
                  >
                    <option value="">Select Country...</option>
                    {COUNTRY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.country && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1">{formErrors.country}</p>
                  )}
                </div>
              </div>

              {/* Row 4: Special Requests / Notes */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Special Requests / Notes <span className="text-stone-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  placeholder="Dietary requirements, room preferences, flight details..."
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-800 focus:border-amber-800 bg-white text-stone-900 resize-none font-medium transition-all"
                />
              </div>

              {/* Price Summary */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between text-stone-600 font-medium">
                  <span>{travelers} × ${baseCostPerPerson.toLocaleString()} USD</span>
                  <span className="text-stone-900 font-semibold">${totalPriceUSD.toLocaleString()} USD</span>
                </div>
                <div className="flex items-center justify-between border-t border-stone-200 pt-2 text-sm font-bold text-stone-900">
                  <span>Estimated Total</span>
                  <span className="text-amber-900">${totalPriceUSD.toLocaleString()} USD</span>
                </div>
                <p className="text-[11px] text-stone-500 font-medium pt-0.5">
                  No upfront charge required. A 25% deposit (${depositUSD.toLocaleString()} USD) secures your trip once permits are verified.
                </p>
              </div>

              <TurnstileWidget
                onVerify={(t) => setTurnstileToken(t)}
                onExpire={() => setTurnstileToken('')}
                onError={() => setTurnstileToken('')}
              />

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={requestClose}
                  disabled={isSubmitting}
                  className="text-xs font-semibold cursor-pointer py-2.5 px-5 rounded-xl border-stone-300 hover:bg-stone-50 text-stone-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !turnstileToken}
                  className="bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5" />
                      Request Booking
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
}