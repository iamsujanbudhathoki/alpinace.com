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
  AdminTablePagination,
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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);

  // Load package options for links/modals
  useEffect(() => {
    async function loadPackages() {
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
        console.error("Failed to load packages for bookings:", err);
      }
    }
    loadPackages();
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page to 1 on filter or search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedStatus, selectedType]);

  // Load bookings from backend
  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await BookingService.getAll({
        search: debouncedSearch,
        status: selectedStatus === "All" ? undefined : selectedStatus,
        packageType: selectedType === "All" ? undefined : selectedType,
        page,
        limit,
      });
      setBookings(data);
      if (data.pagination) {
        setTotalItems(data.pagination.count);
        setTotalPages(data.pagination.lastPage);
      } else {
        setTotalItems(data.length);
        setTotalPages(Math.max(1, Math.ceil(data.length / limit)));
      }
    } catch (err) {
      console.error("Failed to load bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [debouncedSearch, selectedStatus, selectedType, page, limit]);

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

  const handleSaveBooking = async (savedBooking: Booking): Promise<boolean> => {
    try {
      let res: ApiResponse<Booking>;
      if (isEditing && activeBooking) {
        res = await BookingService.update(activeBooking.id, savedBooking as any);
      } else {
        res = await BookingService.create({
          ...savedBooking,
          cfTurnstileToken: 'ADMIN_BYPASS',
        } as any);
      }
      if (res.success) {
        toast.success(res.message || "Booking saved successfully");
        setIsFormOpen(false);
        await loadBookings();
        return true;
      } else {
        toast.error(res.message || "Failed to save booking");
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
      return false;
    }
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      const res = await BookingService.delete(id);
      if (res.success) {
        toast.success(res.message || "Booking deleted successfully");
        setDeletingBooking(null);
        await loadBookings();
      } else {
        toast.error(res.message || "Failed to delete booking");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete booking");
    }
  };

  const handleInlineStatusChange = async (bkg: Booking, newStatus: string) => {
    try {
      const res = await BookingService.update(bkg.id, { bookingStatus: newStatus as BookingStatus });
      if (res.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bkg.id ? { ...b, bookingStatus: newStatus as BookingStatus } : b))
        );
        toast.success(`Booking ${bkg.reference} marked as ${newStatus}`);
      } else {
        toast.error(res.message || "Failed to update status");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleInlinePaymentChange = async (bkg: Booking, newPayment: string) => {
    try {
      const res = await BookingService.update(bkg.id, {
        paymentStatus: newPayment as BookingPaymentStatus,
      });
      if (res.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bkg.id ? { ...b, paymentStatus: newPayment as BookingPaymentStatus } : b
          )
        );
        toast.success(`Payment status for ${bkg.reference} updated to ${newPayment}`);
      } else {
        toast.error(res.message || "Failed to update payment");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update payment");
    }
  };

  const handleInlineCategoryChange = async (bkg: Booking, newCategory: string) => {
    try {
      const res = await BookingService.update(bkg.id, {
        packageType: newCategory as BookingPackageType,
      });
      if (res.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bkg.id ? { ...b, packageType: newCategory as BookingPackageType } : b
          )
        );
        toast.success(`Category for ${bkg.reference} updated to ${newCategory}`);
      } else {
        toast.error(res.message || "Failed to update category");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update category");
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Reference",
      "Guest Name",
      "Email",
      "Phone",
      "Country",
      "Package Name",
      "Category",
      "Start Date",
      "End Date",
      "Total Amount USD",
      "Payment Status",
      "Booking Status",
    ];

    const rows = bookings.map((b) => [
      b.reference,
      b.guestName,
      b.guestEmail,
      b.guestPhone,
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
          <Download className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
          Export CSV
        </Button>
        <Button
          size="sm"
          onClick={() => {
            setActiveBooking(null);
            setIsEditing(true);
            setIsFormOpen(true);
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
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
          <span className="text-slate-600 font-semibold">Category:</span>
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
          <span className="text-slate-600 font-semibold">Status:</span>
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
              <AdminTableHead className="w-14 text-center">S.N.</AdminTableHead>
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
              <AdminTableLoading colSpan={9} rows={limit > 10 ? 10 : limit} />
            ) : bookings.length > 0 ? (
              bookings.map((bkg, idx) => {
                const serialNumber = (page - 1) * limit + idx + 1;
                return (
                  <AdminTableRow key={bkg.id}>
                    <AdminTableCell className="text-center font-semibold text-slate-500">
                      {serialNumber}
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="text-xs font-mono font-bold text-slate-700">{bkg.reference}</div>
                      <div className="font-semibold text-slate-900">{bkg.guestName}</div>
                      <div className="text-xs text-slate-500 font-normal">{bkg.country}</div>
                    </AdminTableCell>
                    <AdminTableCell className="max-w-xs">
                      <Link
                        href={getPackageLink(bkg)}
                        className="group inline-flex items-center gap-1 font-semibold text-slate-900 hover:text-slate-950 transition-colors max-w-full"
                        title={`Open "${bkg.packageName}" in package manager`}
                      >
                        <span className="truncate underline decoration-transparent group-hover:decoration-slate-400 underline-offset-2 transition-all">
                          {bkg.packageName}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
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
                );
              })
            ) : (
              <AdminTableEmpty
                colSpan={9}
                title="No bookings found"
                description="No client booking records match your search query or status filter."
              />
            )}
          </AdminTableBody>
        </AdminTable>
        <AdminTablePagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={limit}
          onPageChange={setPage}
          onPageSizeChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
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
