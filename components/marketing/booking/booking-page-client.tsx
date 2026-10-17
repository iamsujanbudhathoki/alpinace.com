"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Calendar,
  Users,
  MapPin,
  Sparkles,
  Check,
  ArrowLeft,
  Loader2,
  Send,
  CheckCircle2,
  ChevronRight,
  Phone,
  Mail,
  Globe,
  Clock,
  Mountain,
  AlertCircle,
  Printer,
  ShieldCheck,
  CheckCheck,
  Minus,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Booking,
  BookingPackageType,
  BookingPaymentStatus,
  BookingPermitStatus,
  PackageAddonItem,
  BookingSelectedAddon,
  TripDepartureDate,
} from "@/lib/admin-data";
import { BookingFormValues } from "@/lib/admin-schemas";
import {
  BookingService,
  TrekService,
  TourService,
  ExpeditionService,
} from "@/lib/services/admin-service";
import { COUNTRY_OPTIONS } from "@/lib/country-list";
import {
  TurnstileWidget,
  TurnstileWidgetRef,
} from "@/components/ui/turnstile-widget";
import {
  GroupPricingTier,
  calculateApplicablePrice,
  getMaxGroupTravelers,
} from "@/lib/pricing-util";

export interface BookingTripDetails {
  id?: string;
  title: string;
  slug: string;
  region: string;
  durationDays: number;
  maxAltitudeMeters?: number;
  difficulty?: string;
  priceUSD: number;
  image?: string;
  categoryType: BookingPackageType;
  groupPricingEnabled?: boolean;
  groupPricing?: GroupPricingTier[];
  addons?: PackageAddonItem[];
  departureDates?: TripDepartureDate[];
}

export interface BookingPageClientProps {
  initialSlug?: string;
  initialType?: BookingPackageType | "trekking" | "tour" | "expedition";
  initialTrip?: BookingTripDetails | null;
}

export function BookingPageClient({
  initialSlug,
  initialType,
  initialTrip,
}: BookingPageClientProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryType = (initialType || searchParams.get("type") || "trekking") as string;
  const querySlug = initialSlug || searchParams.get("slug") || "";
  const queryTravelers = Number(searchParams.get("travelers")) || 2;
  const queryDate = searchParams.get("date") || "";
  const queryAddons = searchParams.get("addons") || "";

  const [loadingTrip, setLoadingTrip] = useState<boolean>(!initialTrip && Boolean(querySlug));
  const [trip, setTrip] = useState<BookingTripDetails | null>(initialTrip || null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Available packages for switching/fallback selection
  const [allPackages, setAllPackages] = useState<
    Array<{ slug: string; title: string; type: BookingPackageType }>
  >([]);

  // Form State
  const [travelers, setTravelers] = useState<number>(queryTravelers > 0 ? queryTravelers : 2);
  const [startDate, setStartDate] = useState<string>(queryDate);

  // Add-on quantities map: addonId -> quantity (0 = not selected)
  const [addonQuantities, setAddonQuantities] = useState<Record<string, number>>(() => {
    if (!queryAddons) return {};
    const map: Record<string, number> = {};
    queryAddons.split(",").filter(Boolean).forEach((id) => {
      map[id] = queryTravelers > 0 ? queryTravelers : 1;
    });
    return map;
  });

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [country, setCountry] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string | undefined>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Fetch package based on slug and type
  useEffect(() => {
    if (initialTrip) {
      setTrip(initialTrip);
      setLoadingTrip(false);
      return;
    }

    let isMounted = true;

    async function loadTargetTrip() {
      if (!querySlug) {
        setLoadingTrip(false);
        return;
      }

      setLoadingTrip(true);
      setLoadError(null);

      try {
        let pkgData: any = null;
        let packageType: BookingPackageType = BookingPackageType.TREKKING;

        if (queryType.toLowerCase().includes("tour")) {
          packageType = BookingPackageType.TOUR;
          pkgData = await TourService.getBySlug(querySlug);
        } else if (queryType.toLowerCase().includes("expedition")) {
          packageType = BookingPackageType.EXPEDITION;
          pkgData = await ExpeditionService.getBySlug(querySlug);
        } else {
          packageType = BookingPackageType.TREKKING;
          pkgData = await TrekService.getBySlug(querySlug);
        }

        if (!isMounted) return;

        if (pkgData) {
          setTrip({
            id: pkgData.id,
            title: pkgData.title,
            slug: pkgData.slug,
            region: pkgData.region,
            durationDays: pkgData.durationDays,
            maxAltitudeMeters: pkgData.maxAltitudeMeters,
            difficulty: pkgData.difficulty,
            priceUSD: pkgData.priceUSD,
            image: pkgData.image,
            categoryType: packageType,
            groupPricingEnabled: pkgData.groupPricingEnabled,
            groupPricing: pkgData.groupPricing,
            addons: pkgData.addons,
            departureDates: pkgData.departureDates,
          });

          // Set default start date if none provided
          if (!queryDate) {
            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + 30);
            setStartDate(nextDate.toISOString().split("T")[0]);
          }
        } else {
          setLoadError(`Unable to load package "${querySlug}". Please select an adventure below.`);
        }
      } catch (err) {
        console.error("Error loading trip for booking:", err);
        if (isMounted) {
          setLoadError("Could not retrieve package details. Please try again.");
        }
      } finally {
        if (isMounted) setLoadingTrip(false);
      }
    }

    loadTargetTrip();

    return () => {
      isMounted = false;
    };
  }, [querySlug, queryType, queryDate, initialTrip]);

  // Load package list for package changer or fallback
  useEffect(() => {
    async function loadAll() {
      try {
        const [treks, tours, exps] = await Promise.all([
          TrekService.getPublicAll().catch(() => []),
          TourService.getPublicAll().catch(() => []),
          ExpeditionService.getPublicAll().catch(() => []),
        ]);

        const combined = [
          ...treks.map((t) => ({ slug: t.slug, title: t.title, type: BookingPackageType.TREKKING })),
          ...tours.map((t) => ({ slug: t.slug, title: t.title, type: BookingPackageType.TOUR })),
          ...exps.map((e) => ({ slug: e.slug, title: e.title, type: BookingPackageType.EXPEDITION })),
        ];

        setAllPackages(combined);
      } catch {}
    }
    loadAll();
  }, []);

  // Return date calculated
  const endDate = useMemo(() => {
    if (!startDate || !trip) return "";
    const matchedSlot = trip.departureDates?.find((d) => d.startDate === startDate);
    if (matchedSlot?.endDate) return matchedSlot.endDate;
    const nights = Math.max(1, trip.durationDays) - 1;
    const d = new Date(startDate);
    if (isNaN(d.getTime())) return "";
    d.setDate(d.getDate() + nights);
    return d.toISOString().split("T")[0];
  }, [startDate, trip]);

  // Pricing calculations
  const pricingResult = useMemo(() => {
    if (!trip) return { pricePerPerson: 0, totalPrice: 0, applicableTier: null };
    return calculateApplicablePrice(trip, travelers);
  }, [trip, travelers]);

  const maxAllowedTravelers = useMemo(() => {
    if (!trip) return 20;
    return trip.groupPricingEnabled && trip.groupPricing && trip.groupPricing.length > 0
      ? getMaxGroupTravelers(trip, 20)
      : 20;
  }, [trip]);

  // Active addons configured on this package
  const activeAddons = useMemo(() => {
    if (!trip || !Array.isArray(trip.addons)) return [];
    return trip.addons.filter((a) => a.isActive !== false && a.title?.trim());
  }, [trip]);

  // Add-on selection handlers
  const handleToggleAddon = (addonId: string, defaultQty: number = travelers) => {
    setAddonQuantities((prev) => {
      const current = prev[addonId] || 0;
      if (current > 0) {
        const next = { ...prev };
        delete next[addonId];
        return next;
      } else {
        return { ...prev, [addonId]: Math.max(1, defaultQty) };
      }
    });
  };

  const handleSetAddonQty = (addonId: string, qty: number) => {
    setAddonQuantities((prev) => {
      if (qty <= 0) {
        const next = { ...prev };
        delete next[addonId];
        return next;
      }
      return { ...prev, [addonId]: qty };
    });
  };

  // Selected addons with calculated subtotals
  const selectedAddonsWithDetails = useMemo(() => {
    return activeAddons
      .map((addon) => {
        const qty = addonQuantities[addon.id] || 0;
        return {
          ...addon,
          quantity: qty,
          isSelected: qty > 0,
          subtotalUSD: addon.priceUSD * qty,
        };
      })
      .filter((a) => a.isSelected);
  }, [activeAddons, addonQuantities]);

  const addonsTotalUSD = useMemo(() => {
    return selectedAddonsWithDetails.reduce((sum, a) => sum + a.subtotalUSD, 0);
  }, [selectedAddonsWithDetails]);

  const unitCostPerPerson = pricingResult.pricePerPerson;
  const baseTripTotalUSD = pricingResult.totalPrice;
  const totalPriceUSD = baseTripTotalUSD + addonsTotalUSD;
  const depositUSD = useMemo(() => Math.round(totalPriceUSD * 0.25), [totalPriceUSD]);
  const balanceUSD = useMemo(() => Math.max(0, totalPriceUSD - depositUSD), [totalPriceUSD, depositUSD]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!guestName.trim()) errors.guestName = "Full name is required";
    if (!guestEmail.trim()) {
      errors.guestEmail = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) {
      errors.guestEmail = "Please enter a valid email address";
    }
    if (!guestPhone.trim()) errors.guestPhone = "Phone number / WhatsApp is required";
    if (!country.trim()) errors.country = "Country of residence is required";
    if (!startDate) {
      errors.startDate = "Departure date is required";
    } else if (startDate < todayStr) {
      errors.startDate = "Departure date cannot be in the past";
    }
    if (!agreedToTerms) {
      errors.agreedToTerms = "Please review and agree to the booking terms to proceed";
    }
    if (!trip) {
      errors.trip = "Please select a trip package to proceed with your booking";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!turnstileToken) {
      setErrorMessage("Please complete the security verification.");
      toast.error("Please complete the security verification.");
      return;
    }

    if (!trip) return;

    setIsSubmitting(true);
    try {
      const payload: BookingFormValues & { cfTurnstileToken?: string; addons?: BookingSelectedAddon[] } = {
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
        guestPhone: guestPhone.trim(),
        country: country.trim(),
        packageId: trip.id,
        packageSlug: trip.slug,
        packageName: trip.title,
        packageType: trip.categoryType,
        startDate,
        endDate,
        groupSize: travelers,
        totalAmountUSD: totalPriceUSD,
        paymentStatus: BookingPaymentStatus.PENDING,
        permitStatus: BookingPermitStatus.PROCESSING,
        specialRequests: specialRequests.trim(),
        addons: selectedAddonsWithDetails.map((a) => ({
          id: a.id,
          title: a.title,
          priceUSD: a.priceUSD,
          quantity: a.quantity,
        })),
        cfTurnstileToken: turnstileToken,
      };

      const res = await BookingService.create(payload);
      if (res.success && res.data) {
        toast.success(`Booking request received! (Ref: ${res.data.reference})`);
        setConfirmedBooking(res.data);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const msg = res.message || "Failed to submit booking request. Please try again.";
        setErrorMessage(msg);
        toast.error(msg);
        turnstileRef.current?.reset();
        setTurnstileToken("");
      }
    } catch (err: any) {
      console.error("Booking submission error:", err);
      const msg = err?.message || "An unexpected error occurred while processing your booking.";
      setErrorMessage(msg);
      toast.error(msg);
      turnstileRef.current?.reset();
      setTurnstileToken("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePackageSelect = (pkg: { slug: string; type: BookingPackageType }) => {
    const prefix =
      pkg.type === BookingPackageType.TOUR
        ? "tour"
        : pkg.type === BookingPackageType.EXPEDITION
        ? "expedition"
        : "trekking";
    router.push(`/book?type=${prefix}&slug=${pkg.slug}&travelers=${travelers}`);
  };

  // 1. CONFIRMATION RECEIPT VIEW
  if (confirmedBooking) {
    return (
      <div className="min-h-screen bg-stone-50/70 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
          {/* Header Card */}
          <div className="bg-white rounded-md border border-stone-200 p-6 sm:p-8 text-center shadow-xs space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 className="w-8 h-8" strokeWidth={2} />
            </div>
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-0.5 rounded-xs">
                <CheckCheck className="w-3.5 h-3.5" /> Reservation Request Received
              </span>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                Thank You, {confirmedBooking.guestName}!
              </h1>
              <p className="text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
                Your reservation request for{" "}
                <strong className="text-stone-900">{confirmedBooking.packageName}</strong> has been
                logged into our mountain operations system.
              </p>
            </div>
          </div>

          {/* Voucher Details Card */}
          <div className="bg-white rounded-md border border-stone-200 overflow-hidden shadow-xs">
            <div className="bg-stone-900 text-white px-6 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs uppercase font-semibold text-stone-400 block tracking-wider">
                  Booking Reference
                </span>
                <span className="font-mono text-xl sm:text-2xl font-bold text-white tracking-wider">
                  {confirmedBooking.reference}
                </span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs uppercase font-semibold text-stone-400 block tracking-wider">
                  Status
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-200 bg-emerald-900/80 px-2.5 py-1 rounded-xs border border-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Permits In Review
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-stone-200">
                <div>
                  <span className="text-stone-500 font-semibold block text-xs uppercase tracking-wider mb-1">
                    Lead Traveler
                  </span>
                  <div className="font-bold text-stone-900">{confirmedBooking.guestName}</div>
                  <div className="text-stone-600">{confirmedBooking.guestEmail}</div>
                  <div className="text-stone-600">{confirmedBooking.guestPhone}</div>
                  <div className="text-stone-600">{confirmedBooking.country}</div>
                </div>

                <div>
                  <span className="text-stone-500 font-semibold block text-xs uppercase tracking-wider mb-1">
                    Adventure Specs
                  </span>
                  <div className="font-bold text-stone-900">{confirmedBooking.packageName}</div>
                  <div className="text-stone-600">
                    {confirmedBooking.startDate} &rarr; {confirmedBooking.endDate}
                  </div>
                  <div className="text-stone-600 font-medium">
                    Group: {confirmedBooking.groupSize} {confirmedBooking.groupSize === 1 ? "Traveler" : "Travelers"}
                  </div>
                </div>
              </div>

              {/* Addons breakdown if any */}
              {confirmedBooking.addons && confirmedBooking.addons.length > 0 && (
                <div className="pb-6 border-b border-stone-200 space-y-2">
                  <span className="text-stone-500 font-semibold block text-xs uppercase tracking-wider">
                    Selected Add-ons &amp; Upgrades
                  </span>
                  <div className="space-y-1.5">
                    {confirmedBooking.addons.map((a: BookingSelectedAddon) => {
                      const qty = a.quantity !== undefined ? a.quantity : 1;
                      const itemTotal = a.priceUSD * qty;
                      return (
                        <div key={a.id} className="flex items-center justify-between text-stone-800">
                          <span>
                            • {a.title} {qty > 1 ? `(×${qty})` : ""}
                          </span>
                          <span className="font-semibold text-stone-900">
                            +US${itemTotal.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Price summary */}
              <div className="bg-stone-50 rounded-sm p-4 space-y-2 border border-stone-200">
                <div className="flex items-center justify-between text-stone-600">
                  <span>Total Estimated Trip Value:</span>
                  <span className="text-stone-900 font-bold text-base">
                    US${confirmedBooking.totalAmountUSD.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-stone-600 text-xs">
                  <span>25% Deposit (payable upon permit confirmation):</span>
                  <span className="text-stone-900 font-semibold">
                    US${Math.round(confirmedBooking.totalAmountUSD * 0.25).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-stone-500 text-[11px] pt-1.5 border-t border-stone-200">
                  <span>Payment status:</span>
                  <span className="font-semibold text-stone-700">
                    No Upfront Payment Required Today
                  </span>
                </div>
              </div>

              {/* Next Steps Road Map */}
              <div className="bg-stone-50 border border-stone-200 rounded-sm p-4.5 space-y-2.5">
                <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-700" /> What Happens Next?
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-stone-700 leading-relaxed font-normal">
                  <li>
                    <strong>Lodge &amp; Permit Verification:</strong> Our operations manager in Kathmandu verifies trail lodge allotments and government national park permits for your requested dates.
                  </li>
                  <li>
                    <strong>Confirmation Invoice:</strong> Within 12 business hours, you will receive an official booking packet and secure payment link for the 25% deposit.
                  </li>
                  <li>
                    <strong>Trip Preparation Dossier:</strong> Upon deposit confirmation, we send your full gear packing checklist, medical guidelines, and Sherpa leader bio.
                  </li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer transition-colors"
                >
                  <Printer className="w-4 h-4" /> Print / Save Voucher
                </button>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <Link
                    href={`/${queryType.toLowerCase().includes("tour") ? "tours" : queryType.toLowerCase().includes("expedition") ? "expeditions" : "trekking"}/${trip?.slug || ""}`}
                    className="w-full sm:w-auto text-center px-4 py-2.5 rounded-sm bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    View Trip Itinerary
                  </Link>
                  <Link
                    href="/"
                    className="w-full sm:w-auto text-center px-4 py-2.5 rounded-sm border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. LOADING STATE
  if (loadingTrip) {
    return (
      <div className="min-h-[60vh] bg-stone-50/50 flex flex-col items-center justify-center p-6 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
        <p className="text-sm font-medium text-stone-600">
          Loading reservation details for your adventure...
        </p>
      </div>
    );
  }

  // Back link URL
  const packageBackHref = trip
    ? `/${trip.categoryType === BookingPackageType.TOUR ? "tours" : trip.categoryType === BookingPackageType.EXPEDITION ? "expeditions" : "trekking"}/${trip.slug}`
    : "/trekking";

  return (
    <div className="min-h-screen bg-stone-50/60 pb-24 lg:pb-32">
      {/* Top Breadcrumb & Guarantee Bar */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <Link
              href={packageBackHref}
              className="inline-flex items-center gap-1.5 font-semibold text-stone-700 hover:text-stone-950 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to {trip?.title || "Trip"}</span>
            </Link>
            <span>/</span>
            <span className="text-stone-900 font-semibold">Reservation</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Guaranteed Departures &bull; No Payment Required Today</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        {/* Reservation Steps Indicator */}
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2 p-2.5 rounded-sm bg-white border border-stone-200 shadow-2xs">
            <span className="w-5 h-5 rounded-xs bg-emerald-50 text-emerald-800 font-bold flex items-center justify-center text-[11px] shrink-0 font-mono">1</span>
            <span className="font-semibold text-stone-800 truncate">Dates &amp; Group</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-sm bg-white border border-stone-200 shadow-2xs">
            <span className="w-5 h-5 rounded-xs bg-emerald-50 text-emerald-800 font-bold flex items-center justify-center text-[11px] shrink-0 font-mono">2</span>
            <span className="font-semibold text-stone-800 truncate">Lead Traveler</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-sm bg-white border border-stone-200 shadow-2xs">
            <span className="w-5 h-5 rounded-xs bg-emerald-50 text-emerald-800 font-bold flex items-center justify-center text-[11px] shrink-0 font-mono">3</span>
            <span className="font-semibold text-stone-800 truncate">Upgrades &amp; Add-ons</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-sm bg-white border border-stone-200 shadow-2xs">
            <span className="w-5 h-5 rounded-xs bg-emerald-50 text-emerald-800 font-bold flex items-center justify-center text-[11px] shrink-0 font-mono">4</span>
            <span className="font-semibold text-stone-800 truncate">Confirm &amp; Lock-in</span>
          </div>
        </div>

        {/* Page Heading */}
        <div className="mb-6 sm:mb-8 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 block">
            Online Reservation
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Reserve Your Himalayan Adventure
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
            Lock in your preferred dates, add-ons, and permits. Our operations desk verifies lodge room allocations and confirms within 12 business hours.
          </p>
        </div>

        {/* Missing Package / Load Error Warning */}
        {(!trip || loadError) && (
          <div className="p-4 rounded-sm bg-stone-100 border border-stone-200 mb-8 space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-stone-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-stone-900">
                  {loadError || "No trip package specified"}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Please choose a trekking route, luxury tour, or summit expedition from the list below to complete your booking.
                </p>
              </div>
            </div>

            {allPackages.length > 0 && (
              <div className="pt-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
                  Select Adventure Package:
                </label>
                <select
                  value={trip?.slug || ""}
                  onChange={(e) => {
                    const found = allPackages.find((p) => p.slug === e.target.value);
                    if (found) handlePackageSelect(found);
                  }}
                  className="w-full sm:max-w-md text-xs font-semibold px-3 py-2.5 rounded-sm border border-stone-300 bg-white text-stone-900 focus:outline-hidden focus:border-emerald-700"
                >
                  <option value="">-- Choose an Adventure --</option>
                  {allPackages.map((p) => (
                    <option key={`${p.type}-${p.slug}`} value={p.slug}>
                      [{p.type.toUpperCase()}] {p.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Main 2-Column Checkout Layout */}
        {trip && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Booking Form (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                {errorMessage && (
                  <div className="p-3.5 rounded-sm bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {pricingResult.error && (
                  <div className="p-3.5 rounded-sm bg-stone-100 border border-stone-300 text-xs font-semibold text-stone-800">
                    {pricingResult.error}
                  </div>
                )}

                {/* STEP 1: Dates & Travelers */}
                <div className="bg-white rounded-sm border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-xs bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-bold text-xs flex items-center justify-center font-mono">
                        1
                      </span>
                      <h3 className="font-heading text-base font-bold text-stone-900 tracking-tight">
                        Dates &amp; Group Size
                      </h3>
                    </div>
                    <span className="text-xs text-stone-500 font-medium bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-xs">
                      Duration: {trip.durationDays} Days
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Departure Date */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Departure Date <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        min={todayStr}
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          if (formErrors.startDate)
                            setFormErrors((prev) => ({ ...prev, startDate: undefined }));
                        }}
                        className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-sm border font-medium transition-all focus:outline-hidden ${
                          formErrors.startDate
                            ? "border-rose-400 bg-rose-50/30 text-rose-950 focus:border-rose-500"
                            : "border-stone-200 hover:border-stone-300 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700/20 bg-white text-stone-900"
                        }`}
                      />
                      {formErrors.startDate ? (
                        <p className="text-[11px] font-semibold text-rose-600 mt-1">
                          {formErrors.startDate}
                        </p>
                      ) : startDate ? (
                        <p className="text-[11px] text-stone-500 mt-1 font-medium">
                          Estimated Return: <strong className="text-stone-800">{endDate}</strong>
                        </p>
                      ) : null}
                    </div>

                    {/* Travelers Counter */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Number of Travelers <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          disabled={travelers <= 1}
                          onClick={() => {
                            const newCount = Math.max(1, travelers - 1);
                            setTravelers(newCount);
                          }}
                          className="w-10 h-10 flex items-center justify-center rounded-l-sm border border-stone-300 bg-stone-50 text-stone-800 font-bold hover:bg-stone-100 active:bg-stone-200 disabled:opacity-30 cursor-pointer transition-colors"
                        >
                          <Minus className="w-4 h-4" strokeWidth={2} />
                        </button>
                        <div className="flex-1 h-10 flex items-center justify-center border-y border-stone-300 bg-white text-xs sm:text-sm font-bold text-stone-900">
                          {travelers} {travelers === 1 ? "Traveler" : "Travelers"}
                        </div>
                        <button
                          type="button"
                          disabled={travelers >= maxAllowedTravelers}
                          onClick={() => {
                            const newCount = Math.min(maxAllowedTravelers, travelers + 1);
                            setTravelers(newCount);
                          }}
                          className="w-10 h-10 flex items-center justify-center rounded-r-sm border border-stone-300 bg-stone-50 text-stone-800 font-bold hover:bg-stone-100 active:bg-stone-200 disabled:opacity-30 cursor-pointer transition-colors"
                        >
                          <Plus className="w-4 h-4" strokeWidth={2} />
                        </button>
                      </div>
                      {trip.groupPricingEnabled && travelers >= maxAllowedTravelers && (
                        <p className="text-[11px] text-stone-500 font-medium mt-1">
                          Online limit: {maxAllowedTravelers} travelers. Contact us for larger groups.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Scheduled Departures Quick Selector (if present on package) */}
                  {trip.departureDates && trip.departureDates.length > 0 && (
                    <div className="pt-3 border-t border-stone-100 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                        Or Pick a Fixed Group Departure:
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {trip.departureDates.slice(0, 5).map((d) => (
                          <button
                            key={d.startDate}
                            type="button"
                            onClick={() => setStartDate(d.startDate)}
                            className={`px-3 py-1.5 rounded-sm border text-xs font-medium transition-colors cursor-pointer ${
                              startDate === d.startDate
                                ? "bg-emerald-800 text-white border-emerald-800"
                                : "bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400"
                            }`}
                          >
                            {d.startDate} &rarr; {d.endDate}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* STEP 2: Lead Traveler Details */}
                <div className="bg-white rounded-sm border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
                    <span className="w-6 h-6 rounded-xs bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-bold text-xs flex items-center justify-center font-mono">
                      2
                    </span>
                    <h3 className="font-heading text-base font-bold text-stone-900 tracking-tight">
                      Lead Traveler Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Marcus Vance"
                        value={guestName}
                        onChange={(e) => {
                          setGuestName(e.target.value);
                          if (formErrors.guestName)
                            setFormErrors((prev) => ({ ...prev, guestName: undefined }));
                        }}
                        className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-sm border font-medium transition-all focus:outline-hidden ${
                          formErrors.guestName
                            ? "border-rose-400 bg-rose-50/30 text-rose-950 focus:border-rose-500"
                            : "border-stone-200 hover:border-stone-300 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700/20 bg-white text-stone-900"
                        }`}
                      />
                      {formErrors.guestName && (
                        <p className="text-[11px] font-semibold text-rose-600 mt-1">
                          {formErrors.guestName}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="marcus@example.com"
                        value={guestEmail}
                        onChange={(e) => {
                          setGuestEmail(e.target.value);
                          if (formErrors.guestEmail)
                            setFormErrors((prev) => ({ ...prev, guestEmail: undefined }));
                        }}
                        className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-sm border font-medium transition-all focus:outline-hidden ${
                          formErrors.guestEmail
                            ? "border-rose-400 bg-rose-50/30 text-rose-950 focus:border-rose-500"
                            : "border-stone-200 hover:border-stone-300 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700/20 bg-white text-stone-900"
                        }`}
                      />
                      {formErrors.guestEmail && (
                        <p className="text-[11px] font-semibold text-rose-600 mt-1">
                          {formErrors.guestEmail}
                        </p>
                      )}
                    </div>

                    {/* Phone / WhatsApp */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Phone / WhatsApp <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 555-019-2834"
                        value={guestPhone}
                        onChange={(e) => {
                          setGuestPhone(e.target.value);
                          if (formErrors.guestPhone)
                            setFormErrors((prev) => ({ ...prev, guestPhone: undefined }));
                        }}
                        className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-sm border font-medium transition-all focus:outline-hidden ${
                          formErrors.guestPhone
                            ? "border-rose-400 bg-rose-50/30 text-rose-950 focus:border-rose-500"
                            : "border-stone-200 hover:border-stone-300 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700/20 bg-white text-stone-900"
                        }`}
                      />
                      {formErrors.guestPhone && (
                        <p className="text-[11px] font-semibold text-rose-600 mt-1">
                          {formErrors.guestPhone}
                        </p>
                      )}
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Country of Residence <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={country}
                        onChange={(e) => {
                          setCountry(e.target.value);
                          if (formErrors.country)
                            setFormErrors((prev) => ({ ...prev, country: undefined }));
                        }}
                        className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-sm border font-medium transition-all cursor-pointer focus:outline-hidden ${
                          formErrors.country
                            ? "border-rose-400 bg-rose-50/30 text-rose-950 focus:border-rose-500"
                            : "border-stone-200 hover:border-stone-300 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700/20 bg-white text-stone-900"
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
                        <p className="text-[11px] font-semibold text-rose-600 mt-1">
                          {formErrors.country}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* STEP 3: Add-ons & Optional Upgrades */}
                {activeAddons.length > 0 && (
                  <div className="bg-white rounded-sm border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-xs bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-bold text-xs flex items-center justify-center font-mono">
                          3
                        </span>
                        <div>
                          <h3 className="font-heading text-base font-bold text-stone-900 tracking-tight">
                            Add-ons &amp; Optional Upgrades
                          </h3>
                          <p className="text-xs text-stone-500">
                            Select individual upgrades and tailor quantities for your team.
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-xs">
                        {selectedAddonsWithDetails.length} Selected
                      </span>
                    </div>

                    <div className="space-y-3">
                      {activeAddons.map((addon) => {
                        const qty = addonQuantities[addon.id] || 0;
                        const isSelected = qty > 0;
                        const subtotal = addon.priceUSD * qty;

                        return (
                          <div
                            key={addon.id}
                            className={`rounded-sm border p-4 sm:p-5 transition-all ${
                              isSelected
                                ? "bg-emerald-50/25 border-emerald-700/70 shadow-2xs"
                                : "bg-white border-stone-200 hover:border-stone-300"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 min-w-0 pr-2">
                                <input
                                  type="checkbox"
                                  id={`addon-check-${addon.id}`}
                                  checked={isSelected}
                                  onChange={() => handleToggleAddon(addon.id, travelers)}
                                  className="w-4 h-4 mt-1 accent-emerald-700 rounded-xs cursor-pointer shrink-0"
                                />
                                <div className="space-y-1">
                                  <label
                                    htmlFor={`addon-check-${addon.id}`}
                                    className="font-bold text-stone-900 block text-xs sm:text-sm leading-snug cursor-pointer select-none"
                                  >
                                    {addon.title}
                                  </label>
                                  {addon.description && (
                                    <p className="text-stone-600 text-xs leading-relaxed font-normal">
                                      {addon.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="font-bold text-stone-900 block text-sm sm:text-base">
                                  US${addon.priceUSD.toLocaleString()}
                                </span>
                                <span className="text-[11px] text-stone-500 font-medium block">
                                  per person / unit
                                </span>
                              </div>
                            </div>

                            {/* When Selected: Interactive Quantity / Traveler Selector */}
                            {isSelected && (
                              <div className="mt-3.5 pt-3.5 border-t border-emerald-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/90 rounded-sm p-3">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <span className="text-xs font-semibold text-stone-700">Quantity:</span>
                                  <div className="flex items-center">
                                    <button
                                      type="button"
                                      onClick={() => handleSetAddonQty(addon.id, qty - 1)}
                                      className="w-7 h-7 rounded-l-sm border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800 flex items-center justify-center cursor-pointer transition-colors"
                                      title="Decrease quantity"
                                    >
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="w-10 h-7 flex items-center justify-center font-bold text-stone-900 text-xs bg-white border-y border-stone-300 font-mono">
                                      {qty}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleSetAddonQty(addon.id, qty + 1)}
                                      className="w-7 h-7 rounded-r-sm border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800 flex items-center justify-center cursor-pointer transition-colors"
                                      title="Increase quantity"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  {/* Quick Presets */}
                                  {travelers > 1 && (
                                    <div className="flex items-center gap-1.5 ml-1">
                                      <button
                                        type="button"
                                        onClick={() => handleSetAddonQty(addon.id, 1)}
                                        className={`text-[11px] px-2.5 py-1 rounded-sm border font-semibold transition-colors cursor-pointer ${
                                          qty === 1
                                            ? "bg-emerald-800 text-white border-emerald-800"
                                            : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                                        }`}
                                      >
                                        Solo (1)
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleSetAddonQty(addon.id, travelers)}
                                        className={`text-[11px] px-2.5 py-1 rounded-sm border font-semibold transition-colors cursor-pointer ${
                                          qty === travelers
                                            ? "bg-emerald-800 text-white border-emerald-800"
                                            : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                                        }`}
                                      >
                                        All {travelers} travelers
                                      </button>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-baseline justify-between sm:justify-end gap-2 text-xs">
                                  <span className="text-stone-500 font-medium">Add-on Subtotal:</span>
                                  <span className="font-bold text-emerald-800 text-sm">
                                    +US${subtotal.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 4: Special Requirements / Notes */}
                <div className="bg-white rounded-sm border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
                    <span className="w-6 h-6 rounded-xs bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-bold text-xs flex items-center justify-center font-mono">
                      {activeAddons.length > 0 ? "4" : "3"}
                    </span>
                    <h3 className="font-heading text-base font-bold text-stone-900 tracking-tight">
                      Special Requirements &amp; Notes
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Dietary preferences, room requests, or flight arrival notes{" "}
                      <span className="text-stone-400 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      placeholder="e.g. Vegetarian meals required, private twin room preference, arriving at Tribhuvan Airport on flight QR648..."
                      rows={3}
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="w-full text-xs sm:text-sm p-3 rounded-sm border border-stone-200 hover:border-stone-300 focus:outline-hidden focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700/20 bg-white text-stone-900 resize-none font-medium transition-all"
                    />
                  </div>
                </div>

                {/* Terms & Conditions Checkbox */}
                <div className="bg-white rounded-sm border border-stone-200 p-4.5 sm:p-5 space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer text-xs text-stone-700 font-medium select-none">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => {
                        setAgreedToTerms(e.target.checked);
                        if (formErrors.agreedToTerms)
                          setFormErrors((prev) => ({ ...prev, agreedToTerms: undefined }));
                      }}
                      className="w-4 h-4 mt-0.5 accent-emerald-700 rounded-xs cursor-pointer shrink-0"
                    />
                    <span className="leading-relaxed">
                      I understand that submitting this request secures my route permits and lodge room allocations. <strong className="text-stone-900 font-semibold">No payment is required today.</strong> A 25% deposit is due only after AlpineAce confirms all route allocations. Free cancellation is available up to 30 days prior to departure.
                    </span>
                  </label>
                  {formErrors.agreedToTerms && (
                    <p className="text-[11px] font-semibold text-rose-600 pl-7">
                      {formErrors.agreedToTerms}
                    </p>
                  )}
                </div>

                {/* Turnstile Security Widget */}
                <div className="bg-white rounded-sm border border-stone-200 p-4 flex justify-center">
                  <TurnstileWidget
                    ref={turnstileRef}
                    onVerify={(t) => setTurnstileToken(t)}
                    onExpire={() => setTurnstileToken("")}
                    onError={() => setTurnstileToken("")}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting || !turnstileToken || Boolean(pricingResult.error)}
                  className="w-full py-4 px-6 rounded-sm bg-emerald-700 hover:bg-emerald-800 text-white text-sm sm:text-base font-bold shadow-xs cursor-pointer transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      Processing Your Reservation...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Send className="w-4 h-4 text-white" />
                      Submit Reservation Request &bull; US${totalPriceUSD.toLocaleString()}
                    </span>
                  )}
                </Button>
              </form>
            </div>

            {/* RIGHT COLUMN: Sticky Order & Summary Card (5 Cols) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
              <div className="bg-white rounded-sm border border-stone-200 shadow-2xs overflow-hidden">
                {/* Trip Photo Preview */}
                {trip.image && (
                  <div className="relative h-44 sm:h-52 w-full bg-stone-100 overflow-hidden">
                    <Image
                      src={trip.image}
                      alt={trip.title}
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute top-3 left-3 bg-stone-900/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xs backdrop-blur-xs">
                      {trip.region}
                    </div>
                  </div>
                )}

                {/* Summary Details Content */}
                <div className="p-5 sm:p-6 space-y-5 text-xs">
                  {/* Trip Title & Meta Tags */}
                  <div className="space-y-2 pb-4 border-b border-stone-100">
                    <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                      {trip.categoryType} Expedition
                    </span>
                    <h2 className="font-heading text-lg sm:text-xl font-bold text-stone-900 leading-snug">
                      {trip.title}
                    </h2>
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <span className="bg-stone-100 border border-stone-200 text-stone-700 px-2 py-0.5 rounded-xs text-xs font-medium">
                        {trip.durationDays} Days Total
                      </span>
                      {trip.difficulty && (
                        <span className="bg-stone-100 border border-stone-200 text-stone-700 px-2 py-0.5 rounded-xs text-xs font-medium">
                          {trip.difficulty}
                        </span>
                      )}
                      {trip.maxAltitudeMeters ? (
                        <span className="bg-stone-100 border border-stone-200 text-stone-700 px-2 py-0.5 rounded-xs text-xs font-medium">
                          {trip.maxAltitudeMeters.toLocaleString()}m altitude
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Trip Specifications Grid */}
                  <div className="grid grid-cols-2 gap-3 pb-4 border-b border-stone-100">
                    <div>
                      <span className="text-stone-500 font-semibold block text-[11px] uppercase tracking-wider">
                        Departure Date
                      </span>
                      <span className="font-bold text-stone-900 text-sm">
                        {startDate || "Not selected"}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-500 font-semibold block text-[11px] uppercase tracking-wider">
                        Est. Return Date
                      </span>
                      <span className="font-bold text-stone-900 text-sm">
                        {endDate || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-500 font-semibold block text-[11px] uppercase tracking-wider">
                        Group Size
                      </span>
                      <span className="font-bold text-stone-900 text-sm">
                        {travelers} {travelers === 1 ? "Traveler" : "Travelers"}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-500 font-semibold block text-[11px] uppercase tracking-wider">
                        Permit Allocation
                      </span>
                      <span className="font-bold text-emerald-800 text-sm flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-700" /> Guaranteed Slot
                      </span>
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="space-y-3">
                    <span className="font-bold text-stone-900 text-xs uppercase tracking-wider block">
                      Price Breakdown
                    </span>

                    {/* Base Trip Rate */}
                    <div className="flex items-center justify-between text-stone-600 font-medium">
                      <div>
                        <span>Base Package Rate</span>
                        <span className="block text-[11px] text-stone-500">
                          {travelers} &times; US${unitCostPerPerson.toLocaleString()}
                        </span>
                      </div>
                      <span className="font-bold text-stone-900">
                        US${baseTripTotalUSD.toLocaleString()}
                      </span>
                    </div>

                    {/* Group Tier Badge if applied */}
                    {pricingResult.applicableTier && (
                      <div className="flex items-center justify-between text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-xs text-[11px] font-semibold">
                        <span>Group Tier Rate Applied</span>
                        <span>Saving vs Solo Rate</span>
                      </div>
                    )}

                    {/* Selected Add-ons itemized with quantities */}
                    {selectedAddonsWithDetails.length > 0 && (
                      <div className="pt-2 border-t border-dashed border-stone-200 space-y-1.5">
                        <span className="text-stone-500 font-semibold text-[11px] block">
                          Selected Upgrades &amp; Add-ons:
                        </span>
                        {selectedAddonsWithDetails.map((addon) => (
                          <div
                            key={addon.id}
                            className="flex items-center justify-between text-stone-700 text-xs"
                          >
                            <span className="truncate pr-2 font-medium">
                              • {addon.title} {addon.quantity > 1 ? `(×${addon.quantity})` : "(for 1)"}
                            </span>
                            <span className="font-semibold text-stone-900 shrink-0">
                              +US${addon.subtotalUSD.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Estimated Total */}
                    <div className="pt-3 border-t border-stone-200 flex items-baseline justify-between">
                      <span className="font-bold text-stone-900 text-sm sm:text-base">
                        Total Estimated Cost
                      </span>
                      <span className="font-heading font-extrabold text-stone-900 text-lg sm:text-xl text-emerald-800">
                        US${totalPriceUSD.toLocaleString()}
                      </span>
                    </div>

                    {/* Deposit info */}
                    <div className="bg-stone-50 rounded-sm p-3.5 space-y-1.5 border border-stone-200">
                      <div className="flex items-center justify-between text-stone-700 font-semibold">
                        <span>Due Today:</span>
                        <span className="text-emerald-800 font-bold">US$0.00</span>
                      </div>
                      <div className="flex items-center justify-between text-stone-600 text-[11px]">
                        <span>25% Deposit Upon Permit Approval:</span>
                        <span className="font-semibold text-stone-800">US${depositUSD.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-stone-500 text-[11px]">
                        <span>Remaining Balance in Nepal:</span>
                        <span>US${balanceUSD.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Trust badges list */}
                  <div className="pt-4 border-t border-stone-100 space-y-2 text-stone-600 font-medium text-[11px]">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>Zero cancellation fees up to 30 days prior</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>Government registered TAAN &amp; NMA licensed guides</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mountain className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>24/7 Satellite phone &amp; high-altitude emergency coverage</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
