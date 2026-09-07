"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Edit, Loader2, Image as ImageIcon, Maximize2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ActivityItem, ActivityStatus } from "@/lib/admin-data";
import { AdminInputField, AdminSelectField, AdminTextareaField } from "@/components/admin/forms/admin-form-fields";
import { AdminImageUpload } from "@/components/admin/forms/admin-image-upload";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { AdminConfirmModal } from "@/components/admin/ui/admin-confirm-modal";
import { AdminStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Button } from "@/components/ui/button";
import { ActivityService } from "@/lib/services/admin-service";
import { openSingleImage } from "@/lib/utils/lightbox";

interface ActivityFormValues {
  name: string;
  slug: string;
  description?: string;
  status: ActivityStatus;
  isFeatured?: boolean;
  image?: string;
  mediaId?: string;
}

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: ActivityItem) => Promise<boolean | void> | boolean | void;
  initialData?: ActivityItem | null;
  isEditing?: boolean;
}

export function ActivityFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing = false,
}: ActivityFormModalProps) {
  const [editingMode, setEditingMode] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ActivityFormValues>({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      status: ActivityStatus.ACTIVE,
      isFeatured: false,
      image: "",
      mediaId: "",
    },
  });

  const currentImage = watch("image");
  const nameValue = watch("name");

  useEffect(() => {
    setFormError(null);
    setIsSubmitting(false);
    if (initialData) {
      reset({
        name: initialData.name,
        slug: initialData.slug || "",
        description: initialData.description || "",
        status: (initialData.status as ActivityStatus) || ActivityStatus.ACTIVE,
        isFeatured: Boolean(initialData.isFeatured),
        image: initialData.image || "",
        mediaId: initialData.mediaId || "",
      });
      setEditingMode(isEditing);
    } else {
      reset({
        name: "",
        slug: "",
        description: "",
        status: ActivityStatus.ACTIVE,
        isFeatured: false,
        image: "",
        mediaId: "",
      });
      setEditingMode(true);
    }
  }, [initialData, isEditing, isOpen, reset]);

  // Auto-generate slug from name if creating new activity
  const handleNameBlur = () => {
    if (!initialData && nameValue) {
      const generatedSlug = nameValue
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", generatedSlug);
    }
  };

  const onSubmit = async (data: ActivityFormValues) => {
    if (isViewMode) return;
    setFormError(null);
    setIsSubmitting(true);

    try {
      let response;
      if (initialData?.id) {
        response = await ActivityService.update(initialData.id, data);
      } else {
        response = await ActivityService.create(data);
      }

      if (response && response.success && response.data) {
        toast.success(
          initialData
            ? "Activity updated successfully"
            : "Activity created successfully"
        );
        await onSave(response.data);
        onClose();
      } else {
        const errorMsg =
          response?.errors?.[0] ||
          response?.message ||
          "Failed to save activity.";
        setFormError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error?.message ||
        err?.message ||
        "An unexpected error occurred.";
      setFormError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isViewMode = Boolean(initialData) && !editingMode;

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isViewMode
          ? `Activity Details: ${initialData?.name}`
          : initialData
          ? `Edit Activity: ${initialData.name}`
          : "Add New Activity"
      }
      description={
        isViewMode
          ? "Read-only view of activity details."
          : "Fill in the information below to create or update an activity hub."
      }
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {formError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-sm text-xs font-medium text-rose-700">
            {formError}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminInputField
              label="Activity Name"
              required={!isViewMode}
              placeholder="e.g. Activities in Pokhara"
              disabled={isViewMode}
              {...register("name", {
                required: "Activity name is required",
                onBlur: handleNameBlur,
              })}
              error={errors.name?.message}
            />

            <AdminInputField
              label="Slug"
              required={!isViewMode}
              placeholder="e.g. pokhara-activities"
              disabled={isViewMode}
              {...register("slug", { required: "Slug is required" })}
              error={errors.slug?.message}
            />
          </div>

          <AdminTextareaField
            label="Description"
            rows={3}
            placeholder="Brief overview of what travelers can experience in this activity hub..."
            disabled={isViewMode}
            {...register("description")}
            error={errors.description?.message}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminSelectField
              label="Status"
              disabled={isViewMode}
              options={[
                { label: "Active", value: ActivityStatus.ACTIVE },
                { label: "Draft", value: ActivityStatus.DRAFT },
              ]}
              {...register("status")}
            />

            <div className="flex items-center pt-6">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={isViewMode}
                  className="rounded border-stone-300 text-stone-900 focus:ring-stone-500 w-4 h-4"
                  {...register("isFeatured")}
                />
                <span className="text-xs font-medium text-stone-700">
                  Highlight as Featured Activity on Homepage
                </span>
              </label>
            </div>
          </div>

          {/* Cover Media Image Upload */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <label className="text-xs font-semibold text-stone-700 block">
              Cover Banner Image
            </label>
            {isViewMode ? (
              currentImage ? (
                <div className="relative w-full h-44 rounded-sm overflow-hidden border border-stone-200 group bg-stone-100">
                  <img
                    src={currentImage}
                    alt="Activity Banner"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => openSingleImage(currentImage, initialData?.name)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 text-xs font-medium"
                  >
                    <Maximize2 className="w-4 h-4" /> View Full Image
                  </button>
                </div>
              ) : (
                <div className="p-6 text-center border border-dashed border-stone-200 rounded-sm bg-stone-50 text-xs text-stone-400">
                  No image assigned.
                </div>
              )
            ) : (
              <AdminImageUpload
                value={currentImage || ""}
                onChange={(url, mediaId) => {
                  setValue("image", url || "");
                  setValue("mediaId", mediaId || "");
                }}
              />
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-200">
          <div>
            {initialData && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500">Status:</span>
                <AdminStatusBadge status={initialData.status} />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs"
            >
              Close
            </Button>

            {isViewMode ? (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditingMode(true);
                }}
                className="bg-stone-900 hover:bg-stone-800 text-white text-xs gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Activity
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-stone-900 hover:bg-stone-800 text-white text-xs gap-1.5"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {initialData ? "Save Changes" : "Create Activity"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </AdminModal>
  );
}

interface DeleteActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<boolean | void> | boolean | void;
  activityName?: string;
}

export function DeleteActivityModal({
  isOpen,
  onClose,
  onConfirm,
  activityName = "this activity",
}: DeleteActivityModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Delete Activity"
      description={`Are you sure you want to delete "${activityName}"? Trips linked to this activity will no longer appear on this activity page.`}
      confirmText="Delete Activity"
      variant="danger"
      isLoading={isDeleting}
    />
  );
}
