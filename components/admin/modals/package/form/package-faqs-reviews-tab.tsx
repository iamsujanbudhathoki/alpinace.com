"use client";

import { TripFaqsManager, TripReviewsManager } from "@/components/admin/forms/trip-faqs-reviews-fields";
import { Controller } from "react-hook-form";

interface PackageFaqsReviewsTabProps {
  control: any;
  errors: any;
}

export function PackageFaqsReviewsTab({ control, errors }: PackageFaqsReviewsTabProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Frequently Asked Questions (FAQs)
        </h4>
        <Controller
          name="faqs"
          control={control}
          render={({ field }) => (
            <TripFaqsManager
              faqs={field.value || []}
              onChange={(faqs) => field.onChange(faqs)}
            />
          )}
        />
        {errors.faqs && (
          <p className="text-xs text-rose-500 font-semibold mt-1">
            {errors.faqs.message as string}
          </p>
        )}
      </div>

      <div className="space-y-2 pt-4 border-t border-slate-200">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Customer Reviews &amp; Testimonials
        </h4>
        <Controller
          name="reviews"
          control={control}
          render={({ field }) => (
            <TripReviewsManager
              reviews={field.value || []}
              onChange={(reviews) => field.onChange(reviews)}
            />
          )}
        />
        {errors.reviews && (
          <p className="text-xs text-rose-500 font-semibold mt-1">
            {errors.reviews.message as string}
          </p>
        )}
      </div>
    </div>
  );
}
