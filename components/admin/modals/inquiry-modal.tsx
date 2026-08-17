"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Mail, Phone, Globe } from "lucide-react";
import { Inquiry, InquiryStatus } from "@/lib/admin-data";
import { inquirySchema, InquiryFormValues } from "@/lib/admin-schemas";
import { AdminInputField, AdminSelectField, AdminTextareaField } from "@/components/admin/forms/admin-form-fields";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { COUNTRY_OPTIONS } from "@/lib/country-list";

interface InquiryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (inquiry: Inquiry) => void;
}

export function InquiryFormModal({ isOpen, onClose, onSave }: InquiryFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
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
    },
  });

  useEffect(() => {
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
      });
    }
  }, [isOpen, reset]);

  const onSubmit = (values: InquiryFormValues) => {
    const newInquiry: Inquiry = {
      id: `inq-${Date.now()}`,
      guestName: values.guestName,
      email: values.email,
      phone: values.phone,
      country: values.country,
      interestedTrip: values.interestedTrip,
      travelDates: values.travelDates,
      groupSize: Number(values.groupSize),
      message: values.message,
      createdAt: "Just now",
      status: InquiryStatus.NEW,
      notes: "Logged via admin CRM desk.",
    };

    onSave(newInquiry);
    onClose();
  };

  const modalFooter = (
    <div className="flex items-center justify-end gap-2 w-full">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        className="text-xs font-semibold h-9 px-4 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="inquiry-form"
        className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow-2xs cursor-pointer"
      >
        Log Inquiry Lead
      </Button>
    </div>
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Manual Customer Inquiry"
      description="Record a phone, WhatsApp, or trade show lead into the CRM."
      maxWidth="lg"
      footer={modalFooter}
    >
      <form id="inquiry-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2 text-xs">
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

          <AdminSelectField
            label="Country of Residence"
            required
            options={[
              { label: "Select Country...", value: "" },
              ...COUNTRY_OPTIONS,
            ]}
            error={errors.country?.message}
            {...register("country")}
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
            {...register("interestedTrip")}
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
            {...register("groupSize")}
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

interface ReplyInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: Inquiry | null;
  onUpdateStatus: (id: string, newStatus: InquiryStatus) => Promise<boolean> | void;
  onSendQuote?: (id: string, message: string, status: InquiryStatus) => Promise<boolean>;
}

export function ReplyInquiryModal({
  isOpen,
  onClose,
  inquiry,
  onUpdateStatus,
  onSendQuote,
}: ReplyInquiryModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<InquiryStatus>(inquiry?.status || InquiryStatus.NEW);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (inquiry) {
      setSelectedStatus(inquiry.status);
      setReplyText("");
    }
  }, [inquiry, isOpen]);

  const handleStatusClick = async (st: InquiryStatus) => {
    if (!inquiry) return;
    setSelectedStatus(st);
    await onUpdateStatus(inquiry.id, st);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiry || isSending) return;

    setIsSending(true);
    try {
      let success = false;
      const hasMessage = replyText.trim().length > 0;

      if (hasMessage && onSendQuote) {
        success = await onSendQuote(inquiry.id, replyText, selectedStatus);
      } else {
        const res = await onUpdateStatus(inquiry.id, selectedStatus);
        success = res !== false;
      }

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

  const replyFooter = (
    <div className="flex items-center justify-end gap-2 w-full">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        className="text-xs font-semibold h-9 px-4 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
      >
        Close
      </Button>
      <Button
        type="submit"
        form="reply-inquiry-form"
        disabled={isSending}
        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs h-9 px-4 rounded-xl shadow-2xs cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
      >
        <Send className="w-3.5 h-3.5" />
        <span>
          {isSending
            ? "Saving..."
            : replyText.trim()
            ? "Dispatch Quote Email"
            : "Save Status Update"}
        </span>
      </Button>
    </div>
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Inquiry from ${inquiry?.guestName}`}
      description={`${inquiry?.interestedTrip} • Received ${inquiry?.createdAt}`}
      maxWidth="2xl"
      footer={replyFooter}
    >
      <div className="space-y-5 py-2 text-xs">
        <div className="flex items-center justify-between bg-slate-50/80 p-4 rounded-xl border border-slate-200">
          <div className="space-y-1">
            <span className="text-slate-700 font-bold block">Contact Email:</span>
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-600" />
              <span>{inquiry?.email}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-700 font-bold block">Phone / WhatsApp:</span>
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              <span>{inquiry?.phone}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-700 font-bold block">Country &amp; Group:</span>
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-600" />
              <span>{inquiry?.country} ({inquiry?.groupSize} Pax)</span>
            </div>
          </div>

          <div>
            <AdminStatusBadge status={selectedStatus} />
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="font-bold text-slate-900 block">Guest Message &amp; Requirements:</span>
          <p className="text-slate-800 font-medium bg-slate-50/60 border border-slate-200 p-3 rounded-xl leading-relaxed italic">
            &ldquo;{inquiry?.message}&rdquo;
          </p>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <span className="font-bold text-slate-900 block">Update Lead Status:</span>
          <div className="flex flex-wrap gap-2">
            {Object.values(InquiryStatus).map((st) => (
              <Button
                key={st}
                type="button"
                size="sm"
                onClick={() => handleStatusClick(st)}
                className={`text-xs h-8 px-3 rounded-lg cursor-pointer ${
                  selectedStatus === st
                    ? "bg-slate-900 text-white font-bold"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 font-medium"
                }`}
              >
                {st}
              </Button>
            ))}
          </div>
        </div>

        <form id="reply-inquiry-form" onSubmit={handleSendReply} className="space-y-3 pt-2 border-t border-slate-100">
          <div className="space-y-0.5">
            <label className="font-bold text-slate-900 block">Send Custom Quote &amp; Dispatch Email</label>
            <p className="text-slate-500 font-normal">
              {replyText.trim()
                ? `Will email quote to ${inquiry?.email} and mark status as "${selectedStatus}".`
                : `Leave blank to only update lead status to "${selectedStatus}" without sending an email.`}
            </p>
          </div>
          <textarea
            rows={4}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Draft custom quote itinerary and pricing details to ${inquiry?.email}...`}
            className="w-full bg-slate-50/60 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium text-xs leading-relaxed focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400"
          />
        </form>
      </div>
    </AdminModal>
  );
}

interface DeleteInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  guestName?: string;
}

export function DeleteInquiryModal({ isOpen, onClose, onConfirm, guestName }: DeleteInquiryModalProps) {
  const deleteFooter = (
    <div className="flex items-center justify-end gap-2 w-full">
      <Button variant="outline" onClick={onClose} className="text-xs font-semibold cursor-pointer">
        Cancel
      </Button>
      <Button
        onClick={() => {
          onConfirm();
          onClose();
        }}
        className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
      >
        Delete Inquiry
      </Button>
    </div>
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Inquiry"
      description={`Are you sure you want to remove the inquiry from "${guestName}"?`}
      maxWidth="md"
      footer={deleteFooter}
    >
      <div className="text-sm text-slate-700 py-2">
        This will remove the inquiry record from your active CRM inbox.
      </div>
    </AdminModal>
  );
}
