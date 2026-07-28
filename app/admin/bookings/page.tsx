"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  Plus,
  X,
  User,
  Calendar,
  DollarSign,
  ShieldCheck,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { mockBookings, Booking } from "@/lib/admin-data";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [activeBookingModal, setActiveBookingModal] = useState<Booking | null>(null);

  // Filter bookings logic
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

  const handleStatusChange = (bookingId: string, newStatus: Booking["bookingStatus"]) => {
    setBookings((prev) =>
      prev.map((bkg) => (bkg.id === bookingId ? { ...bkg, bookingStatus: newStatus } : bkg))
    );
    if (activeBookingModal && activeBookingModal.id === bookingId) {
      setActiveBookingModal((prev) => (prev ? { ...prev, bookingStatus: newStatus } : null));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-charcoal-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-offwhite-50">
            Bookings & Reservations
          </h1>
          <p className="text-xs text-charcoal-400 mt-1">
            Manage guest reservations, expedition permits, and Sherpa guide assignments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert("Exporting bookings CSV...")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-charcoal-900 border border-charcoal-800 text-xs font-semibold text-offwhite-200 hover:border-gold-500/40 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-gold-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => alert("Creating manual booking...")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-xs font-bold text-charcoal-950 transition-colors shadow-lg shadow-gold-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter guest, ref, or package..."
            className="w-full bg-charcoal-950 border border-charcoal-700 text-offwhite-100 placeholder-charcoal-400 text-xs rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-gold-500 transition-colors"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-charcoal-950 border border-charcoal-700 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-charcoal-400 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-offwhite-100 focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-charcoal-900">All Statuses</option>
              <option value="Confirmed" className="bg-charcoal-900">Confirmed</option>
              <option value="In Review" className="bg-charcoal-900">In Review</option>
              <option value="Active Trek" className="bg-charcoal-900">Active Trek</option>
              <option value="Completed" className="bg-charcoal-900">Completed</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2 bg-charcoal-950 border border-charcoal-700 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-charcoal-400 font-medium">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-transparent text-offwhite-100 focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-charcoal-900">All Types</option>
              <option value="Trekking" className="bg-charcoal-900">Trekking</option>
              <option value="Expedition" className="bg-charcoal-900">Expedition</option>
              <option value="Tour" className="bg-charcoal-900">Tour</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-charcoal-800 text-charcoal-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 pr-4">Reference & Guest</th>
                <th className="pb-3 px-4">Package & Type</th>
                <th className="pb-3 px-4">Dates</th>
                <th className="pb-3 px-4">Total Price</th>
                <th className="pb-3 px-4">Payment</th>
                <th className="pb-3 px-4">Permit Status</th>
                <th className="pb-3 pl-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800/60">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-charcoal-400">
                    No bookings found matching your search filters.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((bkg) => (
                  <tr
                    key={bkg.id}
                    onClick={() => setActiveBookingModal(bkg)}
                    className="group hover:bg-charcoal-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-4 pr-4">
                      <div className="font-bold text-offwhite-50 group-hover:text-gold-400 transition-colors">
                        {bkg.guestName}
                      </div>
                      <div className="text-[10px] text-charcoal-400 mt-0.5">
                        {bkg.reference} • {bkg.country} ({bkg.groupSize} PAX)
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-medium text-offwhite-100 max-w-[220px] truncate">
                        {bkg.packageName}
                      </div>
                      <span className="text-[10px] text-gold-400 bg-gold-500/10 px-1.5 py-0.5 rounded font-semibold inline-block mt-0.5">
                        {bkg.packageType}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-charcoal-300">
                      <div>{bkg.startDate}</div>
                      <div className="text-[10px] text-charcoal-400">to {bkg.endDate}</div>
                    </td>

                    <td className="py-4 px-4 font-bold text-offwhite-50">
                      ${bkg.totalAmountUSD.toLocaleString()}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          bkg.paymentStatus === "Paid"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : bkg.paymentStatus === "Deposit Paid"
                            ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                            : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {bkg.paymentStatus}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="text-[10px] font-semibold text-charcoal-300 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-gold-400" />
                        {bkg.permitStatus}
                      </span>
                    </td>

                    <td className="py-4 pl-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveBookingModal(bkg);
                        }}
                        className="px-3 py-1 rounded bg-charcoal-800 hover:bg-gold-500 hover:text-charcoal-950 text-[11px] font-semibold text-offwhite-200 transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Detail Modal Drawer */}
      {activeBookingModal && (
        <div className="fixed inset-0 bg-charcoal-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-charcoal-900 border border-charcoal-700 rounded-2xl shadow-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-charcoal-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-gold-400">
                    {activeBookingModal.reference}
                  </span>
                  <span className="text-[10px] bg-gold-500/20 text-gold-300 px-2 py-0.5 rounded font-semibold">
                    {activeBookingModal.packageType}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-offwhite-50 mt-1">
                  {activeBookingModal.guestName}
                </h2>
              </div>
              <button
                onClick={() => setActiveBookingModal(null)}
                className="p-1 rounded-lg bg-charcoal-800 text-charcoal-400 hover:text-offwhite-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-2">
                <div className="text-charcoal-400 font-semibold text-[11px] uppercase tracking-wider">
                  Guest & Contact
                </div>
                <div className="flex items-center gap-2 text-offwhite-100">
                  <Mail className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                  <span>{activeBookingModal.guestEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-offwhite-100">
                  <Phone className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                  <span>{activeBookingModal.guestPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-offwhite-100">
                  <Globe className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                  <span>{activeBookingModal.country} ({activeBookingModal.groupSize} Trekkers)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-2">
                <div className="text-charcoal-400 font-semibold text-[11px] uppercase tracking-wider">
                  Expedition Package & Dates
                </div>
                <div className="font-bold text-gold-400 text-sm">
                  {activeBookingModal.packageName}
                </div>
                <div className="flex items-center gap-2 text-offwhite-200 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                  <span>{activeBookingModal.startDate} to {activeBookingModal.endDate}</span>
                </div>
              </div>
            </div>

            {/* Status Management */}
            <div className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-3">
              <div className="text-xs font-semibold text-offwhite-100">Update Booking Status</div>
              <div className="flex flex-wrap gap-2">
                {(["Confirmed", "In Review", "Active Trek", "Completed", "Cancelled"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(activeBookingModal.id, st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeBookingModal.bookingStatus === st
                        ? "bg-gold-500 text-charcoal-950 shadow"
                        : "bg-charcoal-800 text-offwhite-300 hover:bg-charcoal-700"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes & Special Requests */}
            {activeBookingModal.specialRequests && (
              <div className="p-4 rounded-xl bg-gold-950/20 border border-gold-500/30 text-xs">
                <div className="font-bold text-gold-400 mb-1">Medical / Special Notes:</div>
                <p className="text-offwhite-200 leading-relaxed">
                  {activeBookingModal.specialRequests}
                </p>
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-charcoal-800">
              <button
                onClick={() => setActiveBookingModal(null)}
                className="px-4 py-2 rounded-lg bg-charcoal-800 text-offwhite-200 hover:bg-charcoal-700 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Confirmation voucher generated for ${activeBookingModal.guestName}`);
                  setActiveBookingModal(null);
                }}
                className="px-4 py-2 rounded-lg bg-gold-500 text-charcoal-950 hover:bg-gold-400 text-xs font-bold shadow"
              >
                Send Confirmation Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
