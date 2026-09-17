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
          Primary Cover Banner Image <span className="text-rose-500">*</span>
        </label>
        <Controller
          name="image"
          control={control}
          render={({ field }) => (
            <AdminImageUpload
              value={field.value || ""}
              onChange={(url, mediaId) => {
                field.onChange(url);
                if (mediaId) {
                  setValue("coverMediaId", mediaId, { shouldValidate: true });
                }
              }}
              error={errors.image?.message as string}
            />
          )}
        />
      </div>

      {/* Interactive Route Map */}
      <div className="space-y-1.5 pt-4 border-t border-slate-200">
        <label className="text-xs font-bold text-slate-800 block">
          Route Map Illustration &amp; Topographic Image
        </label>
        <Controller
          name="mapImage"
          control={control}
          render={({ field }) => (
            <TripMapManager
              mapImage={field.value || ""}
              onChange={(url, mediaId) => {
                field.onChange(url);
                if (mediaId) {
                  setValue("mapMediaId", mediaId, { shouldValidate: true });
                }
              }}
              packageTitle={watchTitle}
            />
          )}
        />
      </div>

      {/* Media Photo Gallery */}
      <div className="space-y-1.5 pt-4 border-t border-slate-200">
        <label className="text-xs font-bold text-slate-800 block">
          Photo Gallery Images
        </label>
        <Controller
          name="galleryImages"
          control={control}
          render={({ field }) => (
            <TripGalleryManager
              images={field.value || []}
              onChange={(images, mediaIds) => {
                field.onChange(images);
                if (mediaIds) {
                  setValue("galleryMediaIds", mediaIds, { shouldValidate: true });
                }
              }}
            />
          )}
        />
      </div>
    </div>
  );
}
