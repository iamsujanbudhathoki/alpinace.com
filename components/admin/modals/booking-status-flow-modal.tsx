"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Booking,
  BookingStatus,
  BookingWorkflowPhase,
} from "@/lib/admin-data";
import { BookingService } from "@/lib/services/admin-service";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Check,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

// Default fallback phases matching backend source of truth
const DEFAULT_PHASES: BookingWorkflowPhase[] = [
  {
    status: BookingStatus.PENDING,
    step: 1,
    label: "Pending",
    title: "Booking Request Received",
    description: "Initial booking request submitted by guest. Review requested dates, group capacity, and route availability.",
    allowedTransitions: [BookingStatus.IN_REVIEW, BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  },
  {
    status: BookingStatus.IN_REVIEW,
    step: 2,
    label: "In Review",
    title: "Operational Review & Vetting",
    description: "Reviewing permits, guide availability, and logistics. Communicating with client regarding requirements.",
    allowedTransitions: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  },
  {
    status: BookingStatus.CONFIRMED,
    step: 3,
    label: "Confirmed",
    title: "Booking Confirmed & Secured",
    description: "Deposit verified, dates locked, and official permits (TIMS/National Park) issued. Pre-departure briefing sent.",
    allowedTransitions: [BookingStatus.IN_REVIEW, BookingStatus.ACTIVE, BookingStatus.CANCELLED],
  },
  {
    status: BookingStatus.ACTIVE,
    step: 4,
    label: "Active",
    title: "Trip in Progress",
    description: "The trip is underway on the trail. Operations team is monitoring daily field check-ins and safety telemetry.",
    allowedTransitions: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED, BookingStatus.CANCELLED],
  },
  {
    status: BookingStatus.COMPLETED,
    step: 5,
    label: "Completed",
    title: "Trip Completed Successfully",
    description: "All services fulfilled, post-trip debrief finished, feedback collected, and booking records archived.",
    allowedTransitions: [BookingStatus.ACTIVE],
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
  const [phases, setPhases] = useState<BookingWorkflowPhase[]>(DEFAULT_PHASES);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [transitionNote, setTransitionNote] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [showCancelPrompt, setShowCancelPrompt] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>("");

  // Fetch workflow definition from backend when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadPhases() {
      try {
        const res = await BookingService.getWorkflowPhases();
        if (isMounted && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setPhases(res.data);
        }
      } catch (err) {
        console.warn("Failed to fetch workflow phases from backend, using default:", err);
      }
    }

    loadPhases();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Synchronize step index with current booking status
  useEffect(() => {
    if (isOpen && booking) {
      const idx = phases.findIndex((p) => p.status === booking.bookingStatus);
      setActiveStepIndex(idx >= 0 ? idx : 0);
      setTransitionNote(booking.statusNote || "");
      setShowCancelPrompt(false);
      setCancelReason("");
    }
  }, [isOpen, booking, phases]);

  if (!booking) return null;

  const currentBookingPhaseIndex = phases.findIndex(
    (p) => p.status === booking.bookingStatus
  );
  const isCancelled = booking.bookingStatus === BookingStatus.CANCELLED;
  const currentViewedPhase = phases[activeStepIndex] || phases[0];

  // Apply workflow transition through backend API
  const handleApplyStatus = async (targetStatus: BookingStatus) => {
    if (!booking || isUpdating) return;
    setIsUpdating(true);
    try {
      const res = await BookingService.updateWorkflow(booking.id, {
        status: targetStatus,
        note: transitionNote.trim() || undefined,
      });

      if (res.success && res.data) {
        toast.success(`Booking status changed to "${targetStatus.replace("_", " ")}"`);
        onStatusUpdated?.(res.data);
        const newIdx = phases.findIndex((p) => p.status === targetStatus);
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

  const handleNextPhase = () => {
    if (activeStepIndex < phases.length - 1) {
      setActiveStepIndex((prev) => prev + 1);
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
      const res = await BookingService.updateWorkflow(booking.id, {
        status: BookingStatus.CANCELLED,
        note: cancelReason.trim() ? `Cancelled: ${cancelReason.trim()}` : "Cancelled by admin",
      });

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

  // Stepper Header
  const subHeader = (
    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
      <div className="relative">
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
        <div className="relative z-10 flex items-center justify-between">
          {phases.map((phase, idx) => {
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
              circleClass = "bg-slate-900 border-2 border-slate-900 text-white shadow-xs ring-4 ring-slate-900/10";
            } else if (isSelected) {
              circleClass = "bg-white border-2 border-emerald-600 text-emerald-700 shadow-xs ring-4 ring-emerald-600/15";
            }

            return (
              <button
                key={phase.status}
                type="button"
                onClick={() => setActiveStepIndex(idx)}
                className="group flex flex-col items-center focus:outline-none cursor-pointer"
                title={`View ${phase.label}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${circleClass}`}
                >
                  {isCompletedBefore ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <span>{phase.step}</span>
                  )}
                </div>

                <div className="mt-1.5 flex flex-col items-center">
                  <span
                    className={`text-xs whitespace-nowrap ${
                      isSelected
                        ? "text-slate-900 font-bold"
                        : isCurrentBookingStatus
                        ? "text-slate-900 font-semibold"
                        : "text-slate-500 group-hover:text-slate-800"
                    }`}
                  >
                    {phase.label}
                  </span>
                  {isCurrentBookingStatus && (
                    <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full mt-0.5">
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

  const isViewingCurrent = currentViewedPhase.status === booking.bookingStatus;
  const isLastPhase = activeStepIndex === phases.length - 1;
  const nextPhase = !isLastPhase ? phases[activeStepIndex + 1] : null;

  // Modal Footer
  const footer = (
    <div className="flex items-center justify-between w-full gap-3">
      {/* Step navigation */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePrevPhase}
          disabled={activeStepIndex === 0 || isUpdating}
          className="h-8.5 px-3 text-xs font-semibold text-slate-700 border-slate-200"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleNextPhase}
          disabled={activeStepIndex === phases.length - 1 || isUpdating}
          className="h-8.5 px-3 text-xs font-semibold text-slate-700 border-slate-200"
        >
          Next
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
        <span className="text-xs text-slate-400 ml-2 hidden sm:inline">
          Phase {activeStepIndex + 1} of {phases.length}
        </span>
      </div>

      {/* Primary actions */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={isUpdating}
          className="h-8.5 px-3 text-xs font-semibold text-slate-600"
        >
          Close
        </Button>

        {isCancelled ? (
          <Button
            type="button"
            size="sm"
            onClick={handleReactivate}
            disabled={isUpdating}
            className="h-8.5 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isUpdating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            )}
            Reactivate Booking
          </Button>
        ) : !isViewingCurrent ? (
          <Button
            type="button"
            size="sm"
            onClick={() => handleApplyStatus(currentViewedPhase.status)}
            disabled={isUpdating}
            className="h-8.5 px-4 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white"
          >
            {isUpdating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
            ) : (
              <Check className="w-3.5 h-3.5 mr-1.5" />
            )}
            Set Status to &ldquo;{currentViewedPhase.label}&rdquo;
          </Button>
        ) : isLastPhase ? (
          <Button
            type="button"
            size="sm"
            onClick={onClose}
            className="h-8.5 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Workflow Completed
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={() => nextPhase && handleApplyStatus(nextPhase.status)}
            disabled={isUpdating}
            className="h-8.5 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
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

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Booking Status Workflow"
      description={`Reference: ${booking.reference} • ${booking.guestName} • ${booking.packageName}`}
      subHeader={subHeader}
      footer={footer}
      maxWidth="lg"
    >
      <div className="space-y-4 py-1 text-xs">
        {/* Cancelled Notice */}
        {isCancelled && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3.5 flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-rose-900">This booking is currently Cancelled</p>
              <p className="text-rose-700 mt-0.5">
                Standard progression is halted. You can reactivate this booking to return it to the active lifecycle.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handleReactivate}
              disabled={isUpdating}
              className="border-rose-300 text-rose-800 hover:bg-rose-100 shrink-0"
            >
              Reactivate
            </Button>
          </div>
        )}

        {/* Current Phase Details Card */}
        <div
          className={`rounded-lg border p-4 ${
            isViewingCurrent
              ? "border-emerald-300 bg-emerald-50/40"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Phase {currentViewedPhase.step}: {currentViewedPhase.title}
              </h3>
              <AdminStatusBadge status={currentViewedPhase.status} />
            </div>
            {isViewingCurrent && (
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded">
                Current Status
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {currentViewedPhase.description}
          </p>

          {!isViewingCurrent && !isCancelled && (
            <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-slate-600">
              <span>
                Booking is currently <strong className="text-slate-900">{booking.bookingStatus}</strong>.
              </span>
              <Button
                type="button"
                size="xs"
                onClick={() => handleApplyStatus(currentViewedPhase.status)}
                disabled={isUpdating}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold h-7 px-3"
              >
                {isUpdating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                Set to this Phase
              </Button>
            </div>
          )}
        </div>

        {/* Transition Note Input */}
        <div className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-1.5">
          <label className="text-xs font-semibold text-slate-800 block">
            Status Transition Note (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Deposit verified via bank wire, permits submitted to park office..."
            value={transitionNote}
            onChange={(e) => setTransitionNote(e.target.value)}
            className="w-full text-xs h-8.5 px-3 rounded-md border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
          <p className="text-[11px] text-slate-500">
            This note will be saved with the status update and recorded in the audit trail.
          </p>
        </div>

        {/* Compact Booking Context */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[11px] text-slate-500 block">Guest</span>
              <span className="font-semibold text-slate-900 block truncate" title={booking.guestName}>
                {booking.guestName}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">{booking.guestEmail}</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 block">Dates & Size</span>
              <span className="font-semibold text-slate-900 block">
                {booking.groupSize} {booking.groupSize === 1 ? "Traveler" : "Travelers"}
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                {booking.startDate} &rarr; {booking.endDate}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 block">Payment</span>
              <div className="mt-0.5">
                <AdminStatusBadge status={booking.paymentStatus} />
              </div>
              <span className="text-[10px] text-slate-600 block mt-0.5 font-medium">
                ${Number(booking.totalAmountUSD || 0).toLocaleString()} USD
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 block">Permit & Guide</span>
              <div className="mt-0.5">
                <AdminStatusBadge status={booking.permitStatus} />
              </div>
              <span className="text-[10px] text-slate-600 block mt-0.5 truncate" title={booking.assignedGuide || "Unassigned"}>
                {booking.assignedGuide ? `Guide: ${booking.assignedGuide}` : "Unassigned"}
              </span>
            </div>
          </div>
        </div>

        {/* Cancellation Section */}
        {!isCancelled && (
          <div className="pt-1">
            {!showCancelPrompt ? (
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>Need to reject or cancel this booking?</span>
                <button
                  type="button"
                  onClick={() => setShowCancelPrompt(true)}
                  className="text-rose-600 hover:text-rose-800 font-semibold hover:underline cursor-pointer"
                >
                  Cancel Booking...
                </button>
              </div>
            ) : (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-rose-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Confirm Cancellation
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
                  placeholder="Reason for cancellation (optional)..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full text-xs h-8 px-2.5 rounded border border-rose-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => setShowCancelPrompt(false)}
                    className="h-7 text-xs"
                  >
                    Keep Booking
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
                    Confirm Cancel
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
