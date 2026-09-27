"use client";

import { AdminCountrySelect } from "@/components/admin/forms/admin-country-select";
import { AdminInputField, AdminSelectField, AdminTextareaField } from "@/components/admin/forms/admin-form-fields";
import { AdminConfirmModal } from "@/components/admin/ui/admin-confirm-modal";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Inquiry, InquiryStep, InquiryStepStatus, InquiryWorkflowPhase, BookingStepStatus, InquiryType } from "@/lib/admin-data";
import { InquiryFormValues, inquirySchema } from "@/lib/admin-schemas";
import { InquiryService } from "@/lib/services/admin-service";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle,
  CheckCircle2,
  Check,
  CheckCheck,
  Loader2,
  Mail,
  Phone,
  Send,
  ArrowLeft,
  ArrowRight,
  Clock,
  FileCheck2,
  ShieldCheck,
  Award,
  Info,
  Calendar,
  Save,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  XCircle,
  X,
  SlidersHorizontal,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

interface InquiryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (inquiry: InquiryFormValues) => Promise<boolean | void> | boolean | void;
}

export function InquiryFormModal({ isOpen, onClose, onSave }: InquiryFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<InquiryFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(inquirySchema) as any,
    defaultValues: {
      guestName: "",
      email: "",
      phone: "",
      country: "",
      interestedTrip: "Everest Region (Khumbu)",
      travelDates: "Upcoming Season",
      groupSize: 2,
      message: "",
      type: InquiryType.TREKKING,
    },
  });

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setFormError(null);
    setIsSubmitting(false);
    if (isOpen) {
      reset({
        guestName: "",
        email: "",
        phone: "",
        country: "",
        interestedTrip: "Everest Region (Khumbu)",
        travelDates: "Upcoming Season",
        groupSize: 2,
        message: "",
        type: InquiryType.TREKKING,
      });
    } else {
      reset({
        guestName: "",
        email: "",
        phone: "",
        country: "",
        interestedTrip: "Everest Region (Khumbu)",
        travelDates: "Upcoming Season",
        groupSize: 2,
        message: "",
        type: InquiryType.TREKKING,
      });
    }
  }, [isOpen, reset]);

  const handleClose = () => {
    setFormError(null);
    setIsSubmitting(false);
    onClose();
  };

  const onSubmit = async (values: InquiryFormValues) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const payload: InquiryFormValues = {
        guestName: values.guestName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        country: values.country.trim(),
        interestedTrip: values.interestedTrip.trim(),
        travelDates: values.travelDates.trim(),
        groupSize: Number(values.groupSize) || 1,
        message: values.message.trim(),
        type: values.type || InquiryType.GENERAL,
      };

      const success = await onSave(payload);
      if (success !== false) {
        onClose();
      } else {
        setFormError("Failed to log inquiry lead. Please check form inputs.");
      }
    } catch (err: any) {
      console.error("Inquiry form submission error:", err);
      const msg = err?.message || "Failed to log inquiry lead. Please try again.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalFooter = (
    <div className="flex items-center justify-end gap-2 w-full">
      <Button
        type="button"
        variant="outline"
        onClick={handleClose}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="inquiry-form"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Saving Lead...
          </span>
        ) : (
          "Save Inquiry Lead"
        )}
      </Button>
    </div>
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Log Manual Customer Inquiry"
      description="Record a phone, WhatsApp, or trade show lead into the CRM."
      maxWidth="lg"
      footer={modalFooter}
    >
      <form id="inquiry-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2 text-xs">
        {formError && (
          <div className="p-3 mb-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
            {formError}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <AdminInputField
            label="Guest Name"
            required
            placeholder="e.g. Dr. Jennifer Vance"
            error={errors.guestName?.message}
            {...register("guestName")}
          />

          <AdminInputField
            label="Email Address"
            type="email"
            required
            placeholder="e.g. jennifer@luxuryexpeditions.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <AdminInputField
            label="Phone / WhatsApp"
            required
            placeholder="e.g. +1 (415) 555-0199"
            error={errors.phone?.message}
            {...register("phone")}
          />

          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <AdminCountrySelect
                label="Country of Residence"
                required
                value={field.value}
                onChange={field.onChange}
                error={errors.country?.message}
                placeholder="Select or search country..."
              />
            )}
          />

          <AdminSelectField
            label="Region / Trip of Interest"
            required
            options={[
              { label: "Everest Region (Khumbu)", value: "Everest Region (Khumbu)" },
              { label: "Annapurna Region", value: "Annapurna Region" },
              { label: "Kathmandu Valley & Culture", value: "Kathmandu Valley & Culture" },
              { label: "Peak Climbing Expeditions", value: "Peak Climbing Expeditions" },
              { label: "Manaslu & Langtang Wilderness", value: "Manaslu & Langtang Wilderness" },
              { label: "Other / Custom Wilderness", value: "Other / Custom Wilderness" },
            ]}
            error={errors.interestedTrip?.message}
            value={watch("interestedTrip")}
            onChange={(val) => setValue("interestedTrip", val, { shouldValidate: true })}
          />

          <AdminSelectField
            label="Inquiry Type / Category"
            required
            options={[
              { label: "Trekking", value: InquiryType.TREKKING },
              { label: "Tour", value: InquiryType.TOUR },
              { label: "Expedition", value: InquiryType.EXPEDITION },
              { label: "General Inquiry", value: InquiryType.GENERAL },
            ]}
            error={errors.type?.message}
            value={watch("type")}
            onChange={(val) => setValue("type", val as InquiryType, { shouldValidate: true })}
          />

          <AdminSelectField
            label="Number of Travelers"
            required
            options={[
              { label: "1 (Solo Traveler)", value: "1" },
              { label: "2 (Couple / Friends)", value: "2" },
              { label: "3 to 5 (Private Group)", value: "3" },
              { label: "6+ Travelers (Expedition Team)", value: "6" },
            ]}
            error={errors.groupSize?.message}
            value={String(watch("groupSize") || 1)}
            onChange={(val) => setValue("groupSize", Number(val) || 1, { shouldValidate: true })}
          />

          <div className="col-span-2">
            <AdminInputField
              label="Target Travel Dates / Season"
              required
              placeholder="e.g. October 2026 / Autumn Season"
              error={errors.travelDates?.message}
              {...register("travelDates")}
            />
          </div>

          <div className="col-span-2">
            <AdminTextareaField
              label="Inquiry Message / Goals & Notes"
              required
              rows={3}
              placeholder="Notes from initial conversation, desired altitude goals, physical preparation level..."
              error={errors.message?.message}
              {...register("message")}
            />
          </div>
        </div>
      </form>
    </AdminModal>
  );
}

interface UpdateInquiryStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: Inquiry | null;
  onStatusUpdated?: (updatedInquiry: Inquiry) => void;
  onUpdateStatus?: (id: string, newStatus: any, notes?: string) => Promise<boolean> | void;
}

interface StageDefinition {
  step: number;
  label: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DEFAULT_INQUIRY_STAGES: StageDefinition[] = [
  {
    step: 1,
    label: "New lead",
    title: "New lead received",
    description: "Initial inquiry received from traveler. Review requested trip, travel dates, and group size.",
    icon: Sparkles,
  },
  {
    step: 2,
    label: "Contacted",
    title: "Contacted traveler",
    description: "Direct communication initiated with traveler via email, phone, or WhatsApp to qualify requirements.",
    icon: Phone,
  },
  {
    step: 3,
    label: "Quote sent",
    title: "Proposal & quote sent",
    description: "Detailed proposal, pricing, and customized itinerary dispatched to the client.",
    icon: Send,
  },
  {
    step: 4,
    label: "Booked",
    title: "Converted to booking",
    description: "Traveler accepted quote and confirmed trip booking.",
    icon: CheckCircle2,
  },
  {
    step: 5,
    label: "Closed",
    title: "Inquiry concluded",
    description: "Inquiry completed, archived, or marked lost/cancelled.",
    icon: CheckCheck,
  },
];

export function UpdateInquiryStatusModal({
  isOpen,
  onClose,
  inquiry,
  onStatusUpdated,
}: UpdateInquiryStatusModalProps) {
  const [stages] = useState<StageDefinition[]>(DEFAULT_INQUIRY_STAGES);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [localSteps, setLocalSteps] = useState<InquiryStep[]>([]);
  const [inquiryNotes, setInquiryNotes] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [showOriginalMessage, setShowOriginalMessage] = useState<boolean>(false);

  // Synchronize local steps with inquiry data on open
  useEffect(() => {
    if (isOpen && inquiry) {
      const initialized: InquiryStep[] = [0, 1, 2, 3, 4].map((i) => {
        const existing = inquiry.steps?.[i];
        return {
          status:
            existing?.status ||
            (i === 0 ? BookingStepStatus.COMPLETED : BookingStepStatus.PENDING),
          message: existing?.message || "",
        };
      });
      setLocalSteps(initialized);

      // Find the currently active step or default to first non-completed
      const firstIncomplete = initialized.findIndex(
        (s) =>
          s.status !== BookingStepStatus.COMPLETED &&
          s.status !== BookingStepStatus.CANCELLED
      );
      setActiveStepIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
      setInquiryNotes(inquiry.notes || "");
      setShowOriginalMessage(false);
    }
  }, [isOpen, inquiry]);

  if (!inquiry) return null;

  const currentStage = stages[activeStepIndex] || stages[0];
  const currentStepData = localSteps[activeStepIndex] || {
    status: BookingStepStatus.PENDING,
    message: "",
  };

  // Helper to change status of currently selected stage
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

  // Helper to update note/remark of currently selected stage
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

  // Save all workflow steps & general notes together
  const handleSaveAll = async () => {
    if (!inquiry || isUpdating) return;
    setIsUpdating(true);
    try {
      const res = await InquiryService.updateWorkflow(inquiry.id, {
        steps: localSteps,
      });

      if (res.success && res.data) {
        if (inquiryNotes.trim() !== (inquiry.notes || "").trim()) {
          await InquiryService.update(inquiry.id, { notes: inquiryNotes.trim() });
          res.data.notes = inquiryNotes.trim();
        }
        toast.success("Inquiry workflow updated successfully");
        onStatusUpdated?.(res.data);
        onClose();
      } else {
        toast.error(res.message || "Failed to update inquiry status");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update inquiry status");
    } finally {
      setIsUpdating(false);
    }
  };

  // Status dot helper for header tabs
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

  // Multi-step header navigation stepper tabs
  const tabsNav = (
    <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1 modal-scroll w-full py-0.5">
      {stages.map((stage, idx) => {
        const isActive = activeStepIndex === idx;
        const stepStatus = localSteps[idx]?.status || BookingStepStatus.PENDING;
        const isCompleted = stepStatus === BookingStepStatus.COMPLETED;
        const isCurrent =
          stepStatus === BookingStepStatus.IN_PROGRESS ||
          stepStatus === BookingStepStatus.ACTIVE;
        const isCancelled = stepStatus === BookingStepStatus.CANCELLED;

        return (
          <React.Fragment key={stage.step}>
            <button
              type="button"
              onClick={() => setActiveStepIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 border ${
                isActive
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs ring-1 ring-slate-900"
                  : isCompleted
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                  : isCurrent
                  ? "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
                  : isCancelled
                  ? "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
              }`}
            >
              {/* Step indicator circle */}
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  isActive
                    ? "bg-white text-slate-900"
                    : isCompleted
                    ? "bg-emerald-600 text-white"
                    : isCurrent
                    ? "bg-blue-600 text-white"
                    : isCancelled
                    ? "bg-rose-600 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                ) : isCancelled ? (
                  <X className="w-2.5 h-2.5 stroke-[3]" />
                ) : (
                  stage.step
                )}
              </span>

              <span>{stage.label}</span>
            </button>

            {idx < stages.length - 1 && (
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0 hidden sm:inline-block" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  // Modal Footer with Back, Next, Cancel, and Save
  const footer = (
    <div className="flex items-center justify-between gap-3 w-full">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
          disabled={activeStepIndex === 0 || isUpdating}
          className="text-xs h-9 px-3.5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setActiveStepIndex((prev) => Math.min(stages.length - 1, prev + 1))}
          disabled={activeStepIndex === stages.length - 1 || isUpdating}
          className="text-xs h-9 px-3.5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer inline-flex items-center gap-1.5"
        >
          <span>Next</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isUpdating}
          className="text-xs h-9 px-4 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
        >
          Cancel
        </Button>

        <Button
          type="button"
          onClick={handleSaveAll}
          disabled={isUpdating}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-9 px-5 rounded-xl cursor-pointer shadow-xs inline-flex items-center gap-1.5"
        >
          {isUpdating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>Save changes</span>
        </Button>
      </div>
    </div>
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Inquiry workflow steps"
      description={`Lead for ${inquiry.guestName} • ${inquiry.interestedTrip}`}
      subHeader={tabsNav}
      footer={footer}
      maxWidth="2xl"
    >
      <div className="space-y-4 py-1 text-xs">
        {/* Compact Traveler & Trip Context */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500">
                Traveler contact
              </span>
              <div className="font-bold text-slate-900 text-sm leading-tight">
                {inquiry.guestName}
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 font-medium text-xs">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{inquiry.email}</span>
              </div>
              {inquiry.phone && (
                <div className="flex items-center gap-1.5 text-slate-600 font-medium text-xs">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{inquiry.phone}</span>
                </div>
              )}
              <div className="text-slate-500 font-medium text-[11px]">{inquiry.country}</div>
            </div>

            <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-3">
              <span className="text-[11px] font-semibold text-slate-500">
                Trip &amp; schedule
              </span>
              <div className="font-bold text-slate-900 text-sm truncate">
                {inquiry.interestedTrip}
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 font-medium text-xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Dates: {inquiry.travelDates}</span>
              </div>
              <div className="text-slate-600 font-medium text-xs">
                Group: {inquiry.groupSize} {inquiry.groupSize === 1 ? "traveler" : "travelers"} &bull; {inquiry.type || "General"}
              </div>
            </div>
          </div>

          {/* Collapsible Guest Inquiry Note */}
          {inquiry.message && (
            <div className="pt-2 border-t border-slate-200/80">
              <button
                type="button"
                onClick={() => setShowOriginalMessage(!showOriginalMessage)}
                className="flex items-center justify-between w-full text-[11px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <span>Original guest message</span>
                <span className="text-slate-400 text-xs">
                  {showOriginalMessage ? "Hide message ▲" : "View message ▼"}
                </span>
              </button>
              {showOriginalMessage && (
                <div className="mt-1.5 p-2.5 bg-white rounded-lg border border-slate-200 text-slate-700 italic text-xs leading-relaxed max-h-32 overflow-y-auto">
                  &ldquo;{inquiry.message}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Active Step Details & Status/Message Editor */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3.5 shadow-2xs">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] text-slate-500 font-semibold tracking-wide">
                Step {currentStage.step} of {stages.length}
              </div>
              <h3 className="font-bold text-slate-900 text-base">{currentStage.title}</h3>
            </div>
            <div className="flex items-center gap-2">
              <AdminStatusBadge status={currentStepData.status} />
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed text-xs">
            {currentStage.description}
          </p>

          {/* Simple Stage Status Buttons (Natural casing, clear icons) */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-600 block">
              Step status:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => updateCurrentStatus(BookingStepStatus.IN_PROGRESS)}
                className={`px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                  currentStepData.status === BookingStepStatus.IN_PROGRESS ||
                  currentStepData.status === BookingStepStatus.ACTIVE
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>In progress</span>
              </button>

              <button
                type="button"
                onClick={() => updateCurrentStatus(BookingStepStatus.COMPLETED)}
                className={`px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                  currentStepData.status === BookingStepStatus.COMPLETED
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Completed</span>
              </button>

              <button
                type="button"
                onClick={() => updateCurrentStatus(BookingStepStatus.CANCELLED)}
                className={`px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                  currentStepData.status === BookingStepStatus.CANCELLED
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancelled / closed</span>
              </button>
            </div>
          </div>

          {/* Step Message / Remarks Input */}
          <div className="space-y-1">
            <AdminTextareaField
              label={`Step ${currentStage.step} message / remarks`}
              rows={2.5}
              placeholder={`Add notes or messages for "${currentStage.label}" (e.g. Discussed itinerary via WhatsApp, quote email sent)...`}
              value={currentStepData.message}
              onChange={(e) => updateCurrentMessage(e.target.value)}
            />
          </div>
        </div>

        {/* General Internal Notes */}
        <AdminTextareaField
          label="Internal notes (general)"
          rows={2}
          placeholder="Add general notes or internal remarks about this customer inquiry..."
          value={inquiryNotes}
          onChange={(e) => setInquiryNotes(e.target.value)}
        />
      </div>
    </AdminModal>
  );
}


interface ReplyInquiryEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: Inquiry | null;
  onSendReply: (id: string, message: string) => Promise<boolean>;
}

export function ReplyInquiryEmailModal({
  isOpen,
  onClose,
  inquiry,
  onSendReply,
}: ReplyInquiryEmailModalProps) {
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (inquiry && isOpen) {
      setReplyText("");
      setError(null);
    }
  }, [inquiry, isOpen]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiry || isSending) return;

    if (!replyText.trim()) {
      setError("Reply message is required");
      return;
    }

    setIsSending(true);
    setError(null);
    try {
      const success = await onSendReply(inquiry.id, replyText.trim());
      if (success) {
        setReplyText("");
        onClose();
      }
    } catch (err) {
      console.error("Quote dispatch error:", err);
    } finally {
      setIsSending(false);
    }
  };

  const footer = (
    <div className="flex items-center justify-end gap-2 w-full">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isSending}
        className="text-xs font-semibold h-9 px-4 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="reply-inquiry-email-form"
        disabled={isSending || !replyText.trim()}
        className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-9 px-4 rounded-lg cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
      >
        {isSending ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Sending...</span>
          </>
        ) : (
          <>
            <Send className="w-3.5 h-3.5" />
            <span>Send Email Reply</span>
          </>
        )}
      </Button>
    </div>
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Reply via Email"
      description={inquiry ? `Compose and send an email reply to ${inquiry.guestName}` : undefined}
      maxWidth="xl"
      footer={footer}
    >
      {inquiry && (
        <form id="reply-inquiry-email-form" onSubmit={handleSendReply} className="space-y-4 py-1 text-xs">
          {/* Recipient Details & Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
            <div className="space-y-1">
              <span className="text-slate-500 font-medium block">Recipient Email</span>
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{inquiry.email}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 font-medium block">Guest Name &amp; Phone</span>
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{inquiry.guestName} {inquiry.phone ? `(${inquiry.phone})` : ""}</span>
              </div>
            </div>

            <div className="space-y-1 sm:col-span-2 pt-1 border-t border-slate-200/60">
              <span className="text-slate-500 font-medium block">Trip of Interest &amp; Dates</span>
              <div className="font-medium text-slate-800 flex items-center gap-2">
                <span className="font-semibold text-slate-900">{inquiry.interestedTrip}</span>
                <span>&bull;</span>
                <span>{inquiry.travelDates} ({inquiry.groupSize} Pax)</span>
              </div>
            </div>
          </div>

          {/* Original Guest Message Preview */}
          <div className="space-y-1">
            <span className="font-bold text-slate-900 block">Original Guest Inquiry:</span>
            <div className="text-slate-800 font-medium bg-slate-50/60 border border-slate-200 p-3 rounded-xl leading-relaxed italic max-h-32 overflow-y-auto">
              &ldquo;{inquiry.message}&rdquo;
            </div>
          </div>

          {/* Email Compose Field using AdminTextareaField */}
          <div className="space-y-1">
            <AdminTextareaField
              label="Email Reply Message"
              required
              rows={5}
              value={replyText}
              onChange={(e) => {
                setReplyText(e.target.value);
                if (error) setError(null);
              }}
              placeholder={`Draft your custom quote, pricing, or itinerary reply to ${inquiry.email}...`}
              error={error || undefined}
            />
            <p className="text-[11px] text-slate-500 font-normal">
              This message will be emailed directly to <strong>{inquiry.email}</strong>. It does not change the lead status.
            </p>
          </div>
        </form>
      )}
    </AdminModal>
  );
}

// Backward-compatible alias
export const ReplyInquiryModal = ReplyInquiryEmailModal;

interface DeleteInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  guestName?: string;
  isDeleting?: boolean;
  error?: string | null;
}

export function DeleteInquiryModal({
  isOpen,
  onClose,
  onConfirm,
  guestName,
  isDeleting = false,
  error = null,
}: DeleteInquiryModalProps) {
  return (
    <AdminConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Inquiry Record"
      description={`Are you sure you want to delete inquiry lead for ${guestName || "this guest"}?`}
      confirmText="Delete Inquiry"
      cancelText="Cancel"
      variant="danger"
      isLoading={isDeleting}
      error={error}
    />
  );
}
