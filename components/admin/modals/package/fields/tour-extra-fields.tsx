"use client";

import { AdminInputField, AdminSelectField } from "@/components/admin/forms/admin-form-fields";

interface TourExtraFieldsProps {
  register: any;
  setValue: any;
  watch: any;
  errors: any;
}

export function TourExtraFields({
  register,
  setValue,
  watch,
  errors,
}: TourExtraFieldsProps) {
  return (
    <>
      <div>
        <AdminSelectField
          label="Tour Category Type"
          value={watch("tourType") || ""}
          onChange={(val) => setValue("tourType", val, { shouldValidate: true })}
          error={errors.tourType?.message as string}
          options={[
            { label: "Cultural Sightseeing", value: "Cultural Sightseeing" },
            { label: "Helicopter Tour", value: "Helicopter Tour" },
            { label: "Wildlife Safari", value: "Wildlife Safari" },
            { label: "Overland 4WD", value: "Overland 4WD" },
            { label: "Pilgrimage & Spiritual", value: "Pilgrimage & Spiritual" },
            { label: "Adventure & Luxury", value: "Adventure & Luxury" },
          ]}
        />
      </div>

      <div>
        <AdminInputField
          label="Transportation Mode"
          placeholder="e.g. Private Luxury SUV / Flight / Helicopter"
          error={errors.transportation?.message as string}
          {...register("transportation")}
        />
      </div>
    </>
  );
}
