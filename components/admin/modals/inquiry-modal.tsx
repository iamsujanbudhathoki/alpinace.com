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
} from "lucide-react";
import { useEffect, useState } from "react";
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

const DEFAULT_INQUIRY_PHASES: InquiryWorkflowPhase[] = [
  {
    step: 1,
    label: "New Lead",
    title: "New Lead Received",
    description:
      "Initial inquiry received from client. Review requested trip, travel dates, and group size.",
  },
  {
    step: 2,
    label: "Contacted",
    title: "Initial Contact Made",
    description:
      "Direct communication initiated with traveler via email or phone to qualify requirements.",
  },
  {
    step: 3,
    label: "Quote Sent",
    title: "Itinerary & Quotation Sent",
    description:
      "Detailed proposal, pricing, and customized itinerary dispatched to the client.",
  },
  {
    step: 4,
    label: "Booked",
    title: "Converted to Booking",
    description:
      "Client accepted quote and proceeded to confirm a trip booking.",
  },
  {
    step: 5,
    label: "Closed",
    title: "Inquiry Concluded",
    description:
      "Inquiry fulfilled, finalized, or archived.",
  },
];

const STEP_STATUS_OPTIONS = [
  { label: "Pending", value: BookingStepStatus.PENDING },
  { label: "In Progress", value: BookingStepStatus.IN_PROGRESS },
  { label: "Active", value: BookingStepStatus.ACTIVE },
  { label: "Completed", value: BookingStepStatus.COMPLETED },
  { label: "Cancelled", value: BookingStepStatus.CANCELLED },
];

export function UpdateInquiryStatusModal({
  isOpen,
  onClose,
  inquiry,
  onStatusUpdated,
  onUpdateStatus,
}: UpdateInquiryStatusModalProps) {
  const [phases, setPhases] = useState<InquiryWorkflowPhase[]>(DEFAULT_INQUIRY_PHASES);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [localSteps, setLocalSteps] = useState<InquiryStep[]>([]);
  const [inquiryNotes, setInquiryNotes] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Load workflow phases dynamically from backend
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadPhases() {
      try {
        const res = await InquiryService.getWorkflowPhases();
        if (isMounted && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setPhases(res.data);
        }
      } catch (err) {
        console.warn("Failed to fetch inquiry workflow phases, using default:", err);
      }
    }

    loadPhases();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Synchronize local steps with inquiry data
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

      // Find first non-completed step or default to 0
      const firstIncomplete = initialized.findIndex(
        (s) =>
          s.status !== BookingStepStatus.COMPLETED &&
          s.status !== BookingStepStatus.CANCELLED
      );
      setActiveStepIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
      setInquiryNotes(inquiry.notes || "");
    }
  }, [isOpen, inquiry]);

  if (!inquiry) return null;

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
    if (!inquiry || isUpdating) return;
    setIsUpdating(true);
    try {
      const res = await InquiryService.updateWorkflow(inquiry.id, {
        steps: localSteps,
      });

      if (res.success && res.data) {
        if (inquiryNotes !== (inquiry.notes || "")) {
          await InquiryService.update(inquiry.id, { notes: inquiryNotes.trim() });
          res.data.notes = inquiryNotes.trim();
        }
        toast.success("Inquiry step statuses & messages saved successfully");
        onStatusUpdated?.(res.data);
      } else {
        toast.error(res.message || "Failed to update inquiry steps");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update inquiry steps");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuickStatusChange = async (targetStatus: BookingStepStatus) => {
    if (!inquiry || isUpdating) return;
    setIsUpdating(true);
    try {
      const updatedSteps = [...localSteps];
      updatedSteps[activeStepIndex] = {
        ...updatedSteps[activeStepIndex],
        status: targetStatus,
      };
      setLocalSteps(updatedSteps);

      const res = await InquiryService.updateWorkflow(inquiry.id, {
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
      title="Inquiry Workflow Steps"
      description={`Lead for ${inquiry.guestName} • ${inquiry.interestedTrip}`}
      subHeader={tabsNav}
      footer={footer}
      maxWidth="2xl"
    >
      <div className="space-y-4 py-1 text-xs">
        {/* Inquiry Summary Box */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="space-y-1">
            <span className="text-slate-500 font-semibold block text-[11px]">Traveler Contact</span>
            <div className="font-semibold text-slate-900 text-sm">{inquiry.guestName}</div>
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{inquiry.email}</span>
            </div>
            {inquiry.phone && (
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{inquiry.phone}</span>
              </div>
            )}
            <div className="text-slate-500 font-medium text-[11px]">{inquiry.country}</div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 font-semibold block text-[11px]">Trip &amp; Schedule</span>
            <div className="font-semibold text-slate-900 text-sm truncate">{inquiry.interestedTrip}</div>
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{inquiry.travelDates}</span>
            </div>
            <div className="font-medium text-slate-700">
              {inquiry.groupSize} {inquiry.groupSize === 1 ? "Traveler" : "Travelers"} &bull; {inquiry.type || "General"}
            </div>
          </div>
        </div>

        {/* Original Guest Message */}
        {inquiry.message && (
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 font-semibold block text-[11px]">Original Inquiry Message</span>
            <p className="text-slate-700 leading-relaxed italic text-xs">
              &ldquo;{inquiry.message}&rdquo;
            </p>
          </div>
        )}

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
            placeholder={`Add notes or messages for "${currentViewedPhase.title}" (e.g. Discussed itinerary via WhatsApp, quotation email sent, confirmed booking reservation)...`}
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
          </div>

          <div className="space-y-2">
            {phases.map((p, idx) => {
              const step = localSteps[idx] || {
                status: BookingStepStatus.PENDING,
                message: "",
              };
              const isSelected = activeStepIndex === idx;

              return (
                <div
                  key={p.step}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-slate-50/80 border-slate-300 ring-1 ring-slate-300"
                      : "bg-white border-slate-200/80 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${getStatusDotColor(step.status)}`} />
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                        <span>
                          {p.step}. {p.title}
                        </span>
                      </div>
                      {step.message ? (
                        <p className="text-[11px] text-slate-600 truncate max-w-md mt-0.5">
                          {step.message}
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic mt-0.5">No message recorded</p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <AdminStatusBadge status={step.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* General Internal Notes */}
        <AdminTextareaField
          label="Internal Notes (General)"
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
