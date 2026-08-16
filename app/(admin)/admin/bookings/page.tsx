"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Plus, Tag, ExternalLink } from "lucide-react";
import { Booking, BookingStatus, BookingPackageType, BookingPaymentStatus, PackageItem } from "@/lib/admin-data";
import { TrekItem } from "@/lib/trek-data";
import { toast } from "sonner";
import { BookingService, TrekService, TourService, ExpeditionService } from "@/lib/services/admin-service";
import { ApiResponse } from "@/lib/services/api-client";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminFilterBar } from "@/components/admin/ui/admin-filter-bar";
import { AdminInlineSelect, InlineSelectOption } from "@/components/admin/ui/admin-inline-select";
import { BookingFormModal, DeleteBookingModal } from "@/components/admin/modals/booking-modal";
import { Button } from "@/components/ui/button";
import {
  AdminTableContainer,
  AdminTable,
  AdminTableHeader,
  AdminTableHead,
  AdminTableBody,
  AdminTableRow,
  AdminTableCell,
  AdminTableEmpty,
  AdminTableLoading,
  AdminTableActions,
  AdminActionButton,
} from "@/components/admin/ui/admin-table";

const CATEGORY_OPTIONS: InlineSelectOption[] = [
  { value: BookingPackageType.TREKKING, label: "Trekking", icon: <Tag className="w-3 h-3 opacity-70" /> },
  { value: BookingPackageType.EXPEDITION, label: "Expedition", icon: <Tag className="w-3 h-3 opacity-70" /> },
  { value: BookingPackageType.TOUR, label: "Tour", icon: <Tag className="w-3 h-3 opacity-70" /> },
];

const PAYMENT_OPTIONS: InlineSelectOption[] = [
  { value: BookingPaymentStatus.PAID, label: "Paid" },
  { value: BookingPaymentStatus.DEPOSIT_PAID, label: "Deposit Paid" },
  { value: BookingPaymentStatus.PENDING, label: "Pending" },
  { value: BookingPaymentStatus.REFUNDED, label: "Refunded" },
];

const STATUS_OPTIONS: InlineSelectOption[] = [
  { value: BookingStatus.CONFIRMED, label: "Confirmed" },
  { value: BookingStatus.IN_REVIEW, label: "In Review" },
  { value: BookingStatus.ACTIVE_TREK, label: "Active Trek" },
  { value: BookingStatus.COMPLETED, label: "Completed" },
  { value: BookingStatus.CANCELLED, label: "Cancelled" },
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [treks, setTreks] = useState<TrekItem[]>([]);
  const [tours, setTours] = useState<PackageItem[]>([]);
  const [expeditions, setExpeditions] = useState<PackageItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [bookingsData, treksData, toursData, expeditionsData] = await Promise.all([
          BookingService.getAll(),
          TrekService.getAll(),
          TourService.getAll(),
          ExpeditionService.getAll(),
        ]);
        setBookings(bookingsData);
        setTreks(treksData);
        setTours(toursData);
        setExpeditions(expeditionsData);
      } catch (err) {
        console.error("Failed to load bookings data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getPackageLink = (bkg: Booking) => {
    if (bkg.packageType === BookingPackageType.TREKKING) {
      const match = treks.find((t) => t.title.toLowerCase() === bkg.packageName.toLowerCase());
      return match ? `/admin/treks?viewId=${match.id}` : `/admin/treks`;
    } else if (bkg.packageType === BookingPackageType.EXPEDITION) {
      const match = expeditions.find((e) => e.title.toLowerCase() === bkg.packageName.toLowerCase());
      return match ? `/admin/expeditions?viewId=${match.id}` : `/admin/expeditions`;
    } else {
      const match = tours.find((t) => t.title.toLowerCase() === bkg.packageName.toLowerCase());
      return match ? `/admin/tours?viewId=${match.id}` : `/admin/tours`;
    }
  };

  const filteredBookings = bookings.filter((bkg) => {
    const matchesSearch =
      bkg.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bkg.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bkg.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bkg.country.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "All" || bkg.bookingStatus === selectedStatus;

    const matchesType =
      selectedType === "All" || bkg.packageType === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSaveBooking = async (savedBooking: Booking): Promise<boolean> => {
    try {
      const exists = bookings.some((b) => b.id === savedBooking.id);
      let res: ApiResponse<Booking>;
      if (exists) {
        res = await BookingService.update(savedBooking.id, savedBooking as any);
        if (res.success) {
          setBookings(bookings.map((b) => (b.id === res.data.id ? res.data : b)));
        }
      } else {
        res = await BookingService.create(savedBooking as any);
        if (res.success) {
          setBookings([res.data, ...bookings]);
        }
      }
      if (res.success) {
        toast.success(res.message || "Reservation saved successfully");
        setIsFormOpen(false);
        return true;
      } else {
        toast.error(res.message || "Failed to save reservation");
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save reservation");
      return false;
    }
  };

  const handleInlineStatusChange = async (bkg: Booking, newStatus: string): Promise<boolean> => {
    try {
      const res = await BookingService.update(bkg.id, { bookingStatus: newStatus as BookingStatus });
      if (res.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bkg.id ? { ...b, bookingStatus: newStatus as BookingStatus } : b))
        );
        toast.success(`Booking ${bkg.reference} status updated`);
        return true;
      } else {
        toast.error(res.message || "Failed to update booking status");
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update booking status");
      return false;
    }
  };

  const handleInlinePaymentChange = async (bkg: Booking, newPayment: string): Promise<boolean> => {
    try {
      const res = await BookingService.update(bkg.id, { paymentStatus: newPayment as BookingPaymentStatus });
      if (res.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bkg.id ? { ...b, paymentStatus: newPayment as BookingPaymentStatus } : b))
        );
        toast.success(`Booking ${bkg.reference} payment status updated`);
        return true;
      } else {
        toast.error(res.message || "Failed to update payment status");
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update payment status");
      return false;
    }
  };

  const handleInlineCategoryChange = async (bkg: Booking, newType: string): Promise<boolean> => {
    try {
      const res = await BookingService.update(bkg.id, { packageType: newType as BookingPackageType });
      if (res.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bkg.id ? { ...b, packageType: newType as BookingPackageType } : b))
        );
        toast.success(`Booking ${bkg.reference} category updated`);
        return true;
      } else {
        toast.error(res.message || "Failed to update booking category");
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update booking category");
      return false;
    }
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      const res = await BookingService.delete(id);
      setBookings(bookings.filter((b) => b.id !== id));
      setDeletingBooking(null);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete booking");
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Reference",
      "Guest Name",
      "Email",
      "Country",
      "Package",
      "Type",
      "Start Date",
      "End Date",
      "Amount (USD)",
      "Payment Status",
      "Booking Status",
    ];
    const rows = filteredBookings.map((b) => [
      b.reference,
      b.guestName,
      b.guestEmail,
      b.country,
      b.packageName,
      b.packageType,
      b.startDate,
      b.endDate,
      b.totalAmountUSD,
      b.paymentStatus,
      b.bookingStatus,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `alpineace_bookings_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Bookings & Reservations"
        description="Manage guest reservations, expedition permits, and Sherpa guide assignments."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          className="text-xs font-semibold cursor-pointer border-slate-200"
        >
          <Download className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
          Export CSV
        </Button>
        <Button
          size="sm"
          onClick={() => {
            setActiveBooking(null);
            setIsEditing(true);
            setIsFormOpen(true);
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4 mr-1.5 text-amber-400" />
          New Booking
        </Button>
      </AdminPageHeader>

      {/* Filter Bar Component */}
      <AdminFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter guest, ref, or package..."
      >
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
          <span className="text-slate-700 font-semibold">Category:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value={BookingPackageType.TREKKING}>Trekking</option>
            <option value={BookingPackageType.EXPEDITION}>Expedition</option>
            <option value={BookingPackageType.TOUR}>Tour</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
          <span className="text-slate-700 font-semibold">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value={BookingStatus.CONFIRMED}>Confirmed</option>
            <option value={BookingStatus.IN_REVIEW}>In Review</option>
            <option value={BookingStatus.ACTIVE_TREK}>Active Trek</option>
            <option value={BookingStatus.COMPLETED}>Completed</option>
            <option value={BookingStatus.CANCELLED}>Cancelled</option>
          </select>
        </div>
      </AdminFilterBar>

      {/* Bookings Table */}
      <AdminTableContainer>
        <AdminTable>
          <AdminTableHeader>
            <tr>
              <AdminTableHead>Ref / Guest</AdminTableHead>
              <AdminTableHead>Trip Package</AdminTableHead>
              <AdminTableHead>Category</AdminTableHead>
              <AdminTableHead>Dates &amp; Group</AdminTableHead>
              <AdminTableHead>Total Amount</AdminTableHead>
              <AdminTableHead>Payment</AdminTableHead>
              <AdminTableHead>Status</AdminTableHead>
              <AdminTableHead align="right">Actions</AdminTableHead>
            </tr>
          </AdminTableHeader>
          <AdminTableBody>
            {loading ? (
              <AdminTableLoading colSpan={8} rows={5} />
            ) : filteredBookings.length > 0 ? (
              filteredBookings.map((bkg) => (
                <AdminTableRow key={bkg.id}>
                  <AdminTableCell>
                    <div className="text-xs font-bold text-amber-600">{bkg.reference}</div>
                    <div className="font-bold text-slate-900">{bkg.guestName}</div>
                    <div className="text-xs text-slate-600 font-normal">{bkg.country}</div>
                  </AdminTableCell>
                  <AdminTableCell className="max-w-xs">
                    <Link
                      href={getPackageLink(bkg)}
                      className="group inline-flex items-center gap-1 font-semibold text-slate-900 hover:text-amber-600 transition-colors max-w-full"
                      title={`Open "${bkg.packageName}" in package manager`}
                    >
                      <span className="truncate underline decoration-transparent group-hover:decoration-amber-500 underline-offset-2 transition-all">
                        {bkg.packageName}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                    </Link>
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminInlineSelect
                      value={bkg.packageType}
                      options={CATEGORY_OPTIONS}
                      onChange={(newVal) => handleInlineCategoryChange(bkg, newVal)}
                      variant="category"
                      title="Click to change booking category"
                    />
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="font-medium text-slate-900">{bkg.startDate} &rarr; {bkg.endDate}</div>
                    <div className="text-xs text-slate-600 font-normal">{bkg.groupSize} {bkg.groupSize === 1 ? "Guest" : "Guests"}</div>
                  </AdminTableCell>
                  <AdminTableCell className="font-bold text-slate-900 text-sm">
                    ${bkg.totalAmountUSD.toLocaleString()} USD
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminInlineSelect
                      value={bkg.paymentStatus}
                      options={PAYMENT_OPTIONS}
                      onChange={(newVal) => handleInlinePaymentChange(bkg, newVal)}
                      variant="badge"
                      title="Click to change payment status"
                    />
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminInlineSelect
                      value={bkg.bookingStatus}
                      options={STATUS_OPTIONS}
                      onChange={(newVal) => handleInlineStatusChange(bkg, newVal)}
                      variant="badge"
                      title="Click to change booking status"
                    />
                  </AdminTableCell>
                  <AdminTableCell align="right">
                    <AdminTableActions>
                      <AdminActionButton
                        variant="view"
                        onClick={() => {
                          setActiveBooking(bkg);
                          setIsEditing(false);
                          setIsFormOpen(true);
                        }}
                        title="View Booking"
                      />
                      <AdminActionButton
                        variant="edit"
                        onClick={() => {
                          setActiveBooking(bkg);
                          setIsEditing(true);
                          setIsFormOpen(true);
                        }}
                        title="Edit Booking"
                      />
                      <AdminActionButton
                        variant="delete"
                        onClick={() => setDeletingBooking(bkg)}
                        title="Delete Booking"
                      />
                    </AdminTableActions>
                  </AdminTableCell>
                </AdminTableRow>
              ))
            ) : (
              <AdminTableEmpty
                colSpan={8}
                title="No bookings found"
                description="No client booking records match your search query or status filter."
              />
            )}
          </AdminTableBody>
        </AdminTable>
      </AdminTableContainer>

      {/* MODALS */}
      <BookingFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveBooking}
        initialData={activeBooking}
        isEditing={isEditing}
      />

      <DeleteBookingModal
        isOpen={deletingBooking !== null}
        onClose={() => setDeletingBooking(null)}
        onConfirm={() => deletingBooking && handleDeleteBooking(deletingBooking.id)}
        bookingRef={deletingBooking?.reference}
        guestName={deletingBooking?.guestName}
      />
    </div>
  );
}
