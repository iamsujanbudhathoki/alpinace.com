"use client";

import { TripDepartureDatesManager } from "@/components/admin/forms/trip-departure-dates-manager";
import { Controller } from "react-hook-form";

interface PackageDatesTabProps {
  control: any;
  watch: any;
}

export function PackageDatesTab({ control, watch }: PackageDatesTabProps) {
  const priceUSD = Number(watch("priceUSD")) || 0;

  return (
    <div className="space-y-4">
      <Controller
        name="departureDates"
        control={control}
        render={({ field }) => (
          <TripDepartureDatesManager
            dates={field.value || []}
            onChange={(dates) => field.onChange(dates)}
            defaultPrice={priceUSD}
          />
        )}
      />
    </div>
  );
}
