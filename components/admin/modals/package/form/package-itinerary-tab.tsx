"use client";

import { TripItineraryManager } from "@/components/admin/forms/trip-itinerary-manager";
import { Controller } from "react-hook-form";

interface PackageItineraryTabProps {
  control: any;
  errors: any;
}

export function PackageItineraryTab({ control, errors }: PackageItineraryTabProps) {
  return (
    <div className="space-y-4">
      <Controller
        name="itinerary"
        control={control}
        render={({ field }) => (
          <TripItineraryManager
            itinerary={field.value || []}
            onChange={(items) => field.onChange(items)}
          />
        )}
      />
      {errors.itinerary && (
        <p className="text-xs text-rose-500 font-semibold mt-1">
          {typeof errors.itinerary.message === "string"
            ? errors.itinerary.message
            : "Please check all required itinerary day titles and descriptions."}
        </p>
      )}
    </div>
  );
}
