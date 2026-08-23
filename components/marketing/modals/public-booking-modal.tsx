"use client";

import {
  Booking,
  BookingPackageType,
  BookingPaymentStatus,
  BookingPermitStatus,
  BookingStatus,
} from "@/lib/admin-data";
import { BookingFormValues } from "@/lib/admin-schemas";
import { BookingService } from "@/lib/services/admin-service";
import {
  AlertTriangle,
  CheckCircle2,
  Compass,
  CreditCard,
  FileCheck,
  Loader2,
  Mountain,
  X
} from "lucide-react";
import { COUNTRY_OPTIONS } from "@/lib/country-list";
import { TurnstileWidget } from "@/components/ui/turnstile-widget";
import { toast } from "sonner";
import { useCallback, useEffect, useMemo, useState } from "react";

interface PublicBookingModalProps {
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s()-]{6,}$/;

type FieldErrors = Partial<
  Record<"guestName" | "guestEmail" | "guestPhone" | "country" | "startDate", string>
>;

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

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  // 1. Prevent background page scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // 2. Reset and synchronize state whenever the modal is opened
  useEffect(() => {
    if (isOpen) {
      if (initialTravelers && initialTravelers >= 1) {
        setTravelers(initialTravelers);
      }
      if (initialDate && initialDate.trim()) {
        setStartDate(initialDate);
      } else {
        setStartDate(defaultStartDate);
      }
      setGuestName("");
      setGuestEmail("");
      setGuestPhone("");
      setCountry("");
      setSpecialRequests("");
      setTouched({});
      setConfirmedBooking(null);
      setErrorMessage(null);
      setIsSubmitting(false);
      setShowExitConfirm(false);
    }
  }, [isOpen, initialTravelers, initialDate, defaultStartDate]);

  // 3. Accurately detect if the user has changed anything from original state
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

  // Return date is inclusive of the departure day
  const endDate = useMemo(() => {
    if (!startDate) return "";
    const nights = Math.max(1, trip.durationDays) - 1;
    const d = new Date(startDate);
    d.setDate(d.getDate() + nights);
    return d.toISOString().split("T")[0];
  }, [startDate, trip.durationDays]);

  const baseCostPerPerson = trip.priceUSD || 0;

  const totalPriceUSD = useMemo(() => {
    const perPerson = baseCostPerPerson;
    return Math.round(perPerson * travelers);
  }, [travelers, baseCostPerPerson]);

  const depositUSD = useMemo(() => {
    return Math.round(totalPriceUSD * 0.25);
  }, [totalPriceUSD]);

  const todayStr = new Date().toISOString().split("T")[0];

  const fieldErrors: FieldErrors = useMemo(() => {
    const errs: FieldErrors = {};
    if (!guestName.trim()) errs.guestName = "Enter the lead traveler's full name.";
    if (!guestEmail.trim()) errs.guestEmail = "Enter an email address.";
    else if (!EMAIL_RE.test(guestEmail.trim())) errs.guestEmail = "Enter a valid email address.";
    if (!guestPhone.trim()) errs.guestPhone = "Enter a phone number.";
    else if (!PHONE_RE.test(guestPhone.trim())) errs.guestPhone = "Enter a valid phone number.";
    if (!country.trim()) errs.country = "Enter a country.";
    if (!startDate) errs.startDate = "Choose a departure date.";
    else if (startDate < todayStr) errs.startDate = "Departure date can't be in the past.";
    return errs;
  }, [guestName, guestEmail, guestPhone, country, startDate, todayStr]);

  const isFormValid = Object.keys(fieldErrors).length === 0;

  const showError = (field: keyof FieldErrors) =>
    touched[field] ? fieldErrors[field] : undefined;

  const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

  // Force-close and clear all state
  const forceClose = useCallback(() => {
    setShowExitConfirm(false);
    setGuestName("");
    setGuestEmail("");
    setGuestPhone("");
    setCountry("");
    setSpecialRequests("");
    setConfirmedBooking(null);
    setErrorMessage(null);
    setTouched({});
    setIsSubmitting(false);
    setTurnstileToken("");
    onClose();
  }, [onClose]);

  // Request close: checks if dirty, otherwise prompts confirmation
  const requestClose = useCallback(() => {
    if (confirmedBooking || !isDirty) {
      forceClose();
    } else {
      setShowExitConfirm(true);
    }
  }, [confirmedBooking, isDirty, forceClose]);

  // Handle keyboard Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (showExitConfirm) {
          setShowExitConfirm(false);
        } else {
          requestClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, showExitConfirm, requestClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    setTouched({
      guestName: true,
      guestEmail: true,
      guestPhone: true,
      country: true,
      startDate: true,
    });

    if (!isFormValid) return;

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
        forceClose();
      } else {
        setErrorMessage(res.message || "We couldn't save this booking. Please try again.");
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      setErrorMessage(err.message || "Something went wrong while sending your request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase =
    "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 transition-colors";
  const inputOk = "border-slate-200 focus:border-amber-500 focus:ring-amber-500";
  const inputBad = "border-red-400 focus:border-red-500 focus:ring-red-500";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <div className="relative flex w-full max-w-lg sm:max-w-2xl max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Unsaved Changes Confirmation Overlay */}
        {showExitConfirm && (
          <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="max-w-sm w-full text-center space-y-4">
              <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" strokeWidth={2} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">
                  Leave booking?
                </h3>
                <p className="text-sm text-slate-600">
                  You have unsaved changes. If you leave now, your entered booking details will be lost.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-amber-700 text-white font-semibold text-sm hover:bg-amber-800"
                  autoFocus
                >
                  Continue Editing
                </button>
                <button
                  type="button"
                  onClick={forceClose}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold text-sm hover:text-red-700 hover:border-red-300"
                >
                  Discard &amp; Leave
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="relative shrink-0 border-b border-slate-200 bg-white">
          <div className="flex items-start justify-between gap-3 px-5 py-4 sm:px-7 sm:py-5">
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Compass className="h-3 w-3" strokeWidth={2.25} />
                  {trip.region}
                </span>
                <span aria-hidden="true">·</span>
                <span>{trip.durationDays} days</span>
                {trip.maxAltitudeMeters ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Mountain className="h-3 w-3" strokeWidth={2.25} />
                      {trip.maxAltitudeMeters.toLocaleString()}m
                    </span>
                  </>
                ) : null}
                {trip.difficulty ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{trip.difficulty}</span>
                  </>
                ) : null}
              </div>
              <h2 id="booking-modal-title" className="font-heading text-base sm:text-lg font-bold leading-snug text-slate-900">
                {trip.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={requestClose}
              className="shrink-0 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 cursor-pointer"
              aria-label="Close booking form"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto">
          {confirmedBooking ? (
            <div className="px-6 py-8 sm:px-10 sm:py-10">
              <div className="mx-auto max-w-sm text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <CheckCircle2 className="h-7 w-7" strokeWidth={2} />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-900 sm:text-2xl">
                  Request sent
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
                  We&apos;ve logged your trip and emailed a copy to {confirmedBooking.guestEmail || guestEmail}.
                  A trip coordinator will confirm permits and lodges, then send payment instructions.
                </p>
              </div>

              <div className="mx-auto mt-6 max-w-sm rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between border-b border-dashed border-slate-300 px-5 py-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Booking reference
                  </span>
                  <span className="rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 font-mono text-sm font-bold text-amber-800">
                    {confirmedBooking.reference}
                  </span>
                </div>
                <div className="space-y-2.5 px-5 py-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Traveler</span>
                    <span className="font-medium text-slate-900">{confirmedBooking.guestName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Dates</span>
                    <span className="font-medium text-slate-900">
                      {confirmedBooking.startDate} → {confirmedBooking.endDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Group</span>
                    <span className="font-medium text-slate-900">
                      {confirmedBooking.groupSize}{" "}
                      {confirmedBooking.groupSize === 1 ? "traveler" : "travelers"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-dashed border-slate-300 pt-2.5">
                    <span className="font-medium text-slate-900">Estimated total</span>
                    <span className="font-mono text-base font-bold text-slate-900">
                      ${Number(confirmedBooking.totalAmountUSD).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={forceClose}
                className="mx-auto mt-7 block w-full max-w-sm rounded-xl bg-amber-700 hover:bg-amber-800 active:bg-amber-900 py-3.5 text-sm font-semibold text-white transition-colors cursor-pointer"
              >
                Back to trip details
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-6 px-5 py-6 sm:px-7 sm:py-7">
              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800"
                >
                  {errorMessage}
                </div>
              )}

              {/* Dates + group size */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="startDate" className="text-sm font-semibold text-slate-900">
                    Departure date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    required
                    min={todayStr}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    onBlur={() => markTouched("startDate")}
                    aria-invalid={!!showError("startDate")}
                    aria-describedby={showError("startDate") ? "startDate-error" : undefined}
                    className={`${inputBase} ${showError("startDate") ? inputBad : inputOk}`}
                  />
                  {showError("startDate") ? (
                    <p id="startDate-error" className="text-xs text-red-600">
                      {showError("startDate")}
                    </p>
                  ) : startDate ? (
                    <p className="text-xs text-slate-500">
                      Returns <span className="font-medium text-slate-600">{endDate}</span> ·{" "}
                      {trip.durationDays} days
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <span className="block text-sm font-semibold text-slate-900" id="travelers-label">
                    Travelers
                  </span>
                  <div className="flex items-center gap-2" role="group" aria-labelledby="travelers-label">
                    <button
                      type="button"
                      disabled={travelers <= 1}
                      onClick={() => setTravelers((prev) => Math.max(1, prev - 1))}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-lg font-semibold text-slate-900 transition-colors hover:bg-slate-50 disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                      aria-label="Decrease travelers"
                    >
                      −
                    </button>
                    <div className="flex h-11 flex-1 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900">
                      {travelers} {travelers === 1 ? "traveler" : "travelers"}
                    </div>
                    <button
                      type="button"
                      disabled={travelers >= 12}
                      onClick={() => setTravelers((prev) => Math.min(12, prev + 1))}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-lg font-semibold text-slate-900 transition-colors hover:bg-slate-50 disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                      aria-label="Increase travelers"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>


              {/* Traveler details */}
              <div className="space-y-3.5 border-t border-slate-100 pt-5">
                <h3 className="text-sm font-semibold text-slate-900">Lead traveler</h3>

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label htmlFor="guestName" className="text-xs font-medium text-slate-600">
                      Full name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="guestName"
                      type="text"
                      required
                      placeholder="Eleanor Vance"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      onBlur={() => markTouched("guestName")}
                      aria-invalid={!!showError("guestName")}
                      aria-describedby={showError("guestName") ? "guestName-error" : undefined}
                      className={`${inputBase} ${showError("guestName") ? inputBad : inputOk}`}
                    />
                    {showError("guestName") && (
                      <p id="guestName-error" className="text-xs text-red-600">
                        {showError("guestName")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="guestEmail" className="text-xs font-medium text-slate-600">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="guestEmail"
                      type="email"
                      required
                      placeholder="eleanor@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      onBlur={() => markTouched("guestEmail")}
                      aria-invalid={!!showError("guestEmail")}
                      aria-describedby={showError("guestEmail") ? "guestEmail-error" : undefined}
                      className={`${inputBase} ${showError("guestEmail") ? inputBad : inputOk}`}
                    />
                    {showError("guestEmail") && (
                      <p id="guestEmail-error" className="text-xs text-red-600">
                        {showError("guestEmail")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="guestPhone" className="text-xs font-medium text-slate-600">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="guestPhone"
                      type="tel"
                      required
                      placeholder="+1 555 234 5678"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      onBlur={() => markTouched("guestPhone")}
                      aria-invalid={!!showError("guestPhone")}
                      aria-describedby={showError("guestPhone") ? "guestPhone-error" : undefined}
                      className={`${inputBase} ${showError("guestPhone") ? inputBad : inputOk}`}
                    />
                    {showError("guestPhone") && (
                      <p id="guestPhone-error" className="text-xs text-red-600">
                        {showError("guestPhone")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="country" className="text-xs font-medium text-slate-600">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="country"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      onBlur={() => markTouched("country")}
                      aria-invalid={!!showError("country")}
                      aria-describedby={showError("country") ? "country-error" : undefined}
                      className={`${inputBase} ${showError("country") ? inputBad : inputOk} cursor-pointer`}
                    >
                      <option value="">Select Country...</option>
                      {COUNTRY_OPTIONS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    {showError("country") && (
                      <p id="country-error" className="text-xs text-red-600">
                        {showError("country")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="specialRequests" className="text-xs font-medium text-slate-600">
                    Notes for your trip coordinator{" "}
                    <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <textarea
                    id="specialRequests"
                    rows={2}
                    placeholder="Diet, room preferences, altitude concerns…"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className={`${inputBase} ${inputOk} resize-none`}
                  />
                </div>
              </div>

              {/* Price summary */}
              <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>
                    {travelers} × ${baseCostPerPerson.toLocaleString()}
                  </span>
                  <span className="font-medium text-slate-900">
                    ${(baseCostPerPerson * travelers).toLocaleString()}
                  </span>
                </div>

              

                <div className="flex items-end justify-between border-t border-slate-200 pt-3">
                  <div>
                    <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                      Estimated total
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 text-xs text-amber-700">
                      <CreditCard className="h-3 w-3" strokeWidth={2.25} />
                      ${depositUSD.toLocaleString()} deposit to confirm
                    </span>
                  </div>
                  <span className="font-heading text-xl sm:text-2xl font-bold text-slate-900">
                    ${totalPriceUSD.toLocaleString()}
                  </span>
                </div>
              </div>

              <TurnstileWidget
                onVerify={(t) => setTurnstileToken(t)}
                onExpire={() => setTurnstileToken('')}
                onError={() => setTurnstileToken('')}
              />

              <button
                type="submit"
                disabled={isSubmitting || !turnstileToken}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending request…
                  </>
                ) : (
                  "Request this booking"
                )}
              </button>

              <p className="flex items-start gap-1.5 text-xs leading-relaxed text-slate-500">
                <FileCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
                No card charge yet. We confirm permits and lodge availability first, then send
                payment instructions for the deposit above.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}