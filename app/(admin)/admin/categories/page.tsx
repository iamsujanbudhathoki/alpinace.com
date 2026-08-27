"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Eye, Edit, Trash2, Tag, Compass, Mountain, MapPin, BookOpen, Image as ImageIcon, GitMerge, Maximize2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [allCategoriesForStats, setAllCategoriesForStats] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleDeletePrompt = (category: CategoryItem) => {
    setActiveCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!activeCategory) return;
    try {
      const res = await CategoryService.delete(activeCategory.id);
      if (res.success) {
        toast.success(res.message || "Category deleted successfully");
        categoryCache.clear();
        await Promise.all([loadCategories(), loadStats()]);
      } else {
        toast.error(res.message || "Failed to delete category");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category");
    } finally {
      setIsDeleteModalOpen(false);
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
    

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100/80 border border-slate-200/60 text-slate-600 flex items-center justify-center font-bold">
            <Mountain className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Trekking</div>
            <div className="text-lg font-bold text-slate-900">
              {allCategoriesForStats.filter((c) => c.type === CategoryType.TREKKING).length}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">Expedition Categories</div>
            <div className="text-lg font-bold text-slate-900">
              {allCategoriesForStats.filter((c) => c.type === CategoryType.EXPEDITIONS).length}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">Tour Categories</div>
            <div className="text-lg font-bold text-slate-900">
              {allCategoriesForStats.filter((c) => c.type === CategoryType.TOURS).length}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">Blog Categories</div>
            <div className="text-lg font-bold text-slate-900">
              {allCategoriesForStats.filter((c) => c.type === CategoryType.BLOGS).length}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">Media Categories</div>
            <div className="text-lg font-bold text-slate-900">
              {allCategoriesForStats.filter((c) => c.type === CategoryType.MEDIA).length}
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar & Domain Filter Dropdown */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search categories by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <Button
            onClick={handleCreateNew}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add New Category
          </Button>
        </div>

        {/* Domain Filter Dropdown Selector */}
        <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
          <label className="text-xs font-bold text-slate-800 whitespace-nowrap">
            Filter by Type:
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-xs rounded-xl px-3.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer shadow-xs"
          >
            <option value="All">All Categories</option>
            <option value={CategoryType.TREKKING}>Trekking</option>
            <option value={CategoryType.TOURS}>Tours</option>
            <option value={CategoryType.EXPEDITIONS}>Expeditions</option>
            <option value={CategoryType.BLOGS}>Blogs</option>
            <option value={CategoryType.MEDIA}>Media</option>
          </select>
        </div>
      </div>

      {/* Category Table */}
      <AdminTableContainer>
        <AdminTable>
          <AdminTableHeader>
            <tr>
              <AdminTableHead className="w-14 text-center">S.N.</AdminTableHead>
              <AdminTableHead>Category Name</AdminTableHead>
              <AdminTableHead>Level / Hierarchy</AdminTableHead>
              <AdminTableHead>Target Domain</AdminTableHead>
              <AdminTableHead>Slug</AdminTableHead>
              <AdminTableHead>Status</AdminTableHead>
              <AdminTableHead align="right">Actions</AdminTableHead>
            </tr>
          </AdminTableHeader>
          <AdminTableBody>
            {isLoading ? (
              <AdminTableLoading colSpan={7} rows={limit > 10 ? 10 : limit} message="Loading category taxonomy..." />
            ) : categories.length > 0 ? (
              categories.map((cat, idx) => {
                const serialNumber = (page - 1) * limit + idx + 1;
                const parentCat = cat.parentId
                  ? allCategoriesForStats.find((c) => c.id === cat.parentId)
                  : null;

                return (
                  <AdminTableRow key={cat.id}>
                    <AdminTableCell className="text-center font-semibold text-slate-500">
                      {serialNumber}
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex items-center gap-3">
                        {cat.image ? (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              openSingleImage(cat.image!, cat.name, e.currentTarget);
                            }}
                            className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-950 shrink-0 group cursor-pointer shadow-2xs"
                            title="Click to view full image in Lightbox"
                          >
                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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
                          <div className="font-semibold text-slate-900 group-hover:text-slate-950 transition-colors truncate">
                            {cat.name}
                          </div>
                          <div className="text-xs text-slate-500 line-clamp-1 max-w-md font-normal">{cat.description}</div>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      {parentCat ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                          <GitMerge className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>Under: {parentCat.name}</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 text-[11px] font-medium border border-slate-200/80">
                          <span>Top-Level Region</span>
                        </div>
                      )}
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminInlineSelect
                        value={cat.type}
                        options={[
                          { label: "Trekking", value: CategoryType.TREKKING, icon: getTypeIcon(CategoryType.TREKKING) },
                          { label: "Tours", value: CategoryType.TOURS, icon: getTypeIcon(CategoryType.TOURS) },
                          { label: "Expeditions", value: CategoryType.EXPEDITIONS, icon: getTypeIcon(CategoryType.EXPEDITIONS) },
                          { label: "Blogs", value: CategoryType.BLOGS, icon: getTypeIcon(CategoryType.BLOGS) },
                          { label: "Media", value: CategoryType.MEDIA, icon: getTypeIcon(CategoryType.MEDIA) },
                        ]}
                        onChange={(newVal) => handleInlineTypeChange(cat, newVal)}
                        variant="category"
                        placeholder={cat.type}
                        title="Click to change category type"
                      />
                    </AdminTableCell>
                    <AdminTableCell className="text-slate-600 text-xs font-normal">/{cat.slug}</AdminTableCell>
                    <AdminTableCell>
                      <AdminInlineSelect
                        value={cat.status}
                        options={[
                          { label: "Active", value: CategoryStatus.ACTIVE },
                          { label: "Draft", value: CategoryStatus.DRAFT },
                        ]}
                        onChange={(newVal) => handleInlineStatusChange(cat, newVal)}
                        variant="badge"
                        title="Click to change category status"
                      />
                    </AdminTableCell>
                    <AdminTableCell align="right">
                      <AdminTableActions>
                        <AdminActionButton
                          variant="view"
                          onClick={() => handleView(cat)}
                          title="View Details"
                        />
                        <AdminActionButton
                          variant="edit"
                          onClick={() => handleEdit(cat)}
                          title="Edit Category"
                        />
                        <AdminActionButton
                          variant="delete"
                          onClick={() => handleDeletePrompt(cat)}
                          title="Delete Category"
                        />
                      </AdminTableActions>
                    </AdminTableCell>
                  </AdminTableRow>
                );
              })
            ) : (
              <AdminTableEmpty
                colSpan={7}
                title="No categories found"
                description="No categories matching your search or module filter query."
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
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        categoryName={activeCategory?.name}
      />
    </div>
  );
}
