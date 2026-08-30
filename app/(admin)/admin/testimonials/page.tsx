"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import {
  AdminTableContainer,
  AdminTable,
  AdminTableHeader,
  AdminTableHead,
  AdminTableBody,
  AdminTableRow,
  AdminTableCell,
  AdminTablePagination,
  AdminTableLoading,
  AdminTableActions,
  AdminActionButton,
} from "@/components/admin/ui/admin-table";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { AdminFilterSelect } from "@/components/admin/forms/admin-form-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Plus,
  Search,
  GripVertical,
  User,
  Star,
  Quote,
  Compass,
} from "lucide-react";
import { adminTestimonialsApi, TestimonialItem } from "@/lib/services/admin-service";
import { TestimonialModal } from "@/components/admin/modals/testimonial-modal";
import { TestimonialViewModal } from "@/components/admin/modals/testimonial-view-modal";
import { AdminConfirmModal } from "@/components/admin/ui/admin-confirm-modal";
import { openSingleImage } from "@/lib/utils/lightbox";

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TestimonialItem | null>(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<TestimonialItem | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<TestimonialItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminTestimonialsApi.getAll({
        search: debouncedSearchQuery.trim() ? debouncedSearchQuery.trim() : undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
        page,
        limit,
      });

      setItems(res);
      setTotalItems(res.pagination?.count || res.length);
      setTotalPages(res.pagination?.lastPage || 1);
    } catch (err) {
      console.error("Failed to fetch testimonials:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, statusFilter, page, limit]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (item: TestimonialItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleOpenViewModal = (item: TestimonialItem) => {
    setViewingItem(item);
    setViewModalOpen(true);
  };

  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handlePromptDelete = (item: TestimonialItem) => {
    setDeletingItem(item);
    setDeleteError(null);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteError(null);
    setIsDeleting(false);
    setDeleteConfirmOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      const res = await adminTestimonialsApi.delete(deletingItem.id);
      if (res.success) {
        toast.success(res.message || "Testimonial deleted successfully");
        handleCloseDeleteModal();
        setDeletingItem(null);
        fetchTestimonials();
      } else {
        const msg = res.message || "Failed to delete testimonial";
        setDeleteError(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      console.error("Failed to delete testimonial:", err);
      const msg = err?.message || "Failed to delete testimonial.";
      setDeleteError(msg);
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
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

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const previousItems = [...items];
    const reordered = [...items];
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, movedItem);

    const updated = reordered.map((item, idx) => ({ ...item, order: idx + 1 }));
    setItems(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);

    try {
      const res = await adminTestimonialsApi.reorder(updated.map((item) => ({ id: item.id, order: item.order })));
      if (res.success) {
        toast.success(res.message || "Testimonials reordered successfully");
      } else {
        toast.error(res.message || "Failed to reorder testimonials");
        setItems(previousItems);
      }
    } catch (err: any) {
      console.error("Failed to reorder testimonials:", err);
      toast.error(err?.message || "Failed to reorder testimonials");
      setItems(previousItems);
    }
  };

  const handleImageClick = (e: React.MouseEvent, avatarUrl: string, name: string) => {
    e.stopPropagation();
    if (avatarUrl) {
      openSingleImage(avatarUrl, `${name} Photo`, e.currentTarget);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        title="Testimonials & Reviews"
        description="Manage trekker testimonials, ratings, and customer stories displayed on the marketing website."
      >
        <Button onClick={handleOpenCreateModal}>
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </Button>
      </AdminPageHeader>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white p-4 rounded-lg border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search author, trip, or testimonial content..."
            className="pl-9 h-9"
          />
        </div>

        <AdminFilterSelect
          label="Status:"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="All">All Testimonials ({totalItems})</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </AdminFilterSelect>
      </div>

      {/* Table Container */}
      <AdminTableContainer>
        <AdminTable>
          <AdminTableHeader>
            <tr>
              <AdminTableHead>Customer / Author</AdminTableHead>
              <AdminTableHead>Trip &amp; Role</AdminTableHead>
              <AdminTableHead>Rating &amp; Content</AdminTableHead>
              <AdminTableHead>Status</AdminTableHead>
              <AdminTableHead align="right">Actions</AdminTableHead>
            </tr>
          </AdminTableHeader>
          <AdminTableBody>
            {loading ? (
              <AdminTableLoading colSpan={5} rows={5} />
            ) : items.length > 0 ? (
              items.map((item, idx) => {
                const isDragging = draggedIndex === idx;
                const isOver = dragOverIndex === idx;

                return (
                  <AdminTableRow
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={() => {
                      setDraggedIndex(null);
                      setDragOverIndex(null);
                    }}
                    className={`transition-colors cursor-move ${
                      isDragging ? "opacity-40 bg-slate-100/50" : ""
                    } ${isOver ? "border-t-2 border-slate-900 bg-slate-100/40" : ""}`}
                  >
                    {/* Customer Info */}
                    <AdminTableCell>
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-slate-400 hover:text-slate-700 shrink-0 cursor-grab active:cursor-grabbing" />
                        {item.avatar ? (
                          <img
                            src={item.avatar}
                            alt={item.author}
                            onClick={(e) => handleImageClick(e, item.avatar!, item.author)}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 cursor-pointer hover:opacity-85 hover:scale-105 transition-all"
                            title="Click to view image lightbox"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-700 font-bold text-xs">
                            {item.author ? item.author.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                          </div>
                        )}
                        <div>
                          <button
                            type="button"
                            onClick={() => handleOpenViewModal(item)}
                            className="font-bold text-slate-900 text-xs hover:underline text-left cursor-pointer"
                          >
                            {item.author}
                          </button>
                          {item.country && (
                            <div className="text-[11px] text-slate-700 font-normal">
                              {item.country}
                            </div>
                          )}
                        </div>
                      </div>
                    </AdminTableCell>

                    {/* Role & Trip */}
                    <AdminTableCell>
                      <div className="space-y-0.5">
                        {item.tripName ? (
                          <span className="font-semibold text-slate-900 text-xs flex items-center gap-1">
                            <Compass className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{item.tripName}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                        {item.role && (
                          <div className="text-[11px] text-slate-700 font-medium">
                            {item.role}
                          </div>
                        )}
                      </div>
                    </AdminTableCell>

                    {/* Rating & Content */}
                    <AdminTableCell>
                      <div className="space-y-1 max-w-sm">
                        <div className="flex items-center gap-0.5">
                          {[...Array(item.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                          &ldquo;{item.content}&rdquo;
                        </p>
                      </div>
                    </AdminTableCell>

                    {/* Status */}
                    <AdminTableCell>
                      <AdminStatusBadge status={item.status} />
                    </AdminTableCell>

                    {/* Actions */}
                    <AdminTableCell align="right">
                      <AdminTableActions>
                        <AdminActionButton
                          variant="view"
                          onClick={() => handleOpenViewModal(item)}
                          title="View Testimonial Details"
                        />
                        <AdminActionButton
                          variant="edit"
                          onClick={() => handleOpenEditModal(item)}
                          title="Edit Testimonial"
                        />
                        <AdminActionButton
                          variant="delete"
                          onClick={() => handlePromptDelete(item)}
                          title="Delete Testimonial"
                        />
                      </AdminTableActions>
                    </AdminTableCell>
                  </AdminTableRow>
                );
              })
            ) : (
              <AdminTableRow>
                <AdminTableCell colSpan={5} className="text-center py-12 text-slate-500 text-xs">
                  No testimonials found. Click &quot;Add Testimonial&quot; to create one.
                </AdminTableCell>
              </AdminTableRow>
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

      {/* View Modal */}
      {viewModalOpen && (
        <TestimonialViewModal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          testimonial={viewingItem}
          onEdit={handleOpenEditModal}
        />
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <TestimonialModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={fetchTestimonials}
          testimonialToEdit={editingItem}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <AdminConfirmModal
          isOpen={deleteConfirmOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          title="Delete Testimonial"
          description={`Are you sure you want to delete the testimonial by "${deletingItem?.author}"?`}
          confirmText="Delete Testimonial"
          cancelText="Cancel"
          variant="danger"
          isLoading={isDeleting}
          error={deleteError}
        />
      )}
    </div>
  );
}
