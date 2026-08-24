"use client";

import { Check, Minus } from "lucide-react";

export interface PackageInclusionsProps {
  inclusions?: string[];
  exclusions?: string[];
  inclusionsText?: string;
  exclusionsText?: string;
  title?: string;
  subtitle?: string;
  inclusionsTitle?: string;
  exclusionsTitle?: string;
}

function isHtmlContent(str?: string): boolean {
  if (!str) return false;
  return /<[a-z][\s\S]*>/i.test(str);
}

function parsePlainTextList(text?: string, fallbackList: string[] = []): string[] {
  if (fallbackList && fallbackList.length > 0) return fallbackList;
  if (!text || !text.trim()) return [];
  return text
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function PackageInclusions({
  inclusions = [],
  exclusions = [],
  inclusionsText,
  exclusionsText,
  title = "What's Included & Excluded",
  subtitle = "Transparent pricing with zero hidden operational costs",
  inclusionsTitle = "Included in Package",
  exclusionsTitle = "Not Included",
}: PackageInclusionsProps) {
  const hasInclusionsHtml = isHtmlContent(inclusionsText);
  const hasExclusionsHtml = isHtmlContent(exclusionsText);

  const parsedInclusions = hasInclusionsHtml
    ? []
    : parsePlainTextList(inclusionsText, inclusions);
  const parsedExclusions = hasExclusionsHtml
    ? []
    : parsePlainTextList(exclusionsText, exclusions);

  const showInclusions = hasInclusionsHtml || parsedInclusions.length > 0;
  const showExclusions = hasExclusionsHtml || parsedExclusions.length > 0;

  if (!showInclusions && !showExclusions) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-stone-200">
        <h2 className="type-heading-xl">{title}</h2>
        {subtitle && <p className="type-body-sm mt-0.5">{subtitle}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
        {/* Inclusions Column */}
        {showInclusions && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="type-heading-md">{inclusionsTitle}</h3>
              {!hasInclusionsHtml && (
                <span className="type-caption">{parsedInclusions.length} items</span>
              )}
            </div>

            {hasInclusionsHtml ? (
              <div
                className="prose-editorial prose-inclusions max-w-none text-stone-700"
                dangerouslySetInnerHTML={{ __html: inclusionsText! }}
              />
            ) : (
              <ul className="space-y-2 text-xs sm:text-sm text-stone-700">
                {parsedInclusions.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check
                      className="w-3.5 h-3.5 text-emerald-800 shrink-0 mt-0.5"
                      strokeWidth={2.5}
                    />
                    <span className="type-body">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Exclusions Column */}
        {showExclusions && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="type-heading-md">{exclusionsTitle}</h3>
              {!hasExclusionsHtml && (
                <span className="type-caption">{parsedExclusions.length} items</span>
              )}
            </div>

            {hasExclusionsHtml ? (
              <div
                className="prose-editorial prose-exclusions max-w-none text-stone-600"
                dangerouslySetInnerHTML={{ __html: exclusionsText! }}
              />
            ) : (
              <ul className="space-y-2 text-xs sm:text-sm text-stone-600">
                {parsedExclusions.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Minus
                      className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5"
                      strokeWidth={2}
                    />
                    <span className="type-body text-stone-600">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
