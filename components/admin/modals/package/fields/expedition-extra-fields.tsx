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
          label="Peak Altitude (Meters)"
          type="number"
          required
          placeholder="e.g. 6812"
          error={errors.peakHeightM?.message as string}
          {...register("peakHeightM")}
        />
      </div>

      <div>
        <AdminInputField
          label="Climbing Grade"
          placeholder="e.g. Alpine TD / 5.7"
          error={errors.climbingGrade?.message as string}
          {...register("climbingGrade")}
        />
      </div>

      <div>
        <AdminInputField
          label="Sherpa Guide Ratio"
          placeholder="e.g. 1:1 Dedicated Sherpa"
          error={errors.sherpaGuideRatio?.message as string}
          {...register("sherpaGuideRatio")}
        />
      </div>

      <div className="flex items-center gap-2 pt-6">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            {...register("oxygenRequired")}
            className="w-4 h-4 rounded border-slate-300 accent-slate-900 cursor-pointer"
          />
          <span className="text-xs font-semibold text-slate-700">Oxygen Required</span>
        </label>
      </div>
    </>
  );
}
