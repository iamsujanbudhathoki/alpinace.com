"use client";

import { useEffect, useState } from "react";
import { SettingService } from "@/lib/services/admin-service";

export function PrivacyPolicyContent() {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    SettingService.getPublicPrivacyPolicy()
      .then((res) => {
        setContent(res.content);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse py-4">
        <div className="h-4 bg-stone-200 rounded w-1/4" />
        <div className="space-y-3">
          <div className="h-3.5 bg-stone-200 rounded w-full" />
          <div className="h-3.5 bg-stone-200 rounded w-5/6" />
          <div className="h-3.5 bg-stone-200 rounded w-4/6" />
        </div>
        <div className="space-y-3 pt-4">
          <div className="h-3.5 bg-stone-200 rounded w-full" />
          <div className="h-3.5 bg-stone-200 rounded w-full" />
          <div className="h-3.5 bg-stone-200 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center space-y-2">
        <p className="text-sm font-semibold text-stone-800">
          Unable to load Privacy Policy
        </p>
        <p className="text-xs text-stone-500">
          Please try again later or contact us directly.
        </p>
      </div>
    );
  }

  if (!content || content.trim() === "" || content === "<p></p>") {
    return (
      <div className="py-12 text-center space-y-2">
        <p className="text-sm font-semibold text-stone-800">
          Privacy Policy not yet published
        </p>
        <p className="text-xs text-stone-500">
          Please check back soon or contact us for more information.
        </p>
      </div>
    );
  }

  return (
    <div className="privacy-content">
      <div
        dangerouslySetInnerHTML={{ __html: content }}
        className="
          prose prose-stone max-w-none text-stone-700 text-sm sm:text-base leading-relaxed
          prose-headings:font-heading prose-headings:text-stone-900 prose-headings:font-bold
          prose-h1:text-2xl prose-h1:sm:text-3xl prose-h1:mt-8 prose-h1:mb-4
          prose-h2:text-xl prose-h2:sm:text-2xl prose-h2:mt-8 prose-h2:mb-3 prose-h2:border-b prose-h2:border-stone-100 prose-h2:pb-2
          prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
          prose-p:text-stone-700 prose-p:leading-relaxed prose-p:my-4
          prose-a:text-stone-900 prose-a:font-medium prose-a:underline hover:prose-a:text-accent transition-colors
          prose-strong:text-stone-900 prose-strong:font-semibold
          prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4 prose-ul:space-y-2
          prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4 prose-ol:space-y-2
          prose-li:text-stone-700
          prose-table:border-collapse prose-table:w-full prose-table:my-6
          prose-th:border prose-th:border-stone-200 prose-th:p-3 prose-th:bg-stone-50 prose-th:text-left prose-th:font-semibold prose-th:text-stone-900
          prose-td:border prose-td:border-stone-200 prose-td:p-3
        "
      />
    </div>
  );
}
