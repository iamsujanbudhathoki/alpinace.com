"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Trash2, Mail, MessageSquare, Tag, Send } from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  Inquiry,
  InquiryStep,
  BookingStepStatus,
  InquiryType,
} from "@/lib/admin-data";
import { InquiryFormValues } from "@/lib/admin-schemas";
import { toast } from "sonner";
import { InquiryService } from "@/lib/services/admin-service";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminFilterBar } from "@/components/admin/ui/admin-filter-bar";
import { AdminTablePagination } from "@/components/admin/ui/admin-table";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import {
  InquiryFormModal,
  UpdateInquiryStatusModal,
  ReplyInquiryEmailModal,
  DeleteInquiryModal,
} from "@/components/admin/modals/inquiry-modal";
import { AdminFilterSelect } from "@/components/admin/forms/admin-form-fields";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const INQUIRY_STEP_NAMES = ["New Lead", "Contacted", "Quote Sent", "Booked", "Closed"];

function getInquiryWorkflowSummary(steps?: InquiryStep[]) {
  if (!steps || !Array.isArray(steps) || steps.length === 0) {
    return {
      activeStepNumber: 1,
      activeStepName: "New Lead",
      activeStatus: BookingStepStatus.PENDING,
      activeMessage: "",
      completedCount: 0,
    };
  }

  const completedCount = steps.filter((s) => s.status === BookingStepStatus.COMPLETED).length;
  if (completedCount === steps.length) {
    return {
      activeStepNumber: 5,
      activeStepName: "Closed",
      activeStatus: BookingStepStatus.COMPLETED,
      activeMessage: steps[4]?.message || "",
      completedCount,
    };
  }

  const activeIdx = steps.findIndex(
    (s) =>
      s.status !== BookingStepStatus.COMPLETED &&
      s.status !== BookingStepStatus.CANCELLED
  );
  const idx = activeIdx >= 0 ? activeIdx : 0;
  return {
    activeStepNumber: idx + 1,
    activeStepName: INQUIRY_STEP_NAMES[idx] || `Step ${idx + 1}`,
    activeStatus: steps[idx]?.status || BookingStepStatus.PENDING,
    activeMessage: steps[idx]?.message || "",
    completedCount,
  };
}

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
  const [statusInquiry, setStatusInquiry] = useState<Inquiry | null>(null);
  const [replyInquiry, setReplyInquiry] = useState<Inquiry | null>(null);
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
        status: statusFilter === "All" ? undefined : statusFilter,
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
        setStatusInquiry(match);
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
    }
  }, [targetId, inquiries]);

  const handleWorkflowUpdated = (updatedInquiry: Inquiry) => {
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === updatedInquiry.id ? updatedInquiry : inq))
    );
    if (statusInquiry && statusInquiry.id === updatedInquiry.id) {
      setStatusInquiry(updatedInquiry);
    }
    if (replyInquiry && replyInquiry.id === updatedInquiry.id) {
      setReplyInquiry(updatedInquiry);
    }
  };

  const handleSendReply = async (id: string, message: string): Promise<boolean> => {
    try {
      const res = await InquiryService.sendQuote(id, { message });
      if (res.success) {
        toast.success(res.message || "Email reply dispatched successfully!");
        await loadInquiries();
        return true;
      } else {
        toast.error(res.message || "Failed to send email reply.");
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send email reply.");
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
        setDeleteError(res.message || "Failed to delete inquiry");
        return false;
      }
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete inquiry");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        title="Customer Inquiries"
        description="Monitor custom trek requests, quotes, lead qualifications, and general client questions."
      >
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-9 px-4 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Inquiry</span>
        </Button>
      </AdminPageHeader>

      {/* Filter bar card */}
      <AdminFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search guest, email, or trip..."
      >
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Step Status Dropdown Filter */}
          <AdminFilterSelect
            label="Step Status:"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Step Statuses</option>
            {Object.values(BookingStepStatus).map((st) => (
              <option key={st} value={st}>
                {st.charAt(0).toUpperCase() + st.slice(1).replace(/_/g, " ")}
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
              const summary = getInquiryWorkflowSummary(inq.steps);

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
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <AdminStatusBadge status={summary.activeStatus} />
                        <span className="text-[10px] font-semibold text-slate-500">
                          Step {summary.activeStepNumber}: {summary.activeStepName}
                        </span>
                      </div>
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

                    {/* Step Progress & Message */}
                    <div className="bg-slate-50/80 px-3 py-2 rounded-lg border border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600 gap-2">
                      <span className="font-semibold text-slate-700">
                        Step {summary.activeStepNumber}/5: {summary.activeStepName}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">
                        {summary.completedCount}/5 steps done
                      </span>
                    </div>

                    {summary.activeMessage && (
                      <div className="text-[11px] text-slate-600 italic px-1 truncate">
                        Remark: &ldquo;{summary.activeMessage}&rdquo;
                      </div>
                    )}

                    <p className="text-xs text-slate-600 line-clamp-3 font-normal leading-relaxed italic bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                      &ldquo;{inq.message}&rdquo;
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 min-w-0">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-28 font-medium">{inq.email}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStatusInquiry(inq)}
                        className="text-xs font-semibold text-slate-800 border-slate-200 hover:bg-slate-100 cursor-pointer h-8 px-2.5"
                        title="Update Inquiry Steps"
                      >
                        <Tag className="w-3.5 h-3.5 mr-1 text-slate-600" />
                        Workflow Steps
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setReplyInquiry(inq)}
                        className="text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 cursor-pointer h-8 px-2.5"
                        title="Reply via Email"
                      >
                        <Send className="w-3.5 h-3.5 mr-1 text-white" />
                        Reply Email
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePromptDelete(inq)}
                        className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                        title="Delete Inquiry"
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

      <UpdateInquiryStatusModal
        isOpen={statusInquiry !== null}
        onClose={() => setStatusInquiry(null)}
        inquiry={statusInquiry}
        onStatusUpdated={handleWorkflowUpdated}
      />

      <ReplyInquiryEmailModal
        isOpen={replyInquiry !== null}
        onClose={() => setReplyInquiry(null)}
        inquiry={replyInquiry}
        onSendReply={handleSendReply}
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
