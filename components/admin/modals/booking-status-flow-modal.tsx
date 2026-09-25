"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Booking,
  BookingStatus,
  BookingPaymentStatus,
  BookingPermitStatus,
  BookingPackageType,
} from "@/lib/admin-data";
import { BookingService } from "@/lib/services/admin-service";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  Flag,
  ArrowRight,
  ArrowLeft,
  Calendar,
  User,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Info,
  Check,
  XCircle,
  Award,
} from "lucide-react";

interface StatusPhaseConfig {
  status: BookingStatus;
  stepNumber: number;
  label: string;
  badgeLabel: string;
  shortDesc: string;
  title: string;
  message: string;
  checklist: string[];
  recommendedAction: string;
  accentBorder: string;
  accentBg: string;
  accentText: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PHASES: StatusPhaseConfig[] = [
  {
    status: BookingStatus.PENDING,
    stepNumber: 1,
    label: "Pending",
    badgeLabel: "Pending",
    shortDesc: "Request Received",
    title: "Phase 1: Booking Request Received",
    message:
      "A new booking request has been submitted by the guest. Initial verification of route dates, group capacity, and seasonal readiness is required before detailed logistics vetting.",
    checklist: [
      "Review client travel dates and seasonal weather window feasibility",
      "Verify group size, requested accommodation style, and special preferences",
      "Perform preliminary check of domestic flight quotas (e.g. Lukla / Pokhara)",
      "Reach out to guest if contact details or custom requests need clarification",
    ],
    recommendedAction: "Verify initial details and move to In Review to commence operations vetting.",
    accentBorder: "border-slate-300",
    accentBg: "bg-slate-50",
    accentText: "text-slate-800",
    icon: Clock,
  },
  {
    status: BookingStatus.IN_REVIEW,
    stepNumber: 2,
    label: "In Review",
    badgeLabel: "In Review",
    shortDesc: "Operations Vetting",
    title: "Phase 2: Operational Review & Vetting",
    message:
      "Operations team is checking guide availability, TIMS/national park permit lead times, and teahouse/camp logistics. Guest communication regarding required paperwork is underway.",
    checklist: [
      "Collect traveler passport scans and insurance policy details (high-altitude coverage)",
      "Verify mountain guide & porter allocation for the requested dates",
      "Lock down preliminary tea-house or campsite reservations along the trail",
      "Send bank transfer invoice or online payment link for booking deposit",
    ],
    recommendedAction: "Once the deposit is received and logistics are vetted, advance to Confirmed.",
    accentBorder: "border-amber-300",
    accentBg: "bg-amber-50/60",
    accentText: "text-amber-900",
    icon: FileCheck2,
  },
  {
    status: BookingStatus.CONFIRMED,
    stepNumber: 3,
    label: "Confirmed",
    badgeLabel: "Confirmed",
    shortDesc: "Guaranteed & Secured",
    title: "Phase 3: Booking Confirmed & Secured",
    message:
      "Booking is officially confirmed and locked in the master calendar. Advance payment is secured, permits are actively issued by the liaison office, and pre-departure packs are sent.",
    checklist: [
      "Verify booking deposit or full payment has cleared in finance ledger",
      "Issue official TIMS cards and National Park / Conservation Area entry permits",
      "Transmit equipment packing list, flight arrival logistics, and hotel vouchers to guest",
      "Schedule pre-departure welcome briefing in Kathmandu prior to day 1",
    ],
    recommendedAction: "When the group arrives in Nepal and the itinerary begins, transition to Active.",
    accentBorder: "border-emerald-300",
    accentBg: "bg-emerald-50/60",
    accentText: "text-emerald-900",
    icon: ShieldCheck,
  },
  {
    status: BookingStatus.ACTIVE,
    stepNumber: 4,
    label: "Active",
    badgeLabel: "Active (On Trip)",
    shortDesc: "Trip in Progress",
    title: "Phase 4: Trip in Progress on the Mountain",
    message:
      "The trek, tour, or expedition is actively underway! Guides and travelers are on the route. Field operations team monitors daily check-ins, weather advisories, and route progress.",
    checklist: [
      "Maintain daily route and health check-ins with lead mountain guide",
      "Monitor high-altitude acclimatization milestones and weather telemetry",
      "Coordinate trail logistical adjustments in case of flight or route disruptions",
      "Collect remaining balance payment in Kathmandu if not prepaid",
    ],
    recommendedAction: "When the group successfully finishes the itinerary and returns, mark Completed.",
    accentBorder: "border-teal-300",
    accentBg: "bg-teal-50/60",
    accentText: "text-teal-900",
    icon: Compass,
  },
  {
    status: BookingStatus.COMPLETED,
    stepNumber: 5,
    label: "Completed",
    badgeLabel: "Completed",
    shortDesc: "Trip Concluded",
    title: "Phase 5: Trip Concluded Successfully",
    message:
      "The journey has concluded successfully! All scheduled services and excursions have been fulfilled. Post-trip celebrations, debriefing, feedback collection, and archival are finalized.",
    checklist: [
      "Conduct post-trek debrief with guide and collect mountain expense receipts",
      "Present travelers with Alpine Ace Trekking Achievement Certificates",
      "Invite travelers to leave an online review and share photos/stories",
      "Reconcile final accounting records and archive booking file",
    ],
    recommendedAction: "All lifecycle phases are fulfilled. This booking is in its terminal completion state.",
    accentBorder: "border-blue-300",
    accentBg: "bg-blue-50/60",
    accentText: "text-blue-900",
    icon: Award,
  },
];

interface BookingStatusFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onStatusUpdated?: (updatedBooking: Booking) => void;
}

export function BookingStatusFlowModal({
  isOpen,
  onClose,
  booking,
  onStatusUpdated,
}: BookingStatusFlowModalProps) {
  // Find current phase index from booking's status
  const initialPhaseIndex = useMemo(() => {
    if (!booking) return 0;
    const idx = PHASES.findIndex((p) => p.status === booking.bookingStatus);
    return idx >= 0 ? idx : 0;
  }, [booking]);

  const [activeStepIndex, setActiveStepIndex] = useState<number>(initialPhaseIndex);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [showCancelPrompt, setShowCancelPrompt] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>("");

  // Sync step index when booking changes or modal opens
  useEffect(() => {
    if (isOpen && booking) {
      const idx = PHASES.findIndex((p) => p.status === booking.bookingStatus);
      setActiveStepIndex(idx >= 0 ? idx : 0);
      setShowCancelPrompt(false);
      setCancelReason("");
    }
  }, [isOpen, booking]);

  if (!booking) return null;

  const currentBookingPhaseIndex = PHASES.findIndex(
    (p) => p.status === booking.bookingStatus
  );
  const isCancelled = booking.bookingStatus === BookingStatus.CANCELLED;
  const currentViewedPhase = PHASES[activeStepIndex];

  // Transition handler
  const handleApplyStatus = async (targetStatus: BookingStatus) => {
    if (!booking || isUpdating) return;
    setIsUpdating(true);
    try {
      const res = await BookingService.update(booking.id, {
        bookingStatus: targetStatus,
      });

      if (res.success && res.data) {
        toast.success(`Booking status changed to "${targetStatus.replace("_", " ")}"`);
        onStatusUpdated?.(res.data);
        const newIdx = PHASES.findIndex((p) => p.status === targetStatus);
        if (newIdx >= 0) {
          setActiveStepIndex(newIdx);
        }
      } else {
        toast.error(res.message || "Failed to update booking status");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update booking status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNextPhase = async () => {
    if (activeStepIndex < PHASES.length - 1) {
      const nextIndex = activeStepIndex + 1;
      setActiveStepIndex(nextIndex);
    }
  };

  const handlePrevPhase = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex((prev) => prev - 1);
    }
  };

  const handleConfirmCancel = async () => {
    if (!booking || isUpdating) return;
    setIsUpdating(true);
    try {
      const payload: any = { bookingStatus: BookingStatus.CANCELLED };
      if (cancelReason.trim()) {
        payload.specialRequests = booking.specialRequests
          ? `${booking.specialRequests}\n[Cancellation Note]: ${cancelReason.trim()}`
          : `[Cancellation Note]: ${cancelReason.trim()}`;
      }
      const res = await BookingService.update(booking.id, payload);
      if (res.success && res.data) {
        toast.success("Booking marked as Cancelled");
        onStatusUpdated?.(res.data);
        setShowCancelPrompt(false);
        onClose();
      } else {
        toast.error(res.message || "Failed to cancel booking");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel booking");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReactivate = async () => {
    await handleApplyStatus(BookingStatus.PENDING);
  };

  // Subheader: Workflow Pipeline Stepper
  const subHeader = (
    <div className="bg-slate-50/80 border-b border-slate-200 px-6 py-4">
      {/* Visual Stepper Tracker */}
      <div className="relative">
        {/* Connecting track line */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />

        <div className="relative z-10 flex items-center justify-between">
          {PHASES.map((phase, idx) => {
            const isCompletedBefore =
              !isCancelled &&
              currentBookingPhaseIndex >= 0 &&
              idx < currentBookingPhaseIndex;
            const isCurrentBookingStatus =
              !isCancelled && booking.bookingStatus === phase.status;
            const isSelected = activeStepIndex === idx;

            let circleClass =
              "bg-white border-2 border-slate-300 text-slate-500 hover:border-slate-400";
            if (isCompletedBefore) {
              circleClass = "bg-emerald-600 border-2 border-emerald-600 text-white";
            } else if (isCurrentBookingStatus) {
              circleClass = "bg-slate-900 border-2 border-slate-900 text-white shadow-sm ring-4 ring-slate-900/10";
            } else if (isSelected) {
              circleClass = "bg-emerald-50 border-2 border-emerald-600 text-emerald-700 shadow-sm ring-4 ring-emerald-600/15";
            }

            return (
              <button
                key={phase.status}
                type="button"
                onClick={() => setActiveStepIndex(idx)}
                className="group flex flex-col items-center focus:outline-none cursor-pointer"
                title={`Click to view ${phase.label} details`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-150 ${circleClass}`}
                >
                  {isCompletedBefore ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <span>{phase.stepNumber}</span>
                  )}
                </div>

                <div className="mt-1.5 flex flex-col items-center">
                  <span
                    className={`text-xs font-semibold whitespace-nowrap transition-colors ${
                      isSelected
                        ? "text-slate-900 font-bold"
                        : isCurrentBookingStatus
                        ? "text-slate-900"
                        : "text-slate-600 group-hover:text-slate-900"
                    }`}
                  >
                    {phase.label}
                  </span>
                  {isCurrentBookingStatus && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.2 rounded-full mt-0.5">
                      Current
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Footer Actions
  const isViewingCurrent = currentViewedPhase.status === booking.bookingStatus;
  const isLastPhase = activeStepIndex === PHASES.length - 1;
  const nextPhase = !isLastPhase ? PHASES[activeStepIndex + 1] : null;

  const footer = (
    <div className="flex items-center justify-between w-full gap-3">
      {/* Left side: Step Navigation Controls */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePrevPhase}
          disabled={activeStepIndex === 0 || isUpdating}
          className="h-8.5 px-3 text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-100/80"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleNextPhase}
          disabled={activeStepIndex === PHASES.length - 1 || isUpdating}
          className="h-8.5 px-3 text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-100/80"
        >
          Next
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
        <span className="text-xs font-medium text-slate-400 ml-2 hidden sm:inline">
          Phase {activeStepIndex + 1} of {PHASES.length}
        </span>
      </div>

      {/* Right side: Primary Status Actions */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={isUpdating}
          className="h-8.5 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100"
        >
          Close
        </Button>

        {/* If booking is cancelled, show reactivate option */}
        {isCancelled ? (
          <Button
            type="button"
            size="sm"
            onClick={handleReactivate}
            disabled={isUpdating}
            className="h-8.5 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            {isUpdating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            )}
            Reactivate Workflow
          </Button>
        ) : !isViewingCurrent ? (
          /* Button to transition booking to this viewed phase */
          <Button
            type="button"
            size="sm"
            onClick={() => handleApplyStatus(currentViewedPhase.status)}
            disabled={isUpdating}
            className="h-8.5 px-4 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
          >
            {isUpdating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
            ) : (
              <Check className="w-3.5 h-3.5 mr-1.5" />
            )}
            Set Booking to &ldquo;{currentViewedPhase.label}&rdquo;
          </Button>
        ) : isLastPhase ? (
          /* Completion State */
          <Button
            type="button"
            size="sm"
            onClick={onClose}
            className="h-8.5 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Workflow Completed
          </Button>
        ) : (
          /* Advance directly to the next phase */
          <Button
            type="button"
            size="sm"
            onClick={() => nextPhase && handleApplyStatus(nextPhase.status)}
            disabled={isUpdating}
            className="h-8.5 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            {isUpdating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
            )}
            Advance to {nextPhase?.label}
          </Button>
        )}
      </div>
    </div>
  );

  const PhaseIcon = currentViewedPhase.icon;

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Booking Status Workflow"
      description={`Reference: ${booking.reference} • ${booking.guestName} • ${booking.packageName}`}
      subHeader={subHeader}
      footer={footer}
      maxWidth="xl"
    >
      <div className="space-y-5 py-1">
        {/* Cancelled Alert Banner if applicable */}
        {isCancelled && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <p className="font-bold text-rose-900">This booking is currently Cancelled</p>
              <p className="text-rose-700 mt-0.5">
                The standard progression is paused. You can reactivate this booking to return it to the active lifecycle.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handleReactivate}
              disabled={isUpdating}
              className="border-rose-300 text-rose-800 hover:bg-rose-100"
            >
              Reopen
            </Button>
          </div>
        )}

        {/* Phase Header Card */}
        <div
          className={`rounded-xl border p-4.5 transition-all duration-200 ${
            isViewingCurrent
              ? "border-emerald-300 bg-gradient-to-r from-emerald-50/70 via-white to-white shadow-2xs"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  isViewingCurrent
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <PhaseIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-slate-900">
                    {currentViewedPhase.title}
                  </h3>
                  <AdminStatusBadge status={currentViewedPhase.status} />
                  {isViewingCurrent && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-md">
                      Current Status
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {currentViewedPhase.message}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Transition Banner if inspecting another phase */}
          {!isViewingCurrent && !isCancelled && (
            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs bg-slate-50/60 -mx-4.5 -mb-4.5 px-4.5 py-2.5 rounded-b-xl">
              <span className="text-slate-600">
                Booking is currently <strong className="text-slate-900">{booking.bookingStatus}</strong>.
              </span>
              <Button
                type="button"
                size="xs"
                onClick={() => handleApplyStatus(currentViewedPhase.status)}
                disabled={isUpdating}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-7 px-3 rounded-md"
              >
                {isUpdating ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <Check className="w-3 h-3 mr-1" />
                )}
                Switch to this Phase
              </Button>
            </div>
          )}
        </div>

        {/* Phase Checklist / Operational Guidelines */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-slate-500" />
              Phase Action Checklist
            </h4>
            <span className="text-[11px] text-slate-500 font-medium">
              Standard Operating Procedure
            </span>
          </div>
          <ul className="space-y-2">
            {currentViewedPhase.checklist.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs text-slate-700 leading-snug"
              >
                <div className="w-4 h-4 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 text-slate-600">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <p>{currentViewedPhase.recommendedAction}</p>
          </div>
        </div>

        {/* Booking Summary Snapshot */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
            Booking Snapshot
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white border border-slate-200/80 rounded-lg p-2.5">
              <span className="text-[11px] text-slate-500 block">Guest</span>
              <span className="font-semibold text-slate-900 truncate block mt-0.5" title={booking.guestName}>
                {booking.guestName}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">{booking.guestEmail}</span>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-lg p-2.5">
              <span className="text-[11px] text-slate-500 block">Dates & Travelers</span>
              <span className="font-semibold text-slate-900 block mt-0.5">
                {booking.groupSize} {booking.groupSize === 1 ? "Traveler" : "Travelers"}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                {booking.startDate} to {booking.endDate}
              </span>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-lg p-2.5">
              <span className="text-[11px] text-slate-500 block">Payment</span>
              <div className="mt-1">
                <AdminStatusBadge status={booking.paymentStatus} />
              </div>
              <span className="text-[10px] text-slate-500 block mt-1 font-semibold">
                ${Number(booking.totalAmountUSD || 0).toLocaleString()} USD
              </span>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-lg p-2.5">
              <span className="text-[11px] text-slate-500 block">Permit & Guide</span>
              <div className="mt-1">
                <AdminStatusBadge status={booking.permitStatus} />
              </div>
              <span className="text-[10px] text-slate-600 block mt-1 truncate" title={booking.assignedGuide || "Unassigned"}>
                {booking.assignedGuide ? `Guide: ${booking.assignedGuide}` : "Guide: Unassigned"}
              </span>
            </div>
          </div>
        </div>

        {/* Cancellation Section (Collapsible / Bottom Bar) */}
        {!isCancelled && (
          <div className="pt-1">
            {!showCancelPrompt ? (
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>Need to terminate or reject this booking request?</span>
                <button
                  type="button"
                  onClick={() => setShowCancelPrompt(true)}
                  className="text-rose-600 hover:text-rose-800 font-semibold hover:underline cursor-pointer"
                >
                  Cancel Booking...
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Cancel This Booking
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCancelPrompt(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Dismiss
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Optional cancellation reason or note..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full text-xs h-8 px-3 rounded-lg border border-rose-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => setShowCancelPrompt(false)}
                    className="h-7 text-xs"
                  >
                    Keep Active
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="xs"
                    onClick={handleConfirmCancel}
                    disabled={isUpdating}
                    className="h-7 text-xs"
                  >
                    {isUpdating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                    Confirm Cancellation
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminModal>
  );
}
