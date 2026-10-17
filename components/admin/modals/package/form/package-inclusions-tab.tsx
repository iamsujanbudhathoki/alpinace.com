"use client";

import { AppRichTextEditor } from "@/components/admin/rich-text/rich-text-editor";
import { Controller } from "react-hook-form";

interface PackageInclusionsTabProps {
  control: any;
  errors: any;
}

export function PackageInclusionsTab({ control, errors }: PackageInclusionsTabProps) {
  return (
    <div className="space-y-6">
      {/* Inclusions */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-800 block">
          Included Services (Inclusions)
        </label>
        <Controller
          name="inclusionsText"
          control={control}
          render={({ field }) => (
            <AppRichTextEditor
              value={field.value || ""}
              onChange={field.onChange}
              placeholder="List all included services, permits, meals, airport transfers, guides, accommodation..."
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

      {/* Exclusions */}
      <div className="space-y-1.5 pt-4 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-800 block">
          Excluded Services (Exclusions)
        </label>
        <Controller
          name="exclusionsText"
          control={control}
          render={({ field }) => (
            <AppRichTextEditor
              value={field.value || ""}
              onChange={field.onChange}
              placeholder="List excluded costs, personal travel insurance, personal equipment, tipping, international airfare..."
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

      {/* Useful Info / Preparation Guidelines */}
      <div className="space-y-1.5 pt-4 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-800 block">
          Important Information &amp; Preparation Guidelines
        </label>
        <Controller
          name="usefulInfoText"
          control={control}
          render={({ field }) => (
            <AppRichTextEditor
              value={field.value || ""}
              onChange={field.onChange}
              placeholder="Permits and visa rules, recommended gear, mandatory travel insurance, altitude acclimatization tips..."
              height="180px"
            />
          )}
        />
        {errors.usefulInfoText && (
          <p className="text-[11px] text-rose-500 font-semibold">
            {errors.usefulInfoText.message as string}
          </p>
        )}
      </div>
    </div>
  );
}
