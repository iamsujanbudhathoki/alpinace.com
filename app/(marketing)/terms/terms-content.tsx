"use client";

import { useEffect, useState } from "react";
import { SettingService } from "@/lib/services/admin-service";

export function TermsAndConditionsContent() {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    SettingService.getPublicTermsAndConditions()
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
      <div className="space-y-6 animate-pulse py-6">
        <div className="h-6 bg-stone-200 rounded-md w-1/3" />
        <div className="space-y-4">
          <div className="h-4 bg-stone-200 rounded-md w-full" />
          <div className="h-4 bg-stone-200 rounded-md w-11/12" />
          <div className="h-4 bg-stone-200 rounded-md w-4/5" />
        </div>
        <div className="space-y-4 pt-6">
          <div className="h-4 bg-stone-200 rounded-md w-full" />
          <div className="h-4 bg-stone-200 rounded-md w-full" />
          <div className="h-4 bg-stone-200 rounded-md w-3/4" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-base font-semibold text-stone-900">
          Unable to load Terms &amp; Conditions
        </p>
        <p className="text-sm text-stone-500">
          Please try refreshing the page or contact us directly.
        </p>
      </div>
    );
  }

  if (!content || content.trim() === "" || content === "<p></p>") {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-base font-semibold text-stone-900">
          Terms &amp; Conditions not yet published
        </p>
        <p className="text-sm text-stone-500">
          Please check back soon or contact us for more information.
        </p>
      </div>
    );
  }

  return (
    <div className="terms-content">
      <div
        dangerouslySetInnerHTML={{ __html: content }}
        className="
          prose prose-stone max-w-none text-stone-800 text-base sm:text-lg leading-relaxed
          prose-headings:font-heading prose-headings:text-stone-900 prose-headings:font-bold
          prose-h1:text-3xl prose-h1:sm:text-4xl prose-h1:mt-10 prose-h1:mb-5 prose-h1:tracking-tight
          prose-h2:text-2xl prose-h2:sm:text-3xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:tracking-tight prose-h2:border-b prose-h2:border-stone-200 prose-h2:pb-3
          prose-h3:text-xl prose-h3:sm:text-2xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:font-semibold
          prose-p:text-stone-700 prose-p:text-base prose-p:sm:text-lg prose-p:leading-relaxed prose-p:my-5
          prose-a:text-stone-950 prose-a:font-semibold prose-a:underline hover:prose-a:text-stone-700 transition-colors
          prose-strong:text-stone-900 prose-strong:font-bold
          prose-ul:list-disc prose-ul:pl-6 prose-ul:my-5 prose-ul:space-y-2.5 prose-ul:text-base prose-ul:sm:text-lg
          prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-5 prose-ol:space-y-2.5 prose-ol:text-base prose-ol:sm:text-lg
          prose-li:text-stone-700
          prose-table:border-collapse prose-table:w-full prose-table:my-8 prose-table:text-base prose-table:sm:text-lg
          prose-th:border prose-th:border-stone-200 prose-th:p-4 prose-th:bg-stone-100/70 prose-th:text-left prose-th:font-bold prose-th:text-stone-900
          prose-td:border prose-td:border-stone-200 prose-td:p-4 prose-td:text-stone-700
        "
      />
    </div>
  );
}
