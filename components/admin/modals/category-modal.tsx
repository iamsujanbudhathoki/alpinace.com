"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Loader2, UploadCloud, Trash2, Image as ImageIcon, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import { CategoryItem, CategoryType, CategoryStatus } from "@/lib/admin-data";
import { categorySchema, CategoryFormValues } from "@/lib/admin-schemas";
import { AdminInputField, AdminSelectField, AdminTextareaField } from "@/components/admin/forms/admin-form-fields";
import { AdminSearchableSelect } from "@/components/admin/forms/admin-searchable-select";
import { AdminImageUpload } from "@/components/admin/forms/admin-image-upload";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { AdminConfirmModal } from "@/components/admin/ui/admin-confirm-modal";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Button } from "@/components/ui/button";
import { MediaService } from "@/lib/services/admin-service";
import { openSingleImage } from "@/lib/utils/lightbox";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: CategoryItem) => Promise<boolean | void> | boolean | void;
  initialData?: CategoryItem | null;
  isEditing?: boolean;
  categoriesList?: CategoryItem[];
}

export function CategoryFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing = false,
  categoriesList = [],
}: CategoryFormModalProps) {
  const [editingMode, setEditingMode] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: "",
      slug: "",
      type: CategoryType.TREKKING,
      description: "",
      status: CategoryStatus.ACTIVE,
      showInMenu: true,
      isFeatured: false,
      image: "",
      mediaId: "",
      parentId: "",
    },
  });

  const selectedType = watch("type");
  const currentImage = watch("image");

  // Check if category already has child subcategories
  const hasChildren = Boolean(
    initialData?.id &&
      ((initialData.children && initialData.children.length > 0) ||
        categoriesList.some((c) => c.parentId === initialData.id))
  );

  // Filter available top-level categories of the active type for parent selection
  const potentialParents = categoriesList.filter(
    (c) =>
      c.type === selectedType &&
      (!initialData || c.id !== initialData.id) &&
      !c.parentId
  );

  useEffect(() => {
    setFormError(null);
    setIsSubmitting(false);
    if (initialData) {
      reset({
        name: initialData.name,
        slug: initialData.slug || "",
        type: initialData.type,
        description: initialData.description,
        status: (initialData.status as CategoryStatus) || CategoryStatus.ACTIVE,
        showInMenu: initialData.showInMenu !== false,
        isFeatured: Boolean(initialData.isFeatured),
        image: initialData.image || "",
        mediaId: initialData.mediaId || "",
        parentId: initialData.parentId || "",
      });
    } else {
      reset({
        name: "",
        slug: "",
        type: CategoryType.TREKKING,
        description: "",
        status: CategoryStatus.ACTIVE,
        showInMenu: true,
        isFeatured: false,
        image: "",
        mediaId: "",
        parentId: "",
      });
    }
    setEditingMode(isEditing || !initialData);
  }, [initialData, isEditing, isOpen, reset]);

  const handleClose = () => {
    setFormError(null);
    setIsSubmitting(false);
    onClose();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsUploadingImage(true);

    try {
      const res = await MediaService.uploadFile(file);
      const url = res?.data?.url || (res as any)?.url;
      const mediaId = res?.data?.id;
      if (url || mediaId) {
        setValue("image", url || "");
        setValue("mediaId", mediaId || "");
        toast.success("Category image uploaded successfully");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload category image");
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = () => {
    setValue("image", "");
    setValue("mediaId", "");
    toast.info("Category image removed");
  };

  const onSubmit = async (values: CategoryFormValues) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const formattedSlug = values.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const categoryToSave: any = {
        ...(initialData?.id ? { id: initialData.id } : {}),
        name: values.name.trim(),
        slug: formattedSlug,
        type: values.type,
        description: values.description.trim(),
        status: values.status,
        showInMenu: values.showInMenu !== false,
        image: values.image || null,
        mediaId: values.mediaId || null,
        parentId: values.parentId || null,
      };

      const success = await onSave(categoryToSave);
      if (success !== false) {
        onClose();
      }
    } catch (err: any) {
      setFormError(err?.message || "Failed to save category.");
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
    ? "Create a top-level category or a subcategory under an existing region."
    : editingMode
    ? "Modify category attributes, parent hierarchy, and status."
    : "Category details and assigned items.";

  const parentCategoryItem = initialData?.parentId
    ? categoriesList.find((c) => c.id === initialData.parentId)
    : null;

  const editFooter = (
    <div className="flex items-center justify-end gap-2 w-full">
      <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting} className="text-xs font-semibold cursor-pointer">
        Cancel
      </Button>
      <Button
        type="submit"
        form="category-form"
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
    </div>
  );

  const viewFooter = (
    <div className="flex items-center justify-between gap-2 w-full">
      <Button type="button" variant="outline" onClick={handleClose} className="text-xs font-semibold cursor-pointer">
        Close
      </Button>
      <Button
        onClick={() => setEditingMode(true)}
        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors"
      >
        <Edit className="w-3.5 h-3.5 mr-1" />
        Edit Category
      </Button>
    </div>
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
      description={modalDescription}
      maxWidth="lg"
      footer={editingMode ? editFooter : viewFooter}
    >
      {editingMode ? (
        <form id="category-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2 text-xs">
          {formError && (
            <div className="p-3 mb-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <AdminInputField
                label="Category Name"
                required
                placeholder="e.g. Everest Base Camp Treks"
                error={errors.name?.message}
                {...register("name", {
                  onChange: (e) => {
                    if (!initialData) {
                      const generated = e.target.value
                        .toLowerCase()
                        .trim()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-+|-+$/g, "");
                      setValue("slug", generated, { shouldValidate: true });
                    }
                  },
                })}
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <AdminInputField
                label="Category Slug"
                required
                placeholder="e.g. everest-base-camp"
                error={errors.slug?.message}
                {...register("slug")}
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <AdminSelectField
                label="Category Type"
                required
                error={errors.type?.message}
                options={[
                  { label: "Trekking", value: CategoryType.TREKKING },
                  { label: "Tours", value: CategoryType.TOURS },
                  { label: "Expeditions", value: CategoryType.EXPEDITIONS },
                  { label: "Blogs", value: CategoryType.BLOGS },
                  { label: "Media", value: CategoryType.MEDIA },
                ]}
                {...register("type")}
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              {hasChildren ? (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Parent Category</label>
                  <div className="p-2.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                    This category has subcategories and must remain a Top-Level Category (Max depth = 2).
                  </div>
                </div>
              ) : (
                <AdminSearchableSelect
                  label="Parent Category (Optional Subcategory)"
                  value={watch("parentId") || ""}
                  onChange={(val) => setValue("parentId", val, { shouldValidate: true })}
                  error={errors.parentId?.message}
                  placeholder="-- None (Top-Level Category) --"
                  searchPlaceholder="Search parent category..."
                  options={[
                    { label: "-- None (Top-Level Category) --", value: "" },
                    ...potentialParents.map((parent) => ({
                      label: `Under: ${parent.name}`,
                      value: parent.id,
                    })),
                  ]}
                />
              )}
            </div>

            <div className="col-span-2 sm:col-span-1">
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

            <div className="col-span-2 sm:col-span-1">
              <AdminSelectField
                label="Show on Menu"
                required
                error={errors.showInMenu?.message}
                options={[
                  { label: "ON (Show in Marketing Menu)", value: "true" },
                  { label: "OFF (Hide from Marketing Menu)", value: "false" },
                ]}
                value={watch("showInMenu") !== false ? "true" : "false"}
                onChange={(e) => setValue("showInMenu", e.target.value === "true", { shouldValidate: true })}
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <AdminSelectField
                label="Featured Category"
                required
                error={errors.isFeatured?.message}
                options={[
                  { label: "NO (Standard Category)", value: "false" },
                  { label: "YES (Featured Category)", value: "true" },
                ]}
                value={watch("isFeatured") ? "true" : "false"}
                onChange={(e) => setValue("isFeatured", e.target.value === "true", { shouldValidate: true })}
              />
            </div>

            <div className="col-span-2 font-medium">
              <AdminTextareaField
                label="Description"
                required
                rows={3}
                placeholder="Brief summary of this category..."
                error={errors.description?.message}
                {...register("description")}
              />
            </div>

            <div className="col-span-2 pt-1">
              <AdminImageUpload
                label="Category Image / Banner (Optional)"
                value={watch("image") || ""}
                onChange={(url, mediaId) => {
                  setValue("image", url, { shouldValidate: true });
                  setValue("mediaId", mediaId || "", { shouldValidate: true });
                }}
                error={errors.image?.message}
              />
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-4 py-2 text-xs">
          {initialData?.image && (
            <div className="space-y-1">
              <span className="font-extrabold text-slate-950 block">Category Image:</span>
              <div
                onClick={(e) => openSingleImage(initialData.image!, initialData.name, e.currentTarget)}
                className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-950 group cursor-pointer shadow-xs"
                title="Click to view full image in Lightbox"
              >
                <img src={initialData.image} alt={initialData.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold">
                  <Maximize2 className="w-4 h-4" />
                  <span>View Fullscreen Lightbox</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-950 font-bold block">Module Domain:</span>
              <span className="text-slate-950 font-black">{initialData?.type}</span>
            </div>
            <div>
              <span className="text-slate-950 font-bold block">Hierarchy Level:</span>
              <span className="text-slate-950 font-black">
                {parentCategoryItem ? `Subcategory of ${parentCategoryItem.name}` : "Top-Level Region / Category"}
              </span>
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
  isDeleting?: boolean;
  error?: string | null;
}

export function DeleteCategoryModal({
  isOpen,
  onClose,
  onConfirm,
  categoryName = "this category",
  isDeleting = false,
  error = null,
}: DeleteCategoryModalProps) {
  return (
    <AdminConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Category"
      description={`Are you sure you want to delete "${categoryName}"? Packages assigned to this category will be unlinked.`}
      confirmText="Delete Category"
      cancelText="Cancel"
      variant="danger"
      isLoading={isDeleting}
      error={error}
    />
  );
}
