"use client";

import { AppRichTextEditor } from "@/components/admin/rich-text/rich-text-editor";
import { Controller } from "react-hook-form";

interface PackageInclusionsTabProps {
  control: any;
  errors: any;
}

export function PackageInclusionsTab({ control, errors }: PackageInclusionsTabProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-800 block">
          What is Included (Rich Text / Bullet Points)
        </label>
        <Controller
          name="inclusionsText"
          control={control}
          render={({ field }) => (
            <AppRichTextEditor
              value={field.value || ""}
              onChange={field.onChange}
              placeholder="List all included services, permits, meals, airport transfers, guides..."
              height="200px"
            />
          )}
        />
        {errors.inclusionsText && (
          <p className="text-[11px] text-rose-500 font-semibold">
            {errors.inclusionsText.message as string}
          </p>
        )}
      </div>

      <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-800 block">
          What is Excluded (Rich Text / Bullet Points)
        </label>
        <Controller
          name="exclusionsText"
          control={control}
          render={({ field }) => (
            <AppRichTextEditor
              value={field.value || ""}
              onChange={field.onChange}
              placeholder="List excluded costs, personal insurance, gear rental, tips, international flights..."
              height="200px"
            />
          )}
        />
        {errors.exclusionsText && (
          <p className="text-[11px] text-rose-500 font-semibold">
            {errors.exclusionsText.message as string}
          </p>
        )}
      </div>
    </div>
  );
}
