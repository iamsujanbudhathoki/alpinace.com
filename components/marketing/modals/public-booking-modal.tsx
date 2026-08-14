"use client";

import { useState, useMemo } from "react";
import {
  Calendar,
  Users,
  CheckCircle2,
  Plane,
  Shield,
  Loader2,
  X,
  CreditCard,
  FileCheck,
  Compass,
} from "lucide-react";
import { BookingService } from "@/lib/services/admin-service";
import {
  Booking,
  BookingPackageType,
  BookingPaymentStatus,
  BookingStatus,
  BookingPermitStatus,
} from "@/lib/admin-data";
import { BookingFormValues } from "@/lib/admin-schemas";

interface PublicBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  initialHelicopter?: boolean;
}

export function PublicBookingModal({
  isOpen,
  onClose,
  trip,
  initialTravelers = 2,
  initialHelicopter = false,
}: PublicBookingModalProps) {
  const [travelers, setTravelers] = useState<number>(initialTravelers);
  const [helicopterAddon, setHelicopterAddon] = useState<boolean>(initialHelicopter);

  // Default start date: 30 days from today
  const defaultStartDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  }, []);

  const [startDate, setStartDate] = useState<string>(defaultStartDate);

  // Auto-calculated end date based on duration
  const endDate = useMemo(() => {
    if (!startDate) return "";
    const d = new Date(startDate);
    d.setDate(d.getDate() + Math.max(1, trip.durationDays));
    return d.toISOString().split("T")[0];
  }, [startDate, trip.durationDays]);

  // Guest details form state
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [country, setCountry] = useState("United States");
  const [specialRequests, setSpecialRequests] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Price calculations
  const baseCostPerPerson = trip.priceUSD || 0;
  const helicopterCostPerPerson = 450;
  const totalPriceUSD = useMemo(() => {
    let perPerson = baseCostPerPerson;
    if (helicopterAddon) perPerson += helicopterCostPerPerson;
    let discount = 1;
    if (travelers >= 4) discount = 0.95;
    if (travelers >= 8) discount = 0.9;
    return Math.round(perPerson * travelers * discount);
  }, [travelers, helicopterAddon, baseCostPerPerson]);

  const depositUSD = Math.round(totalPriceUSD * 0.2);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const payload: BookingFormValues = {
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
        specialRequests: [
          helicopterAddon ? "Includes Private Helicopter Shuttle Option." : "",
          specialRequests.trim(),
        ]
          .filter(Boolean)
          .join(" | ") || undefined,
      };

      const res = await BookingService.create(payload);
      if (res.success && res.data) {
        setConfirmedBooking(res.data);
      } else {
        setErrorMessage(res.message || "Failed to secure booking reservation. Please try again.");
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      setErrorMessage(err.message || "An unexpected error occurred while transmitting your reservation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setConfirmedBooking(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full">
                Secure Reservation
              </span>
              <span className="text-slate-400 text-xs font-semibold">
                {trip.region} &bull; {trip.durationDays} Days
              </span>
            </div>
            <h2 className="font-heading text-base sm:text-lg font-extrabold text-white line-clamp-1">
              {trip.title}
            </h2>
          </div>

          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {confirmedBooking ? (
          /* Confirmation Success State */
          <div className="p-8 sm:p-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 block">
                Reservation Confirmed
              </span>
              <h3 className="font-heading text-2xl font-black text-slate-900">
                You&apos;re Going to the Himalayas!
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                Your reservation has been recorded in our high-altitude logistics system. A confirmation briefing and invoice have been dispatched to your email.
              </p>
            </div>

            {/* Reference Box */}
            <div className="bg-stone-50 border border-slate-200 rounded-2xl p-5 max-w-md mx-auto text-left space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                <span className="text-slate-500 font-bold uppercase tracking-wider">Booking Reference</span>
                <span className="font-mono text-amber-700 font-extrabold text-sm bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {confirmedBooking.reference}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Guest Name:</span>
                <span className="font-bold text-slate-900">{confirmedBooking.guestName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Travel Dates:</span>
                <span className="font-bold text-slate-900">
                  {confirmedBooking.startDate} &rarr; {confirmedBooking.endDate}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Group Size:</span>
                <span className="font-bold text-slate-900">
                  {confirmedBooking.groupSize} {confirmedBooking.groupSize === 1 ? "Traveler" : "Travelers"}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-700 font-bold">Total Estimated:</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  ${Number(confirmedBooking.totalAmountUSD).toLocaleString()} USD
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleClose}
                className="w-full max-w-md mx-auto bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md transition-all cursor-pointer uppercase tracking-wider"
              >
                Return to Expedition Details
              </button>
            </div>
          </div>
        ) : (
          /* Main Reservation Form */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 text-slate-900">
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl font-medium">
                {errorMessage}
              </div>
            )}

            {/* Trip Configuration Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Departure Date Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-heading font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>Departure Date</span>
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-slate-400 font-medium"
                />
                <span className="text-[11px] text-slate-500 block">
                  Est. Return: <strong className="text-slate-700">{endDate}</strong> ({trip.durationDays} Days)
                </span>
              </div>

              {/* Group Size Counter */}
              <div className="space-y-1.5">
                <label className="text-xs font-heading font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  <span>Number of Travelers</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={travelers <= 1}
                    onClick={() => setTravelers((prev) => Math.max(1, prev - 1))}
                    className="bg-slate-100 text-slate-900 hover:bg-slate-200 disabled:opacity-30 w-10 h-9 rounded-xl flex items-center justify-center font-extrabold border border-slate-200 cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    readOnly
                    value={`${travelers} ${travelers === 1 ? "Traveler" : "Travelers"}`}
                    className="flex-grow bg-slate-50 border border-slate-200 text-center text-xs font-extrabold rounded-xl py-2 text-slate-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={travelers >= 12}
                    onClick={() => setTravelers((prev) => Math.min(12, prev + 1))}
                    className="bg-slate-100 text-slate-900 hover:bg-slate-200 disabled:opacity-30 w-10 h-9 rounded-xl flex items-center justify-center font-extrabold border border-slate-200 cursor-pointer"
                  >
                    +
                  </button>
                </div>
                {travelers >= 4 && (
                  <span className="text-[11px] text-emerald-700 font-bold block">
                    &bull; Group discount applied ({travelers >= 8 ? "10% off" : "5% off"})
                  </span>
                )}
              </div>
            </div>

            {/* Optional Addon Card */}
            <div className="bg-stone-50 border border-slate-200 p-4 rounded-2xl flex items-start gap-3 justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                  <Plane className="w-3.5 h-3.5 text-amber-600" />
                  <span>Scenic Helicopter Shuttle Return</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Skip the descent trek and fly via Airbus H125 directly back to Kathmandu. (+$450/person)
                </p>
              </div>
              <input
                type="checkbox"
                checked={helicopterAddon}
                onChange={(e) => setHelicopterAddon(e.target.checked)}
                className="mt-1 h-4 w-4 rounded accent-amber-600 shrink-0 cursor-pointer"
              />
            </div>

            {/* Lead Traveler Information */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="font-heading text-xs font-extrabold uppercase tracking-wider text-slate-900">
                Lead Traveler Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eleanor Vance"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="eleanor.vance@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 234-5678"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Country / Nationality *</label>
                  <input
                    type="text"
                    required
                    placeholder="United States, Germany, Japan..."
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <label className="text-[11px] font-bold text-slate-700">
                  Special Requests / Dietary / Single Room Supplement
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Vegetarian diet, private lodge upgrade in Namche, oxygen setup requirements..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-slate-400 resize-none"
                />
              </div>
            </div>

            {/* Price & Deposit Summary Footer */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">
                  Base Expedition Rate ({travelers} &times; ${baseCostPerPerson.toLocaleString()}):
                </span>
                <span className="font-bold text-white">${(baseCostPerPerson * travelers).toLocaleString()} USD</span>
              </div>

              {helicopterAddon && (
                <div className="flex justify-between items-center text-xs text-amber-300">
                  <span>Helicopter Add-on ({travelers} &times; $450):</span>
                  <span className="font-bold">+${(450 * travelers).toLocaleString()} USD</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 flex justify-between items-end">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                    Total Estimated USD
                  </span>
                  <span className="text-[11px] text-amber-400 font-medium">
                    20% Advance Deposit: ${depositUSD.toLocaleString()} USD
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-heading text-2xl font-black text-white">
                    ${totalPriceUSD.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm py-4 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Transmitting Reservation...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 text-amber-200" />
                  <span>Confirm &amp; Secure Reservation</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-500 text-center leading-normal">
              No immediate card charge. Our executive travel director verifies permits and lodge availability before issuing formal deposit payment instructions.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
