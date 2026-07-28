"use client";

import { useState } from "react";
import {
  MessageSquare,
  Search,
  Filter,
  Send,
  User,
  Mail,
  Phone,
  Globe,
  Calendar,
  Clock,
  CheckCircle,
  X,
  Plus,
} from "lucide-react";
import { mockInquiries, Inquiry } from "@/lib/admin-data";

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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-charcoal-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-offwhite-50">
            Customer Inquiries & Lead CRM
          </h1>
          <p className="text-xs text-charcoal-400 mt-1">
            Track incoming expedition requests, prepare custom quotes, and convert leads.
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guest, email, or trip..."
            className="w-full bg-charcoal-950 border border-charcoal-700 text-offwhite-100 placeholder-charcoal-400 text-xs rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-gold-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {["All", "New", "Contacted", "Quote Sent", "Booked", "Closed"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? "bg-gold-500 text-charcoal-950 font-bold"
                  : "bg-charcoal-950 border border-charcoal-700 text-offwhite-200 hover:border-gold-500/40"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Inquiries Stream */}
      <div className="space-y-4">
        {filteredInquiries.map((inq) => (
          <div
            key={inq.id}
            onClick={() => setActiveInquiryModal(inq)}
            className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 hover:border-gold-500/40 transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 font-bold text-xs flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-offwhite-50 group-hover:text-gold-400 transition-colors">
                    {inq.guestName}
                  </h3>
                  <div className="text-xs text-charcoal-400">
                    {inq.email} • {inq.country} ({inq.groupSize} Guests)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    inq.status === "New"
                      ? "bg-gold-500 text-charcoal-950 animate-pulse"
                      : inq.status === "Quote Sent"
                      ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                      : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  {inq.status}
                </span>
                <span className="text-[10px] text-charcoal-400">{inq.createdAt}</span>
              </div>
            </div>

            {/* Trip interest banner */}
            <div className="p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 text-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-charcoal-400 font-medium">Interested Trip:</span>
                <strong className="text-gold-400">{inq.interestedTrip}</strong>
              </div>
              <div className="flex items-center gap-2 text-charcoal-400">
                <Calendar className="w-3.5 h-3.5 text-gold-400" />
                <span>Travel Window: {inq.travelDates}</span>
              </div>
            </div>

            {/* Message Snippet */}
            <p className="text-xs text-offwhite-200 line-clamp-2 leading-relaxed italic bg-charcoal-950/40 p-3 rounded-lg border border-charcoal-800/40">
              "{inq.message}"
            </p>
          </div>
        ))}
      </div>

      {/* Inquiry Detail & Reply Modal */}
      {activeInquiryModal && (
        <div className="fixed inset-0 bg-charcoal-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-charcoal-900 border border-charcoal-700 rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-charcoal-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-gold-400 tracking-wider">Inquiry Details</span>
                <h2 className="text-xl font-bold text-offwhite-50 mt-0.5">{activeInquiryModal.guestName}</h2>
                <p className="text-xs text-charcoal-400">{activeInquiryModal.email} • {activeInquiryModal.phone}</p>
              </div>
              <button
                onClick={() => setActiveInquiryModal(null)}
                className="text-charcoal-400 hover:text-offwhite-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-2 text-xs">
              <div className="font-bold text-gold-400">Trip Requested: {activeInquiryModal.interestedTrip}</div>
              <div className="text-charcoal-300">Dates: {activeInquiryModal.travelDates} | Group Size: {activeInquiryModal.groupSize} climbers</div>
              <div className="text-charcoal-400 pt-2 border-t border-charcoal-800 leading-relaxed">
                "{activeInquiryModal.message}"
              </div>
            </div>

            {/* Status Change Buttons */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-charcoal-400">Lead Status:</span>
              <div className="flex flex-wrap gap-2">
                {(["New", "Contacted", "Quote Sent", "Booked", "Closed"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(activeInquiryModal.id, st)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      activeInquiryModal.status === st
                        ? "bg-gold-500 text-charcoal-950 font-bold"
                        : "bg-charcoal-950 text-charcoal-400 hover:text-offwhite-100"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Reply Composer Form */}
            <form onSubmit={handleSendReply} className="space-y-3 pt-3 border-t border-charcoal-800">
              <label className="block text-xs font-semibold text-offwhite-100">Send Custom Quote / Response Email</label>
              <textarea
                rows={4}
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Dear guest, thank you for contacting AlpineAce. We would be delighted to organize your upcoming expedition..."
                className="w-full bg-charcoal-950 border border-charcoal-700 text-offwhite-100 text-xs rounded-xl p-3 focus:outline-none focus:border-gold-500"
              />

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveInquiryModal(null)}
                  className="px-4 py-2 rounded-lg bg-charcoal-800 text-offwhite-200 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gold-500 text-charcoal-950 font-bold text-xs hover:bg-gold-400 shadow"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Proposal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
