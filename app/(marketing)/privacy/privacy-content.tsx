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
      <div className="bg-white rounded-xl border border-stone-200 p-8 sm:p-12 space-y-5 animate-pulse">
        <div className="h-3 bg-stone-100 rounded w-1/4" />
        <div className="space-y-3">
          <div className="h-3 bg-stone-100 rounded w-full" />
          <div className="h-3 bg-stone-100 rounded w-5/6" />
          <div className="h-3 bg-stone-100 rounded w-4/6" />
        </div>
        <div className="space-y-3 pt-4">
          <div className="h-3 bg-stone-100 rounded w-full" />
          <div className="h-3 bg-stone-100 rounded w-full" />
          <div className="h-3 bg-stone-100 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-8 sm:p-12 text-center space-y-2">
        <p className="text-sm font-semibold text-zinc-700">
          Unable to load Privacy Policy
        </p>
        <p className="text-xs text-zinc-500">
          Please try again later or contact us directly.
        </p>
      </div>
    );
  }

  if (!content || content.trim() === "" || content === "<p></p>") {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-8 sm:p-12 text-center space-y-2">
        <p className="text-sm font-semibold text-zinc-700">
          Privacy Policy not yet published
        </p>
        <p className="text-xs text-zinc-500">
          Please check back soon or contact us for more information.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-10 text-zinc-700 text-sm leading-relaxed font-normal privacy-content">
      <div
        dangerouslySetInnerHTML={{ __html: content }}
        className="
          prose prose-sm max-w-none
          prose-headings:font-heading prose-headings:text-zinc-900 prose-headings:font-bold
          prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
          prose-p:text-zinc-700 prose-p:leading-relaxed
          prose-a:text-amber-800 prose-a:underline hover:prose-a:text-amber-600
          prose-strong:text-zinc-900 prose-strong:font-semibold
          prose-ul:list-disc prose-ul:pl-5 prose-ul:space-y-1
          prose-ol:list-decimal prose-ol:pl-5 prose-ol:space-y-1
          prose-li:text-zinc-700
          prose-table:border-collapse prose-table:w-full
          prose-th:border prose-th:border-stone-200 prose-th:p-2 prose-th:bg-stone-50 prose-th:text-left
          prose-td:border prose-td:border-stone-200 prose-td:p-2
        "
      />
    </div>
  );
}
