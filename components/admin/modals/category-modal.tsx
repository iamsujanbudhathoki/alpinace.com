"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit } from "lucide-react";
import { CategoryItem } from "@/lib/admin-data";
import { categorySchema, CategoryFormValues } from "@/lib/admin-schemas";
import { AdminInputField, AdminSelectField, AdminTextareaField } from "@/components/admin/forms/admin-form-fields";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: CategoryItem) => void;
  initialData?: CategoryItem | null;
  isEditing?: boolean;
}

export function CategoryFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing = false,
}: CategoryFormModalProps) {
  const [editingMode, setEditingMode] = useState(isEditing);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: "",
      type: "Trekking",
      description: "",
      status: "Active",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        type: initialData.type,
        description: initialData.description,
        status: initialData.status,
      });
    } else {
      reset({
        name: "",
        type: "Trekking",
        description: "",
        status: "Active",
      });
    }
    setEditingMode(isEditing || !initialData);
  }, [initialData, isEditing, isOpen, reset]);

  const onSubmit = (values: CategoryFormValues) => {
    const categoryToSave: CategoryItem = {
      id: initialData?.id || `cat-${Date.now()}`,
      name: values.name,
      slug: initialData?.slug || values.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      type: values.type,
      description: values.description,
      itemCount: initialData?.itemCount || 0,
      status: values.status,
    };

    onSave(categoryToSave);
    onClose();
  };

  const modalTitle = !initialData
    ? "Add New Category"
    : editingMode
    ? `Edit Category: ${initialData.name}`
    : initialData.name;

  const modalDescription = !initialData
    ? "Create a global taxonomy category for Trekking, Tours, Expeditions, Blogs, or Media."
    : editingMode
    ? "Modify category attributes and module scope."
    : "Category details and assigned items.";

  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={modalTitle} description={modalDescription} maxWidth="lg">
      {editingMode ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <AdminInputField
                label="Category Name"
                required
                placeholder="e.g. Everest & Khumbu Region"
                error={errors.name?.message}
                {...register("name")}
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <AdminSelectField
                label="Category Type"
                required
                error={errors.type?.message}
                options={[
                  { label: "Trekking Packages", value: "Trekking" },
                  { label: "Sightseeing Tours", value: "Tours" },
                  { label: "Peak Expeditions", value: "Expeditions" },
                  { label: "Blogs & Articles", value: "Blogs" },
                  { label: "Media Assets & Gallery", value: "Media" },
                ]}
                {...register("type")}
              />
            </div>

            <div className="col-span-2">
              <AdminSelectField
                label="Status"
                required
                error={errors.status?.message}
                options={[
                  { label: "Active", value: "Active" },
                  { label: "Draft", value: "Draft" },
                ]}
                {...register("status")}
              />
            </div>

            <div className="col-span-2">
              <AdminTextareaField
                label="Description"
                required
                rows={3}
                placeholder="Brief summary of this category..."
                error={errors.description?.message}
                {...register("description")}
              />
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs font-semibold cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors">
              Save Category
            </Button>
          </DialogFooter>
        </form>
      ) : (
        <div className="space-y-4 py-2 text-xs">
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-700 font-bold block">Module Domain:</span>
              <span className="text-slate-900 font-extrabold">{initialData?.type}</span>
            </div>
            <div>
              <span className="text-slate-700 font-bold block">Associated Items:</span>
              <span className="text-slate-900 font-extrabold">{initialData?.itemCount} Items</span>
            </div>
            <div>
              <span className="text-slate-700 font-bold block">Slug:</span>
              <span className="text-slate-700 font-bold">/{initialData?.slug}</span>
            </div>
            <div>
              <span className="text-slate-700 font-bold block">Status:</span>
              <AdminStatusBadge status={initialData?.status || "Active"} />
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-800 block">Description:</span>
            <p className="text-slate-700 leading-relaxed font-normal bg-stone-50 p-3 rounded-lg border border-slate-200">
              {initialData?.description}
            </p>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setEditingMode(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors"
            >
              <Edit className="w-3.5 h-3.5 mr-1 text-amber-400" />
              Edit Category
            </Button>
          </DialogFooter>
        </div>
      )}
    </AdminModal>
  );
}

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  categoryName?: string;
}

export function DeleteCategoryModal({ isOpen, onClose, onConfirm, categoryName }: DeleteCategoryModalProps) {
  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Category Deletion"
      description={`Are you sure you want to delete category "${categoryName}"? Packages tagged with this category will become uncategorized.`}
      maxWidth="md"
    >
      <DialogFooter className="pt-2">
        <Button variant="outline" onClick={onClose} className="text-xs font-semibold cursor-pointer">
          Cancel
        </Button>
        <Button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
        >
          Delete Category
        </Button>
      </DialogFooter>
    </AdminModal>
  );
}
