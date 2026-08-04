"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Mail, Phone, Globe } from "lucide-react";
import { Inquiry } from "@/lib/admin-data";
import { inquirySchema, InquiryFormValues } from "@/lib/admin-schemas";
import { AdminInputField, AdminTextareaField } from "@/components/admin/forms/admin-form-fields";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

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
      country: "United States",
      interestedTrip: "Everest Base Camp Luxury Trek",
      travelDates: "October 2026",
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
        country: "United States",
        interestedTrip: "Everest Base Camp Luxury Trek",
        travelDates: "October 2026",
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
      status: "New",
      notes: "Logged via admin CRM desk.",
    };

    onSave(newInquiry);
    onClose();
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Manual Customer Inquiry"
      description="Record a phone, WhatsApp, or trade show lead into the CRM."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <AdminInputField
            label="Guest Name"
            required
            placeholder="e.g. Sarah Jenkins"
            error={errors.guestName?.message}
            {...register("guestName")}
          />

          <AdminInputField
            label="Email Address"
            type="email"
            required
            placeholder="e.g. sarah@example.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <AdminInputField
            label="Phone / WhatsApp"
            required
            placeholder="+44 7700 900077"
            error={errors.phone?.message}
            {...register("phone")}
          />

          <AdminInputField
            label="Country"
            required
            placeholder="United Kingdom"
            error={errors.country?.message}
            {...register("country")}
          />

          <div className="col-span-2">
            <AdminInputField
              label="Interested Expedition / Trek"
              required
              error={errors.interestedTrip?.message}
              {...register("interestedTrip")}
            />
          </div>

          <AdminInputField
            label="Target Dates"
            required
            placeholder="October 2026"
            error={errors.travelDates?.message}
            {...register("travelDates")}
          />

          <AdminInputField
            label="Group Size"
            type="number"
            required
            error={errors.groupSize?.message}
            {...register("groupSize")}
          />

          <div className="col-span-2">
            <AdminTextareaField
              label="Inquiry Message / Special Goals"
              required
              rows={3}
              placeholder="Notes from initial conversation..."
              error={errors.message?.message}
              {...register("message")}
            />
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="text-xs font-semibold cursor-pointer">
            Cancel
          </Button>
          <Button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer">
            Log Inquiry Lead
          </Button>
        </DialogFooter>
      </form>
    </AdminModal>
  );
}

interface ReplyInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: Inquiry | null;
  onUpdateStatus: (id: string, newStatus: Inquiry["status"]) => void;
}

export function ReplyInquiryModal({
  isOpen,
  onClose,
  inquiry,
  onUpdateStatus,
}: ReplyInquiryModalProps) {
  const [replyText, setReplyText] = useState("");

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiry || !replyText) return;

    onUpdateStatus(inquiry.id, "Quote Sent");
    setReplyText("");
    onClose();
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Inquiry from ${inquiry?.guestName}`}
      description={`${inquiry?.interestedTrip} • Received ${inquiry?.createdAt}`}
      maxWidth="2xl"
    >
      <div className="space-y-5 py-2 text-xs">
        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="space-y-1">
            <span className="text-slate-700 font-bold block">Contact Email:</span>
            <div className="font-bold text-slate-900 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-amber-600" />
              <span>{inquiry?.email}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-700 font-bold block">Phone / WhatsApp:</span>
            <div className="font-bold text-slate-900 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              <span>{inquiry?.phone}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-700 font-bold block">Country &amp; Group:</span>
            <div className="font-bold text-slate-900 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-amber-600" />
              <span>{inquiry?.country} ({inquiry?.groupSize} Pax)</span>
            </div>
          </div>

          <div>
            <AdminStatusBadge status={inquiry?.status || "New"} />
          </div>
        </div>

        <div className="space-y-1">
          <span className="font-bold text-slate-800 block">Guest Message &amp; Requirements:</span>
          <p className="text-slate-800 font-normal bg-stone-50 border border-slate-200 p-3 rounded-lg leading-relaxed italic">
            &ldquo;{inquiry?.message}&rdquo;
          </p>
        </div>

        <div className="space-y-1 pt-2 border-t border-slate-100">
          <span className="font-bold text-slate-800 block">Update Lead Status:</span>
          <div className="flex flex-wrap gap-2">
            {(["New", "Contacted", "Quote Sent", "Booked", "Closed"] as Inquiry["status"][]).map((st) => (
              <Button
                key={st}
                size="sm"
                variant={inquiry?.status === st ? "default" : "outline"}
                onClick={() => inquiry && onUpdateStatus(inquiry.id, st)}
                className={`text-xs font-semibold cursor-pointer ${
                  inquiry?.status === st
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {st}
              </Button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSendReply} className="space-y-3 pt-2 border-t border-slate-100">
          <label className="font-bold text-slate-800 block">Send Custom Quote &amp; Dispatch Email</label>
          <textarea
            rows={4}
            required
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Draft custom quote itinerary and pricing details to ${inquiry?.email}...`}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 font-normal leading-relaxed focus:outline-none focus:border-amber-500"
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="text-xs font-semibold cursor-pointer">
              Close
            </Button>
            <Button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer">
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Dispatch Quote Email
            </Button>
          </DialogFooter>
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
  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Inquiry"
      description={`Are you sure you want to remove the inquiry from "${guestName}"?`}
      maxWidth="md"
    >
      <DialogFooter className="pt-2">
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
      </DialogFooter>
    </AdminModal>
  );
}
