"use client";

import React from "react";
import { Controller } from "react-hook-form";
import { TripAddonsManager } from "@/components/admin/forms/trip-addons-manager";
import { PackageAddonItem } from "@/lib/admin-data";

interface PackageAddonsTabProps {
  control: any;
}

export function PackageAddonsTab({ control }: PackageAddonsTabProps) {
  return (
    <div className="space-y-4">
      <Controller
        name="addons"
        control={control}
        render={({ field }) => (
          <TripAddonsManager
            addons={(field.value as PackageAddonItem[]) || []}
            onChange={(items) => field.onChange(items)}
          />
        )}
      />
    </div>
  );
}
