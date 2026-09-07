"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus, Search, Eye, Edit, Trash2, Sparkles, Image as ImageIcon, Maximize2, GitMerge, GripVertical, Save, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ActivityItem, ActivityStatus } from "@/lib/admin-data";
import { ActivityService } from "@/lib/services/admin-service";
import { openSingleImage } from "@/lib/utils/lightbox";
import { ActivityFormModal, DeleteActivityModal } from "@/components/admin/modals/activity-modal";
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
  AdminTablePagination,
} from "@/components/admin/ui/admin-table";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminFilterSelect } from "@/components/admin/forms/admin-form-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Stats Counters
  const [stats, setStats] = useState({ total: 0, active: 0, draft: 0 });

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Drag and Drop reorder states
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeActivity, setActiveActivity] = useState<ActivityItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedStatus]);

  // Load activities from API
  const loadActivities = async () => {
    setIsLoading(true);
    try {
      const data = await ActivityService.getAll({
        status: selectedStatus === "All" ? undefined : selectedStatus,
        search: debouncedSearch,
        page,
        limit,
      });

      const items = Array.isArray(data) ? [...data] : [];
      setActivities(items);

      if (data.pagination) {
        setTotalItems(data.pagination.count);
        setTotalPages(data.pagination.lastPage);
      } else {
        setTotalItems(items.length);
        setTotalPages(Math.max(1, Math.ceil(items.length / limit)));
      }

      // Calculate stats summary
      const allRes = await ActivityService.getAll({ limit: 1000 });
      const allItems: ActivityItem[] = Array.isArray(allRes) ? allRes : [];
      setStats({
        total: allItems.length,
        active: allItems.filter((a: ActivityItem) => a.status === ActivityStatus.ACTIVE).length,
        draft: allItems.filter((a: ActivityItem) => a.status === ActivityStatus.DRAFT).length,
      });
    } catch (e) {
      console.error("Failed to load activities:", e);
      toast.error("Failed to load activities list.");
    } finally {
      setIsLoading(false);
    }
  };

  const searchParams = useSearchParams();
  const targetId = searchParams?.get("id") || searchParams?.get("viewId");

  useEffect(() => {
    if (targetId && activities.length > 0) {
      const match = activities.find((a) => a.id === targetId || a.slug === targetId);
      if (match) {
        setActiveActivity(match);
        setIsEditing(false);
        setIsFormModalOpen(true);
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
    }
  }, [targetId, activities]);

  useEffect(() => {
    loadActivities();
  }, [debouncedSearch, selectedStatus, page, limit]);

  // Drag & Drop Handlers
  const handleDragStart = (idx: number) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== idx) {
      setDragOverIndex(idx);
    }
  };

  const handleDrop = async (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIdx) return;

    const list = [...activities];
    const draggedItem = list[draggedIndex];
    list.splice(draggedIndex, 1);
    list.splice(dropIdx, 0, draggedItem);

    setActivities(list);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Save order automatically to backend
    setIsSavingOrder(true);
    try {
      const payload = list.map((act, idx) => ({
        id: act.id,
        menuOrder: idx,
      }));
      const res = await ActivityService.reorder(payload);
      if (res && res.success) {
        toast.success("Activity position reordered successfully.");
      } else {
        toast.error(res?.message || "Failed to update activity position.");
      }
    } catch (err: any) {
      toast.error("Failed to update activity order.");
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleCreateNew = () => {
    setActiveActivity(null);
    setIsEditing(false);
    setIsFormModalOpen(true);
  };

  const handleView = (act: ActivityItem) => {
    setActiveActivity(act);
    setIsEditing(false);
    setIsFormModalOpen(true);
  };

  const handleEdit = (act: ActivityItem) => {
    setActiveActivity(act);
    setIsEditing(true);
    setIsFormModalOpen(true);
  };

  const handleDeletePrompt = (act: ActivityItem) => {
    setActiveActivity(act);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!activeActivity?.id) return;
    try {
      const res = await ActivityService.delete(activeActivity.id);
      if (res && res.success) {
        toast.success(`Activity "${activeActivity.name}" deleted.`);
        await loadActivities();
      } else {
        toast.error(res?.message || "Failed to delete activity.");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete activity.");
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Activities Management"
        description="Create, edit, and drag-and-drop reorder activity hubs (e.g. Activities in Pokhara, Helicopter Tours, Peak Climbing)."
      >
        <div className="flex items-center gap-2">
          <Link href="/admin/activities/ordering">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 cursor-pointer">
              <GitMerge className="w-3.5 h-3.5" /> Reorder Page View
            </Button>
          </Link>
          <Button
            onClick={handleCreateNew}
            size="sm"
            className="bg-stone-900 hover:bg-stone-800 text-white text-xs gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Activity
          </Button>
        </div>
      </AdminPageHeader>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-sm p-4 space-y-1">
          <div className="text-xs text-stone-500 font-medium uppercase tracking-wider">Total Activities</div>
          <div className="text-2xl font-bold text-stone-900">{stats.total}</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-sm p-4 space-y-1">
          <div className="text-xs text-emerald-600 font-medium uppercase tracking-wider">Active</div>
          <div className="text-2xl font-bold text-stone-900">{stats.active}</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-sm p-4 space-y-1">
          <div className="text-xs text-amber-600 font-medium uppercase tracking-wider">Drafts</div>
          <div className="text-2xl font-bold text-stone-900">{stats.draft}</div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 border border-stone-200 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activities by name or slug..."
            className="pl-9 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isSavingOrder && (
            <span className="text-xs text-amber-600 font-medium flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving order...
            </span>
          )}
          <AdminFilterSelect
            label="Status:"
            value={selectedStatus}
            onChange={(e: any) => setSelectedStatus(typeof e === "string" ? e : e.target.value)}
            options={[
              { label: "All Statuses", value: "All" },
              { label: "Active", value: ActivityStatus.ACTIVE },
              { label: "Draft", value: ActivityStatus.DRAFT },
            ]}
          />
        </div>
      </div>

      {/* Activities Data Table */}
      <AdminTableContainer>
        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow>
              <AdminTableHead className="w-10 text-center" title="Drag to reorder">
                <GripVertical className="w-3.5 h-3.5 mx-auto text-stone-400" />
              </AdminTableHead>
              <AdminTableHead className="w-14 text-center">Banner</AdminTableHead>
              <AdminTableHead>Name &amp; Slug</AdminTableHead>
              <AdminTableHead>Description</AdminTableHead>
              <AdminTableHead className="w-24 text-center">Order</AdminTableHead>
              <AdminTableHead className="w-24 text-center">Status</AdminTableHead>
              <AdminTableHead className="w-28 text-right">Actions</AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>

          <AdminTableBody>
            {isLoading ? (
              <AdminTableLoading colSpan={7} message="Loading activities..." />
            ) : activities.length === 0 ? (
              <AdminTableEmpty
                colSpan={7}
                title="No activities found"
                description={
                  debouncedSearch
                    ? "Try adjusting your search criteria or clear filters."
                    : "Get started by adding your first activity hub."
                }
              />
            ) : (
              activities.map((act, index) => {
                const isDragging = draggedIndex === index;
                const isDragOver = dragOverIndex === index;

                return (
                  <AdminTableRow
                    key={act.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleView(act)}
                    className={`transition-colors ${
                      isDragging
                        ? "bg-amber-50 opacity-50"
                        : isDragOver
                        ? "bg-stone-100 border-t-2 border-stone-900"
                        : ""
                    }`}
                  >
                    <AdminTableCell
                      className="text-center cursor-grab active:cursor-grabbing text-stone-400 hover:text-stone-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <GripVertical className="w-4 h-4 mx-auto" />
                    </AdminTableCell>

                    <AdminTableCell className="text-center">
                      {act.image ? (
                        <div className="relative w-9 h-9 mx-auto rounded overflow-hidden border border-stone-200 group/img bg-stone-100">
                          <img src={act.image} alt={act.name} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openSingleImage(act.image!, act.name);
                            }}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white"
                          >
                            <Maximize2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-9 h-9 mx-auto rounded border border-stone-200 bg-stone-50 flex items-center justify-center text-stone-300">
                          <Sparkles className="w-4 h-4" />
                        </div>
                      )}
                    </AdminTableCell>

                    <AdminTableCell>
                      <div className="space-y-0.5">
                        <div className="font-semibold text-stone-900 text-xs flex items-center gap-2">
                          {act.name}
                          {act.isFeatured && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-stone-400">/{act.slug}</div>
                      </div>
                    </AdminTableCell>

                    <AdminTableCell>
                      <p className="text-xs text-stone-600 line-clamp-1 max-w-md">
                        {act.description || "—"}
                      </p>
                    </AdminTableCell>

                    <AdminTableCell className="text-center">
                      <span className="text-xs font-mono font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                        #{index + 1}
                      </span>
                    </AdminTableCell>

                    <AdminTableCell className="text-center">
                      <AdminStatusBadge status={act.status} />
                    </AdminTableCell>

                    <AdminTableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <AdminTableActions>
                        <AdminActionButton
                          variant="view"
                          title="View Details"
                          onClick={() => handleView(act)}
                        />
                        <AdminActionButton
                          variant="edit"
                          title="Edit Activity"
                          onClick={() => handleEdit(act)}
                        />
                        <AdminActionButton
                          variant="delete"
                          title="Delete Activity"
                          onClick={() => handleDeletePrompt(act)}
                        />
                      </AdminTableActions>
                    </AdminTableCell>
                  </AdminTableRow>
                );
              })
            )}
          </AdminTableBody>
        </AdminTable>
      </AdminTableContainer>

      {/* Pagination Footer */}
      {!isLoading && totalPages > 1 && (
        <AdminTablePagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={limit}
          onPageChange={setPage}
        />
      )}

      {/* Activity Create/Edit Modal */}
      <ActivityFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={async () => {
          await loadActivities();
        }}
        initialData={activeActivity}
        isEditing={isEditing}
      />

      {/* Delete Confirmation Modal */}
      <DeleteActivityModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        activityName={activeActivity?.name}
      />
    </div>
  );
}

