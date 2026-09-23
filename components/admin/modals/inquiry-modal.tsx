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
import { CheckCircle, Loader2, Mail, Phone, Send } from "lucide-react";
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
  onUpdateStatus: (id: string, newStatus: InquiryStatus) => Promise<boolean> | void;
}

export function UpdateInquiryStatusModal({
  isOpen,
  onClose,
  inquiry,
  onUpdateStatus,
}: UpdateInquiryStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<InquiryStatus>(
    inquiry ? inquiry.status : ("" as InquiryStatus)
  );
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (inquiry) {
      setSelectedStatus(inquiry.status);
    }
  }, [inquiry, isOpen]);

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiry || isUpdating) return;

    setIsUpdating(true);
    try {
      const res = await onUpdateStatus(inquiry.id, selectedStatus);
      if (res !== false) {
        onClose();
      }
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const statusOptions = Object.values(InquiryStatus).map((st) => ({
    label: st,
    value: st,
  }));

  const footer = (
    <div className="flex items-center justify-end gap-2 w-full">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isUpdating}
        className="text-xs font-semibold h-9 px-4 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="update-inquiry-status-form"
        disabled={isUpdating}
        className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-9 px-4 rounded-lg cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
      >
        {isUpdating ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Updating...</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Save Status</span>
          </>
        )}
      </Button>
    </div>
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Lead Status"
      description={inquiry ? `Lead for ${inquiry.guestName} • ${inquiry.interestedTrip}` : undefined}
      maxWidth="md"
      footer={footer}
    >
      {inquiry && (
        <form id="update-inquiry-status-form" onSubmit={handleSaveStatus} className="space-y-4 py-1 text-xs">
          {/* Quick Context Summary */}
          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Guest Name</span>
              <span className="font-bold text-slate-900">{inquiry.guestName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Email</span>
              <span className="font-semibold text-slate-800">{inquiry.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Trip / Region</span>
              <span className="font-medium text-slate-800">{inquiry.interestedTrip}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
              <span className="text-slate-500 font-medium">Current Status</span>
              <AdminStatusBadge status={inquiry.status} />
            </div>
          </div>

          {/* Reusable Select Field */}
          <div className="space-y-1.5 pt-1">
            <AdminSelectField
              label="Lead Status"
              required
              options={statusOptions}
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val as InquiryStatus)}
            />
            <p className="text-[11px] text-slate-500 font-normal">
              Change the pipeline status of this inquiry. This action updates only the status record and does not send an email.
            </p>
          </div>
        </form>
      )}
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
