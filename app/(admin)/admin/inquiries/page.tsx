"use client";

import { useState } from "react";
import {
  Send,
  User,
  Calendar,
} from "lucide-react";
import { mockInquiries, Inquiry } from "@/lib/admin-data";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminFilterBar } from "@/components/admin/ui/admin-filter-bar";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>(mockInquiries);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeInquiryModal, setActiveInquiryModal] = useState<Inquiry | null>(null);
  const [replyText, setReplyText] = useState("");

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      inq.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.interestedTrip.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || inq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (id: string, newStatus: Inquiry["status"]) => {
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
    );
    if (activeInquiryModal && activeInquiryModal.id === id) {
      setActiveInquiryModal((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInquiryModal || !replyText) return;

    alert(`Quote & Reply sent to ${activeInquiryModal.email}`);
    handleUpdateStatus(activeInquiryModal.id, "Quote Sent");
    setReplyText("");
    setActiveInquiryModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        title="Customer Inquiries & Lead CRM"
        description="Track incoming expedition requests, prepare custom quotes, and convert leads."
      />

      {/* Filter bar card */}
      <AdminFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search guest, email, or trip..."
      >
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {["All", "New", "Contacted", "Quote Sent", "Booked", "Closed"].map((st) => (
            <Button
              key={st}
              variant={statusFilter === st ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(st)}
              className={`text-xs h-8 whitespace-nowrap ${
                statusFilter === st
                  ? "bg-slate-900 text-white font-bold"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {st}
            </Button>
          ))}
        </div>
      </AdminFilterBar>

      {/* Inquiries Stream */}
      <div className="space-y-4">
        {filteredInquiries.map((inq) => (
          <Card
            key={inq.id}
            onClick={() => setActiveInquiryModal(inq)}
            className="p-5 bg-white border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center shadow-xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-600 transition-colors">
                    {inq.guestName}
                  </h3>
                  <div className="text-xs text-slate-500 font-medium">
                    {inq.email} • {inq.country} ({inq.groupSize} Guests)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <AdminStatusBadge status={inq.status} />
                <span className="text-[10px] text-slate-400 font-medium">{inq.createdAt}</span>
              </div>
            </div>

            {/* Trip interest banner */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Interested Trip:</span>
                <strong className="text-slate-900">{inq.interestedTrip}</strong>
              </div>
              <div className="flex items-center gap-2 text-slate-600 font-medium">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>Travel Window: {inq.travelDates}</span>
              </div>
            </div>

            {/* Message Snippet */}
            <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed italic bg-slate-50/50 p-3 rounded-lg border border-slate-100 font-medium">
              "{inq.message}"
            </p>
          </Card>
        ))}
      </div>

      {/* Inquiry Detail & Reply Dialog */}
      {activeInquiryModal && (
        <Dialog open={!!activeInquiryModal} onOpenChange={(open) => !open && setActiveInquiryModal(null)}>
          <DialogContent className="sm:max-w-2xl bg-white border-slate-200 p-6 space-y-4">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Inquiry Details</span>
              <DialogTitle className="text-xl font-bold text-slate-900">{activeInquiryModal.guestName}</DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {activeInquiryModal.email} • {activeInquiryModal.phone}
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-900 text-sm">Trip Requested: {activeInquiryModal.interestedTrip}</div>
              <div className="text-slate-600 font-medium">Dates: {activeInquiryModal.travelDates} | Group Size: {activeInquiryModal.groupSize} climbers</div>
              <div className="text-slate-700 pt-2 border-t border-slate-200 leading-relaxed font-medium">
                "{activeInquiryModal.message}"
              </div>
            </div>

            {/* Status Change Buttons */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700">Lead Status:</span>
              <div className="flex flex-wrap gap-2">
                {(["New", "Contacted", "Quote Sent", "Booked", "Closed"] as const).map((st) => (
                  <Button
                    key={st}
                    type="button"
                    variant={activeInquiryModal.status === st ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleUpdateStatus(activeInquiryModal.id, st)}
                    className={`text-xs h-7 ${
                      activeInquiryModal.status === st
                        ? "bg-slate-900 text-white font-bold"
                        : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {st}
                  </Button>
                ))}
              </div>
            </div>

            {/* Reply Form */}
            <form onSubmit={handleSendReply} className="space-y-3 pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-900">Send Custom Quote / Response Email</label>
              <textarea
                rows={4}
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Dear guest, thank you for contacting AlpineAce. We would be delighted to organize your upcoming expedition..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-3 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 font-medium"
              />

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setActiveInquiryModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                  <Send className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                  Send Proposal
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
