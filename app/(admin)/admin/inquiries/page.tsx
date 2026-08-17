"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Eye, Mail, MessageSquare } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Inquiry, InquiryStatus } from "@/lib/admin-data";
import { InquiryFormValues } from "@/lib/admin-schemas";
import { toast } from "sonner";
import { InquiryService } from "@/lib/services/admin-service";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminFilterBar } from "@/components/admin/ui/admin-filter-bar";
import { AdminTablePagination } from "@/components/admin/ui/admin-table";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import {
  InquiryFormModal,
  ReplyInquiryModal,
  DeleteInquiryModal,
} from "@/components/admin/modals/inquiry-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeInquiry, setActiveInquiry] = useState<Inquiry | null>(null);
  const [deletingInquiry, setDeletingInquiry] = useState<Inquiry | null>(null);

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
  }, [debouncedSearch, statusFilter]);

  // Load inquiries from backend
  const loadInquiries = async () => {
    setLoading(true);
    try {
      const data = await InquiryService.getAll({
        status: statusFilter === "All" ? undefined : statusFilter,
        search: debouncedSearch,
        page,
        limit,
      });
      setInquiries(data);
      if (data.pagination) {
        setTotalItems(data.pagination.count);
        setTotalPages(data.pagination.lastPage);
      } else {
        setTotalItems(data.length);
        setTotalPages(Math.max(1, Math.ceil(data.length / limit)));
      }
    } catch (err) {
      console.error("Failed to load inquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, [debouncedSearch, statusFilter, page, limit]);

  const handleUpdateStatus = async (id: string, newStatus: InquiryStatus): Promise<boolean> => {
    try {
      const res = await InquiryService.update(id, { status: newStatus });
      if (res.success) {
        setInquiries((prev) =>
          prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
        );
        if (activeInquiry && activeInquiry.id === id) {
          setActiveInquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        toast.success(res.message);
        return true;
      } else {
        toast.error(res.message);
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update inquiry status");
      return false;
    }
  };

  const handleSendQuote = async (id: string, message: string, status: InquiryStatus): Promise<boolean> => {
    try {
      if (status) {
        const statusRes = await InquiryService.update(id, { status });
        if (!statusRes.success) {
          toast.error(statusRes.message || "Failed to update inquiry status");
          return false;
        }
      }

      const res = await InquiryService.sendQuote(id, { message });
      if (res.success) {
        setInquiries((prev) =>
          prev.map((inq) => (inq.id === id ? { ...inq, status } : inq))
        );
        if (activeInquiry && activeInquiry.id === id) {
          setActiveInquiry((prev) => (prev ? { ...prev, status } : null));
        }
        toast.success(res.message || "Custom quote email dispatched successfully!");
        return true;
      } else {
        toast.error(res.message || "Failed to process quote dispatch.");
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to process quote dispatch.");
      return false;
    }
  };

  const handleSaveInquiry = async (formData: InquiryFormValues): Promise<boolean> => {
    try {
      const res = await InquiryService.create(formData);
      if (res?.success && res.data) {
        toast.success(res.message || "Manual inquiry logged successfully");
        setIsFormOpen(false);
        await loadInquiries();
        return true;
      } else {
        toast.error(res?.message || "Failed to create inquiry");
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save inquiry");
      return false;
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    try {
      const res = await InquiryService.delete(id);
      if (res.success) {
        toast.success(res.message || "Inquiry deleted successfully");
        setDeletingInquiry(null);
        await loadInquiries();
      } else {
        toast.error(res.message || "Failed to delete inquiry");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete inquiry");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        title="Customer Inquiries & Lead CRM"
        description="Track incoming expedition requests, prepare custom quotes, and convert leads."
      >
        <Button
          size="sm"
          onClick={() => setIsFormOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4 mr-1.5 text-amber-400" />
          Log Manual Inquiry
        </Button>
      </AdminPageHeader>

      {/* Filter bar card */}
      <AdminFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search guest, email, or trip..."
      >
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {["All", ...Object.values(InquiryStatus)].map((st) => (
            <Button
              key={st}
              variant={statusFilter === st ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(st)}
              className={`text-xs font-semibold cursor-pointer ${
                statusFilter === st
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {st}
            </Button>
          ))}
        </div>
      </AdminFilterBar>

      {/* Inquiries Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 animate-pulse">
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-3 bg-slate-100 rounded w-1/3"></div>
              </div>
              <div className="h-16 bg-slate-100 rounded-xl"></div>
              <div className="h-12 bg-slate-50 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : inquiries.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {inquiries.map((inq, idx) => {
              const serialNumber = (page - 1) * limit + idx + 1;
              return (
                <Card
                  key={inq.id}
                  className="bg-white border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between p-5 space-y-4 relative"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-bold text-slate-600">
                          #{serialNumber}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 text-base leading-snug">
                            {inq.guestName}
                          </div>
                          <div className="text-xs text-slate-600 font-normal">
                            {inq.country} &bull; {formatDate(inq.createdAt)}
                          </div>
                        </div>
                      </div>
                      <AdminStatusBadge status={inq.status} />
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{inq.interestedTrip}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700 font-medium text-xs">
                        <span>Dates: {inq.travelDates}</span>
                        <span>Group: {inq.groupSize} Pax</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 line-clamp-3 font-normal leading-relaxed italic bg-stone-50 p-3 rounded-lg border border-slate-100">
                      &ldquo;{inq.message}&rdquo;
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-700">
                      <Mail className="w-3.5 h-3.5 text-amber-600" />
                      <span className="truncate max-w-[120px] font-medium">{inq.email}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveInquiry(inq)}
                        className="text-xs font-semibold text-slate-800 border-slate-200 hover:bg-slate-100 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1 text-slate-700" />
                        View &amp; Reply
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingInquiry(inq)}
                        className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <AdminTablePagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={limit}
              pageSizeOptions={[9, 18, 36, 72]}
              onPageChange={setPage}
              onPageSizeChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-sm font-bold text-slate-900">No inquiries found</p>
          <p className="text-xs text-slate-600 mt-1">No customer inquiries match your filter criteria.</p>
        </div>
      )}

      {/* MODALS */}
      <InquiryFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveInquiry}
      />

      <ReplyInquiryModal
        isOpen={activeInquiry !== null}
        onClose={() => setActiveInquiry(null)}
        inquiry={activeInquiry}
        onUpdateStatus={handleUpdateStatus}
        onSendQuote={handleSendQuote}
      />

      <DeleteInquiryModal
        isOpen={deletingInquiry !== null}
        onClose={() => setDeletingInquiry(null)}
        onConfirm={() => deletingInquiry && handleDeleteInquiry(deletingInquiry.id)}
        guestName={deletingInquiry?.guestName}
      />
    </div>
  );
}
