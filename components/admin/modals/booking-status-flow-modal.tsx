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
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

// Default 5 workflow steps matching backend definition
const DEFAULT_PHASES: BookingWorkflowPhase[] = [
  {
    step: 1,
    label: "Request Received",
    title: "Booking Request Received",
    description:
      "Initial booking request submitted by guest. Review requested dates, group capacity, and availability.",
  },
  {
    step: 2,
    label: "In Review",
    title: "Operational Review & Vetting",
    description:
      "Reviewing permits, guide availability, and logistics. Communicating with client regarding requirements.",
  },
  {
    step: 3,
    label: "Confirmed",
    title: "Booking Confirmed & Secured",
    description:
      "Deposit verified, dates locked, and official permits (TIMS/National Park) issued. Pre-departure briefing sent.",
  },
  {
    step: 4,
    label: "Active",
    title: "Trip in Progress",
    description:
      "The trip is underway on the trail. Operations team is monitoring daily field check-ins and safety telemetry.",
  },
  {
    step: 5,
    label: "Completed",
    title: "Trip Completed Successfully",
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

  // Status dot color helper
  const getStatusDotColor = (status: BookingStepStatus | string) => {
    switch (status) {
      case BookingStepStatus.COMPLETED:
        return "bg-emerald-500";
      case BookingStepStatus.IN_PROGRESS:
      case BookingStepStatus.ACTIVE:
        return "bg-blue-500";
      case BookingStepStatus.CANCELLED:
        return "bg-rose-500";
      default:
        return "bg-slate-400";
    }
  };

  // Phase navigation subHeader tabs
  const tabsNav = (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 modal-scroll">
      {phases.map((phase, idx) => {
        const isActive = activeStepIndex === idx;
        const stepStatus = localSteps[idx]?.status || BookingStepStatus.PENDING;
        const isCompleted = stepStatus === BookingStepStatus.COMPLETED;

        return (
          <button
            key={phase.step}
            type="button"
            onClick={() => setActiveStepIndex(idx)}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              isActive
                ? "bg-slate-900 text-white shadow-xs"
                : isCompleted
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                : "bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 border border-slate-200"
            }`}
          >
            {isCompleted ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <span className={`w-2 h-2 rounded-full shrink-0 ${getStatusDotColor(stepStatus)}`} />
            )}
            <span>
              {phase.step}. {phase.label}
            </span>
          </button>
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
        <Button type="button" variant="outline" onClick={onClose} disabled={isUpdating}>
          Close
        </Button>

        <Button
          type="button"
          onClick={handleSaveAll}
          disabled={isUpdating}
          className="bg-slate-900 hover:bg-slate-800 text-white"
        >
          {isUpdating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
          ) : (
            <Save className="w-3.5 h-3.5 mr-1.5" />
          )}
          Save Workflow Steps
        </Button>
      </div>
    </div>
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Booking Workflow Steps"
      description={`Reference: ${booking.reference} • ${booking.guestName}`}
      subHeader={tabsNav}
      footer={footer}
      maxWidth="2xl"
    >
      <div className="space-y-4 py-1 text-xs">
        {/* Booking Summary Box */}
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
              <span>
                {booking.startDate} &rarr; {booking.endDate}
              </span>
            </div>
            <div className="font-medium text-slate-700">
              {booking.groupSize} {booking.groupSize === 1 ? "Traveler" : "Travelers"} &bull; $
              {Number(booking.totalAmountUSD || 0).toLocaleString()} USD
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <AdminStatusBadge status={booking.paymentStatus} />
              <AdminStatusBadge status={booking.permitStatus} />
            </div>
          </div>
        </div>

        {/* Active Step Details & Status/Message Editor */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-500 font-semibold tracking-wider uppercase">
                Step {currentViewedPhase.step} of {phases.length}
              </div>
              <h3 className="font-bold text-slate-900 text-base">{currentViewedPhase.title}</h3>
            </div>
            <div className="flex items-center gap-2">
              <AdminStatusBadge status={currentStepData.status} />
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed text-xs">
            {currentViewedPhase.description}
          </p>

          {/* Step Status Selector and Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <AdminSelectField
              label={`Step ${currentViewedPhase.step} Status`}
              value={currentStepData.status}
              onChange={(val) => updateCurrentStatus(val as BookingStepStatus)}
              options={STEP_STATUS_OPTIONS}
            />

            <div className="flex flex-col justify-end space-y-1.5">
              <span className="text-slate-500 font-medium text-[11px]">Quick Status Action</span>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant={currentStepData.status === BookingStepStatus.COMPLETED ? "default" : "outline"}
                  onClick={() => handleQuickStatusChange(BookingStepStatus.COMPLETED)}
                  disabled={isUpdating}
                  className="text-xs h-8 cursor-pointer flex-1"
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Completed
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={currentStepData.status === BookingStepStatus.IN_PROGRESS ? "default" : "outline"}
                  onClick={() => handleQuickStatusChange(BookingStepStatus.IN_PROGRESS)}
                  disabled={isUpdating}
                  className="text-xs h-8 cursor-pointer flex-1"
                >
                  <Clock className="w-3.5 h-3.5 mr-1 text-blue-600" />
                  In Progress
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={currentStepData.status === BookingStepStatus.CANCELLED ? "default" : "outline"}
                  onClick={() => handleQuickStatusChange(BookingStepStatus.CANCELLED)}
                  disabled={isUpdating}
                  className="text-xs h-8 cursor-pointer text-rose-600 hover:text-rose-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>

          {/* Step Message / Remarks Input */}
          <AdminTextareaField
            label={`Step ${currentViewedPhase.step} Message / Remarks`}
            rows={3}
            placeholder={`Add notes or messages for "${currentViewedPhase.title}" (e.g. Deposit verified, TIMS cards applied, client briefed)...`}
            value={currentStepData.message}
            onChange={(e) => updateCurrentMessage(e.target.value)}
          />
        </div>

        {/* All Steps Summary Overview */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-semibold">
            <span>
              Workflow Steps Overview (
              {localSteps.filter((s) => s.status === BookingStepStatus.COMPLETED).length}/
              {phases.length} completed)
            </span>
            <span>Click any step to inspect &amp; edit</span>
          </div>

          <div className="space-y-1.5">
            {phases.map((phase, idx) => {
              const stepData = localSteps[idx] || {
                status: BookingStepStatus.PENDING,
                message: "",
              };
              const isSelected = activeStepIndex === idx;

              return (
                <div
                  key={phase.step}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? "bg-slate-50 border-slate-400 ring-1 ring-slate-400/40"
                      : "bg-white border-slate-200 hover:bg-slate-50/70"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        stepData.status === BookingStepStatus.COMPLETED
                          ? "bg-emerald-100 text-emerald-800"
                          : stepData.status === BookingStepStatus.IN_PROGRESS
                          ? "bg-blue-100 text-blue-800"
                          : stepData.status === BookingStepStatus.CANCELLED
                          ? "bg-rose-100 text-rose-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {phase.step}
                    </span>
                    <div className="truncate">
                      <div className="font-semibold text-slate-900 truncate">
                        {phase.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-sm">
                        {stepData.message || (
                          <span className="italic text-slate-400">No message entered</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <AdminStatusBadge status={stepData.status} />
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? "text-slate-900" : "text-slate-300"}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminModal>
  );
}
