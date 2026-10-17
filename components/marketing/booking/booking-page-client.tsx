"use client";

import {
  TurnstileWidget,
  TurnstileWidgetRef,
} from "@/components/ui/turnstile-widget";
import {
  Booking,
  BookingPackageType,
  BookingPaymentStatus,
  BookingPermitStatus,
  BookingSelectedAddon,
  PackageAddonItem,
  TripDepartureDate,
} from "@/lib/admin-data";
import { BookingFormValues } from "@/lib/admin-schemas";
import { COMMON_ADDON_PRESETS } from "@/lib/constants/package-presets";
import { COUNTRY_OPTIONS } from "@/lib/country-list";
import {
  GroupPricingTier,
  calculateApplicablePrice,
  getMaxGroupTravelers,
} from "@/lib/pricing-util";
import {
  BookingService,
  ExpeditionService,
  TourService,
  TrekService,
} from "@/lib/services/admin-service";
import { useSettings } from "@/lib/settings-context";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  Loader2,
  Minus,
  Plus,
  Printer,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

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
  const { settings } = useSettings();

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
  const [isNoteOpen, setIsNoteOpen] = useState(false);

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

  const hasGroupPricing = Boolean(
    trip?.groupPricingEnabled && trip?.groupPricing && trip.groupPricing.length > 0
  );

  const sortedTiers = useMemo(() => {
    if (!hasGroupPricing || !trip?.groupPricing) return null;
    return [...trip.groupPricing].sort(
      (a, b) => Number(a.minTravelers) - Number(b.minTravelers)
    );
  }, [hasGroupPricing, trip]);

  const maxAllowedTravelers = useMemo(() => {
    if (!trip) return 20;
    return trip.groupPricingEnabled && trip.groupPricing && trip.groupPricing.length > 0
      ? getMaxGroupTravelers(trip, 20)
      : 20;
  }, [trip]);

  // Active addons configured on this package, falling back to standard adventure add-ons
  const activeAddons = useMemo<PackageAddonItem[]>(() => {
    if (!trip) return [];
    if (Array.isArray(trip.addons) && trip.addons.length > 0) {
      const configured = trip.addons.filter((a) => a.isActive !== false && a.title?.trim());
      if (configured.length > 0) return configured;
    }
    return COMMON_ADDON_PRESETS.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      priceUSD: p.priceUSD,
      isActive: true,
    }));
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

    const scrollToEl = (el: Element | null) => {
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      if (el instanceof HTMLElement) el.focus({ preventScroll: true });
    };

    if (!validateForm()) {
      toast.error("Please fill in the highlighted fields.");
      // Wait for error state to render, then jump to the first invalid field
      setTimeout(() => scrollToEl(document.querySelector('[aria-invalid="true"]')), 50);
      return;
    }

    if (!turnstileToken) {
      toast.error("Please complete the verification.");
      scrollToEl(document.getElementById("booking-verify"));
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
      <div className="min-h-screen bg-[#fafaf8] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
          {/* Header Card */}
          <div className="bg-white rounded-md border border-stone-200 p-6 sm:p-8 text-center shadow-xs space-y-3">
            <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-900 border border-stone-200 flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 className="w-8 h-8 text-stone-900" strokeWidth={2} />
            </div>
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-800 bg-stone-100 border border-stone-200 px-3 py-1 rounded-md">
                <CheckCheck className="w-3.5 h-3.5 text-stone-700" /> Reservation Request Received
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
                <span className="text-xs font-medium text-stone-400 block">
                  Booking reference
                </span>
                <span className="font-mono text-xl sm:text-2xl font-bold text-white tracking-wider">
                  {confirmedBooking.reference}
                </span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs font-medium text-stone-400 block">
                  Status
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-200 bg-stone-800 px-2.5 py-1 rounded-md border border-stone-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Permits in review
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-stone-200">
                <div>
                  <span className="text-stone-500 font-medium block text-xs mb-1">
                    Lead traveler
                  </span>
                  <div className="font-bold text-stone-900">{confirmedBooking.guestName}</div>
                  <div className="text-stone-600">{confirmedBooking.guestEmail}</div>
                  <div className="text-stone-600">{confirmedBooking.guestPhone}</div>
                  <div className="text-stone-600">{confirmedBooking.country}</div>
                </div>

                <div>
                  <span className="text-stone-500 font-medium block text-xs mb-1">
                    Adventure details
                  </span>
                  <div className="font-bold text-stone-900">{confirmedBooking.packageName}</div>
                  <div className="text-stone-600">
                    {confirmedBooking.startDate} &rarr; {confirmedBooking.endDate}
                  </div>
                  <div className="text-stone-600 font-medium">
                    Party: {confirmedBooking.groupSize} {confirmedBooking.groupSize === 1 ? "Traveler" : "Travelers"}
                  </div>
                </div>
              </div>

              {/* Addons breakdown if any */}
              {confirmedBooking.addons && confirmedBooking.addons.length > 0 && (
                <div className="pb-6 border-b border-stone-200 space-y-2">
                  <span className="text-stone-500 font-medium block text-xs">
                    Selected add-ons
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
              <div className="bg-stone-50 rounded-md p-4 space-y-2 border border-stone-200">
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
                    Pending Confirmation
                  </span>
                </div>
              </div>

              {/* Next Steps Road Map */}
              <div className="bg-stone-50 border border-stone-200 rounded-md p-4.5 space-y-2.5">
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-stone-700" /> What happens next?
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
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer transition-colors"
                >
                  <Printer className="w-4 h-4" /> Print / Save Voucher
                </button>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <Link
                    href={`/${queryType.toLowerCase().includes("tour") ? "tours" : queryType.toLowerCase().includes("expedition") ? "expeditions" : "trekking"}/${trip?.slug || ""}`}
                    className="w-full sm:w-auto text-center px-4 py-2.5 rounded-md bg-stone-900 hover:bg-black text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    View Trip Itinerary
                  </Link>
                  <Link
                    href="/"
                    className="w-full sm:w-auto text-center px-4 py-2.5 rounded-md border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
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
      <div className="min-h-[70vh] bg-[#fafaf8] flex flex-col items-center justify-center p-6 gap-3 pt-20">
        <Loader2 className="w-7 h-7 animate-spin text-stone-700" />
        <p className="text-sm text-stone-500">Loading…</p>
      </div>
    );
  }

  // Back link URL
  const packageBackHref = trip
    ? `/${trip.categoryType === BookingPackageType.TOUR ? "tours" : trip.categoryType === BookingPackageType.EXPEDITION ? "expeditions" : "trekking"}/${trip.slug}`
    : "/trekking";

  const formatDate = (value: string) => {
    if (!value) return "";
    const d = new Date(`${value}T00:00:00`);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const fieldClass = (hasError?: boolean) =>
    `w-full h-11 text-sm px-3.5 rounded-md border bg-white text-stone-900 placeholder:text-stone-400 transition-colors focus:outline-hidden ${
      hasError
        ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15"
        : "border-stone-300 hover:border-stone-400 focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
    }`;

  const labelClass = "block text-sm font-medium text-stone-800 mb-1.5";
  const errorClass = "text-xs text-rose-600 mt-1.5";
  const sectionTitleClass = "font-heading text-lg font-bold text-stone-900";

  return (
    <div className="min-h-screen bg-[#fafaf8] pb-28 lg:pb-20">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link
            href={packageBackHref}
            className="inline-flex items-center gap-1.5 px-3 py-2 -ml-3 rounded-md hover:bg-stone-100 text-stone-800 font-medium text-sm transition-colors group shrink-0"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </Link>

          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Image
              src={settings.siteLogo || "/logo.jpg"}
              alt={settings.siteName || "Alpine Ace"}
              width={36}
              height={36}
              className="h-8 w-8 sm:h-9 sm:w-9 object-cover rounded-md border border-stone-200 bg-white"
            />
            <span className="font-heading font-bold text-base sm:text-lg text-stone-900 tracking-tight hidden sm:inline">
              {settings.siteName || "Alpine Ace"}
            </span>
          </Link>

          <a
            href={`https://wa.me/${(settings.whatsappNumber || "9779764398491").replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
            className="inline-flex items-center gap-1.5 px-3 py-2 -mr-3 rounded-md hover:bg-stone-100 text-stone-800 font-medium text-sm transition-colors shrink-0"
          >
            <svg className="w-4 h-4 fill-emerald-600 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.205 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        {/* Missing package */}
        {(!trip || loadError) && (
          <div className="max-w-xl bg-white rounded-lg border border-stone-200 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-stone-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h1 className="font-heading text-lg font-bold text-stone-900">
                  {loadError || "No trip selected"}
                </h1>
                <p className="text-sm text-stone-600">Choose a trip to continue.</p>
              </div>
            </div>

            {allPackages.length > 0 && (
              <select
                value={trip?.slug || ""}
                onChange={(e) => {
                  const found = allPackages.find((p) => p.slug === e.target.value);
                  if (found) handlePackageSelect(found);
                }}
                className={fieldClass()}
              >
                <option value="">Choose a trip</option>
                {allPackages.map((p) => (
                  <option key={`${p.type}-${p.slug}`} value={p.slug}>
                    {p.title}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {trip && (
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* LEFT: Form */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h1 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                    {trip.title}
                  </h1>
                  <p className="text-sm text-stone-500 mt-1.5">
                    {trip.durationDays} days
                    {trip.region ? ` · ${trip.region}` : ""}
                    {trip.difficulty ? ` · ${trip.difficulty}` : ""}
                  </p>
                </div>

                {(errorMessage || pricingResult.error) && (
                  <div className="p-3.5 rounded-md bg-rose-50 border border-rose-200 text-sm text-rose-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>{errorMessage || pricingResult.error}</span>
                  </div>
                )}

                <div className="bg-white rounded-lg border border-stone-200 divide-y divide-stone-100">
                  {/* Trip */}
                  <section className="p-5 sm:p-7 space-y-5">
                    <h2 className={sectionTitleClass}>Trip</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="booking-date" className={labelClass}>
                          Departure date
                        </label>
                        <input
                          id="booking-date"
                          type="date"
                          min={todayStr}
                          value={startDate}
                          aria-invalid={Boolean(formErrors.startDate)}
                          onChange={(e) => {
                            setStartDate(e.target.value);
                            if (formErrors.startDate)
                              setFormErrors((prev) => ({ ...prev, startDate: undefined }));
                          }}
                          className={fieldClass(Boolean(formErrors.startDate))}
                        />
                        {formErrors.startDate ? (
                          <p className={errorClass}>{formErrors.startDate}</p>
                        ) : endDate ? (
                          <p className="text-xs text-stone-500 mt-1.5">
                            Back on {formatDate(endDate)}
                          </p>
                        ) : null}
                      </div>

                      <div>
                        <span className={labelClass}>Travelers</span>
                        <div className="flex items-center h-11 rounded-md border border-stone-300 bg-white overflow-hidden">
                          <button
                            type="button"
                            aria-label="Remove a traveler"
                            disabled={travelers <= 1}
                            onClick={() => setTravelers(Math.max(1, travelers - 1))}
                            className="w-11 h-full flex items-center justify-center text-stone-700 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="flex-1 text-center text-sm font-semibold text-stone-900">
                            {travelers}
                          </span>
                          <button
                            type="button"
                            aria-label="Add a traveler"
                            disabled={travelers >= maxAllowedTravelers}
                            onClick={() => setTravelers(Math.min(maxAllowedTravelers, travelers + 1))}
                            className="w-11 h-full flex items-center justify-center text-stone-700 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Group prices: compact, clickable */}
                    {sortedTiers && sortedTiers.length > 1 && (
                      <div>
                        <span className="block text-xs font-medium text-stone-500 mb-2">
                          Group price per person
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {sortedTiers.map((tier, idx) => {
                            const min = Number(tier.minTravelers);
                            const max = Number(tier.maxTravelers);
                            const isActive = travelers >= min && travelers <= max;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setTravelers(min)}
                                className={`px-3 py-1.5 rounded-full border text-xs transition-colors cursor-pointer ${
                                  isActive
                                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold"
                                    : "border-stone-200 text-stone-600 hover:border-stone-400"
                                }`}
                              >
                                {min === max ? `${min}` : `${min}–${max}`} people · US$
                                {Number(tier.pricePerPerson).toLocaleString()}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </section>

                  {/* Your details */}
                  <section className="p-5 sm:p-7 space-y-5">
                    <h2 className={sectionTitleClass}>Your details</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="sm:col-span-2">
                        <label htmlFor="booking-name" className={labelClass}>
                          Full name
                        </label>
                        <input
                          id="booking-name"
                          type="text"
                          name="name"
                          autoComplete="name"
                          value={guestName}
                          aria-invalid={Boolean(formErrors.guestName)}
                          onChange={(e) => {
                            setGuestName(e.target.value);
                            if (formErrors.guestName)
                              setFormErrors((prev) => ({ ...prev, guestName: undefined }));
                          }}
                          className={fieldClass(Boolean(formErrors.guestName))}
                        />
                        {formErrors.guestName && <p className={errorClass}>{formErrors.guestName}</p>}
                      </div>

                      <div>
                        <label htmlFor="booking-email" className={labelClass}>
                          Email
                        </label>
                        <input
                          id="booking-email"
                          type="email"
                          name="email"
                          autoComplete="email"
                          inputMode="email"
                          value={guestEmail}
                          aria-invalid={Boolean(formErrors.guestEmail)}
                          onChange={(e) => {
                            setGuestEmail(e.target.value);
                            if (formErrors.guestEmail)
                              setFormErrors((prev) => ({ ...prev, guestEmail: undefined }));
                          }}
                          className={fieldClass(Boolean(formErrors.guestEmail))}
                        />
                        {formErrors.guestEmail && <p className={errorClass}>{formErrors.guestEmail}</p>}
                      </div>

                      <div>
                        <label htmlFor="booking-phone" className={labelClass}>
                          Phone / WhatsApp
                        </label>
                        <input
                          id="booking-phone"
                          type="tel"
                          name="tel"
                          autoComplete="tel"
                          inputMode="tel"
                          value={guestPhone}
                          aria-invalid={Boolean(formErrors.guestPhone)}
                          onChange={(e) => {
                            setGuestPhone(e.target.value);
                            if (formErrors.guestPhone)
                              setFormErrors((prev) => ({ ...prev, guestPhone: undefined }));
                          }}
                          className={fieldClass(Boolean(formErrors.guestPhone))}
                        />
                        {formErrors.guestPhone && <p className={errorClass}>{formErrors.guestPhone}</p>}
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="booking-country" className={labelClass}>
                          Country
                        </label>
                        <select
                          id="booking-country"
                          name="country"
                          autoComplete="country-name"
                          value={country}
                          aria-invalid={Boolean(formErrors.country)}
                          onChange={(e) => {
                            setCountry(e.target.value);
                            if (formErrors.country)
                              setFormErrors((prev) => ({ ...prev, country: undefined }));
                          }}
                          className={`${fieldClass(Boolean(formErrors.country))} cursor-pointer`}
                        >
                          <option value="">Select</option>
                          {COUNTRY_OPTIONS.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                        {formErrors.country && <p className={errorClass}>{formErrors.country}</p>}
                      </div>
                    </div>

                    {/* Note: hidden behind a link until needed */}
                    {isNoteOpen || specialRequests ? (
                      <div>
                        <label htmlFor="booking-note" className={labelClass}>
                          Note <span className="text-stone-400 font-normal">(optional)</span>
                        </label>
                        <textarea
                          id="booking-note"
                          rows={3}
                          autoFocus={isNoteOpen && !specialRequests}
                          placeholder="Dietary needs, room preference, arrival flight…"
                          value={specialRequests}
                          onChange={(e) => setSpecialRequests(e.target.value)}
                          className="w-full text-sm p-3.5 rounded-md border border-stone-300 hover:border-stone-400 focus:outline-hidden focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 bg-white text-stone-900 placeholder:text-stone-400 resize-none transition-colors"
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsNoteOpen(true)}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 cursor-pointer transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add a note
                      </button>
                    )}
                  </section>

                  {/* Add-ons */}
                  {activeAddons.length > 0 && (
                    <section className="p-5 sm:p-7 space-y-4">
                      <div className="flex items-baseline justify-between gap-3">
                        <h2 className={sectionTitleClass}>Add-ons</h2>
                        <span className="text-xs text-stone-500">Optional</span>
                      </div>

                      <div className="space-y-2.5">
                        {activeAddons.map((addon) => {
                          const qty = addonQuantities[addon.id] || 0;
                          const isSelected = qty > 0;

                          return (
                            <div
                              key={addon.id}
                              className={`rounded-md border transition-colors ${
                                isSelected
                                  ? "border-emerald-600 bg-emerald-50/40"
                                  : "border-stone-200 hover:border-stone-300"
                              }`}
                            >
                              <div className="flex items-start gap-3 p-4">
                                <button
                                  type="button"
                                  role="checkbox"
                                  aria-checked={isSelected}
                                  onClick={() => handleToggleAddon(addon.id, travelers)}
                                  className="flex-1 flex items-start gap-3 text-left cursor-pointer min-w-0"
                                >
                                  <span
                                    className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                      isSelected
                                        ? "bg-emerald-600 border-emerald-600 text-white"
                                        : "border-stone-300 bg-white"
                                    }`}
                                  >
                                    {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block text-sm font-semibold text-stone-900">
                                      {addon.title}
                                    </span>
                                    {addon.description && (
                                      <span className="block text-xs text-stone-500 mt-0.5 leading-relaxed">
                                        {addon.description}
                                      </span>
                                    )}
                                  </span>
                                </button>

                                <div className="flex flex-col items-end gap-2 shrink-0">
                                  <span className="text-sm font-semibold text-stone-900">
                                    US${addon.priceUSD.toLocaleString()}
                                    <span className="text-xs font-normal text-stone-500"> each</span>
                                  </span>
                                  {isSelected && (
                                    <div className="flex items-center h-8 rounded-md border border-stone-300 bg-white overflow-hidden">
                                      <button
                                        type="button"
                                        aria-label={`Fewer ${addon.title}`}
                                        onClick={() => handleSetAddonQty(addon.id, qty - 1)}
                                        className="w-8 h-full flex items-center justify-center text-stone-700 hover:bg-stone-50 cursor-pointer"
                                      >
                                        <Minus className="w-3.5 h-3.5" />
                                      </button>
                                      <span className="w-8 text-center text-sm font-semibold text-stone-900">
                                        {qty}
                                      </span>
                                      <button
                                        type="button"
                                        aria-label={`More ${addon.title}`}
                                        onClick={() => handleSetAddonQty(addon.id, qty + 1)}
                                        className="w-8 h-full flex items-center justify-center text-stone-700 hover:bg-stone-50 cursor-pointer"
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}
                </div>
              </div>

              {/* RIGHT: Summary */}
              <aside className="lg:col-span-5 lg:sticky lg:top-24">
                <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
                  {trip.image && (
                    <div className="relative h-40 w-full bg-stone-100 hidden lg:block">
                      <Image src={trip.image} alt={trip.title} fill className="object-cover" priority />
                    </div>
                  )}

                  <div className="p-5 sm:p-6 space-y-5">
                    {/* Dates & travelers */}
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <dt className="text-xs text-stone-500">Dates</dt>
                        <dd className="font-medium text-stone-900 mt-0.5">
                          {startDate ? (
                            <>
                              {formatDate(startDate)}
                              {endDate && endDate !== startDate && (
                                <span className="block text-stone-500 font-normal">
                                  to {formatDate(endDate)}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-stone-400">Not set</span>
                          )}
                        </dd>
                      </div>
                      <div className="text-right">
                        <dt className="text-xs text-stone-500">Travelers</dt>
                        <dd className="font-medium text-stone-900 mt-0.5">{travelers}</dd>
                      </div>
                    </dl>

                    {/* Price */}
                    <div className="pt-5 border-t border-stone-100 space-y-2.5 text-sm">
                      <div className="flex items-center justify-between text-stone-600">
                        <span>
                          US${unitCostPerPerson.toLocaleString()} × {travelers}
                        </span>
                        <span className="text-stone-900">US${baseTripTotalUSD.toLocaleString()}</span>
                      </div>
                      {selectedAddonsWithDetails.map((addon) => (
                        <div key={addon.id} className="flex items-center justify-between text-stone-600">
                          <span className="truncate pr-3">
                            {addon.title}
                            {addon.quantity > 1 ? ` × ${addon.quantity}` : ""}
                          </span>
                          <span className="text-stone-900 shrink-0">
                            US${addon.subtotalUSD.toLocaleString()}
                          </span>
                        </div>
                      ))}

                      <div className="pt-3 mt-1 border-t border-stone-100 flex items-baseline justify-between">
                        <span className="font-semibold text-stone-900">Total</span>
                        <span className="font-heading text-2xl font-bold text-stone-900">
                          US${totalPriceUSD.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500">
                        25% deposit (US${depositUSD.toLocaleString()}) after we confirm your dates.
                      </p>
                    </div>

                    {/* Terms + verification + button, all together */}
                    <div className="pt-5 border-t border-stone-100 space-y-4">
                      <div>
                        <label className="flex items-start gap-2.5 cursor-pointer text-sm text-stone-700 select-none">
                          <input
                            id="booking-terms"
                            type="checkbox"
                            checked={agreedToTerms}
                            aria-invalid={Boolean(formErrors.agreedToTerms)}
                            onChange={(e) => {
                              setAgreedToTerms(e.target.checked);
                              if (formErrors.agreedToTerms)
                                setFormErrors((prev) => ({ ...prev, agreedToTerms: undefined }));
                            }}
                            className="w-4 h-4 mt-0.5 accent-emerald-600 cursor-pointer shrink-0"
                          />
                          <span>I agree to the booking and cancellation terms.</span>
                        </label>
                        {formErrors.agreedToTerms && (
                          <p className={`${errorClass} pl-6.5`}>{formErrors.agreedToTerms}</p>
                        )}
                      </div>

                      <div id="booking-verify" className="flex justify-center">
                        <TurnstileWidget
                          ref={turnstileRef}
                          onVerify={(t) => setTurnstileToken(t)}
                          onExpire={() => setTurnstileToken("")}
                          onError={() => setTurnstileToken("")}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || Boolean(pricingResult.error)}
                        className="group w-full h-12 px-5 rounded-md bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:ring-offset-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Confirming…</span>
                          </>
                        ) : (
                          <>
                            <span>Confirm Reservation</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </aside>
            </div>

            {/* Mobile sticky bar */}
            <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-stone-200 px-4 py-3 flex items-center justify-between gap-4 print:hidden">
              <div className="min-w-0">
                <span className="block text-xs text-stone-500">Total</span>
                <span className="block font-heading text-lg font-bold text-stone-900 leading-tight">
                  US${totalPriceUSD.toLocaleString()}
                </span>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || Boolean(pricingResult.error)}
                className="h-11 px-5 rounded-md bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>{isSubmitting ? "Confirming…" : "Confirm Reservation"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
