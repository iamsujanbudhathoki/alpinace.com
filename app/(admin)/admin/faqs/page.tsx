"use client";

import { AdminConfirmModal } from "@/components/admin/ui/admin-confirm-modal";
import { AdminInlineSelect, InlineSelectOption } from "@/components/admin/ui/admin-inline-select";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import {
  AdminActionButton,
  AdminTable,
  AdminTableActions,
  AdminTableBody,
  AdminTableCell,
  AdminTableContainer,
  AdminTableEmpty,
  AdminTableHead,
  AdminTableHeader,
  AdminTableLoading,
  AdminTablePagination,
  AdminTableRow,
} from "@/components/admin/ui/admin-table";
import { AdminFilterSelect } from "@/components/admin/forms/admin-form-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaqItem, FaqStatus } from "@/lib/admin-data";
import { FaqService } from "@/lib/services/admin-service";
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  HelpCircle,
  Layers,
  Loader2,
  Plus,
  Search,
  Trash2,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

const STATUS_OPTIONS: InlineSelectOption[] = [
  { value: FaqStatus.ACTIVE, label: "Active" },
  { value: FaqStatus.DRAFT, label: "Draft" },
];

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [allFaqsForCategories, setAllFaqsForCategories] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Drag & Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [viewingFaq, setViewingFaq] = useState<FaqItem | null>(null);
  const [deletingFaq, setDeletingFaq] = useState<FaqItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("General");
  const [status, setStatus] = useState<FaqStatus>(FaqStatus.ACTIVE);
  const [order, setOrder] = useState<number>(0);

  const loadCategoryOptions = async () => {
    try {
      const data = await FaqService.getAll();
      setAllFaqsForCategories(data);
    } catch (e) {
      console.warn("Failed to load FAQ categories:", e);
    }
  };

  useEffect(() => {
    loadCategoryOptions();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryFilter]);

  const loadFaqs = async () => {
    setLoading(true);
    try {
      const res = await FaqService.getAll({
        category: categoryFilter === "All" ? undefined : categoryFilter,
        search: debouncedSearch,
        page,
        limit,
      });
      setFaqs(res);
      if (res.pagination) {
        setTotalItems(res.pagination.count);
        setTotalPages(res.pagination.lastPage);
      } else {
        setTotalItems(res.length);
        setTotalPages(Math.max(1, Math.ceil(res.length / limit)));
      }
    } catch (err) {
      console.error("Failed to load FAQs:", err);
      toast.error("Failed to load FAQs from backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, [debouncedSearch, categoryFilter, page, limit]);

  const searchParams = useSearchParams();
  const targetId = searchParams?.get("id") || searchParams?.get("viewId");

  // Auto-open modal when targetId is in query params & remove targetId from URL
  useEffect(() => {
    if (targetId && (faqs.length > 0 || allFaqsForCategories.length > 0)) {
      const list = faqs.length > 0 ? faqs : allFaqsForCategories;
      const match = list.find((f) => f.id === targetId);
      if (match) {
        setViewingFaq(match);
        setViewModalOpen(true);
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
    }
  }, [targetId, faqs, allFaqsForCategories]);

  const handleInlineStatusChange = async (faq: FaqItem, newStatus: string): Promise<boolean> => {
    try {
      const res = await FaqService.update(faq.id, { status: newStatus as FaqStatus });
      if (res.success) {
        setFaqs((prev) =>
          prev.map((f) => (f.id === faq.id ? { ...f, status: newStatus as FaqStatus } : f))
        );
        toast.success(`FAQ #${faq.order} status updated`);
        return true;
      } else {
        toast.error(res.message || "Failed to update FAQ status");
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update FAQ status");
      return false;
    }
  };

  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCloseFormModal = () => {
    setFormError(null);
    setIsSubmitting(false);
    setModalOpen(false);
  };

  const handleCloseDeleteModal = () => {
    setDeleteError(null);
    setIsDeleting(false);
    setDeleteModalOpen(false);
    setDeletingFaq(null);
  };

  const openCreateModal = () => {
    setEditingFaq(null);
    setQuestion("");
    setAnswer("");
    setCategory("General");
    setStatus(FaqStatus.ACTIVE);
    setOrder(totalItems + 1);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (faq: FaqItem) => {
    setEditingFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategory(faq.category || "General");
    setStatus(faq.status);
    setOrder(faq.order || 0);
    setFormError(null);
    setModalOpen(true);
  };

  const openDeleteModal = (faq: FaqItem) => {
    setDeletingFaq(faq);
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      setFormError("Question and Answer are required.");
      toast.error("Question and Answer are required.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      if (editingFaq) {
        const res = await FaqService.update(editingFaq.id, {
          question,
          answer,
          category,
          status,
          order: Number(order) || 0,
        });
        if (res.success) {
          toast.success("FAQ updated successfully!");
          handleCloseFormModal();
          await Promise.all([loadFaqs(), loadCategoryOptions()]);
        } else {
          const msg = res.message || "Failed to update FAQ";
          setFormError(msg);
          toast.error(msg);
        }
      } else {
        const res = await FaqService.create({
          question,
          answer,
          category,
          status,
          order: Number(order) || 0,
        });
        if (res.success) {
          toast.success("FAQ created successfully!");
          handleCloseFormModal();
          await Promise.all([loadFaqs(), loadCategoryOptions()]);
        } else {
          const msg = res.message || "Failed to create FAQ";
          setFormError(msg);
          toast.error(msg);
        }
      }
    } catch (err: any) {
      const msg = err.message || "Failed to save FAQ";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingFaq) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await FaqService.delete(deletingFaq.id);
      if (res.success) {
        toast.success("FAQ deleted successfully!");
        handleCloseDeleteModal();
        await Promise.all([loadFaqs(), loadCategoryOptions()]);
      } else {
        const msg = res.message || "Failed to delete FAQ";
        setDeleteError(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg = err.message || "Failed to delete FAQ";
      setDeleteError(msg);
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const syncReorder = async (updatedFaqs: FaqItem[]) => {
    setIsReordering(true);
    try {
      const payload = updatedFaqs.map((f, idx) => ({ id: f.id, order: idx + 1 }));
      const res = await FaqService.reorder(payload);
      if (res.success) {
        toast.success("FAQ order saved!");
      } else {
        toast.error(res.message || "Failed to save reorder");
      }
    } catch (err) {
      toast.error("Failed to save reordered list");
      loadFaqs();
    } finally {
      setIsReordering(false);
    }
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= faqs.length) return;

    const reordered = [...faqs];
    const [movedItem] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, movedItem);

    const updated = reordered.map((item, idx) => ({ ...item, order: idx + 1 }));
    setFaqs(updated);
    syncReorder(updated);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...faqs];
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, movedItem);

    const updated = reordered.map((item, idx) => ({ ...item, order: idx + 1 }));
    setFaqs(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
    syncReorder(updated);
  };

  const categories = Array.from(
    new Set(allFaqsForCategories.map((f) => f.category || "General").filter(Boolean))
  );

  return (
    <div className="space-y-6 pb-16">
      <AdminPageHeader
        title="Pre-Trip Consultations &amp; FAQs"
        description="Manage consultation Q&amp;As, high-altitude advice, and booking FAQs displayed on the marketing homepage."
      >
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4" />
          <span>New Consultation FAQ</span>
        </Button>
      </AdminPageHeader>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white p-4 rounded-lg border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or answers..."
            className="pl-9 h-9"
          />
        </div>

        <AdminFilterSelect
          label="Category:"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="All">All Categories ({totalItems})</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </AdminFilterSelect>
      </div>

      <AdminTableContainer>
        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow>
              <AdminTableHead className="w-14 text-center">S.N.</AdminTableHead>
              <AdminTableHead className="w-64">Question</AdminTableHead>
              <AdminTableHead>Answer</AdminTableHead>
              <AdminTableHead className="w-36">Category</AdminTableHead>
              <AdminTableHead className="w-24">Status</AdminTableHead>
              <AdminTableHead className="w-28 text-right">Actions</AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>

          <AdminTableBody>
            {loading ? (
              <AdminTableLoading colSpan={6} rows={limit > 10 ? 10 : limit} />
            ) : faqs.length === 0 ? (
              <AdminTableEmpty
                colSpan={6}
                title="No FAQs found"
                description={
                  searchQuery
                    ? "No FAQs match your search criteria."
                    : "No consultation FAQs available. Click 'New Consultation FAQ' to create one."
                }
              />
            ) : (
              faqs.map((faq, index) => {
                const isDragging = draggedIndex === index;
                const isOver = dragOverIndex === index;
                const serialNumber = (page - 1) * limit + index + 1;

                return (
                  <AdminTableRow
                    key={faq.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={() => {
                      setDraggedIndex(null);
                      setDragOverIndex(null);
                    }}
                    className={`transition-colors cursor-move ${
                      isDragging ? "opacity-40 bg-amber-50/50" : ""
                    } ${isOver ? "border-t-2 border-amber-500 bg-amber-50/30" : ""}`}
                  >
                    <AdminTableCell className="text-center font-semibold text-slate-500 text-xs">
                      {serialNumber}
                    </AdminTableCell>

                    <AdminTableCell>
                      <span className="font-bold text-slate-900 text-xs line-clamp-2">
                        {faq.question}
                      </span>
                    </AdminTableCell>

                    <AdminTableCell>
                      <p className="text-slate-600 text-xs line-clamp-2 font-normal leading-relaxed">
                        {faq.answer}
                      </p>
                    </AdminTableCell>

                    <AdminTableCell>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                        <Layers className="w-3 h-3 text-slate-500" />
                        <span>{faq.category || "General"}</span>
                      </span>
                    </AdminTableCell>

                    <AdminTableCell>
                      <AdminInlineSelect
                        value={faq.status}
                        options={STATUS_OPTIONS}
                        onChange={(newVal) => handleInlineStatusChange(faq, newVal)}
                        variant="badge"
                        title="Click to change FAQ status"
                      />
                    </AdminTableCell>

                    <AdminTableCell className="text-right">
                      <AdminTableActions>
                        <AdminActionButton
                          variant="view"
                          onClick={() => {
                            setViewingFaq(faq);
                            setViewModalOpen(true);
                          }}
                          title="View FAQ Details"
                        />
                        <AdminActionButton
                          variant="edit"
                          onClick={() => openEditModal(faq)}
                          title="Edit FAQ"
                        />
                        <AdminActionButton
                          variant="delete"
                          onClick={() => openDeleteModal(faq)}
                          title="Delete FAQ"
                        />
                      </AdminTableActions>
                    </AdminTableCell>
                  </AdminTableRow>
                );
              })
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

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 max-w-xl w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4.5 h-4.5 text-slate-700" />
                <span>{editingFaq ? "Edit Consultation FAQ" : "Create Consultation FAQ"}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-semibold">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Consultation Question *
                </label>
                <Input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. What physical fitness and prior experience is required?"
                  className="text-xs bg-slate-50 border-slate-200 text-slate-900 font-medium focus:bg-white rounded-xl py-2.5"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Detailed Answer *
                </label>
                <textarea
                  rows={5}
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Provide a clear, expert explanation for travelers..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500/20 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Category
                  </label>
                  <Input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Safety & Altitude"
                  />
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1.5 text-xs">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as FaqStatus)}
                    className="w-full text-xs bg-white border border-slate-300 text-slate-900 font-semibold rounded-md px-3 py-2 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 cursor-pointer"
                  >
                    <option value={FaqStatus.ACTIVE}>Active (Visible)</option>
                    <option value={FaqStatus.DRAFT}>Draft (Hidden)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Display Order
                  </label>
                  <Input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value) || 0)}
                    className="text-xs bg-slate-50 border-slate-200 text-slate-900 font-medium focus:bg-white rounded-xl py-2.5"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseFormModal}
                  className="text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 rounded-xl cursor-pointer shadow-xs flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingFaq ? "Save Changes" : "Create FAQ"}</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ Detail View Modal */}
      {viewModalOpen && viewingFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 max-w-xl w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-500" />
                <span>FAQ Details</span>
              </h3>
              <button
                onClick={() => { setViewModalOpen(false); setViewingFaq(null); }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Question
                </span>
                <p className="text-slate-900 font-bold text-sm leading-snug">
                  {viewingFaq.question}
                </p>
              </div>

              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Answer
                </span>
                <p className="text-slate-700 font-normal leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {viewingFaq.answer}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Category
                  </span>
                  <span className="font-semibold text-slate-900">{viewingFaq.category || "General"}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Status
                  </span>
                  <span className="font-semibold text-slate-900 capitalize">{viewingFaq.status}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                onClick={() => {
                  const faqToEdit = viewingFaq;
                  setViewModalOpen(false);
                  setViewingFaq(null);
                  openEditModal(faqToEdit);
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 rounded-xl cursor-pointer shadow-xs"
              >
                Edit FAQ
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setViewModalOpen(false); setViewingFaq(null); }}
                className="text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && deletingFaq && (
        <AdminConfirmModal
          isOpen={deleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleDeleteConfirm}
          title="Delete FAQ"
          description={`Are you sure you want to delete this FAQ: "${deletingFaq.question}"?`}
          confirmText="Delete FAQ"
          cancelText="Cancel"
          variant="danger"
          isLoading={isDeleting}
          error={deleteError}
        />
      )}
    </div>
  );
}
