"use client";

import { useState } from "react";
import {
  Download,
  Plus,
  Mail,
  Phone,
  Globe,
  Calendar,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { mockBookings, Booking } from "@/lib/admin-data";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminFilterBar } from "@/components/admin/ui/admin-filter-bar";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [activeBookingModal, setActiveBookingModal] = useState<Booking | null>(null);

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
      <AdminPageHeader
        title="Bookings & Reservations"
        description="Manage guest reservations, expedition permits, and Sherpa guide assignments."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => alert("Exporting bookings CSV...")}
          className="text-xs font-semibold"
        >
          <Download className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
          Export CSV
        </Button>
        <Button
          size="sm"
          onClick={() => alert("Creating manual booking...")}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
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
          <span className="text-slate-500 font-medium">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-transparent text-slate-900 font-medium focus:outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="In Review">In Review</option>
            <option value="Active Trek">Active Trek</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
          <span className="text-slate-500 font-medium">Type:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-transparent text-slate-900 font-medium focus:outline-none cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="Trekking">Trekking</option>
            <option value="Expedition">Expedition</option>
            <option value="Tour">Tour</option>
          </select>
        </div>
      </AdminFilterBar>

      {/* Bookings Table */}
      <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="font-bold text-slate-700 text-xs">Reference & Guest</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Package & Type</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Dates</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Total Price</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Payment</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Permit Status</TableHead>
              <TableHead className="text-right font-bold text-slate-700 text-xs">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 text-xs">
            {filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-slate-400">
                  No bookings found matching your search filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((bkg) => (
                <TableRow
                  key={bkg.id}
                  onClick={() => setActiveBookingModal(bkg)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <TableCell className="py-3.5">
                    <div className="font-bold text-slate-900 hover:text-amber-600 transition-colors">
                      {bkg.guestName}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {bkg.reference} • {bkg.country} ({bkg.groupSize} PAX)
                    </div>
                  </TableCell>

                  <TableCell className="py-3.5">
                    <div className="font-semibold text-slate-800 max-w-[200px] truncate">
                      {bkg.packageName}
                    </div>
                    <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-200 bg-amber-50 mt-1">
                      {bkg.packageType}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-3.5 text-slate-600">
                    <div>{bkg.startDate}</div>
                    <div className="text-[10px] text-slate-400">to {bkg.endDate}</div>
                  </TableCell>

                  <TableCell className="py-3.5 font-bold text-slate-900">
                    ${bkg.totalAmountUSD.toLocaleString()}
                  </TableCell>

                  <TableCell className="py-3.5">
                    <AdminStatusBadge status={bkg.paymentStatus} />
                  </TableCell>

                  <TableCell className="py-3.5">
                    <span className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      {bkg.permitStatus}
                    </span>
                  </TableCell>

                  <TableCell className="py-3.5 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveBookingModal(bkg);
                      }}
                      className="text-[11px] h-7 px-2.5 font-semibold"
                    >
                      Inspect
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Booking Detail Dialog Modal */}
      {activeBookingModal && (
        <Dialog open={!!activeBookingModal} onOpenChange={(open) => !open && setActiveBookingModal(null)}>
          <DialogContent className="sm:max-w-2xl bg-white border-slate-200 p-6 space-y-4">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="font-mono text-amber-700 bg-amber-50 border-amber-200">
                  {activeBookingModal.reference}
                </Badge>
                <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                  {activeBookingModal.packageType}
                </Badge>
              </div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                {activeBookingModal.guestName}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Expedition reservation breakdown and guide assignment.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  Guest Contact Details
                </div>
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <Mail className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{activeBookingModal.guestEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{activeBookingModal.guestPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <Globe className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{activeBookingModal.country} ({activeBookingModal.groupSize} Trekkers)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  Expedition Package
                </div>
                <div className="font-extrabold text-slate-900 text-sm">
                  {activeBookingModal.packageName}
                </div>
                <div className="flex items-center gap-2 text-slate-600 mt-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{activeBookingModal.startDate} to {activeBookingModal.endDate}</span>
                </div>
              </div>
            </div>

            {/* Status Management */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-900">Update Booking Status</div>
              <div className="flex flex-wrap gap-2 pt-1">
                {(["Confirmed", "In Review", "Active Trek", "Completed", "Cancelled"] as const).map((st) => (
                  <Button
                    key={st}
                    type="button"
                    variant={activeBookingModal.bookingStatus === st ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange(activeBookingModal.id, st)}
                    className={`text-xs h-8 ${
                      activeBookingModal.bookingStatus === st
                        ? "bg-slate-900 text-white font-bold"
                        : "bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {st}
                  </Button>
                ))}
              </div>
            </div>

            {/* Special Requests */}
            {activeBookingModal.specialRequests && (
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs">
                <div className="font-bold text-amber-900 mb-1">Medical / Special Notes:</div>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {activeBookingModal.specialRequests}
                </p>
              </div>
            )}

            <DialogFooter className="border-t border-slate-100 pt-3">
              <Button variant="outline" size="sm" onClick={() => setActiveBookingModal(null)}>
                Close
              </Button>
              <Button
                size="sm"
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                onClick={() => {
                  alert(`Confirmation voucher generated for ${activeBookingModal.guestName}`);
                  setActiveBookingModal(null);
                }}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-amber-400" />
                Send Confirmation Voucher
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
