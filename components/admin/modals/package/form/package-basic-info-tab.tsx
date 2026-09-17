"use client";

import {
  AdminInputField,
  AdminSelectField,
} from "@/components/admin/forms/admin-form-fields";
import { AdminSearchableSelect } from "@/components/admin/forms/admin-searchable-select";
import { AdminSearchableMultiSelect } from "@/components/admin/forms/admin-searchable-multiselect";
import { AdminCountrySelect } from "@/components/admin/forms/admin-country-select";
import { AppRichTextEditor } from "@/components/admin/rich-text/rich-text-editor";
import { PackageStatus, TripDifficulty, TripActivity } from "@/lib/admin-data";
import { Controller } from "react-hook-form";

interface PackageBasicInfoTabProps {
  register: any;
  control: any;
  setValue: any;
  watch: any;
  errors: any;
  categories: { label: string; value: string }[];
  subcategories: { label: string; value: string }[];
  isLoadingSubcats?: boolean;
  availableActivities: { id: string; name: string }[];
  editingMode?: boolean;
  extraFields?: React.ReactNode;
  regionOptions?: { label: string; value: string }[];
  titlePlaceholder?: string;
}

export function PackageBasicInfoTab({
  register,
  control,
  setValue,
  watch,
  errors,
  categories,
  subcategories,
  isLoadingSubcats = false,
  availableActivities,
  editingMode = true,
  extraFields,
  regionOptions = [
    { label: "Everest", value: "Everest" },
    { label: "Annapurna", value: "Annapurna" },
    { label: "Langtang", value: "Langtang" },
    { label: "Manaslu", value: "Manaslu" },
    { label: "Khumbu", value: "Khumbu" },
    { label: "Kathmandu & Pokhara", value: "Kathmandu & Pokhara" },
  ],
  titlePlaceholder = "e.g. Annapurna Sanctuary Luxury Trek",
}: PackageBasicInfoTabProps) {
  return (
    <div className="grid grid-cols-2 gap-3 pr-1">
      <div className="col-span-2 sm:col-span-1">
        <AdminInputField
          label="Package Title"
          required
          placeholder={titlePlaceholder}
          error={errors.title?.message as string}
          {...register("title")}
        />
      </div>

      <div className="sm:col-span-1">
        <AdminSearchableSelect
          label="Category"
          required
          value={watch("categoryId") || ""}
          onChange={(val) => {
            setValue("categoryId", val, { shouldValidate: true });
            setValue("subcategoryId", "", { shouldValidate: true });
          }}
          error={errors.categoryId?.message as string}
          placeholder="Select category..."
          searchPlaceholder="Search categories..."
          options={categories}
        />
      </div>

      <div className="sm:col-span-1">
        <AdminSearchableSelect
          label="Subcategory (Optional)"
          value={watch("subcategoryId") || ""}
          onChange={(val) => setValue("subcategoryId", val, { shouldValidate: true })}
          error={errors.subcategoryId?.message as string}
          placeholder={
            isLoadingSubcats
              ? "Loading subcategories..."
              : subcategories.length > 0
                ? "Select subcategory (Optional)..."
                : "No subcategories available"
          }
          searchPlaceholder="Search subcategories..."
          options={subcategories}
          disabled={isLoadingSubcats || subcategories.length === 0}
        />
      </div>

      <div className="sm:col-span-1">
        <AdminSelectField
          label="Region"
          required
          searchable
          placeholder="Select or search region..."
          value={watch("region") || ""}
          onChange={(val) => setValue("region", val as any, { shouldValidate: true })}
          error={errors.region?.message as string}
          options={regionOptions}
        />
      </div>

      <div className="sm:col-span-1">
        <AdminCountrySelect
          label="Country"
          required
          value={watch("country") || ""}
          onChange={(val) => setValue("country", val, { shouldValidate: true })}
          error={errors.country?.message as string}
        />
      </div>

      <div className="sm:col-span-1">
        <AdminSelectField
          label="Activity Type"
          required
          value={watch("activity") || ""}
          onChange={(val) => setValue("activity", val as any, { shouldValidate: true })}
          error={errors.activity?.message as string}
          options={[
            { label: "Trekking/Hiking", value: TripActivity.TREKKING_HIKING },
            { label: "Cultural Sightseeing", value: TripActivity.CULTURAL_SIGHTSEEING },
            { label: "Peak Climbing", value: TripActivity.PEAK_CLIMBING },
            { label: "Heli Trek & Tour", value: TripActivity.HELI_TREK_TOUR },
            { label: "Wildlife Safari", value: TripActivity.WILDLIFE_SAFARI },
            { label: "Other", value: TripActivity.OTHER },
          ]}
        />
      </div>

      <div className="sm:col-span-3">
        <Controller
          name="activityIds"
          control={control}
          render={({ field }) => (
            <AdminSearchableMultiSelect
              label="Associated Activity Hubs (Multi-Select)"
              placeholder="Select activity hubs to link to this package..."
              searchPlaceholder="Search available activities..."
              values={field.value || []}
              disabled={!editingMode}
              options={availableActivities.map((act) => ({
                value: act.id,
                label: act.name,
              }))}
              onChange={(newValues) => field.onChange(newValues)}
              error={errors.activityIds?.message as string}
            />
          )}
        />
      </div>

      {/* Render Extra Domain Fields (Tour / Expedition) if provided */}
      {extraFields}

      <div>
        <AdminInputField
          label="Duration (Days)"
          type="number"
          required
          error={errors.durationDays?.message as string}
          {...register("durationDays")}
        />
      </div>

      <div>
        <AdminInputField
          label="Max Elevation Altitude (Meters)"
          type="number"
          required
          placeholder="5364"
          error={errors.maxAltitudeMeters?.message as string}
          {...register("maxAltitudeMeters")}
        />
      </div>

      <div>
        <AdminSelectField
          label="Difficulty Grade"
          required
          value={watch("difficulty") || ""}
          onChange={(val) => setValue("difficulty", val as any, { shouldValidate: true })}
          error={errors.difficulty?.message as string}
          options={[
            { label: "Easy", value: TripDifficulty.EASY },
            { label: "Moderate", value: TripDifficulty.MODERATE },
            { label: "Challenging", value: TripDifficulty.CHALLENGING },
            { label: "Strenuous", value: TripDifficulty.STRENUOUS },
            { label: "Extreme", value: TripDifficulty.EXTREME },
          ]}
        />
      </div>

      <div>
        <AdminInputField
          label="Price (USD)"
          type="number"
          required
          error={errors.priceUSD?.message as string}
          {...register("priceUSD")}
        />
      </div>

      <div>
        <AdminSelectField
          label="Status"
          required
          value={watch("status") || ""}
          onChange={(val) => setValue("status", val as any, { shouldValidate: true })}
          error={errors.status?.message as string}
          options={[
            { label: "Active", value: PackageStatus.ACTIVE },
            { label: "Draft", value: PackageStatus.DRAFT },
          ]}
        />
      </div>

      <div>
        <AdminInputField
          label="Group Size Range"
          placeholder="e.g. 2 - 12 Travelers"
          {...register("groupSizeRange")}
        />
      </div>

      <div>
        <AdminInputField
          label="Start & End Route Location"
          placeholder="e.g. Kathmandu to Kathmandu"
          {...register("startEndLocation")}
        />
      </div>

      <div className="col-span-2 sm:col-span-3">
        <AdminInputField
          label="Best Season"
          required
          placeholder="e.g. March - May & Sept - Nov"
          error={errors.bestSeason?.message as string}
          {...register("bestSeason")}
        />
      </div>

      <div className="col-span-2 sm:col-span-3 flex items-center gap-6 pt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            {...register("isFeatured")}
            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span className="text-sm font-medium text-slate-700">Featured Package</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            {...register("isPopular")}
            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span className="text-sm font-medium text-slate-700">Popular Package</span>
        </label>
      </div>

      <div className="col-span-2">
        <AdminInputField
          label="Accommodation Type"
          placeholder="e.g. Luxury Lodges & Heritage Hotels"
          {...register("accommodation")}
        />
      </div>

      <div className="col-span-2">
        <AdminInputField
          label="Meals Plan"
          placeholder="e.g. All Meals Included (Breakfast, Lunch, Dinner)"
          {...register("meals")}
        />
      </div>

      <div className="col-span-2 space-y-1.5">
        <label className="text-xs font-bold text-slate-800 block">
          Overview &amp; Experience Description <span className="text-rose-500">*</span>
        </label>
        <Controller
          name="shortDesc"
          control={control}
          render={({ field }) => (
            <AppRichTextEditor
              value={field.value || ""}
              onChange={field.onChange}
              placeholder="Detailed marketing overview, highlights, terrain insights, and trekking experiences..."
              height="220px"
            />
          )}
        />
        {errors.shortDesc && (
          <p className="text-[11px] text-rose-500 font-semibold">{errors.shortDesc.message as string}</p>
        )}
      </div>

      <div className="col-span-2 space-y-1.5 pt-2 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-800 block">
          Add-ons &amp; Optional Upgrades (Rich Text)
        </label>
        <Controller
          name="addonsText"
          control={control}
          render={({ field }) => (
            <AppRichTextEditor
              value={field.value || ""}
              onChange={field.onChange}
              placeholder="Detail helicopter return options, single supplement upgrades, gear rental, extensions..."
              height="180px"
            />
          )}
        />
      </div>

      <div className="col-span-2 space-y-1.5 pt-2 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-800 block">
          Useful Info &amp; Preparation Guidelines (Rich Text)
        </label>
        <Controller
          name="usefulInfoText"
          control={control}
          render={({ field }) => (
            <AppRichTextEditor
              value={field.value || ""}
              onChange={field.onChange}
              placeholder="Packing lists, permit rules, visa advice, fitness prerequisites..."
              height="180px"
            />
          )}
        />
      </div>
    </div>
  );
}
