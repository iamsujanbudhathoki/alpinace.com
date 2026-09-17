"use client";

import { TripFilesManager } from "@/components/admin/forms/trip-files-manager";
import { Controller } from "react-hook-form";

interface PackageFilesTabProps {
  control: any;
}

export function PackageFilesTab({ control }: PackageFilesTabProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Downloadable PDF Brochures &amp; Permits
        </h4>
        <Controller
          name="packageFiles"
          control={control}
          render={({ field }) => (
            <TripFilesManager
              files={field.value || []}
              onChange={(files) => field.onChange(files)}
            />
          )}
        />
      </div>
    </div>
  );
}
