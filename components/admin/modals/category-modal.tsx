"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Loader2 } from "lucide-react";
import { CategoryItem, CategoryType, CategoryStatus } from "@/lib/admin-data";
import { categorySchema, CategoryFormValues } from "@/lib/admin-schemas";
import { AdminInputField, AdminSelectField, AdminTextareaField } from "@/components/admin/forms/admin-form-fields";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: CategoryItem) => Promise<boolean | void> | boolean | void;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      type: CategoryType.TREKKING,
      description: "",
      status: CategoryStatus.ACTIVE,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        type: initialData.type,
        description: initialData.description,
        status: (initialData.status as CategoryStatus) || CategoryStatus.ACTIVE,
      });
    } else {
      reset({
        name: "",
        type: CategoryType.TREKKING,
        description: "",
        status: CategoryStatus.ACTIVE,
      });
    }
    setEditingMode(isEditing || !initialData);
  }, [initialData, isEditing, isOpen, reset]);

  const onSubmit = async (values: CategoryFormValues) => {
    setIsSubmitting(true);
    try {
      const categoryToSave: CategoryItem = {
        id: initialData?.id || `cat-${Date.now()}`,
        name: values.name,
        slug: initialData?.slug || values.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        type: values.type,
        description: values.description,
        itemCount: initialData?.itemCount || 0,
        status: values.status,
      };

      const success = await onSave(categoryToSave);
      if (success !== false) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
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
                  { label: "Trekking Packages", value: CategoryType.TREKKING },
                  { label: "Sightseeing Tours", value: CategoryType.TOURS },
                  { label: "Peak Expeditions", value: CategoryType.EXPEDITIONS },
                  { label: "Blogs & Articles", value: CategoryType.BLOGS },
                  { label: "Media Assets & Gallery", value: CategoryType.MEDIA },
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
                  { label: "Active", value: CategoryStatus.ACTIVE },
                  { label: "Draft", value: CategoryStatus.DRAFT },
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
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="text-xs font-semibold cursor-pointer">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Category"
              )}
            </Button>
          </DialogFooter>
        </form>
      ) : (
        <div className="space-y-4 py-2 text-xs">
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-950 font-bold block">Module Domain:</span>
              <span className="text-slate-950 font-black">{initialData?.type}</span>
            </div>
            <div>
              <span className="text-slate-950 font-bold block">Associated Items:</span>
              <span className="text-slate-950 font-black">{initialData?.itemCount} Items</span>
            </div>
            <div>
              <span className="text-slate-950 font-bold block">Slug:</span>
              <span className="text-slate-900 font-bold">/{initialData?.slug}</span>
            </div>
            <div>
              <span className="text-slate-950 font-bold block">Status:</span>
              <AdminStatusBadge status={initialData?.status || "Active"} />
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-extrabold text-slate-950 block">Description:</span>
            <p className="text-slate-950 leading-relaxed font-semibold bg-stone-50 p-3 rounded-lg border border-slate-200">
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
