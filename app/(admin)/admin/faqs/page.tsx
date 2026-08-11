"use client";

import { useEffect, useState } from "react";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  HelpCircle, 
  Check, 
  Loader2, 
  X, 
  Layers, 
  ArrowUpDown,
  FileQuestion
} from "lucide-react";
import { toast } from "sonner";
import { FaqItem, FaqStatus } from "@/lib/admin-data";
import { FaqService } from "@/lib/services/admin-service";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
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
} from "@/components/admin/ui/admin-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [deletingFaq, setDeletingFaq] = useState<FaqItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("General");
  const [status, setStatus] = useState<FaqStatus>(FaqStatus.ACTIVE);
  const [order, setOrder] = useState<number>(0);

  const loadFaqs = async () => {
    setLoading(true);
    try {
      const data = await FaqService.getAll();
      setFaqs(data);
    } catch (err) {
      console.error("Failed to load FAQs:", err);
      toast.error("Failed to load FAQs from backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const openCreateModal = () => {
    setEditingFaq(null);
    setQuestion("");
    setAnswer("");
    setCategory("General");
    setStatus(FaqStatus.ACTIVE);
    setOrder(faqs.length + 1);
    setModalOpen(true);
  };

  const openEditModal = (faq: FaqItem) => {
    setEditingFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategory(faq.category || "General");
    setStatus(faq.status);
    setOrder(faq.order || 0);
    setModalOpen(true);
  };

  const openDeleteModal = (faq: FaqItem) => {
    setDeletingFaq(faq);
    setDeleteModalOpen(true);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      toast.error("Question and Answer are required.");
      return;
    }

    setIsSubmitting(true);
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
          setModalOpen(false);
          loadFaqs();
        } else {
          toast.error(res.message || "Failed to update FAQ");
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
          setModalOpen(false);
          loadFaqs();
        } else {
          toast.error(res.message || "Failed to create FAQ");
        }
      }
    } catch (err: any) {
      console.error("Error saving FAQ:", err);
      toast.error(err.message || "Failed to save FAQ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingFaq) return;
    setIsSubmitting(true);
    try {
      const res = await FaqService.delete(deletingFaq.id);
      if (res.success) {
        toast.success("FAQ deleted successfully!");
        setDeleteModalOpen(false);
        setDeletingFaq(null);
        loadFaqs();
      } else {
        toast.error(res.message || "Failed to delete FAQ");
      }
    } catch (err: any) {
      console.error("Error deleting FAQ:", err);
      toast.error(err.message || "Failed to delete FAQ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = Array.from(
    new Set(faqs.map((f) => f.category).filter(Boolean))
  );

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || faq.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Header */}
      <AdminPageHeader
        title="Pre-Trip Consultations &amp; FAQs"
        description="Manage consultation Q&amp;As, high-altitude advice, and booking FAQs displayed on the marketing homepage."
      >
        <Button
          onClick={openCreateModal}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer shadow-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>New Consultation FAQ</span>
        </Button>
      </AdminPageHeader>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or answers..."
            className="pl-9 text-xs bg-slate-50 border-slate-200 text-slate-900 focus:bg-white rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:bg-white rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="All">All Categories ({faqs.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* FAQs Table */}
      <AdminTableContainer>
        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow>
              <AdminTableHead className="w-16 text-center">Order</AdminTableHead>
              <AdminTableHead className="w-64">Question</AdminTableHead>
              <AdminTableHead>Answer</AdminTableHead>
              <AdminTableHead className="w-36">Category</AdminTableHead>
              <AdminTableHead className="w-24">Status</AdminTableHead>
              <AdminTableHead className="w-24 text-right">Actions</AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>

          <AdminTableBody>
            {loading ? (
              <AdminTableLoading colSpan={6} />
            ) : filteredFaqs.length === 0 ? (
              <AdminTableEmpty
                colSpan={6}
                message={
                  searchQuery
                    ? "No FAQs match your search criteria."
                    : "No consultation FAQs available. Click 'New Consultation FAQ' to create one."
                }
              />
            ) : (
              filteredFaqs.map((faq) => (
                <AdminTableRow key={faq.id}>
                  <AdminTableCell className="text-center font-bold text-slate-500 text-xs">
                    #{faq.order}
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
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 text-[11px] font-semibold">
                      <Layers className="w-3 h-3 text-amber-600" />
                      <span>{faq.category || "General"}</span>
                    </span>
                  </AdminTableCell>

                  <AdminTableCell>
                    <AdminStatusBadge
                      status={faq.status === FaqStatus.ACTIVE ? "Active" : "Draft"}
                    />
                  </AdminTableCell>

                  <AdminTableCell className="text-right">
                    <AdminTableActions>
                      <AdminActionButton
                        onClick={() => openEditModal(faq)}
                        title="Edit FAQ"
                        className="hover:text-amber-600"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </AdminActionButton>
                      <AdminActionButton
                        onClick={() => openDeleteModal(faq)}
                        title="Delete FAQ"
                        className="hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </AdminActionButton>
                    </AdminTableActions>
                  </AdminTableCell>
                </AdminTableRow>
              ))
            )}
          </AdminTableBody>
        </AdminTable>
      </AdminTableContainer>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-600" />
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
                    className="text-xs bg-slate-50 border-slate-200 text-slate-900 font-medium focus:bg-white rounded-xl py-2.5"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as FaqStatus)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none"
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
                  onClick={() => setModalOpen(false)}
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

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && deletingFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-heading text-base font-bold text-slate-900 text-rose-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              <span>Delete FAQ?</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete this FAQ: &quot;
              <strong className="text-slate-900">{deletingFaq.question}</strong>&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteModalOpen(false)}
                className="text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 rounded-xl cursor-pointer shadow-xs"
              >
                {isSubmitting ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
