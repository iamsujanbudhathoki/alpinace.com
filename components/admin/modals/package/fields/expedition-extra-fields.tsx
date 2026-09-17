"use client";

import { AdminInputField } from "@/components/admin/forms/admin-form-fields";

interface ExpeditionExtraFieldsProps {
  register: any;
  setValue: any;
  watch: any;
  errors: any;
}

export function ExpeditionExtraFields({
  register,
  setValue,
  watch,
  errors,
}: ExpeditionExtraFieldsProps) {
  return (
    <>
      <div>
        <AdminInputField
          label="Peak Altitude Height (Meters)"
          type="number"
          required
          placeholder="e.g. 6812"
          error={errors.peakHeightM?.message as string}
          {...register("peakHeightM")}
        />
      </div>

      <div>
        <AdminInputField
          label="Climbing Grade / Technical Rating"
          placeholder="e.g. Technical Alpine Grade (TD/5.7)"
          error={errors.climbingGrade?.message as string}
          {...register("climbingGrade")}
        />
      </div>

      <div>
        <AdminInputField
          label="Sherpa Guide Ratio"
          placeholder="e.g. 1:1 Dedicated Sherpa Ratio"
          error={errors.sherpaGuideRatio?.message as string}
          {...register("sherpaGuideRatio")}
        />
      </div>

      <div className="flex items-center gap-2 pt-6">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            {...register("oxygenRequired")}
            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span className="text-sm font-medium text-slate-700">Supplementary Oxygen Required</span>
        </label>
      </div>
    </>
  );
}
