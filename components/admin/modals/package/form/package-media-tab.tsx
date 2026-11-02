"use client";

import { AdminImageUpload } from "@/components/admin/forms/admin-image-upload";
import { TripGalleryManager } from "@/components/admin/forms/trip-gallery-manager";
import { TripMapManager } from "@/components/admin/forms/trip-map-manager";
import { Controller } from "react-hook-form";

interface PackageMediaTabProps {
  register: any;
  control: any;
  setValue: any;
  watch: any;
  errors: any;
}

export function PackageMediaTab({
  register,
  control,
  setValue,
  watch,
  errors,
}: PackageMediaTabProps) {
  const watchTitle = watch("title") || "Package";

  return (
    <div className="space-y-6">
      {/* Primary Cover Image */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-800 block">
          Cover Image <span className="text-rose-500">*</span>
        </label>
        <Controller
          name="image"
          control={control}
          render={({ field }) => (
            <AdminImageUpload
              value={field.value || ""}
              libraryOnly={true}
              onChange={(url, mediaId) => {
                field.onChange(url);
                setValue("coverMediaId", mediaId || "", { shouldValidate: true, shouldDirty: true });
              }}
              error={errors.image?.message as string}
            />
          )}
        />
      </div>

      {/* Route Map */}
      <div className="space-y-1.5 pt-4 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-800 block">
          Route Map
        </label>
        <Controller
          name="mapImage"
          control={control}
          render={({ field }) => (
            <TripMapManager
              mapImage={field.value || ""}
              mapMediaId={watch("mapMediaId") || ""}
              onChange={(url, mediaId) => {
                field.onChange(url);
                setValue("mapMediaId", mediaId || "", { shouldValidate: true, shouldDirty: true });
              }}
              packageTitle={watchTitle}
            />
          )}
        />
      </div>

      {/* Photo Gallery */}
      <div className="space-y-1.5 pt-4 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-800 block">
          Photo Gallery
        </label>
        <Controller
          name="galleryImages"
          control={control}
          render={({ field }) => (
            <TripGalleryManager
              images={field.value || []}
              galleryMediaIds={watch("galleryMediaIds") || []}
              onChange={(images, mediaIds) => {
                field.onChange(images);
                setValue("galleryMediaIds", mediaIds || [], { shouldValidate: true, shouldDirty: true });
              }}
            />
          )}
        />
      </div>
    </div>
  );
}
