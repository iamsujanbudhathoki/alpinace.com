"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Trash2, Eye, Mail, MessageSquare } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Inquiry, InquiryStatus, InquiryType } from "@/lib/admin-data";
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
import { AdminFilterSelect } from "@/components/admin/forms/admin-form-fields";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");

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
  }, [debouncedSearch, statusFilter, typeFilter]);

  // Load inquiries from backend
  const loadInquiries = async () => {
    setLoading(true);
    try {
      const data = await InquiryService.getAll({
        status: statusFilter === "All" ? undefined : (statusFilter as InquiryStatus),
        type: typeFilter === "All" ? undefined : (typeFilter as InquiryType),
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
  }, [debouncedSearch, statusFilter, typeFilter, page, limit]);

  const searchParams = useSearchParams();
  const targetId = searchParams?.get("id") || searchParams?.get("viewId");

  // Auto-open modal when targetId is in query params & remove targetId from URL
  useEffect(() => {
    if (targetId && inquiries.length > 0) {
      const match = inquiries.find((i) => i.id === targetId);
      if (match) {
        setActiveInquiry(match);
        setIsFormOpen(true);
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
    }
  }, [targetId, inquiries]);

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
      const res = await InquiryService.create({
        ...formData,
        cfTurnstileToken: 'ADMIN_BYPASS',
      } as any);
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

  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePromptDelete = (inq: Inquiry) => {
    setDeletingInquiry(inq);
    setDeleteError(null);
  };

  const handleCloseDeleteModal = () => {
    setDeleteError(null);
    setIsDeleting(false);
    setDeletingInquiry(null);
  };

  const handleDeleteInquiry = async (id: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      const res = await InquiryService.delete(id);
      if (res.success) {
        setInquiries((prev) => prev.filter((inq) => inq.id !== id));
        handleCloseDeleteModal();
        toast.success(res.message || "Inquiry record deleted successfully");
        return true;
      } else {
        const msg = res.message || "Failed to delete inquiry";
        setDeleteError(msg);
        toast.error(msg);
        return false;
      }
    } catch (err: any) {
      const msg = err.message || "Failed to delete inquiry";
      setDeleteError(msg);
      toast.error(msg);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        title="Inquiries & Lead Management"
        description="Review inbound travel leads, dispatch custom quotes, and track customer communication."
      >
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Log Manual Inquiry
        </Button>
      </AdminPageHeader>

      {/* Filter bar card */}
      <AdminFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search guest, email, or trip..."
      >
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Status Dropdown Filter */}
          <AdminFilterSelect
            label="Status:"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            {Object.values(InquiryStatus).map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </AdminFilterSelect>

          {/* Inquiry Type Dropdown Filter */}
          <AdminFilterSelect
            label="Inquiry Type:"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Inquiry Types</option>
            {Object.values(InquiryType).map((tp) => (
              <option key={tp} value={tp}>
                {tp}
              </option>
            ))}
          </AdminFilterSelect>
        </div>
      </AdminFilterBar>

      {/* Inquiries Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 animate-pulse">
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
                  className="bg-white border-slate-200 shadow-none hover:border-slate-300 transition-all flex flex-col justify-between p-5 space-y-4 relative rounded-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-500">
                            #{serialNumber}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-medium text-slate-700">
                            {inq.type || InquiryType.GENERAL}
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 text-base leading-snug pt-0.5">
                          {inq.guestName}
                        </div>
                        <div className="text-xs text-slate-500 font-normal">
                          {inq.country} &bull; {formatDate(inq.createdAt)}
                        </div>
                      </div>
                      <AdminStatusBadge status={inq.status} />
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-1.5 text-xs">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{inq.interestedTrip}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 font-medium text-xs">
                        <span>Dates: {inq.travelDates}</span>
                        <span>Group: {inq.groupSize} Pax</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3 font-normal leading-relaxed italic bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                      &ldquo;{inq.message}&rdquo;
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
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
        onClose={handleCloseDeleteModal}
        onConfirm={() => deletingInquiry && handleDeleteInquiry(deletingInquiry.id)}
        guestName={deletingInquiry?.guestName}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </div>
  );
}
