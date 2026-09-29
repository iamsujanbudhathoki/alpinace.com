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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Check,
  Loader2,
  ShieldAlert,
  RotateCcw,
  Ban,
  CheckCircle2,
} from "lucide-react";

// Default 5 workflow steps matching backend definition
const DEFAULT_PHASES: BookingWorkflowPhase[] = [
  {
    step: 1,
    label: "Request Received",
    title: "Booking Request Received",
    description:
      "Initial booking inquiry submitted by the guest. Verify dates, guest count, and initial itinerary feasibility.",
  },
  {
    step: 2,
    label: "In Review",
    title: "Operational Review & Vetting",
    description:
      "Checking mountain guide availability, national park & TIMS permits, domestic flights, and lodge accommodations.",
  },
  {
    step: 3,
    label: "Confirmed",
    title: "Booking Confirmed & Secured",
    description:
      "Deposit/full payment verified, official permits issued, and pre-departure equipment checklist sent to traveler.",
  },
  {
    step: 4,
    label: "Active",
    title: "Trip in Progress (On Mountain)",
    description:
      "Traveler is currently on the trail. Operations team is tracking daily check-ins, weather telemetry, and guide reports.",
  },
  {
    step: 5,
    label: "Completed",
    title: "Trip Completed & Archived",
    description:
      "Trip successfully concluded. Post-trek debrief completed, feedback gathered, and records archived.",
  },
];

const NEXT_STAGE_LABELS: Record<number, string> = {
  0: "Start Operational Review →",
  1: "Confirm Booking & Lock Spot →",
  2: "Mark Trip as Active (On Trail) →",
  3: "Mark Trip as Completed ✓",
};

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
  const [confirmAction, setConfirmAction] = useState<"cancel" | "fraud" | null>(null);
  const [actionReason, setActionReason] = useState<string>("");

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
      setConfirmAction(null);
      setActionReason("");

      // Find first non-completed step or default to 0
      const firstIncomplete = initialized.findIndex(
        (s) =>
          s.status !== BookingStepStatus.COMPLETED &&
          s.status !== BookingStepStatus.CANCELLED &&
          s.status !== BookingStepStatus.FRAUD
      );
      setActiveStepIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
    }
  }, [isOpen, booking]);

  if (!booking) return null;

  const isFraud = localSteps.some((s) => s.status === BookingStepStatus.FRAUD);
  const isCancelled = localSteps.some((s) => s.status === BookingStepStatus.CANCELLED);
  const fraudStep = localSteps.find((s) => s.status === BookingStepStatus.FRAUD);
  const cancelledStep = localSteps.find((s) => s.status === BookingStepStatus.CANCELLED);

  // Current active stage index
  const currentOverallStageIdx = (() => {
    const idx = localSteps.findIndex(
      (s) =>
        s.status !== BookingStepStatus.COMPLETED &&
        s.status !== BookingStepStatus.CANCELLED &&
        s.status !== BookingStepStatus.FRAUD
    );
    if (idx >= 0) return idx;
    if (localSteps.every((s) => s.status === BookingStepStatus.COMPLETED)) return 4;
    return 0;
  })();

  const viewedPhase = phases[activeStepIndex] || phases[0];
  const viewedStepData = localSteps[activeStepIndex] || {
    status: BookingStepStatus.PENDING,
    message: "",
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

  const saveWorkflow = async (stepsToSave: BookingStep[], successMessage?: string) => {
    if (!booking || isUpdating) return;
    setIsUpdating(true);
    try {
      const res = await BookingService.updateWorkflow(booking.id, {
        steps: stepsToSave,
      });

      if (res.success && res.data) {
        toast.success(successMessage || "Booking workflow updated successfully");
        onStatusUpdated?.(res.data);
        onClose();
      } else {
        toast.error(res.message || "Failed to update booking steps");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update booking steps");
    } finally {
      setIsUpdating(false);
    }
  };

  // 1-Click Advance to Next Stage
  const handleAdvanceStage = async () => {
    const updated = localSteps.map((step, idx) => {
      if (idx <= activeStepIndex) {
        return {
          status: BookingStepStatus.COMPLETED,
          message: step.message,
        };
      }
      if (idx === activeStepIndex + 1) {
        return {
          status: BookingStepStatus.IN_PROGRESS,
          message: step.message,
        };
      }
      return step;
    });

    const nextIndex = Math.min(phases.length - 1, activeStepIndex + 1);
    const nextPhaseLabel = phases[nextIndex]?.label || `Step ${nextIndex + 1}`;
    setLocalSteps(updated);
    setActiveStepIndex(nextIndex);

    await saveWorkflow(updated, `Advanced to "${nextPhaseLabel}"`);
  };

  // Save current step notes without changing stage
  const handleSaveNotes = async () => {
    await saveWorkflow(localSteps, "Step notes saved successfully");
  };

  // Unflag / Reopen Workflow
  const handleResumeWorkflow = async () => {
    const restored = localSteps.map((s, idx) => {
      if (s.status === BookingStepStatus.CANCELLED || s.status === BookingStepStatus.FRAUD) {
        return {
          status: idx === 0 ? BookingStepStatus.COMPLETED : BookingStepStatus.IN_PROGRESS,
          message: s.message ? `${s.message} (Reopened)` : "Workflow resumed",
        };
      }
      return s;
    });
    setLocalSteps(restored);
    setConfirmAction(null);
    await saveWorkflow(restored, "Booking reopened & resumed successfully");
  };

  // Mark as Cancelled
  const handleConfirmCancel = async () => {
    const updated = [...localSteps];
    const targetIdx = activeStepIndex >= 0 ? activeStepIndex : 0;
    const reason = actionReason.trim() || "Booking cancelled by admin";
    updated[targetIdx] = {
      status: BookingStepStatus.CANCELLED,
      message: reason,
    };
    setLocalSteps(updated);
    setConfirmAction(null);
    setActionReason("");
    await saveWorkflow(updated, "Booking marked as Cancelled");
  };

  // Flag as Fraud
  const handleConfirmFraud = async () => {
    const updated = [...localSteps];
    const targetIdx = activeStepIndex >= 0 ? activeStepIndex : 0;
    const reason = actionReason.trim() || "Flagged as fraud / spam";
    updated[targetIdx] = {
      status: BookingStepStatus.FRAUD,
      message: reason,
    };
    setLocalSteps(updated);
    setConfirmAction(null);
    setActionReason("");
    await saveWorkflow(updated, "Booking flagged as Fraud / Spam");
  };

  const isFrozen = isCancelled || isFraud;

  // Clean, consistent stepper navigation (frozen when cancelled or fraud)
  const stepperNav = (
    <div className="w-full pb-2.5 border-b border-slate-100">
      <div className="flex items-center justify-between gap-1 overflow-x-auto modal-scroll px-1">
        {phases.map((phase, idx) => {
          const isSelected = activeStepIndex === idx;
          const stepStatus = localSteps[idx]?.status;
          const isDone = stepStatus === BookingStepStatus.COMPLETED;
          const isCurrentActive = currentOverallStageIdx === idx && !isFrozen;
          const isStepCancelled = stepStatus === BookingStepStatus.CANCELLED;
          const isStepFraud = stepStatus === BookingStepStatus.FRAUD;

          return (
            <React.Fragment key={phase.step}>
              <button
                type="button"
                disabled={isFrozen}
                onClick={() => !isFrozen && setActiveStepIndex(idx)}
                className={`flex items-center gap-2 py-1 px-2.5 rounded-md text-xs transition-colors shrink-0 ${
                  isFrozen
                    ? "cursor-not-allowed opacity-50 text-slate-400"
                    : isSelected
                    ? "bg-slate-900 text-white font-medium cursor-pointer"
                    : isCurrentActive
                    ? "bg-blue-50 text-blue-900 font-medium cursor-pointer"
                    : "text-slate-600 hover:bg-slate-100 cursor-pointer"
                }`}
                title={
                  isFrozen
                    ? "Workflow is halted. Reopen booking to manage steps."
                    : phase.title
                }
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                    isStepFraud
                      ? "bg-red-100 text-red-700"
                      : isStepCancelled
                      ? "bg-rose-100 text-rose-700"
                      : isSelected && !isFrozen
                      ? "bg-white/20 text-white"
                      : isDone
                      ? "bg-emerald-100 text-emerald-700"
                      : isCurrentActive
                      ? "bg-blue-200 text-blue-800"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isStepFraud ? (
                    <ShieldAlert className="w-3 h-3" />
                  ) : isStepCancelled ? (
                    <Ban className="w-3 h-3" />
                  ) : isDone ? (
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  ) : (
                    phase.step
                  )}
                </span>
                <span>{phase.label}</span>
              </button>

              {idx < phases.length - 1 && (
                <span className="text-slate-300 text-xs select-none hidden sm:inline">
                  /
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  // Clean, focused footer with visible compulsory termination actions and unified primary CTA
  const footer = (
    <div className="flex items-center justify-between gap-3 w-full">
      {/* Left: Compulsory Termination Actions (Clean & Easily Visible) or Reopen Action */}
      <div className="flex items-center gap-2">
        {!isFrozen ? (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50/70 border border-rose-200/80 text-xs">
            <button
              type="button"
              onClick={() => {
                setConfirmAction("cancel");
                setActionReason("");
              }}
              className="font-medium text-rose-700 hover:text-rose-900 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Cancel this booking"
            >
              <Ban className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Cancel booking</span>
            </button>

            <span className="text-rose-300 font-bold select-none">·</span>

            <button
              type="button"
              onClick={() => {
                setConfirmAction("fraud");
                setActionReason("");
              }}
              className="font-medium text-red-700 hover:text-red-900 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Flag this booking as fraud or spam"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span>Flag as fraud</span>
            </button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResumeWorkflow}
            disabled={isUpdating}
            className="text-xs h-8 px-3 border-slate-300 bg-white text-slate-800 hover:bg-slate-50 cursor-pointer inline-flex items-center gap-1.5 font-medium shadow-2xs"
          >
            {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span>Reopen &amp; Resume Flow</span>
          </Button>
        )}
      </div>

      {/* Right: Dialog CTAs (Hidden progression buttons when frozen) */}
      <div className="flex items-center gap-2 ml-auto">
        <Button
          type="button"
          variant={isFrozen ? "outline" : "ghost"}
          size="sm"
          onClick={onClose}
          disabled={isUpdating}
          className={`text-xs h-8 px-3 cursor-pointer ${
            isFrozen
              ? "border-slate-200 text-slate-700 hover:bg-slate-50"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Close
        </Button>

        {!isFrozen && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSaveNotes}
            disabled={isUpdating}
            className="text-xs h-8 px-3 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer font-medium"
          >
            Save Notes
          </Button>
        )}

        {!isFrozen && activeStepIndex < phases.length - 1 && (
          <Button
            type="button"
            size="sm"
            onClick={handleAdvanceStage}
            disabled={isUpdating}
            className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs h-8 px-4 rounded-lg cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
          >
            {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{NEXT_STAGE_LABELS[activeStepIndex] || "Advance Stage →"}</span>
          </Button>
        )}

        {!isFrozen && activeStepIndex === phases.length - 1 && (
          <Button
            type="button"
            size="sm"
            onClick={handleAdvanceStage}
            disabled={isUpdating || localSteps[4]?.status === BookingStepStatus.COMPLETED}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs h-8 px-4 rounded-lg cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
          >
            {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            <span>
              {localSteps[4]?.status === BookingStepStatus.COMPLETED
                ? "Trip Completed ✓"
                : "Complete Trip ✓"}
            </span>
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Booking Workflow"
      description={`Ref: ${booking.reference} · ${booking.guestName} · ${booking.packageName}`}
      subHeader={stepperNav}
      footer={footer}
      maxWidth="2xl"
    >
      <div className="space-y-4 py-1 text-xs">
        {/* Fraud Banner */}
        {isFraud && (
          <div className="rounded-lg border border-red-200 bg-red-50/80 p-3 text-xs text-red-900 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-semibold text-red-900">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <span>Booking Flagged as Fraud / Spam</span>
              </div>
              <button
                type="button"
                onClick={handleResumeWorkflow}
                disabled={isUpdating}
                className="text-xs px-2.5 py-1 bg-white border border-red-300 text-red-800 hover:bg-red-50 rounded-md font-medium cursor-pointer inline-flex items-center gap-1 shadow-2xs"
              >
                <RotateCcw className="w-3 h-3 text-red-600" />
                <span>Reopen Booking</span>
              </button>
            </div>
            <p className="text-red-700 text-xs pl-6 leading-relaxed">
              This booking is marked as fraudulent and all operational processing is halted.
              {fraudStep?.message ? ` Reason: "${fraudStep.message}"` : ""}
            </p>
          </div>
        )}

        {/* Cancelled Banner */}
        {isCancelled && !isFraud && (
          <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-900 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-semibold text-rose-900">
                <Ban className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Booking Cancelled</span>
              </div>
              <button
                type="button"
                onClick={handleResumeWorkflow}
                disabled={isUpdating}
                className="text-xs px-2.5 py-1 bg-white border border-rose-300 text-rose-800 hover:bg-rose-50 rounded-md font-medium cursor-pointer inline-flex items-center gap-1 shadow-2xs"
              >
                <RotateCcw className="w-3 h-3 text-rose-600" />
                <span>Reopen Booking</span>
              </button>
            </div>
            <p className="text-rose-700 text-xs pl-6 leading-relaxed">
              This booking has been cancelled and processing is stopped.
              {cancelledStep?.message ? ` Reason: "${cancelledStep.message}"` : ""}
            </p>
          </div>
        )}

        {/* Guest & Trip Details Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden text-xs bg-white">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-3 py-2 bg-slate-50 text-slate-500 font-medium w-24 sm:w-28 shrink-0">
                  Guest Name
                </td>
                <td className="px-3 py-2 font-semibold text-slate-900">{booking.guestName}</td>
                <td className="px-3 py-2 bg-slate-50 text-slate-500 font-medium w-24 sm:w-28 shrink-0">
                  Package
                </td>
                <td className="px-3 py-2 font-medium text-slate-900">{booking.packageName}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 bg-slate-50 text-slate-500 font-medium">Email</td>
                <td className="px-3 py-2 text-slate-700 break-all">{booking.guestEmail}</td>
                <td className="px-3 py-2 bg-slate-50 text-slate-500 font-medium">Dates</td>
                <td className="px-3 py-2 text-slate-700">
                  {booking.startDate} &rarr; {booking.endDate}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 bg-slate-50 text-slate-500 font-medium">Phone</td>
                <td className="px-3 py-2 text-slate-700">{booking.guestPhone || "—"}</td>
                <td className="px-3 py-2 bg-slate-50 text-slate-500 font-medium">Group Size</td>
                <td className="px-3 py-2 text-slate-700">
                  {booking.groupSize} {booking.groupSize === 1 ? "traveler" : "travelers"}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 bg-slate-50 text-slate-500 font-medium">Country</td>
                <td className="px-3 py-2 text-slate-700">{booking.country || "—"}</td>
                <td className="px-3 py-2 bg-slate-50 text-slate-500 font-medium">Amount &amp; Status</td>
                <td className="px-3 py-2 text-slate-700">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-slate-900">
                      ${Number(booking.totalAmountUSD || 0).toLocaleString()} USD
                    </span>
                    <AdminStatusBadge status={booking.paymentStatus} />
                    <AdminStatusBadge status={booking.permitStatus} />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Special Requests */}
        {booking.specialRequests && (
          <div className="text-xs text-slate-600 border-l-2 border-slate-300 pl-3 py-1 space-y-0.5">
            <span className="text-slate-400 font-medium">Special requests:</span>
            <p className="italic text-slate-700 leading-relaxed">&ldquo;{booking.specialRequests}&rdquo;</p>
          </div>
        )}

        {/* Current Stage Information & Notes (Only active when workflow is not halted) */}
        {!isFrozen ? (
          <div className="space-y-3 pt-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-slate-400 font-medium">
                  Step {viewedPhase.step} of 5
                </div>
                <h3 className="text-base font-semibold text-slate-900 mt-0.5">
                  {viewedPhase.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {viewedPhase.description}
                </p>
              </div>

              <div>
                {localSteps[activeStepIndex]?.status === BookingStepStatus.COMPLETED ? (
                  <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Completed
                  </span>
                ) : currentOverallStageIdx === activeStepIndex ? (
                  <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    Current stage
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-600">
                    Upcoming
                  </span>
                )}
              </div>
            </div>

            {/* Step Notes Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Step notes
              </label>
              <textarea
                rows={3}
                value={viewedStepData.message}
                onChange={(e) => updateCurrentMessage(e.target.value)}
                placeholder={`Notes for "${viewedPhase.label.toLowerCase()}" (e.g. deposit confirmed, TIMS card #3821 issued, briefing sent)...`}
                className="w-full text-xs rounded-lg border border-slate-200 p-2.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors leading-relaxed"
              />
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3.5 text-xs text-slate-600 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-800">Workflow is currently frozen</span>
              <p className="text-slate-500">
                Step reviews and operational notes are disabled while this booking is {isFraud ? "flagged as fraud" : "cancelled"}. Click &ldquo;Reopen &amp; Resume Flow&rdquo; to reactivate the workflow.
              </p>
            </div>
          </div>
        )}

        {/* Inline Cancel / Fraud Confirmation Modal Card */}
        {confirmAction && (
          <div
            className={`p-3.5 rounded-lg border space-y-2.5 text-xs transition-all ${
              confirmAction === "cancel"
                ? "bg-rose-50/60 border-rose-200"
                : "bg-red-50/60 border-red-200"
            }`}
          >
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              {confirmAction === "cancel" ? (
                <Ban className="w-4 h-4 text-rose-600" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-red-600" />
              )}
              <span>
                {confirmAction === "cancel"
                  ? "Confirm Booking Cancellation"
                  : "Flag Booking as Fraud / Spam"}
              </span>
            </div>
            <p className="text-slate-600 text-xs">
              {confirmAction === "cancel"
                ? "Please enter a reason for cancelling this booking (optional):"
                : "Please enter a reason for flagging this booking as fraud:"}
            </p>
            <input
              type="text"
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder={
                confirmAction === "cancel"
                  ? "e.g. Guest requested cancellation / medical reasons"
                  : "e.g. Suspicious payment attempt / stolen card / spam bot"
              }
              className="w-full text-xs rounded-md border border-slate-300 p-2 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors"
            />
            <div className="flex items-center gap-2 justify-end pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirmAction(null)}
                className="text-xs h-7 px-2.5 text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Dismiss
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={
                  confirmAction === "cancel"
                    ? handleConfirmCancel
                    : handleConfirmFraud
                }
                disabled={isUpdating}
                className={`text-xs h-7 px-3.5 text-white font-medium cursor-pointer shadow-2xs ${
                  confirmAction === "cancel"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-red-700 hover:bg-red-800"
                }`}
              >
                {isUpdating && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                <span>
                  {confirmAction === "cancel"
                    ? "Confirm Cancellation"
                    : "Confirm Flag as Fraud"}
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminModal>
  );
}
