"use client";

import React, { useState, useEffect } from "react";
import {
  Booking,
  BookingStatus,
  BookingWorkflowPhase,
} from "@/lib/admin-data";
import { BookingService } from "@/lib/services/admin-service";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { AdminInputField } from "@/components/admin/forms/admin-form-fields";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Check,
  CheckCircle,
  Loader2,
  AlertTriangle,
  RotateCcw,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";

// Fallback phases matching backend source of truth
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

  // Load official phases from backend when modal opens
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

  const isViewingCurrent = currentViewedPhase.status === booking.bookingStatus;
  const isLastPhase = activeStepIndex === phases.length - 1;
  const nextPhase = !isLastPhase ? phases[activeStepIndex + 1] : null;

  // Transition handler
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

  // Phase navigation subHeader matching existing admin tab patterns (e.g. trek-modal)
  const tabsNav = (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 modal-scroll">
      {phases.map((phase, idx) => {
        const isActive = activeStepIndex === idx;
        const isCurrent = booking.bookingStatus === phase.status;
        const isCompletedBefore =
          !isCancelled &&
          currentBookingPhaseIndex >= 0 &&
          idx < currentBookingPhaseIndex;

        return (
          <button
            key={phase.status}
            type="button"
            onClick={() => setActiveStepIndex(idx)}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              isActive
                ? "bg-slate-900 text-white shadow-xs"
                : isCurrent
                ? "bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold"
                : isCompletedBefore
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                : "bg-slate-100/70 text-slate-500 hover:bg-slate-200/70"
            }`}
          >
            {isCompletedBefore ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <span className="text-[11px] opacity-75">{phase.step}.</span>
            )}
            <span>{phase.label}</span>
            {isCurrent && (
              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-emerald-600 text-white font-bold tracking-wider">
                Current
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  // Modal Footer matching existing modal patterns
  const footer = (
    <div className="flex items-center justify-between gap-3 w-full">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevPhase}
          disabled={activeStepIndex === 0 || isUpdating}
        >
          Back
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleNextPhase}
          disabled={activeStepIndex === phases.length - 1 || isUpdating}
        >
          Next
        </Button>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isUpdating}
        >
          Close
        </Button>

        {isCancelled ? (
          <Button
            type="button"
            onClick={handleReactivate}
            disabled={isUpdating}
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
            onClick={() => handleApplyStatus(currentViewedPhase.status)}
            disabled={isUpdating}
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
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
            Booking Completed
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => nextPhase && handleApplyStatus(nextPhase.status)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
            ) : (
              <Check className="w-3.5 h-3.5 mr-1.5" />
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
      description={`Reference: ${booking.reference} • ${booking.guestName}`}
      subHeader={tabsNav}
      footer={footer}
      maxWidth="2xl"
    >
      <div className="space-y-4 py-1 text-xs">
        {/* Cancelled Banner if applicable */}
        {isCancelled && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center justify-between gap-3">
            <div>
              <span className="font-bold block">Booking is Cancelled</span>
              <span className="text-[11px] text-rose-700">
                Workflow progression is halted. Reactivating moves the booking back to Pending.
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReactivate}
              disabled={isUpdating}
              className="border-rose-300 text-rose-800 hover:bg-rose-100"
            >
              Reactivate
            </Button>
          </div>
        )}

        {/* Booking Summary Box - matching booking-modal.tsx exactly */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="space-y-1">
            <span className="text-slate-500 font-semibold block text-[11px]">Guest Details</span>
            <div className="font-semibold text-slate-900 text-sm">{booking.guestName}</div>
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{booking.guestEmail}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{booking.guestPhone}</span>
            </div>
            <div className="text-slate-500 font-medium text-[11px]">{booking.country}</div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 font-semibold block text-[11px]">Package &amp; Dates</span>
            <div className="font-semibold text-slate-900 text-sm">{booking.packageName}</div>
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{booking.startDate} &rarr; {booking.endDate}</span>
            </div>
            <div className="font-medium text-slate-700">
              {booking.groupSize} {booking.groupSize === 1 ? "Traveler" : "Travelers"} &bull; ${Number(booking.totalAmountUSD || 0).toLocaleString()} USD
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <AdminStatusBadge status={booking.paymentStatus} />
              <AdminStatusBadge status={booking.permitStatus} />
            </div>
          </div>
        </div>

        {/* Phase Details Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">
                Phase {currentViewedPhase.step}: {currentViewedPhase.title}
              </h3>
              <AdminStatusBadge status={currentViewedPhase.status} />
            </div>
            {isViewingCurrent && (
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                Current Status
              </span>
            )}
          </div>

          <p className="text-slate-600 leading-relaxed text-xs">
            {currentViewedPhase.description}
          </p>

          {!isViewingCurrent && !isCancelled && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px]">
              <span>
                Current database status: <strong className="text-slate-800">{booking.bookingStatus}</strong>
              </span>
              <span className="text-slate-400">Click &ldquo;Set Status&rdquo; below to transition.</span>
            </div>
          )}
        </div>

        {/* Status Transition Note - standard AdminInputField */}
        <AdminInputField
          label="Transition Note (Optional)"
          placeholder="e.g. Deposit verified via bank transfer, permits processed..."
          value={transitionNote}
          onChange={(e) => setTransitionNote(e.target.value)}
        />

        {/* Discreet Cancellation Toggle */}
        {!isCancelled && (
          <div className="pt-1">
            {!showCancelPrompt ? (
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
                <span>Need to reject or cancel this reservation?</span>
                <button
                  type="button"
                  onClick={() => setShowCancelPrompt(true)}
                  className="text-rose-600 hover:text-rose-800 font-semibold hover:underline cursor-pointer"
                >
                  Cancel Booking...
                </button>
              </div>
            ) : (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
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
                  className="w-full text-xs h-8 px-3 rounded-md border border-rose-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCancelPrompt(false)}
                  >
                    Keep Booking
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleConfirmCancel}
                    disabled={isUpdating}
                  >
                    {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
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
