"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Mail, Phone, Globe, Calendar, Loader2, Footprints, Mountain, Compass, Info, ExternalLink } from "lucide-react";
import {
  Booking,
  BookingPackageType,
  BookingPaymentStatus,
  BookingStatus,
  BookingPermitStatus,
  PackageItem,
  PackageStatus,
} from "@/lib/admin-data";
import { TrekItem } from "@/lib/trek-data";
import { bookingSchema, BookingFormValues } from "@/lib/admin-schemas";
import { TrekService, TourService, ExpeditionService } from "@/lib/services/admin-service";
import { AdminInputField, AdminSelectField, AdminTextareaField } from "@/components/admin/forms/admin-form-fields";
import { AdminCountrySelect } from "@/components/admin/forms/admin-country-select";
import { AdminSearchableSelect, SearchableSelectOption } from "@/components/admin/forms/admin-searchable-select";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { AdminConfirmModal } from "@/components/admin/ui/admin-confirm-modal";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Button } from "@/components/ui/button";

interface BookingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: Booking) => Promise<boolean | void> | boolean | void;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);

  // Inventory data
  const [treks, setTreks] = useState<TrekItem[]>([]);
  const [tours, setTours] = useState<PackageItem[]>([]);
  const [expeditions, setExpeditions] = useState<PackageItem[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<BookingFormValues, any, BookingFormValues>({
    resolver: zodResolver(bookingSchema) as any,
    defaultValues: {
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      country: "",
      packageName: "",
      packageType: BookingPackageType.TREKKING,
      startDate: "",
      endDate: "",
      groupSize: 1,
      totalAmountUSD: 0,
      paymentStatus: BookingPaymentStatus.PENDING,
      bookingStatus: BookingStatus.IN_REVIEW,
      assignedGuide: "",
      permitStatus: BookingPermitStatus.PROCESSING,
      specialRequests: "",
    },
  });

  const currentPackageType = watch("packageType");
  const currentPackageName = watch("packageName");

  // Load Inventory when modal opens
  useEffect(() => {
    if (!isOpen) return;

    async function loadData() {
      setLoadingInventory(true);
      try {
        const [treksData, toursData, expeditionsData] = await Promise.all([
          TrekService.getAll(),
          TourService.getAll(),
          ExpeditionService.getAll(),
        ]);
        setTreks(treksData);
        setTours(toursData);
        setExpeditions(expeditionsData);
      } catch (err) {
        console.error("Failed to load inventory for booking modal:", err);
      } finally {
        setLoadingInventory(false);
      }
    }
    loadData();
  }, [isOpen]);

  // Filter Available Items by Type and Active Status
  const availableItems = useMemo(() => {
    let rawItems: (TrekItem | PackageItem)[] = [];
    if (currentPackageType === BookingPackageType.TREKKING) {
      rawItems = treks;
    } else if (currentPackageType === BookingPackageType.EXPEDITION) {
      rawItems = expeditions;
    } else if (currentPackageType === BookingPackageType.TOUR) {
      rawItems = tours;
    }

    // Only include valid/active options (not drafts)
    return rawItems.filter((i) => i.status !== PackageStatus.DRAFT);
  }, [currentPackageType, treks, expeditions, tours]);

  // Currently selected item object (for preview specs)
  const selectedItemObj = useMemo(() => {
    if (!currentPackageName) return null;
    let list: (TrekItem | PackageItem)[] = [];
    if (currentPackageType === BookingPackageType.TREKKING) list = treks;
    else if (currentPackageType === BookingPackageType.EXPEDITION) list = expeditions;
    else if (currentPackageType === BookingPackageType.TOUR) list = tours;

    return list.find((i) => i.title.toLowerCase() === currentPackageName.toLowerCase()) || null;
  }, [currentPackageName, currentPackageType, treks, expeditions, tours]);

  // Options for AdminSearchableSelect dynamic product selection
  const packageSelectOptions: SearchableSelectOption[] = useMemo(() => {
    return availableItems.map((item) => ({
      value: item.title,
      label: item.title,
      badge: `${item.durationDays} Days`,
      badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
      description: `${item.region} • $${(item.priceUSD || 0).toLocaleString()} USD / person`,
    }));
  }, [availableItems]);

  const [formError, setFormError] = useState<string | null>(null);

  // Reset or Populate form on opening / initialData change
  useEffect(() => {
    setFormError(null);
    setIsSubmitting(false);
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
        guestPhone: "",
        country: "",
        packageName: "",
        packageType: BookingPackageType.TREKKING,
        startDate: "",
        endDate: "",
        groupSize: 1,
        totalAmountUSD: 0,
        paymentStatus: BookingPaymentStatus.PENDING,
        bookingStatus: BookingStatus.IN_REVIEW,
        assignedGuide: "",
        permitStatus: BookingPermitStatus.PROCESSING,
        specialRequests: "",
      });
    }
    setEditingMode(isEditing || !initialData);
  }, [initialData, isEditing, isOpen, reset]);

  const handleClose = () => {
    setFormError(null);
    setIsSubmitting(false);
    onClose();
  };

  // Handle Type Change (resets dependent item selection)
  const handleTypeChange = (newType: BookingPackageType) => {
    setValue("packageType", newType, { shouldValidate: true });
    setValue("packageName", "", { shouldValidate: true });
  };

  // Handle Item Selection (auto-fills price & duration)
  const handleItemSelect = (itemTitle: string) => {
    setValue("packageName", itemTitle, { shouldValidate: true });

    let item = availableItems.find((i) => i.title === itemTitle);
    if (!item) {
      let list: (TrekItem | PackageItem)[] = [];
      if (currentPackageType === BookingPackageType.TREKKING) list = treks;
      else if (currentPackageType === BookingPackageType.EXPEDITION) list = expeditions;
      else if (currentPackageType === BookingPackageType.TOUR) list = tours;
      item = list.find((i) => i.title === itemTitle);
    }

    if (item) {
      // Auto-calculate Total USD
      const size = Number(getValues("groupSize")) || 1;
      const calculatedTotal = (item.priceUSD || 0) * size;
      setValue("totalAmountUSD", calculatedTotal, { shouldValidate: true });

      // Auto-calculate End Date if Start Date is set
      const sDate = getValues("startDate");
      if (sDate && item.durationDays) {
        const nights = Math.max(1, item.durationDays) - 1;
        const d = new Date(sDate);
        d.setDate(d.getDate() + nights);
        setValue("endDate", d.toISOString().split("T")[0], { shouldValidate: true });
      }
    }
  };

  // Auto-calculate end date when Start Date changes
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setValue("startDate", newStartDate, { shouldValidate: true });
    if (newStartDate && selectedItemObj?.durationDays) {
      const nights = Math.max(1, selectedItemObj.durationDays) - 1;
      const d = new Date(newStartDate);
      d.setDate(d.getDate() + nights);
      setValue("endDate", d.toISOString().split("T")[0], { shouldValidate: true });
    }
  };

  // Auto-calculate total price when Group Size changes
  const handleGroupSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = Number(e.target.value) || 1;
    setValue("groupSize", newSize, { shouldValidate: true });
    if (selectedItemObj && selectedItemObj.priceUSD) {
      setValue("totalAmountUSD", selectedItemObj.priceUSD * newSize, { shouldValidate: true });
    }
  };

  const onSubmit = async (values: BookingFormValues) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const bookingToSave: Booking = {
        id: initialData?.id || `bkg-${Date.now()}`,
        reference: initialData?.reference || `ACE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        guestName: values.guestName.trim(),
        guestEmail: values.guestEmail.trim(),
        guestPhone: values.guestPhone.trim(),
        country: values.country.trim(),
        packageName: values.packageName.trim(),
        packageType: values.packageType,
        startDate: values.startDate,
        endDate: values.endDate,
        groupSize: Number(values.groupSize),
        totalAmountUSD: Number(values.totalAmountUSD),
        paymentStatus: values.paymentStatus,
        bookingStatus: values.bookingStatus,
        assignedGuide: values.assignedGuide ? values.assignedGuide.trim() : undefined,
        permitStatus: values.permitStatus,
        specialRequests: values.specialRequests ? values.specialRequests.trim() : undefined,
      };

      const success = await onSave(bookingToSave);
      if (success !== false) {
        onClose();
      } else {
        setFormError("Failed to save booking. Please check form inputs.");
      }
    } catch (err: any) {
      setFormError(err?.message || "Failed to save booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const dynamicItemLabel =
    currentPackageType === BookingPackageType.TREKKING
      ? "Select Trek"
      : currentPackageType === BookingPackageType.EXPEDITION
      ? "Select Expedition"
      : "Select Tour";

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

  // Direct package link calculation for view mode
  const packageLink = useMemo(() => {
    if (!initialData) return "#";
    let matchedId = "";
    if (initialData.packageType === BookingPackageType.TREKKING) {
      matchedId = treks.find((t) => t.title.toLowerCase() === initialData.packageName.toLowerCase())?.id || "";
      return matchedId ? `/admin/treks?viewId=${matchedId}` : `/admin/treks`;
    } else if (initialData.packageType === BookingPackageType.EXPEDITION) {
      matchedId = expeditions.find((e) => e.title.toLowerCase() === initialData.packageName.toLowerCase())?.id || "";
      return matchedId ? `/admin/expeditions?viewId=${matchedId}` : `/admin/expeditions`;
    } else {
      matchedId = tours.find((t) => t.title.toLowerCase() === initialData.packageName.toLowerCase())?.id || "";
      return matchedId ? `/admin/tours?viewId=${matchedId}` : `/admin/tours`;
    }
  }, [initialData, treks, expeditions, tours]);

  // Always-Visible Sticky Footers
  const editFooter = (
    <div className="flex items-center justify-between gap-3 w-full">
      <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
        All changes are validated and saved directly to the database.
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={isSubmitting}
          className="text-xs font-semibold cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="booking-form"
          disabled={isSubmitting}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              Saving Reservation...
            </span>
          ) : (
            "Save Reservation"
          )}
        </Button>
      </div>
    </div>
  );

  const viewFooter = (
    <div className="flex items-center justify-between gap-3 w-full">
      <Button
        type="button"
        variant="outline"
        onClick={handleClose}
        className="text-xs font-semibold cursor-pointer"
      >
        Close
      </Button>
      <Button
        onClick={() => setEditingMode(true)}
        className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer"
      >
        <Edit className="w-3.5 h-3.5 mr-1" />
        Edit Reservation
      </Button>
    </div>
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
      description={modalDescription}
      maxWidth="2xl"
      footer={editingMode ? editFooter : viewFooter}
    >
      {editingMode ? (
        <form id="booking-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1 text-xs">
          {formError && (
            <div className="p-3 mb-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
              {formError}
            </div>
          )}
          {/* Guest Information Section */}
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 space-y-3">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <Mail className="w-3.5 h-3.5 text-amber-600" />
              <span>Guest Details</span>
            </div>
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

              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <AdminCountrySelect
                    label="Country"
                    required
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.country?.message}
                    placeholder="Select or search country..."
                  />
                )}
              />
            </div>
          </div>

          {/* Dynamic Inventory Selection Section */}
          <div className="bg-amber-50/30 p-3 rounded-xl border border-amber-200/60 space-y-3">
            <div className="font-semibold text-slate-800 flex items-center justify-between pb-1 border-b border-amber-200/60">
              <div className="flex items-center gap-1.5">
                {currentPackageType === BookingPackageType.TREKKING && <Footprints className="w-3.5 h-3.5 text-amber-600" />}
                {currentPackageType === BookingPackageType.EXPEDITION && <Mountain className="w-3.5 h-3.5 text-amber-600" />}
                {currentPackageType === BookingPackageType.TOUR && <Compass className="w-3.5 h-3.5 text-amber-600" />}
                <span>Product / Inventory Selection</span>
              </div>
              {loadingInventory && (
                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                  Loading inventory...
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Step 1: Reservation Type */}
              <AdminSelectField
                label="Reservation Type"
                required
                value={currentPackageType}
                onChange={(e) => handleTypeChange(e.target.value as BookingPackageType)}
                options={[
                  { label: "Trekking", value: BookingPackageType.TREKKING },
                  { label: "Expedition", value: BookingPackageType.EXPEDITION },
                  { label: "Tour", value: BookingPackageType.TOUR },
                ]}
                error={errors.packageType?.message}
              />

              {/* Step 2: Dynamic Item Selection */}
              <AdminSearchableSelect
                label={dynamicItemLabel}
                required
                value={currentPackageName}
                options={packageSelectOptions}
                onChange={(val) => handleItemSelect(val)}
                error={errors.packageName?.message}
                placeholder={
                  availableItems.length > 0
                    ? `Select or search ${dynamicItemLabel.toLowerCase()}...`
                    : `No available ${currentPackageType}s found`
                }
                searchPlaceholder={`Search by ${currentPackageType} name, region, duration...`}
                emptyText={`No matching ${currentPackageType} found`}
              />

              {/* Selected Item Summary Info Pill */}
              {selectedItemObj && (
                <div className="col-span-1 md:col-span-2 bg-white/90 border border-slate-200 p-2.5 rounded-lg flex items-center justify-between text-[11px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      <strong className="text-slate-900">{selectedItemObj.title}</strong> &bull; {selectedItemObj.region} Region &bull;{" "}
                      {selectedItemObj.durationDays} Days
                    </span>
                  </div>
                  <div className="font-semibold text-slate-900">
                    ${selectedItemObj.priceUSD?.toLocaleString()} USD / person
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dates & Pricing Section */}
          <div className="grid grid-cols-2 gap-3">
            <AdminInputField
              label="Group Size"
              type="number"
              min={1}
              required
              error={errors.groupSize?.message}
              {...register("groupSize", {
                onChange: handleGroupSizeChange,
              })}
            />

            <AdminInputField
              label="Total USD"
              type="number"
              min={0}
              required
              placeholder="0"
              error={errors.totalAmountUSD?.message}
              {...register("totalAmountUSD")}
            />

            <AdminInputField
              label="Start Date"
              type="date"
              required
              error={errors.startDate?.message}
              {...register("startDate", {
                onChange: handleStartDateChange,
              })}
            />

            <AdminInputField
              label="End Date"
              type="date"
              required
              error={errors.endDate?.message}
              {...register("endDate")}
            />

            <AdminSelectField
              label="Payment Status"
              required
              error={errors.paymentStatus?.message}
              options={[
                { label: "Deposit Paid", value: BookingPaymentStatus.DEPOSIT_PAID },
                { label: "Paid", value: BookingPaymentStatus.PAID },
                { label: "Pending", value: BookingPaymentStatus.PENDING },
                { label: "Refunded", value: BookingPaymentStatus.REFUNDED },
              ]}
              {...register("paymentStatus")}
            />

            <AdminSelectField
              label="Booking Status"
              required
              error={errors.bookingStatus?.message}
              options={[
                { label: "Confirmed", value: BookingStatus.CONFIRMED },
                { label: "In Review", value: BookingStatus.IN_REVIEW },
                { label: "Active Trek", value: BookingStatus.ACTIVE_TREK },
                { label: "Completed", value: BookingStatus.COMPLETED },
                { label: "Cancelled", value: BookingStatus.CANCELLED },
              ]}
              {...register("bookingStatus")}
            />

            <AdminSelectField
              label="Permit Status"
              required
              error={errors.permitStatus?.message}
              options={[
                { label: "Issued", value: BookingPermitStatus.ISSUED },
                { label: "Processing", value: BookingPermitStatus.PROCESSING },
                { label: "Pending Document", value: BookingPermitStatus.PENDING_DOCUMENT },
              ]}
              {...register("permitStatus")}
            />

            <AdminInputField
              label="Assigned Sherpa Guide"
              placeholder="e.g. Lakpa Tenzing Sherpa"
              error={errors.assignedGuide?.message}
              {...register("assignedGuide")}
            />

            <div className="col-span-2">
              <AdminTextareaField
                label="Special Requests & Notes"
                rows={2}
                placeholder="Dietary requests, medical considerations, or custom accommodation..."
                error={errors.specialRequests?.message}
                {...register("specialRequests")}
              />
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-5 py-2 text-xs">
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="space-y-1">
              <span className="text-slate-500 font-semibold block">Lead Guest</span>
              <div className="font-semibold text-slate-900 text-sm">{initialData?.guestName}</div>
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{initialData?.guestEmail}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{initialData?.guestPhone}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>{initialData?.country}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 font-semibold block">Package Specs</span>
              <div>
                <Link
                  href={packageLink}
                  className="group inline-flex items-center gap-1.5 font-semibold text-slate-900 hover:text-slate-950 transition-colors"
                  title="View package details in management page"
                >
                  <span className="underline decoration-slate-300 underline-offset-2 group-hover:decoration-slate-500">
                    {initialData?.packageName}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-80 group-hover:opacity-100 shrink-0" />
                </Link>
              </div>
              <div className="flex items-center gap-1 text-slate-600 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
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
              <AdminStatusBadge status={initialData?.paymentStatus || ""} />
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <span className="text-slate-500 font-semibold block">Permit Status</span>
              <AdminStatusBadge status={initialData?.permitStatus || ""} />
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
  isDeleting?: boolean;
  error?: string | null;
}

export function DeleteBookingModal({
  isOpen,
  onClose,
  onConfirm,
  bookingRef,
  guestName,
  isDeleting = false,
  error = null,
}: DeleteBookingModalProps) {
  return (
    <AdminConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Reservation"
      description={`Are you sure you want to delete reservation "${bookingRef}" for ${guestName}?`}
      confirmText="Delete Reservation"
      cancelText="Cancel"
      variant="danger"
      isLoading={isDeleting}
      error={error}
    />
  );
}
