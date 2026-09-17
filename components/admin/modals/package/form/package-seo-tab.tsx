"use client";

import { AdminInputField, AdminTextareaField } from "@/components/admin/forms/admin-form-fields";
import { websiteDomain } from "@/lib/env.constants";

interface PackageSeoTabProps {
  register: any;
  watch: any;
  errors: any;
  slugPrefix?: string;
  initialSlug?: string;
}

export function PackageSeoTab({
  register,
  watch,
  errors,
  slugPrefix = "trekking",
  initialSlug = "",
}: PackageSeoTabProps) {
  const watchMetaTitle = watch("metaTitle") || watch("title") || "Package";
  const watchMetaDescription = watch("metaDescription") || watch("shortDesc") || "";
  const slug = initialSlug || "package-url-slug";

  // Clean html tags for preview snippet
  const cleanSnippetDesc = watchMetaDescription
    .replace(/<[^>]*>?/gm, "")
    .slice(0, 160);

  return (
    <div className="space-y-4">
      {/* Live Google Search Result Snippet Card */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
        <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
          Search Result Live Preview
        </span>
        <div className="space-y-0.5 font-sans">
          <div className="text-[12px] text-emerald-700 truncate">
            {websiteDomain}/{slugPrefix}/{slug}
          </div>
          <div className="text-base font-medium text-blue-700 hover:underline cursor-pointer truncate">
            {watchMetaTitle} | Alpine Ace
          </div>
          <p className="text-xs text-slate-600 line-clamp-2">
            {cleanSnippetDesc || "No meta description provided yet. Google will automatically display a snippet from your content."}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <AdminInputField
            label="Meta Title (SEO Title)"
            placeholder="e.g. Everest Base Camp Trek 14 Days | Alpine Ace"
            error={errors.metaTitle?.message as string}
            {...register("metaTitle")}
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Recommended length: 50–60 characters.
          </p>
        </div>

        <div>
          <AdminTextareaField
            label="Meta Description (Search Snippet)"
            placeholder="Concise summary for search engines and social sharing preview..."
            rows={3}
            error={errors.metaDescription?.message as string}
            {...register("metaDescription")}
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Recommended length: 150–160 characters.
          </p>
        </div>

        <div>
          <AdminInputField
            label="Focus Keywords (Comma Separated)"
            placeholder="e.g. Everest trek, Nepal trekking, high altitude hike"
            error={errors.keywords?.message as string}
            {...register("keywords")}
          />
        </div>
      </div>
    </div>
  );
}
