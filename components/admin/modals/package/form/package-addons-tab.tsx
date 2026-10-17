"use client";

import React from "react";
import { Controller } from "react-hook-form";
import { TripAddonsManager } from "@/components/admin/forms/trip-addons-manager";
import { AppRichTextEditor } from "@/components/admin/rich-text/rich-text-editor";
import { PackageAddonItem } from "@/lib/admin-data";

interface PackageAddonsTabProps {
  control: any;
}

export function PackageAddonsTab({ control }: PackageAddonsTabProps) {
  return (
    <div className="space-y-6">
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

      <div className="space-y-1.5 pt-4 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-800 block">
          Add-on Policies &amp; General Notes
        </label>
        <Controller
          name="addonsText"
          control={control}
          render={({ field }) => (
            <AppRichTextEditor
              value={field.value || ""}
              onChange={field.onChange}
              placeholder="Provide extra details or terms for optional upgrades (e.g. helicopter booking conditions, equipment rental requirements)..."
              height="160px"
            />
          )}
        />
      </div>
    </div>
  );
}
