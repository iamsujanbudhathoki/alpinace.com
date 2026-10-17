"use client";

import React from "react";
import { Controller } from "react-hook-form";
import {
  AdminInputField,
  AdminSelectField,
} from "@/components/admin/forms/admin-form-fields";
import { AdminSearchableSelect } from "@/components/admin/forms/admin-searchable-select";
import { AdminSearchableMultiSelect } from "@/components/admin/forms/admin-searchable-multiselect";
import { AdminCountrySelect } from "@/components/admin/forms/admin-country-select";
import { AppRichTextEditor } from "@/components/admin/rich-text/rich-text-editor";
import { TripDifficulty, TripActivity } from "@/lib/admin-data";
import { TripGroupPricingManager } from "@/components/admin/forms/trip-group-pricing-manager";

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
    <div className="space-y-8">
      {/* 1. Basic Details */}
      <div className="space-y-4">
        <div className="pb-2 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            General Information
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <AdminInputField
              label="Package Title"
              required
              placeholder={titlePlaceholder}
              error={errors.title?.message as string}
              {...register("title")}
            />
          </div>

          <div>
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

          <div>
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

          <div>
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

          <div>
            <AdminCountrySelect
              label="Country"
              required
              value={watch("country") || ""}
              onChange={(val) => setValue("country", val, { shouldValidate: true })}
              error={errors.country?.message as string}
            />
          </div>

          <div className="sm:col-span-2">
            <Controller
              name="activityIds"
              control={control}
              render={({ field }) => (
                <AdminSearchableMultiSelect
                  label="Related Activities"
                  placeholder="Select related activities..."
                  searchPlaceholder="Search activities..."
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
        </div>
      </div>

      {/* 2. Trip Specifications & Logistics */}
      <div className="space-y-4">
        <div className="pb-2 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Trip Specifications &amp; Logistics
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              label="Max Altitude (Meters)"
              type="number"
              placeholder="e.g. 5364"
              error={errors.maxAltitudeMeters?.message as string}
              {...register("maxAltitudeMeters")}
            />
          </div>

          <div>
            <AdminSelectField
              label="Difficulty"
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

          <div>
            <AdminInputField
              label="Best Season"
              placeholder="e.g. Mar - May & Sept - Nov"
              error={errors.bestSeason?.message as string}
              {...register("bestSeason")}
            />
          </div>

          <div>
            <AdminInputField
              label="Start &amp; End Location"
              placeholder="e.g. Kathmandu to Kathmandu"
              {...register("startEndLocation")}
            />
          </div>

          <div>
            <AdminInputField
              label="Group Size"
              placeholder="e.g. 2 - 12 Travelers"
              {...register("groupSizeRange")}
            />
          </div>

          <div>
            <AdminInputField
              label="Accommodation"
              placeholder="e.g. Luxury Lodges & Tea Houses"
              {...register("accommodation")}
            />
          </div>

          <div>
            <AdminInputField
              label="Meals"
              placeholder="e.g. All Meals Included (B, L, D)"
              {...register("meals")}
            />
          </div>

          {/* Extra Domain Fields (Tour / Expedition) if provided */}
          {extraFields}
        </div>
      </div>

      {/* 3. Pricing & Highlights */}
      <div className="space-y-4">
        <div className="pb-2 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Pricing &amp; Highlights
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <AdminInputField
              label="Base Price (USD)"
              type="number"
              required
              error={errors.priceUSD?.message as string}
              {...register("priceUSD")}
            />
          </div>

          <div className="flex items-center gap-6 sm:pt-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register("isFeatured")}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-700">Featured Package</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register("isPopular")}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-700">Popular Package</span>
            </label>
          </div>
        </div>

        {/* Group Pricing Manager */}
        <div className="pt-2">
          <Controller
            name="groupPricing"
            control={control}
            render={({ field }) => (
              <TripGroupPricingManager
                enabled={Boolean(watch("groupPricingEnabled"))}
                onEnabledChange={(val) =>
                  setValue("groupPricingEnabled", val, { shouldValidate: true })
                }
                tiers={field.value || []}
                onChange={(newTiers) => field.onChange(newTiers)}
                readOnly={!editingMode}
              />
            )}
          />
          {errors.groupPricing?.message && (
            <p className="text-xs font-semibold text-rose-600 mt-1">
              {errors.groupPricing.message as string}
            </p>
          )}
        </div>
      </div>

      {/* 4. Overview Description */}
      <div className="space-y-3">
        <div className="pb-2 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Overview Description
          </h3>
        </div>

        <div className="space-y-1.5">
          <Controller
            name="shortDesc"
            control={control}
            render={({ field }) => (
              <AppRichTextEditor
                value={field.value || ""}
                onChange={field.onChange}
                placeholder="Write a clear, inspiring overview of the journey, terrain highlights, and experiences..."
                height="220px"
              />
            )}
          />
          {errors.shortDesc && (
            <p className="text-[11px] text-rose-500 font-semibold">{errors.shortDesc.message as string}</p>
          )}
        </div>
      </div>
    </div>
  );
}
