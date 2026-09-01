"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Search, Eye, Edit, Trash2, Tag, Compass, Mountain, MapPin, BookOpen, Image as ImageIcon, GitMerge, Maximize2, Check, X, ChevronRight, ChevronDown, CornerDownRight } from "lucide-react";
import { toast } from "sonner";
import { CategoryItem, CategoryStatus, CategoryType } from "@/lib/admin-data";
import { CategoryService } from "@/lib/services/admin-service";
import { ApiResponse } from "@/lib/services/api-client";
import { categoryCache } from "@/lib/services/category-cache";
import { openSingleImage } from "@/lib/utils/lightbox";
import { CategoryFormModal, DeleteCategoryModal } from "@/components/admin/modals/category-modal";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { AdminInlineSelect } from "@/components/admin/ui/admin-inline-select";
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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [allCategoriesForStats, setAllCategoriesForStats] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");

  // Collapsible Rows State
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const toggleExpand = (catId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedIds((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  // Load all categories once for stats summary cards & parent dropdown list
  const loadStats = async () => {
    try {
      const data = await CategoryService.getAll();
      setAllCategoriesForStats(data);
    } catch (e) {
      console.warn("Failed to load category stats:", e);
    }
  };

  useEffect(() => {
    loadStats();
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
  }, [debouncedSearch, selectedType]);

  // Fetch paginated categories from backend
  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await CategoryService.getAll({
        type: selectedType === "All" ? undefined : selectedType,
        search: debouncedSearch,
        page,
        limit,
      });
      setCategories(data);
      if (data.pagination) {
        setTotalItems(data.pagination.count);
        setTotalPages(data.pagination.lastPage);
      } else {
        setTotalItems(data.length);
        setTotalPages(Math.max(1, Math.ceil(data.length / limit)));
      }

      // Auto expand parents if search query matches subcategories
      if (debouncedSearch && data.length > 0) {
        const autoExpand: Record<string, boolean> = {};
        data.forEach((item) => {
          if (item.parentId) {
            autoExpand[item.parentId] = true;
          }
        });
        setExpandedIds((prev) => ({ ...prev, ...autoExpand }));
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const searchParams = useSearchParams();
  const targetId = searchParams?.get("id") || searchParams?.get("viewId");

  // Auto-open modal when targetId is in query params & remove targetId from URL
  useEffect(() => {
    if (targetId && (categories.length > 0 || allCategoriesForStats.length > 0)) {
      const list = categories.length > 0 ? categories : allCategoriesForStats;
      const match = list.find((c) => c.id === targetId || c.slug === targetId);
      if (match) {
        setActiveCategory(match);
        setIsEditing(false);
        setIsFormModalOpen(true);
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
    }
  }, [targetId, categories, allCategoriesForStats]);

  useEffect(() => {
    loadCategories();
  }, [debouncedSearch, selectedType, page, limit]);

  const handleCreateNew = () => {
    setActiveCategory(null);
    setIsEditing(false);
    setIsFormModalOpen(true);
  };

  const handleEdit = (category: CategoryItem) => {
    setActiveCategory(category);
    setIsEditing(true);
    setIsFormModalOpen(true);
  };

  const handleView = (category: CategoryItem) => {
    setActiveCategory(category);
    setIsEditing(false);
    setIsFormModalOpen(true);
  };

  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletePrompt = (category: CategoryItem) => {
    setActiveCategory(category);
    setDeleteError(null);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteError(null);
    setIsDeleting(false);
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!activeCategory) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      const res = await CategoryService.delete(activeCategory.id);
      if (res.success) {
        toast.success(res.message || "Category deleted successfully");
        categoryCache.clear();
        handleCloseDeleteModal();
        setActiveCategory(null);
        await Promise.all([loadCategories(), loadStats()]);
      } else {
        const msg = res.message || "Failed to delete category";
        setDeleteError(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg = err?.message || "Failed to delete category";
      setDeleteError(msg);
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveCategory = async (savedCategory: CategoryItem): Promise<boolean> => {
    try {
      let res: ApiResponse<CategoryItem>;
      if (isEditing && activeCategory) {
        res = await CategoryService.update(activeCategory.id, savedCategory as any);
      } else {
        res = await CategoryService.create(savedCategory as any);
      }
      if (res.success) {
        toast.success(res.message || "Category saved successfully");
        categoryCache.clear();
        setIsFormModalOpen(false);
        await Promise.all([loadCategories(), loadStats()]);
        return true;
      } else {
        toast.error(res.message || "Failed to save category");
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
      return false;
    }
  };

  const handleInlineTypeChange = async (cat: CategoryItem, newType: string): Promise<boolean> => {
    try {
      const res = await CategoryService.update(cat.id, { type: newType as CategoryType });
      if (res.success) {
        toast.success(`Category type updated to ${newType}`);
        categoryCache.clear();
        await Promise.all([loadCategories(), loadStats()]);
        return true;
      } else {
        toast.error(res.message || "Failed to update category type");
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || "Error updating category type");
      return false;
    }
  };

  const handleInlineStatusChange = async (cat: CategoryItem, newStatus: string): Promise<boolean> => {
    try {
      const res = await CategoryService.update(cat.id, { status: newStatus as CategoryStatus });
      if (res.success) {
        toast.success(`Category status updated to ${newStatus}`);
        categoryCache.clear();
        await Promise.all([loadCategories(), loadStats()]);
        return true;
      } else {
        toast.error(res.message || "Failed to update category status");
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || "Error updating category status");
      return false;
    }
  };

  const isMenuVisible = (val: any) => val === true || val === 1 || val === "true" || val === undefined;

  const handleToggleMenuVisibility = async (cat: CategoryItem) => {
    const currentVisible = isMenuVisible(cat.showInMenu);
    const newShowInMenu = !currentVisible;

    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, showInMenu: newShowInMenu } : c))
    );
    setAllCategoriesForStats((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, showInMenu: newShowInMenu } : c))
    );

    try {
      const res = await CategoryService.update(cat.id, { showInMenu: newShowInMenu });
      if (res.success) {
        categoryCache.clear();
        toast.success(
          `"${cat.name}" menu visibility set to ${newShowInMenu ? "ON" : "OFF"}.`
        );
        await Promise.all([loadCategories(), loadStats()]);
      } else {
        toast.error(res.message || "Failed to update menu visibility");
        await Promise.all([loadCategories(), loadStats()]);
      }
    } catch (err: any) {
      toast.error("Failed to update menu visibility");
      await Promise.all([loadCategories(), loadStats()]);
    }
  };

  const handleToggleFeatured = async (cat: CategoryItem) => {
    const newFeatured = !cat.isFeatured;

    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, isFeatured: newFeatured } : c))
    );
    setAllCategoriesForStats((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, isFeatured: newFeatured } : c))
    );

    try {
      const res = await CategoryService.update(cat.id, { isFeatured: newFeatured });
      if (res.success) {
        categoryCache.clear();
        toast.success(
          `"${cat.name}" featured status set to ${newFeatured ? "YES" : "NO"}.`
        );
        await Promise.all([loadCategories(), loadStats()]);
      } else {
        toast.error(res.message || "Failed to update featured status");
        await Promise.all([loadCategories(), loadStats()]);
      }
    } catch (err: any) {
      toast.error("Failed to update featured status");
      await Promise.all([loadCategories(), loadStats()]);
    }
  };

  const getTypeIcon = (type: CategoryType) => {
    switch (type) {
      case CategoryType.TREKKING:
        return <Mountain className="w-3.5 h-3.5 text-slate-500" />;
      case CategoryType.EXPEDITIONS:
        return <MapPin className="w-3.5 h-3.5 text-slate-500" />;
      case CategoryType.TOURS:
        return <Compass className="w-3.5 h-3.5 text-slate-500" />;
      case CategoryType.BLOGS:
        return <BookOpen className="w-3.5 h-3.5 text-slate-500" />;
      case CategoryType.MEDIA:
        return <ImageIcon className="w-3.5 h-3.5 text-slate-500" />;
      default:
        return <Tag className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        title="Category Management"
        description="Organize treks, expeditions, tours, blogs, and media into taxonomy categories."
      >
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </Button>
      </AdminPageHeader>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold">
            <Mountain className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-700">Trekking</div>
            <div className="text-lg font-bold text-slate-900">
              {allCategoriesForStats.filter((c) => c.type === CategoryType.TREKKING).length}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center font-bold">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-700">Expeditions</div>
            <div className="text-lg font-bold text-slate-900">
              {allCategoriesForStats.filter((c) => c.type === CategoryType.EXPEDITIONS).length}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-700">Tours</div>
            <div className="text-lg font-bold text-slate-900">
              {allCategoriesForStats.filter((c) => c.type === CategoryType.TOURS).length}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs">
            ★
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-700">Featured</div>
            <div className="text-lg font-bold text-slate-900">
              {allCategoriesForStats.filter((c) => c.isFeatured).length}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-700">Blogs</div>
            <div className="text-lg font-bold text-slate-900">
              {allCategoriesForStats.filter((c) => c.type === CategoryType.BLOGS).length}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-700">Media</div>
            <div className="text-lg font-bold text-slate-900">
              {allCategoriesForStats.filter((c) => c.type === CategoryType.MEDIA).length}
            </div>
          </div>
        </div>
      </div>

      {/* Category Toolbar Controls */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by category name, slug, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <Button onClick={handleCreateNew}>
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </Button>
        </div>

        {/* Domain Filter Dropdown Selector */}
        <div className="border-t border-slate-200 pt-3">
          <AdminFilterSelect
            label="Filter by Type:"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value={CategoryType.TREKKING}>Trekking</option>
            <option value={CategoryType.TOURS}>Tours</option>
            <option value={CategoryType.EXPEDITIONS}>Expeditions</option>
            <option value={CategoryType.BLOGS}>Blogs</option>
            <option value={CategoryType.MEDIA}>Media</option>
          </AdminFilterSelect>
        </div>
      </div>

      {/* Category Collapsible Table */}
      <AdminTableContainer>
        <AdminTable>
          <AdminTableHeader>
            <tr>
              <AdminTableHead className="w-10 text-center"></AdminTableHead>
              <AdminTableHead className="w-14 text-center">S.N.</AdminTableHead>
              <AdminTableHead>Category Name</AdminTableHead>
              <AdminTableHead>Level / Hierarchy</AdminTableHead>
              <AdminTableHead>Target Domain</AdminTableHead>
              <AdminTableHead>Slug</AdminTableHead>
              <AdminTableHead>Status</AdminTableHead>
              <AdminTableHead>Show on Menu</AdminTableHead>
              <AdminTableHead>Featured</AdminTableHead>
              <AdminTableHead align="right">Actions</AdminTableHead>
            </tr>
          </AdminTableHeader>
          <AdminTableBody>
            {isLoading ? (
              <AdminTableLoading colSpan={10} rows={10} message="Loading category taxonomy..." />
            ) : (() => {
              const parentIdsOfMatchingSubcats = new Set(
                categories.filter((c) => c.parentId).map((c) => c.parentId!)
              );

              const parentCategories = allCategoriesForStats.filter(
                (c) =>
                  !c.parentId &&
                  (selectedType === "All" || c.type === selectedType) &&
                  (!debouncedSearch ||
                    categories.some((matched) => matched.id === c.id) ||
                    parentIdsOfMatchingSubcats.has(c.id))
              );

              if (parentCategories.length === 0) {
                return (
                  <AdminTableEmpty
                    colSpan={10}
                    title="No categories found"
                    description="No categories matching your search or module filter query."
                  />
                );
              }

              return parentCategories.map((parentCat, idx) => {
                const serialNumber = (page - 1) * limit + idx + 1;

                // Find subcategories belonging to this parent category
                const subCategories = allCategoriesForStats.filter((c) => c.parentId === parentCat.id);
                const hasChildren = subCategories.length > 0;
                const isExpanded = Boolean(expandedIds[parentCat.id]);

                return (
                  <React.Fragment key={parentCat.id}>
                    {/* Parent Category Row */}
                    <AdminTableRow
                      onClick={() => {
                        if (hasChildren) toggleExpand(parentCat.id);
                      }}
                      className={hasChildren ? "cursor-pointer hover:bg-slate-50/80 transition-colors" : ""}
                    >
                      {/* Expand Chevron / Spacer Column */}
                      <AdminTableCell className="text-center p-2" onClick={(e) => e.stopPropagation()}>
                        {hasChildren ? (
                          <button
                            type="button"
                            onClick={(e) => toggleExpand(parentCat.id, e)}
                            className="w-7 h-7 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
                            title={isExpanded ? "Collapse subcategories" : "Expand subcategories"}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-slate-800" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-600" />
                            )}
                          </button>
                        ) : (
                          <div className="w-7 h-7" />
                        )}
                      </AdminTableCell>

                      <AdminTableCell className="text-center font-semibold text-slate-500">
                        {serialNumber}
                      </AdminTableCell>

                      <AdminTableCell>
                        <div className="flex items-center gap-3">
                          {parentCat.image ? (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                openSingleImage(parentCat.image!, parentCat.name, e.currentTarget);
                              }}
                              className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-950 shrink-0 group cursor-pointer shadow-2xs"
                              title="Click to view full image in Lightbox"
                            >
                              <img src={parentCat.image} alt={parentCat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Maximize2 className="w-3.5 h-3.5 text-white drop-shadow-xs" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                              <ImageIcon className="w-4 h-4 text-slate-400" />
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 group-hover:text-slate-950 transition-colors truncate flex items-center gap-2">
                              <span>{parentCat.name}</span>
                              {hasChildren && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                  {subCategories.length} subcategories
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 line-clamp-1 max-w-md font-normal">{parentCat.description}</div>
                          </div>
                        </div>
                      </AdminTableCell>

                      <AdminTableCell>
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 text-[11px] font-medium border border-slate-200/80">
                          <span>Top-Level Category</span>
                        </div>
                      </AdminTableCell>

                      <AdminTableCell onClick={(e) => e.stopPropagation()}>
                        <AdminInlineSelect
                          value={parentCat.type}
                          options={[
                            { label: "Trekking", value: CategoryType.TREKKING, icon: getTypeIcon(CategoryType.TREKKING) },
                            { label: "Tours", value: CategoryType.TOURS, icon: getTypeIcon(CategoryType.TOURS) },
                            { label: "Expeditions", value: CategoryType.EXPEDITIONS, icon: getTypeIcon(CategoryType.EXPEDITIONS) },
                            { label: "Blogs", value: CategoryType.BLOGS, icon: getTypeIcon(CategoryType.BLOGS) },
                            { label: "Media", value: CategoryType.MEDIA, icon: getTypeIcon(CategoryType.MEDIA) },
                          ]}
                          onChange={(newVal) => handleInlineTypeChange(parentCat, newVal)}
                          variant="category"
                          placeholder={parentCat.type}
                          title="Click to change category type"
                        />
                      </AdminTableCell>

                      <AdminTableCell className="text-slate-600 text-xs font-normal">/{parentCat.slug}</AdminTableCell>

                      <AdminTableCell onClick={(e) => e.stopPropagation()}>
                        <AdminInlineSelect
                          value={parentCat.status}
                          options={[
                            { label: "Active", value: CategoryStatus.ACTIVE },
                            { label: "Draft", value: CategoryStatus.DRAFT },
                          ]}
                          onChange={(newVal) => handleInlineStatusChange(parentCat, newVal)}
                          variant="badge"
                          title="Click to change category status"
                        />
                      </AdminTableCell>

                      <AdminTableCell onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleToggleMenuVisibility(parentCat)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer border ${isMenuVisible(parentCat.showInMenu)
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                            }`}
                          title="Click to toggle marketing navbar visibility"
                        >
                          {isMenuVisible(parentCat.showInMenu) ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>ON</span>
                            </>
                          ) : (
                            <>
                              <X className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span>OFF</span>
                            </>
                          )}
                        </button>
                      </AdminTableCell>

                      <AdminTableCell onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(parentCat)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer border ${
                            parentCat.isFeatured
                              ? "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
                              : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                          }`}
                          title="Click to toggle featured status"
                        >
                          {parentCat.isFeatured ? "★ YES" : "NO"}
                        </button>
                      </AdminTableCell>

                      <AdminTableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <AdminTableActions>
                          <AdminActionButton
                            variant="view"
                            onClick={() => handleView(parentCat)}
                            title="View Details"
                          />
                          <AdminActionButton
                            variant="edit"
                            onClick={() => handleEdit(parentCat)}
                            title="Edit Category"
                          />
                          <AdminActionButton
                            variant="delete"
                            onClick={() => handleDeletePrompt(parentCat)}
                            title="Delete Category"
                          />
                        </AdminTableActions>
                      </AdminTableCell>
                    </AdminTableRow>

                    {/* Subcategory Expandable Rows */}
                    {isExpanded &&
                      subCategories.map((subCat, subIdx) => (
                        <AdminTableRow
                          key={subCat.id}
                          className="bg-slate-50/70 hover:bg-slate-100/90 transition-colors border-l-4 border-l-slate-300"
                        >
                          <AdminTableCell className="text-center p-2"></AdminTableCell>
                          <AdminTableCell className="text-center font-semibold text-slate-400 text-xs">
                            ↳ {serialNumber}.{subIdx + 1}
                          </AdminTableCell>

                          {/* Indented Subcategory Name & Image */}
                          <AdminTableCell>
                            <div className="pl-4 flex items-center gap-3">
                              <CornerDownRight className="w-4 h-4 text-slate-400 shrink-0" />
                              {subCat.image ? (
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openSingleImage(subCat.image!, subCat.name, e.currentTarget);
                                  }}
                                  className="relative w-8 h-8 rounded-md overflow-hidden border border-slate-200 bg-slate-950 shrink-0 group cursor-pointer shadow-2xs"
                                  title="Click to view full image in Lightbox"
                                >
                                  <img src={subCat.image} alt={subCat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Maximize2 className="w-3 h-3 text-white drop-shadow-xs" />
                                  </div>
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                  <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                              )}

                              <div className="min-w-0">
                                <div className="font-semibold text-slate-900 truncate text-xs">
                                  {subCat.name}
                                </div>
                                <div className="text-[11px] text-slate-500 line-clamp-1 max-w-md font-normal">
                                  {subCat.description}
                                </div>
                              </div>
                            </div>
                          </AdminTableCell>

                          <AdminTableCell>
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                              <GitMerge className="w-3 h-3 text-slate-500 shrink-0" />
                              <span>Under: {parentCat.name}</span>
                            </div>
                          </AdminTableCell>

                          <AdminTableCell onClick={(e) => e.stopPropagation()}>
                            <AdminInlineSelect
                              value={subCat.type}
                              options={[
                                { label: "Trekking", value: CategoryType.TREKKING, icon: getTypeIcon(CategoryType.TREKKING) },
                                { label: "Tours", value: CategoryType.TOURS, icon: getTypeIcon(CategoryType.TOURS) },
                                { label: "Expeditions", value: CategoryType.EXPEDITIONS, icon: getTypeIcon(CategoryType.EXPEDITIONS) },
                                { label: "Blogs", value: CategoryType.BLOGS, icon: getTypeIcon(CategoryType.BLOGS) },
                                { label: "Media", value: CategoryType.MEDIA, icon: getTypeIcon(CategoryType.MEDIA) },
                              ]}
                              onChange={(newVal) => handleInlineTypeChange(subCat, newVal)}
                              variant="category"
                              placeholder={subCat.type}
                              title="Click to change category type"
                            />
                          </AdminTableCell>

                          <AdminTableCell className="text-slate-600 text-xs font-normal">/{subCat.slug}</AdminTableCell>

                          <AdminTableCell onClick={(e) => e.stopPropagation()}>
                            <AdminInlineSelect
                              value={subCat.status}
                              options={[
                                { label: "Active", value: CategoryStatus.ACTIVE },
                                { label: "Draft", value: CategoryStatus.DRAFT },
                              ]}
                              onChange={(newVal) => handleInlineStatusChange(subCat, newVal)}
                              variant="badge"
                              title="Click to change category status"
                            />
                          </AdminTableCell>

                          <AdminTableCell onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleToggleFeatured(subCat)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer border ${
                                subCat.isFeatured
                                  ? "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
                                  : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                              }`}
                              title="Click to toggle featured status"
                            >
                              {subCat.isFeatured ? "★ YES" : "NO"}
                            </button>
                          </AdminTableCell>

                          <AdminTableCell align="right" onClick={(e) => e.stopPropagation()}>
                            <AdminTableActions>
                              <AdminActionButton
                                variant="view"
                                onClick={() => handleView(subCat)}
                                title="View Details"
                              />
                              <AdminActionButton
                                variant="edit"
                                onClick={() => handleEdit(subCat)}
                                title="Edit Category"
                              />
                              <AdminActionButton
                                variant="delete"
                                onClick={() => handleDeletePrompt(subCat)}
                                title="Delete Category"
                              />
                            </AdminTableActions>
                          </AdminTableCell>
                        </AdminTableRow>
                      ))}
                  </React.Fragment>
                );
              });
            })()}
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

      {/* Category Create/Edit Modal */}
      <CategoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveCategory}
        initialData={activeCategory}
        isEditing={isEditing}
        categoriesList={allCategoriesForStats}
      />

      {/* Delete Confirmation Modal */}
      <DeleteCategoryModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        categoryName={activeCategory?.name}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </div>
  );
}
