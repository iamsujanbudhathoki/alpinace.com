"use client";

import { useEffect, useState } from "react";
import { Download, Plus } from "lucide-react";
import { Booking } from "@/lib/admin-data";
import { toast } from "sonner";
import { BookingService } from "@/lib/services/admin-service";
import { ApiResponse } from "@/lib/services/api-client";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminFilterBar } from "@/components/admin/ui/admin-filter-bar";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { BookingFormModal, DeleteBookingModal } from "@/components/admin/modals/booking-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AdminTableContainer,
  AdminTable,
  AdminTableHeader,
  AdminTableHead,
  AdminTableBody,
  AdminTableRow,
  AdminTableCell,
  AdminTableEmpty,
  AdminTableActions,
  AdminActionButton,
} from "@/components/admin/ui/admin-table";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
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
    async function loadBookings() {
      try {
        const data = await BookingService.getAll();
        setBookings(data);
      } catch (err) {
        console.error("Failed to load bookings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, []);

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

  const handleSaveBooking = async (savedBooking: Booking) => {
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
        toast.success(res.message);
        setIsFormOpen(false);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save booking");
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
            <option value="Trekking">Trekking</option>
            <option value="Expedition">Expedition</option>
            <option value="Tour">Tour</option>
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
            <option value="Confirmed">Confirmed</option>
            <option value="In Review">In Review</option>
            <option value="Active Trek">Active Trek</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
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
              <AdminTableHead>Dates &amp; Group</AdminTableHead>
              <AdminTableHead>Total Amount</AdminTableHead>
              <AdminTableHead>Payment</AdminTableHead>
              <AdminTableHead>Status</AdminTableHead>
              <AdminTableHead align="right">Actions</AdminTableHead>
            </tr>
          </AdminTableHeader>
          <AdminTableBody>
            {filteredBookings.length > 0 ? (
              filteredBookings.map((bkg) => (
                <AdminTableRow key={bkg.id}>
                  <AdminTableCell>
                    <div className="text-xs font-bold text-amber-600">{bkg.reference}</div>
                    <div className="font-bold text-slate-900">{bkg.guestName}</div>
                    <div className="text-xs text-slate-600 font-normal">{bkg.country}</div>
                  </AdminTableCell>
                  <AdminTableCell className="max-w-xs">
                    <div className="font-semibold text-slate-900 truncate" title={bkg.packageName}>
                      {bkg.packageName}
                    </div>
                    <Badge variant="outline" className="text-[10px] font-medium mt-0.5 border-slate-200 text-slate-700">
                      {bkg.packageType}
                    </Badge>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="font-medium text-slate-900">{bkg.startDate} &rarr; {bkg.endDate}</div>
                    <div className="text-xs text-slate-600 font-normal">{bkg.groupSize} {bkg.groupSize === 1 ? "Guest" : "Guests"}</div>
                  </AdminTableCell>
                  <AdminTableCell className="font-bold text-slate-900 text-sm">
                    ${bkg.totalAmountUSD.toLocaleString()} USD
                  </AdminTableCell>
                  <AdminTableCell>
                    <Badge
                      variant="secondary"
                      className={`text-xs font-semibold ${
                        bkg.paymentStatus === "Paid"
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                          : bkg.paymentStatus === "Deposit Paid"
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-slate-100 text-slate-800 border border-slate-200"
                      }`}
                    >
                      {bkg.paymentStatus}
                    </Badge>
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminStatusBadge status={bkg.bookingStatus} />
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
                colSpan={7}
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
