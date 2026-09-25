"use client";

import { AdminCountrySelect } from "@/components/admin/forms/admin-country-select";
import { AdminInputField, AdminSelectField, AdminTextareaField } from "@/components/admin/forms/admin-form-fields";
import { AdminConfirmModal } from "@/components/admin/ui/admin-confirm-modal";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Inquiry, InquiryStatus, InquiryType } from "@/lib/admin-data";
import { InquiryFormValues, inquirySchema } from "@/lib/admin-schemas";
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
  onUpdateStatus: (id: string, newStatus: InquiryStatus, notes?: string) => Promise<boolean> | void;
}

const INQUIRY_PHASES = [
  {
    status: InquiryStatus.NEW,
    stepNumber: 1,
    label: "New",
    title: "Phase 1: New Lead Received",
    message: "A fresh inquiry has arrived. Review traveler preferences, requested trip region, and target travel dates.",
    actionRecommendation: "Reach out via email or phone to confirm requirements, then move to Contacted.",
  },
  {
    status: InquiryStatus.CONTACTED,
    stepNumber: 2,
    label: "Contacted",
    title: "Phase 2: Initial Contact Made",
    message: "Initial outreach has been initiated with the traveler. Discussion regarding fitness, budget, group size, and route customization is ongoing.",
    actionRecommendation: "Prepare a tailored proposal and quote, then advance to Quote Sent.",
  },
  {
    status: InquiryStatus.QUOTE_SENT,
    stepNumber: 3,
    label: "Quote Sent",
    title: "Phase 3: Itinerary & Quotation Sent",
    message: "A formal itinerary proposal with package inclusions and pricing has been dispatched to the prospective guest.",
    actionRecommendation: "Follow up to answer questions. When the guest accepts and commits, transition to Booked.",
  },
  {
    status: InquiryStatus.BOOKED,
    stepNumber: 4,
    label: "Booked",
    title: "Phase 4: Converted to Confirmed Booking",
    message: "Lead successfully converted! The client accepted the proposal and a formal booking reservation has been created.",
    actionRecommendation: "Manage trip execution through the Admin Bookings ledger.",
  },
  {
    status: InquiryStatus.CLOSED,
    stepNumber: 5,
    label: "Closed",
    title: "Phase 5: Lead Concluded / Archived",
    message: "Communication is concluded or archived. Keep records available for future seasonal re-engagement.",
    actionRecommendation: "Lead lifecycle completed.",
  },
];

export function UpdateInquiryStatusModal({
  isOpen,
  onClose,
  inquiry,
  onUpdateStatus,
}: UpdateInquiryStatusModalProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [transitionNote, setTransitionNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (inquiry && isOpen) {
      const idx = INQUIRY_PHASES.findIndex((p) => p.status === inquiry.status);
      setActiveStepIndex(idx >= 0 ? idx : 0);
      setTransitionNote(inquiry.notes || "");
    }
  }, [inquiry, isOpen]);

  if (!inquiry) return null;

  const currentLeadPhaseIndex = INQUIRY_PHASES.findIndex((p) => p.status === inquiry.status);
  const currentViewedPhase = INQUIRY_PHASES[activeStepIndex];
  const isViewingCurrent = currentViewedPhase.status === inquiry.status;
  const isLastPhase = activeStepIndex === INQUIRY_PHASES.length - 1;
  const nextPhase = !isLastPhase ? INQUIRY_PHASES[activeStepIndex + 1] : null;

  const handleApplyStatus = async (targetStatus: InquiryStatus) => {
    if (!inquiry || isUpdating) return;
    setIsUpdating(true);
    try {
      const res = await onUpdateStatus(inquiry.id, targetStatus, transitionNote.trim() || undefined);
      if (res !== false) {
        toast.success(`Inquiry status updated to "${targetStatus}"`);
        const newIdx = INQUIRY_PHASES.findIndex((p) => p.status === targetStatus);
        if (newIdx >= 0) setActiveStepIndex(newIdx);
      }
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const tabsNav = (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 modal-scroll">
      {INQUIRY_PHASES.map((phase, idx) => {
        const isActive = activeStepIndex === idx;
        const isCurrent = inquiry.status === phase.status;
        const isCompletedBefore = currentLeadPhaseIndex >= 0 && idx < currentLeadPhaseIndex;

        return (
          <button
            key={phase.status}
            type="button"
            onClick={() => setActiveStepIndex(idx)}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              isActive
                ? "bg-slate-900 text-white shadow-xs"
                : isCurrent
                ? "bg-slate-100 text-slate-900 border border-slate-300 font-bold"
                : isCompletedBefore
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                : "bg-slate-100/70 text-slate-500 hover:bg-slate-200/70"
            }`}
          >
            {isCompletedBefore ? (
              <Check className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <span className="text-[11px] opacity-75">{phase.stepNumber}.</span>
            )}
            <span>{phase.label}</span>
            {isCurrent && (
              <span
                className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold tracking-wider ${
                  isActive
                    ? "bg-slate-700 text-slate-100"
                    : "bg-slate-800 text-white"
                }`}
              >
                Current
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  const footer = (
    <div className="flex items-center justify-between w-full gap-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
          disabled={activeStepIndex === 0 || isUpdating}
        >
          Back
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setActiveStepIndex((prev) => Math.min(INQUIRY_PHASES.length - 1, prev + 1))}
          disabled={activeStepIndex === INQUIRY_PHASES.length - 1 || isUpdating}
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

        {!isViewingCurrent ? (
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
            className="bg-slate-900 hover:bg-slate-800 text-white"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Lead Completed
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
      title="Inquiry Status Workflow"
      description={`Lead for ${inquiry.guestName} • ${inquiry.interestedTrip}`}
      subHeader={tabsNav}
      footer={footer}
      maxWidth="2xl"
    >
      <div className="space-y-4 py-1 text-xs">
        {/* Lead Context Snapshot */}
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

        {/* Phase Details Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">
                Phase {currentViewedPhase.stepNumber}: {currentViewedPhase.title}
              </h3>
              <AdminStatusBadge status={currentViewedPhase.status} />
            </div>
            {isViewingCurrent && (
              <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                Current Status
              </span>
            )}
          </div>

          <p className="text-slate-600 leading-relaxed text-xs">
            {currentViewedPhase.message}
          </p>

          <div className="pt-2 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <p>{currentViewedPhase.actionRecommendation}</p>
          </div>

          {!isViewingCurrent && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px]">
              <span>
                Current lead status: <strong className="text-slate-800">{inquiry.status}</strong>
              </span>
              <span className="text-slate-400">Click &ldquo;Set Status&rdquo; below to update.</span>
            </div>
          )}
        </div>

        {/* Transition Note Textarea */}
        <AdminTextareaField
          label="Transition Note / Remarks (Optional)"
          rows={3}
          placeholder="Add follow-up notes, discussion remarks, or next steps for this lead..."
          value={transitionNote}
          onChange={(e) => setTransitionNote(e.target.value)}
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
