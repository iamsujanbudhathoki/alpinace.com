"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Eye, Edit, Trash2, Tag, Compass, Mountain, MapPin, BookOpen, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { CategoryItem, CategoryType } from "@/lib/admin-data";
import { CategoryService } from "@/lib/services/admin-service";
import { ApiResponse } from "@/lib/services/api-client";
import { CategoryFormModal, DeleteCategoryModal } from "@/components/admin/modals/category-modal";
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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch categories using CategoryService DAOs
  const loadCategories = async () => {
    setIsLoading(true);
    const data = await CategoryService.getAll();
    setCategories(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Filter Categories
  const filteredCategories = categories.filter((cat) => {
    const matchesSearch =
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "All" || cat.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleCreateNew = () => {
    setActiveCategory(null);
    setIsEditing(true);
    setIsFormModalOpen(true);
  };

  const handleView = (category: CategoryItem) => {
    setActiveCategory(category);
    setIsEditing(false);
    setIsFormModalOpen(true);
  };

  const handleEdit = (category: CategoryItem) => {
    setActiveCategory(category);
    setIsEditing(true);
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
        setCategories((prev) => prev.filter((c) => c.id !== activeCategory.id));
        toast.success(res.message );
      } else {
        toast.error(res.message );
      }
    } catch (err: any) {
      toast.error(err.message );
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleSaveCategory = async (savedCategory: CategoryItem): Promise<boolean> => {
    try {
      let res: ApiResponse<CategoryItem>;
      if (isEditing && activeCategory) {
        res = await CategoryService.update(activeCategory.id, {
          name: savedCategory.name,
          type: savedCategory.type,
          description: savedCategory.description,
          status: savedCategory.status,
        });
        if (res.success) {
          setCategories((prev) =>
            prev.map((c) => (c.id === activeCategory.id ? res.data : c))
          );
        }
      } else {
        res = await CategoryService.create({
          name: savedCategory.name,
          type: savedCategory.type,
          description: savedCategory.description,
          status: savedCategory.status,
        });
        if (res.success) {
          setCategories((prev) => [res.data, ...prev]);
        }
      }
      if (res.success) {
        toast.success(res.message || "Category saved successfully.");
        setIsFormModalOpen(false);
        return true;
      } else {
        toast.error(res.message || "Failed to save category.");
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save category.");
      return false;
    }
  };

  const getTypeIcon = (type: CategoryType) => {
    switch (type) {
      case CategoryType.TREKKING:
        return <Compass className="w-3.5 h-3.5 text-amber-600" />;
      case CategoryType.EXPEDITIONS:
        return <Mountain className="w-3.5 h-3.5 text-rose-600" />;
      case CategoryType.TOURS:
        return <MapPin className="w-3.5 h-3.5 text-blue-600" />;
      case CategoryType.BLOGS:
        return <BookOpen className="w-3.5 h-3.5 text-purple-600" />;
      case CategoryType.MEDIA:
        return <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Tag className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-500" />
            Categories
          </h1>
          <p className="text-xs text-slate-600 font-normal">
            Manage categories across Treks, Tours, Expeditions, Blogs &amp; Media
          </p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">Trekking Categories</div>
            <div className="text-lg font-bold text-slate-900">
              {categories.filter((c) => c.type === CategoryType.TREKKING).length}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
            <Mountain className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">Expedition Categories</div>
            <div className="text-lg font-bold text-slate-900">
              {categories.filter((c) => c.type === CategoryType.EXPEDITIONS).length}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">Tour Categories</div>
            <div className="text-lg font-bold text-slate-900">
              {categories.filter((c) => c.type === CategoryType.TOURS).length}
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
              {categories.filter((c) => c.type === CategoryType.BLOGS).length}
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
              {categories.filter((c) => c.type === CategoryType.MEDIA).length}
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
            <option value="All">All Modules (All Categories)</option>
            <option value={CategoryType.TREKKING}>Trekking Packages</option>
            <option value={CategoryType.TOURS}>Sightseeing Tours</option>
            <option value={CategoryType.EXPEDITIONS}>Peak Expeditions</option>
            <option value={CategoryType.BLOGS}>Blogs &amp; Articles</option>
            <option value={CategoryType.MEDIA}>Media Assets &amp; Gallery</option>
          </select>
        </div>
      </div>

      {/* Category Table */}
      <AdminTableContainer>
        <AdminTable>
          <AdminTableHeader>
            <tr>
              <AdminTableHead>Category Name</AdminTableHead>
              <AdminTableHead>Target Domain</AdminTableHead>
              <AdminTableHead>Slug</AdminTableHead>
              <AdminTableHead>Assigned Items</AdminTableHead>
              <AdminTableHead>Status</AdminTableHead>
              <AdminTableHead align="right">Actions</AdminTableHead>
            </tr>
          </AdminTableHeader>
          <AdminTableBody>
            {isLoading ? (
              <AdminTableLoading colSpan={6} message="Loading category taxonomy..." />
            ) : filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => (
                <AdminTableRow key={cat.id}>
                  <AdminTableCell>
                    <div className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                      {cat.name}
                    </div>
                    <div className="text-xs text-slate-600 line-clamp-1 max-w-md font-normal">{cat.description}</div>
                  </AdminTableCell>
                  <AdminTableCell className="font-medium text-slate-800">
                    <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md w-fit">
                      {getTypeIcon(cat.type)}
                      <span>{cat.type}</span>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell className="text-slate-600 text-xs font-normal">/{cat.slug}</AdminTableCell>
                  <AdminTableCell className="font-medium text-slate-800">{cat.itemCount} Items</AdminTableCell>
                  <AdminTableCell>
                    <AdminStatusBadge status={cat.status} />
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
              ))
            ) : (
              <AdminTableEmpty
                colSpan={6}
                title="No categories found"
                description="No categories matching your search or module filter query."
              />
            )}
          </AdminTableBody>
        </AdminTable>
      </AdminTableContainer>

      {/* Category Create/Edit Modal */}
      <CategoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveCategory}
        initialData={activeCategory}
        isEditing={isEditing}
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
