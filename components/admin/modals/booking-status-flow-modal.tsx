"use client";

import React, { useState, useEffect } from "react";
import {
  Booking,
  BookingStep,
  BookingWorkflowPhase,
  BookingStepStatus,
} from "@/lib/admin-data";
import { BookingService } from "@/lib/services/admin-service";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { AdminTextareaField, AdminSelectField } from "@/components/admin/forms/admin-form-fields";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Check,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  Save,
  Clock,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  X,
} from "lucide-react";

// Default 5 workflow steps matching backend definition
const DEFAULT_PHASES: BookingWorkflowPhase[] = [
  {
    step: 1,
    label: "Request received",
    title: "Request received",
    description:
      "Initial booking request submitted by guest. Review requested dates, group capacity, and availability.",
  },
  {
    step: 2,
    label: "In review",
    title: "Operational review & vetting",
    description:
      "Reviewing permits, guide availability, and logistics. Communicating with client regarding requirements.",
  },
  {
    step: 3,
    label: "Confirmed",
    title: "Booking confirmed & secured",
    description:
      "Deposit verified, dates locked, and official permits (TIMS/National Park) issued. Pre-departure briefing sent.",
  },
  {
    step: 4,
    label: "Active",
    title: "Trip in progress",
    description:
      "The trip is underway on the trail. Operations team is monitoring daily field check-ins and safety telemetry.",
  },
  {
    step: 5,
    label: "Completed",
    title: "Trip completed successfully",
    description:
      "All services fulfilled, post-trip debrief finished, feedback collected, and booking records archived.",
  },
];

const STEP_STATUS_OPTIONS = [
  { label: "Pending", value: BookingStepStatus.PENDING },
  { label: "In Progress", value: BookingStepStatus.IN_PROGRESS },
  { label: "Active", value: BookingStepStatus.ACTIVE },
  { label: "Completed", value: BookingStepStatus.COMPLETED },
  { label: "Cancelled", value: BookingStepStatus.CANCELLED },
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
  const [localSteps, setLocalSteps] = useState<BookingStep[]>([]);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Load phases from backend
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

  // Synchronize local steps with booking
  useEffect(() => {
    if (isOpen && booking) {
      const initialized: BookingStep[] = [0, 1, 2, 3, 4].map((i) => {
        const existing = booking.steps?.[i];
        return {
          status:
            existing?.status ||
            (i === 0 ? BookingStepStatus.COMPLETED : BookingStepStatus.PENDING),
          message: existing?.message || "",
        };
      });
      setLocalSteps(initialized);

      // Find first non-completed step or default to 0
      const firstIncomplete = initialized.findIndex(
        (s) =>
          s.status !== BookingStepStatus.COMPLETED &&
          s.status !== BookingStepStatus.CANCELLED
      );
      setActiveStepIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
    }
  }, [isOpen, booking]);

  if (!booking) return null;

  const currentViewedPhase = phases[activeStepIndex] || phases[0];
  const currentStepData = localSteps[activeStepIndex] || {
    status: BookingStepStatus.PENDING,
    message: "",
  };

  const updateCurrentStatus = (newStatus: BookingStepStatus) => {
    setLocalSteps((prev) => {
      const copy = [...prev];
      copy[activeStepIndex] = {
        ...copy[activeStepIndex],
        status: newStatus,
      };
      return copy;
    });
  };

  const updateCurrentMessage = (newMessage: string) => {
    setLocalSteps((prev) => {
      const copy = [...prev];
      copy[activeStepIndex] = {
        ...copy[activeStepIndex],
        message: newMessage,
      };
      return copy;
    });
  };

  const handleSaveAll = async () => {
    if (!booking || isUpdating) return;
    setIsUpdating(true);
    try {
      const res = await BookingService.updateWorkflow(booking.id, {
        steps: localSteps,
      });

      if (res.success && res.data) {
        toast.success(`Booking step statuses & messages saved successfully`);
        onStatusUpdated?.(res.data);
      } else {
        toast.error(res.message || "Failed to update booking steps");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update booking steps");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuickStatusChange = async (targetStatus: BookingStepStatus) => {
    if (!booking || isUpdating) return;
    setIsUpdating(true);
    try {
      const updatedSteps = [...localSteps];
      updatedSteps[activeStepIndex] = {
        ...updatedSteps[activeStepIndex],
        status: targetStatus,
      };
      setLocalSteps(updatedSteps);

      const res = await BookingService.updateWorkflow(booking.id, {
        stepIndex: activeStepIndex,
        status: targetStatus,
        message: updatedSteps[activeStepIndex].message,
      });

      if (res.success && res.data) {
        toast.success(
          `Step ${activeStepIndex + 1} (${currentViewedPhase.label}) status set to "${targetStatus}"`
        );
        onStatusUpdated?.(res.data);
      } else {
        toast.error(res.message || "Failed to update step status");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update step status");
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

  // Step indicator / workflow header tabs
  const tabsNav = (
    <div className="flex items-center gap-1 overflow-x-auto pb-2 modal-scroll w-full border-b border-slate-100">
      {phases.map((phase, idx) => {
        const isActive = activeStepIndex === idx;
        const stepStatus = localSteps[idx]?.status || BookingStepStatus.PENDING;
        const isCompleted = stepStatus === BookingStepStatus.COMPLETED;
        const isCancelled = stepStatus === BookingStepStatus.CANCELLED;

        return (
          <React.Fragment key={phase.step}>
            <button
              type="button"
              onClick={() => setActiveStepIndex(idx)}
              className={`flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs transition-colors cursor-pointer shrink-0 ${
                isActive
                  ? "bg-slate-900 text-white font-medium"
                  : isCompleted
                  ? "text-slate-700 hover:bg-slate-100"
                  : isCancelled
                  ? "text-rose-700 hover:bg-rose-50"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                  isActive
                    ? "bg-white/20 text-white font-medium"
                    : isCompleted
                    ? "bg-emerald-100 text-emerald-700 font-medium"
                    : isCancelled
                    ? "bg-rose-100 text-rose-700 font-medium"
                    : "bg-slate-100 text-slate-500 font-normal"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                ) : isCancelled ? (
                  <X className="w-2.5 h-2.5 stroke-[2.5]" />
                ) : (
                  phase.step
                )}
              </span>

              <span>{phase.label}</span>
            </button>

            {idx < phases.length - 1 && (
              <span className="text-slate-300 text-xs px-0.5 select-none hidden sm:inline">
                /
              </span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  // Modal Footer
  const footer = (
    <div className="flex items-center justify-between gap-3 w-full">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePrevPhase}
          disabled={activeStepIndex === 0 || isUpdating}
          className="text-xs h-8 px-3 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
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
          className="text-xs h-8 px-3 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          Next
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
        <span className="text-slate-400 text-xs ml-1 hidden sm:inline">
          Step {activeStepIndex + 1} of {phases.length}
        </span>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={isUpdating}
          className="text-xs h-8 px-3 text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          Cancel
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={handleSaveAll}
          disabled={isUpdating}
          className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs h-8 px-4 rounded-lg cursor-pointer inline-flex items-center gap-1.5"
        >
          {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>Save changes</span>
        </Button>
      </div>
    </div>
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Booking workflow"
      description={`Ref: ${booking.reference} · ${booking.guestName} · ${booking.packageName}`}
      subHeader={tabsNav}
      footer={footer}
      maxWidth="2xl"
    >
      <div className="space-y-4 py-1 text-xs">
        {/* Context Bar: Guest & Trip Details (Airy, typographic hierarchy, no heavy cards) */}
        <div className="flex flex-wrap items-baseline justify-between gap-y-1.5 text-xs text-slate-500 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900">{booking.guestName}</span>
            <span>·</span>
            <span>{booking.guestEmail}</span>
            {booking.guestPhone && (
              <>
                <span>·</span>
                <span>{booking.guestPhone}</span>
              </>
            )}
            {booking.country && (
              <>
                <span>·</span>
                <span>{booking.country}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap text-slate-600">
            <span>
              {booking.startDate} &rarr; {booking.endDate}
            </span>
            <span>·</span>
            <span>
              {booking.groupSize} {booking.groupSize === 1 ? "traveler" : "travelers"}
            </span>
            <span>·</span>
            <span className="font-medium text-slate-900">
              ${Number(booking.totalAmountUSD || 0).toLocaleString()} USD
            </span>
            <span className="flex items-center gap-1.5 ml-1">
              <AdminStatusBadge status={booking.paymentStatus} />
              <AdminStatusBadge status={booking.permitStatus} />
            </span>
          </div>
        </div>

        {/* Special Requests (clean quote block if present) */}
        {booking.specialRequests && (
          <div className="text-xs text-slate-600 border-l-2 border-slate-300 pl-3 py-1 space-y-0.5">
            <span className="text-[11px] text-slate-400 font-medium">Special requests:</span>
            <p className="italic text-slate-700 leading-relaxed">&ldquo;{booking.specialRequests}&rdquo;</p>
          </div>
        )}

        {/* Current Stage Section */}
        <div className="space-y-4 pt-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] text-slate-400 font-normal">
                Step {currentViewedPhase.step} of {phases.length}
              </span>
              <h3 className="text-base font-semibold text-slate-900 mt-0.5">
                {currentViewedPhase.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                {currentViewedPhase.description}
              </p>
            </div>
            <AdminStatusBadge status={currentStepData.status} />
          </div>

          {/* Segmented Stage Status Control (Clean, native product feel) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Stage status
            </label>
            <div>
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50/70 p-0.5 text-xs flex-wrap">
                <button
                  type="button"
                  onClick={() => updateCurrentStatus(BookingStepStatus.IN_PROGRESS)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                    currentStepData.status === BookingStepStatus.IN_PROGRESS ||
                    currentStepData.status === BookingStepStatus.ACTIVE
                      ? "bg-white text-slate-900 shadow-2xs border border-slate-200/80"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  In progress
                </button>
                <button
                  type="button"
                  onClick={() => updateCurrentStatus(BookingStepStatus.COMPLETED)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                    currentStepData.status === BookingStepStatus.COMPLETED
                      ? "bg-white text-slate-900 shadow-2xs border border-slate-200/80"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Completed
                </button>
                <button
                  type="button"
                  onClick={() => updateCurrentStatus(BookingStepStatus.CANCELLED)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                    currentStepData.status === BookingStepStatus.CANCELLED
                      ? "bg-white text-slate-900 shadow-2xs border border-slate-200/80"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Cancelled
                </button>
              </div>
            </div>
          </div>

          {/* Stage Note / Remarks */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Step notes
            </label>
            <textarea
              rows={3}
              value={currentStepData.message}
              onChange={(e) => updateCurrentMessage(e.target.value)}
              placeholder={`Notes for this stage (e.g. deposit verified, TIMS cards applied, client briefed)...`}
              className="w-full text-xs rounded-lg border border-slate-200 p-2.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors leading-relaxed"
            />
          </div>
        </div>
      </div>
    </AdminModal>
  );
}
