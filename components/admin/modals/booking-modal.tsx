"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Mail, Phone, Globe, Calendar, ShieldCheck } from "lucide-react";
import { Booking } from "@/lib/admin-data";
import { bookingSchema, BookingFormValues } from "@/lib/admin-schemas";
import { AdminInputField, AdminSelectField, AdminTextareaField } from "@/components/admin/forms/admin-form-fields";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DialogFooter } from "@/components/ui/dialog";

interface BookingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: Booking) => void;
  initialData?: Booking | null;
  isEditing?: boolean;
}

export function BookingFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing = false,
}: BookingFormModalProps) {
  const [editingMode, setEditingMode] = useState(isEditing);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookingFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(bookingSchema) as any,
    defaultValues: {
      guestName: "",
      guestEmail: "",
      guestPhone: "+1 (555) 234-5678",
      country: "United States",
      packageName: "Everest Base Camp Luxury Helicopter Trek",
      packageType: "Trekking",
      startDate: "2026-09-15",
      endDate: "2026-09-28",
      groupSize: 2,
      totalAmountUSD: 4800,
      paymentStatus: "Deposit Paid",
      bookingStatus: "Confirmed",
      assignedGuide: "Lakpa Tenzing Sherpa",
      permitStatus: "Issued",
      specialRequests: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        guestName: initialData.guestName,
        guestEmail: initialData.guestEmail,
        guestPhone: initialData.guestPhone,
        country: initialData.country,
        packageName: initialData.packageName,
        packageType: initialData.packageType,
        startDate: initialData.startDate,
        endDate: initialData.endDate,
        groupSize: initialData.groupSize,
        totalAmountUSD: initialData.totalAmountUSD,
        paymentStatus: initialData.paymentStatus,
        bookingStatus: initialData.bookingStatus,
        assignedGuide: initialData.assignedGuide || "",
        permitStatus: initialData.permitStatus,
        specialRequests: initialData.specialRequests || "",
      });
    } else {
      reset({
        guestName: "",
        guestEmail: "",
        guestPhone: "+1 (555) 234-5678",
        country: "United States",
        packageName: "Everest Base Camp Luxury Helicopter Trek",
        packageType: "Trekking",
        startDate: "2026-09-15",
        endDate: "2026-09-28",
        groupSize: 2,
        totalAmountUSD: 4800,
        paymentStatus: "Deposit Paid",
        bookingStatus: "Confirmed",
        assignedGuide: "Lakpa Tenzing Sherpa",
        permitStatus: "Issued",
        specialRequests: "",
      });
    }
    setEditingMode(isEditing || !initialData);
  }, [initialData, isEditing, isOpen, reset]);

  const onSubmit = (values: BookingFormValues) => {
    const bookingToSave: Booking = {
      id: initialData?.id || `bkg-${Date.now()}`,
      reference: initialData?.reference || `ACE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      guestName: values.guestName,
      guestEmail: values.guestEmail,
      guestPhone: values.guestPhone,
      country: values.country,
      packageName: values.packageName,
      packageType: values.packageType,
      startDate: values.startDate,
      endDate: values.endDate,
      groupSize: Number(values.groupSize),
      totalAmountUSD: Number(values.totalAmountUSD),
      paymentStatus: values.paymentStatus,
      bookingStatus: values.bookingStatus,
      assignedGuide: values.assignedGuide || undefined,
      permitStatus: values.permitStatus,
      specialRequests: values.specialRequests || undefined,
    };

    onSave(bookingToSave);
    onClose();
  };

  const modalTitle = !initialData
    ? "Create Manual Reservation"
    : editingMode
    ? `Edit Booking: ${initialData.reference}`
    : `Reservation ${initialData.reference}`;

  const modalDescription = !initialData
    ? "Enter reservation details received via phone or travel agency partner."
    : editingMode
    ? "Update guest details, payment statuses, and guide assignment."
    : `${initialData.packageName} • ${initialData.guestName}`;

  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={modalTitle} description={modalDescription} maxWidth="2xl">
      {editingMode ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <AdminInputField
              label="Lead Guest Name"
              required
              placeholder="e.g. Marcus Vance"
              error={errors.guestName?.message}
              {...register("guestName")}
            />

            <AdminInputField
              label="Guest Email"
              type="email"
              required
              placeholder="e.g. marcus@example.com"
              error={errors.guestEmail?.message}
              {...register("guestEmail")}
            />

            <AdminInputField
              label="Phone Number"
              required
              placeholder="+1 (555) 234-5678"
              error={errors.guestPhone?.message}
              {...register("guestPhone")}
            />

            <AdminInputField
              label="Country"
              required
              placeholder="United States"
              error={errors.country?.message}
              {...register("country")}
            />

            <div className="col-span-2">
              <AdminInputField
                label="Package Name"
                required
                error={errors.packageName?.message}
                {...register("packageName")}
              />
            </div>

            <AdminSelectField
              label="Category"
              required
              error={errors.packageType?.message}
              options={[
                { label: "Trekking", value: "Trekking" },
                { label: "Expedition", value: "Expedition" },
                { label: "Tour", value: "Tour" },
              ]}
              {...register("packageType")}
            />

            <AdminInputField
              label="Group Size"
              type="number"
              required
              error={errors.groupSize?.message}
              {...register("groupSize")}
            />

            <AdminInputField
              label="Start Date"
              type="date"
              required
              error={errors.startDate?.message}
              {...register("startDate")}
            />

            <AdminInputField
              label="End Date"
              type="date"
              required
              error={errors.endDate?.message}
              {...register("endDate")}
            />

            <AdminInputField
              label="Total USD"
              type="number"
              required
              error={errors.totalAmountUSD?.message}
              {...register("totalAmountUSD")}
            />

            <AdminSelectField
              label="Payment Status"
              required
              error={errors.paymentStatus?.message}
              options={[
                { label: "Deposit Paid", value: "Deposit Paid" },
                { label: "Paid", value: "Paid" },
                { label: "Pending", value: "Pending" },
                { label: "Refunded", value: "Refunded" },
              ]}
              {...register("paymentStatus")}
            />

            <AdminSelectField
              label="Booking Status"
              required
              error={errors.bookingStatus?.message}
              options={[
                { label: "Confirmed", value: "Confirmed" },
                { label: "In Review", value: "In Review" },
                { label: "Active Trek", value: "Active Trek" },
                { label: "Completed", value: "Completed" },
                { label: "Cancelled", value: "Cancelled" },
              ]}
              {...register("bookingStatus")}
            />

            <AdminSelectField
              label="Permit Status"
              required
              error={errors.permitStatus?.message}
              options={[
                { label: "Issued", value: "Issued" },
                { label: "Processing", value: "Processing" },
                { label: "Pending Document", value: "Pending Document" },
              ]}
              {...register("permitStatus")}
            />

            <div className="col-span-2">
              <AdminInputField
                label="Assigned Sherpa Guide"
                placeholder="e.g. Lakpa Tenzing Sherpa"
                error={errors.assignedGuide?.message}
                {...register("assignedGuide")}
              />
            </div>

            <div className="col-span-2">
              <AdminTextareaField
                label="Special Requests & Notes"
                rows={3}
                placeholder="Dietary requests or single supplement requirements..."
                error={errors.specialRequests?.message}
                {...register("specialRequests")}
              />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs font-semibold cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors">
              Save Reservation
            </Button>
          </DialogFooter>
        </form>
      ) : (
        <div className="space-y-5 py-2 text-xs">
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="space-y-1">
              <span className="text-slate-500 font-semibold block">Lead Guest</span>
              <div className="font-semibold text-slate-900 text-sm">{initialData?.guestName}</div>
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Mail className="w-3.5 h-3.5 text-amber-600" />
                <span>{initialData?.guestEmail}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Phone className="w-3.5 h-3.5 text-amber-600" />
                <span>{initialData?.guestPhone}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Globe className="w-3.5 h-3.5 text-amber-600" />
                <span>{initialData?.country}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 font-semibold block">Package Specs</span>
              <div className="font-semibold text-slate-900">{initialData?.packageName}</div>
              <div className="flex items-center gap-1 text-slate-700 font-medium">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>{initialData?.startDate} → {initialData?.endDate}</span>
              </div>
              <div className="font-medium text-slate-700 mt-1">
                Group: {initialData?.groupSize} Guests &bull; ${initialData?.totalAmountUSD.toLocaleString()} USD
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <span className="text-slate-500 font-semibold block">Payment Status</span>
              <Badge variant="outline" className="font-semibold text-slate-800 bg-white">
                {initialData?.paymentStatus}
              </Badge>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <span className="text-slate-500 font-semibold block">Permit Status</span>
              <div className="flex items-center gap-1 font-medium text-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{initialData?.permitStatus}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <span className="text-slate-500 font-semibold block">Assigned Sherpa</span>
              <div className="font-medium text-slate-800">
                {initialData?.assignedGuide || "Unassigned"}
              </div>
            </div>
          </div>

          {initialData?.specialRequests && (
            <div className="space-y-1">
              <span className="font-semibold text-slate-700 block">Special Requests &amp; Notes</span>
              <p className="text-slate-700 font-normal bg-amber-50/60 border border-amber-200 p-3 rounded-lg leading-relaxed">
                {initialData.specialRequests}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setEditingMode(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5 mr-1" />
              Edit Reservation
            </Button>
          </DialogFooter>
        </div>
      )}
    </AdminModal>
  );
}

interface DeleteBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bookingRef?: string;
  guestName?: string;
}

export function DeleteBookingModal({ isOpen, onClose, onConfirm, bookingRef, guestName }: DeleteBookingModalProps) {
  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Reservation"
      description={`Are you sure you want to delete reservation "${bookingRef}" for ${guestName}?`}
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
          Delete Reservation
        </Button>
      </DialogFooter>
    </AdminModal>
  );
}
