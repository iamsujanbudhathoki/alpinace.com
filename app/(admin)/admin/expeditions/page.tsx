"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Mountain, TrendingUp, Tag, ExternalLink, Maximize2, Image as ImageIcon } from "lucide-react";
import { PackageItem, PackageStatus, CategoryType, CategoryItem } from "@/lib/admin-data";
import { toast } from "sonner";
import { ExpeditionService, CategoryService } from "@/lib/services/admin-service";
import { ApiResponse } from "@/lib/services/api-client";
import { openSingleImage } from "@/lib/utils/lightbox";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminFilterBar } from "@/components/admin/ui/admin-filter-bar";
import { AdminInlineSelect, InlineSelectOption } from "@/components/admin/ui/admin-inline-select";
import { ExpeditionFormModal, DeleteExpeditionModal } from "@/components/admin/modals/expedition-modal";
import { AdminFilterSelect } from "@/components/admin/forms/admin-form-fields";
import { Button } from "@/components/ui/button";
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

const STATUS_OPTIONS: InlineSelectOption[] = [
  { value: PackageStatus.ACTIVE, label: "Active" },
  { value: PackageStatus.FEATURED, label: "Featured" },
  { value: PackageStatus.DRAFT, label: "Draft" },
];

export default function AdminExpeditionsPage() {
  const searchParams = useSearchParams();
  const targetId = searchParams?.get("id") || searchParams?.get("viewId");

  const [expeditions, setExpeditions] = useState<PackageItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeExp, setActiveExp] = useState<PackageItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingExp, setDeletingExp] = useState<PackageItem | null>(null);

  // Load categories once
  useEffect(() => {
    async function loadCategories() {
      try {
        const catsData = await CategoryService.getByType(CategoryType.EXPEDITIONS);
        setCategories(catsData);
      } catch (err) {
        console.error("Failed to load expedition categories:", err);
      }
    }
    loadCategories();
  }, []);

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

  // Load expeditions from backend
  const loadExpeditions = async () => {
    setLoading(true);
    try {
      const data = await ExpeditionService.getAdminAll({
        search: debouncedSearch,
        status: statusFilter === "All" ? undefined : statusFilter,
        page,
        limit,
      });
      setExpeditions(data);
      if (data.pagination) {
        setTotalItems(data.pagination.count);
        setTotalPages(data.pagination.lastPage);
      } else {
        setTotalItems(data.length);
        setTotalPages(Math.max(1, Math.ceil(data.length / limit)));
      }
    } catch (err) {
      console.error("Failed to load expeditions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpeditions();
  }, [debouncedSearch, statusFilter, page, limit]);

  // Auto-open modal when targetId is in query params & remove targetId from URL
  useEffect(() => {
    if (targetId && expeditions.length > 0) {
      const match = expeditions.find((e) => e.id === targetId || e.slug === targetId);
      if (match) {
        setActiveExp(match);
        setIsEditing(false);
        setIsFormOpen(true);
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
    }
  }, [targetId, expeditions]);

  const categoryOptions: InlineSelectOption[] = categories.map((c) => ({
    value: c.id,
    label: c.name,
    icon: <Tag className="w-3 h-3 opacity-70" />,
  }));

  const handleSaveExpedition = async (savedExp: PackageItem): Promise<boolean> => {
    try {
      let res: ApiResponse<PackageItem>;
      if (isEditing && activeExp) {
        res = await ExpeditionService.update(activeExp.id, savedExp as any);
      } else {
        res = await ExpeditionService.create(savedExp as any);
      }
      if (res.success) {
        toast.success(res.message || "Expedition itinerary saved successfully");
        setIsFormOpen(false);
        await loadExpeditions();
        return true;
      } else {
        toast.error(res.message || "Failed to save expedition itinerary");
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
      return false;
    }
  };

  const handleInlineStatusChange = async (exp: PackageItem, newStatus: string) => {
    try {
      const res = await ExpeditionService.update(exp.id, { status: newStatus as PackageStatus });
      if (res.success) {
        setExpeditions((prev) =>
          prev.map((e) => (e.id === exp.id ? { ...e, status: newStatus as PackageStatus } : e))
        );
        toast.success(`Updated "${exp.title}" status to ${newStatus}`);
      } else {
        toast.error(res.message || "Failed to update status");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleInlineCategoryChange = async (exp: PackageItem, newCategoryId: string) => {
    const selectedCat = categories.find((c) => c.id === newCategoryId);
    try {
      const res = await ExpeditionService.update(exp.id, {
        categoryId: newCategoryId,
        category: selectedCat?.name || exp.category,
      } as any);
      if (res.success) {
        setExpeditions((prev) =>
          prev.map((e) =>
            e.id === exp.id
              ? { ...e, categoryId: newCategoryId, category: selectedCat?.name || e.category }
              : e
          )
        );
        toast.success(`Updated "${exp.title}" category to ${selectedCat?.name || newCategoryId}`);
      } else {
        toast.error(res.message || "Failed to update category");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update category");
    }
  };

  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePromptDelete = (exp: PackageItem) => {
    setDeletingExp(exp);
    setDeleteError(null);
  };

  const handleCloseDeleteModal = () => {
    setDeleteError(null);
    setIsDeleting(false);
    setDeletingExp(null);
  };

  const handleDeleteExpedition = async (id: string) => {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      const res = await ExpeditionService.delete(id);
      if (res.success) {
        toast.success(res.message || "Expedition itinerary deleted successfully");
        handleCloseDeleteModal();
        await loadExpeditions();
      } else {
        const msg = res.message || "Failed to delete expedition";
        setDeleteError(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg = err.message || "Failed to delete expedition";
      setDeleteError(msg);
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Mountaineering Expeditions"
        description="Manage 8000m peaks, 7000m training climbs, climbing permits, and logistical services."
      >
        <Button
          onClick={() => {
            setActiveExp(null);
            setIsEditing(true);
            setIsFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add New Expedition
        </Button>
      </AdminPageHeader>

      <AdminFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search peak name or region..."
      >
        <AdminFilterSelect
          label="Status:"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value={PackageStatus.ACTIVE}>Active</option>
          <option value={PackageStatus.FEATURED}>Featured</option>
          <option value={PackageStatus.DRAFT}>Draft</option>
        </AdminFilterSelect>
      </AdminFilterBar>

      {/* Expeditions Table */}
      <AdminTableContainer>
        <AdminTable>
          <AdminTableHeader>
            <tr>
              <AdminTableHead className="w-14 text-center">S.N.</AdminTableHead>
              <AdminTableHead>Peak / Expedition Title</AdminTableHead>
              <AdminTableHead>Category</AdminTableHead>
              <AdminTableHead>Summit Elevation</AdminTableHead>
              <AdminTableHead>Duration</AdminTableHead>
              <AdminTableHead>Price (USD)</AdminTableHead>
              <AdminTableHead>Climber Reservations</AdminTableHead>
              <AdminTableHead>Status</AdminTableHead>
              <AdminTableHead align="right">Actions</AdminTableHead>
            </tr>
          </AdminTableHeader>
          <AdminTableBody>
            {loading ? (
              <AdminTableLoading colSpan={9} rows={limit > 10 ? 10 : limit} />
            ) : expeditions.length > 0 ? (
              expeditions.map((exp, idx) => {
                const currentCatId = exp.categoryId;
                const serialNumber = (page - 1) * limit + idx + 1;

                return (
                  <AdminTableRow key={exp.id}>
                    <AdminTableCell className="text-center font-semibold text-slate-500">
                      {serialNumber}
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex items-center gap-3">
                        {exp.image ? (
                           <div
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              openSingleImage(exp.image!, exp.title, e.currentTarget);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.stopPropagation();
                                openSingleImage(exp.image!, exp.title, e.currentTarget);
                              }
                            }}
                            className="relative w-12 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 cursor-zoom-in group/thumb shadow-2xs hover:border-slate-400 transition-all"
                            title="Click to view image in lightbox"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={exp.image}
                              alt={exp.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-110"
                            />
                            <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                              <Maximize2 className="w-3.5 h-3.5 text-white drop-shadow-md" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-12 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <Link
                            href={`/expeditions/${exp.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/link inline-flex items-center gap-1.5 font-semibold text-slate-900 hover:text-slate-950 transition-colors"
                            title="Open expedition in public marketing page"
                          >
                            <span className="line-clamp-1 underline decoration-transparent group-hover/link:decoration-slate-400 underline-offset-2 transition-all">
                              {exp.title}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-slate-700 opacity-0 group-hover/link:opacity-100 transition-all shrink-0" />
                          </Link>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200/80 rounded-lg text-xs font-semibold text-slate-700">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        <span>{(exp as any).subcategory ? `${exp.category} → ${(exp as any).subcategory}` : (exp.category || "Unassigned")}</span>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell className="font-medium text-slate-900">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                        <span>{(exp.maxAltitudeMeters || 6000).toLocaleString()}m</span>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell className="font-medium text-slate-800">{exp.durationDays} Days</AdminTableCell>
                    <AdminTableCell className="font-bold text-slate-900 text-sm">
                      ${exp.priceUSD.toLocaleString()} USD
                    </AdminTableCell>
                    <AdminTableCell className="font-medium text-slate-800">
                      {exp.totalBookings || 0} Climbers
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminInlineSelect
                        value={exp.status}
                        options={STATUS_OPTIONS}
                        onChange={(newVal) => handleInlineStatusChange(exp, newVal)}
                        variant="badge"
                        title="Click to change expedition status"
                      />
                    </AdminTableCell>
                    <AdminTableCell align="right">
                      <AdminTableActions>
                        <AdminActionButton
                          variant="view"
                          onClick={() => {
                            setActiveExp(exp);
                            setIsEditing(false);
                            setIsFormOpen(true);
                          }}
                          title="View Expedition"
                        />
                        <AdminActionButton
                          variant="edit"
                          onClick={() => {
                            setActiveExp(exp);
                            setIsEditing(true);
                            setIsFormOpen(true);
                          }}
                          title="Edit Expedition"
                        />
                        <AdminActionButton
                          variant="delete"
                          onClick={() => setDeletingExp(exp)}
                          title="Delete Expedition"
                        />
                      </AdminTableActions>
                    </AdminTableCell>
                  </AdminTableRow>
                );
              })
            ) : (
              <AdminTableEmpty
                colSpan={9}
                title="No expeditions found"
                description="No peak climbing packages match your search query or status filter."
              />
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

      {/* MODALS */}
      <ExpeditionFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveExpedition}
        initialData={activeExp}
        isEditing={isEditing}
      />

      <DeleteExpeditionModal
        isOpen={deletingExp !== null}
        onClose={handleCloseDeleteModal}
        onConfirm={() => deletingExp && handleDeleteExpedition(deletingExp.id)}
        expeditionTitle={deletingExp?.title}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </div>
  );
}

