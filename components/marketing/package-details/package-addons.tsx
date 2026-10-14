"use client";

import { useMemo } from "react";
import { Sparkles, Plus, Check } from "lucide-react";
import { hasRichText, isHtmlContent } from "@/lib/utils";
import { PackageSection } from "./package-section";

interface PackageAddonsProps {
  addonsText?: string;
}

interface AddonCardItem {
  title: string;
  price?: string;
  description?: string;
}

function parseAddons(rawText?: string): AddonCardItem[] {
  if (!rawText || !hasRichText(rawText)) return [];

  // Match list items from HTML or plain lines
  const rawItems: string[] = [];
  const liMatches = rawText.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
  if (liMatches && liMatches.length > 0) {
    for (const li of liMatches) {
      const cleaned = li.replace(/<\/?li[^>]*>/gi, "").trim();
      if (hasRichText(cleaned)) rawItems.push(cleaned);
    }
  } else {
    const lines = rawText.split(/\n+/);
    for (const line of lines) {
      const cleaned = line.replace(/^[-*•\d.]+\s*/, "").trim();
      if (hasRichText(cleaned)) rawItems.push(cleaned);
    }
  }

  if (rawItems.length === 0) return [];

  const parsed: AddonCardItem[] = [];

  for (const item of rawItems) {
    // Strip inner strong tags while capturing content
    const plain = item.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (!plain) continue;

    // Pattern 1: Title (with price in parentheses): Description
    // e.g. "Helicopter Return ($950 USD): Skip the 3-day descent..."
    let match = plain.match(/^(.+?)\s*\(([\$\d,]+(?:\s*[A-Z]{3})?(?:\s*per\s*[a-z]+)?)\)\s*[:–-]\s*(.+)$/i);
    if (match) {
      parsed.push({
        title: match[1].trim(),
        price: match[2].trim(),
        description: match[3].trim(),
      });
      continue;
    }

    // Pattern 2: Title: $Price - Description or Title - $Price (Description)
    // e.g. "Single Room Supplement: $120 USD. Private boutique room in Kathmandu."
    match = plain.match(/^(.+?)\s*[:–-]\s*([\$\d,]+(?:\s*[A-Z]{3})?(?:\s*(?:each|per person|total))?)\s*[.–-]?\s*(.*)$/i);
    if (match) {
      parsed.push({
        title: match[1].trim(),
        price: match[2].trim(),
        description: match[3].trim() || undefined,
      });
      continue;
    }

    // Pattern 3: Title containing price at the end
    // e.g. "Sarangkot Sunrise Paragliding Flight in Pokhara: $95 USD"
    match = plain.match(/^(.+?)\s*[:–-]\s*([\$\d,]+(?:\s*[A-Z]{3})?.*)$/i);
    if (match) {
      parsed.push({
        title: match[1].trim(),
        price: match[2].trim(),
      });
      continue;
    }

    // Fallback: Just display title
    parsed.push({
      title: plain,
    });
  }

  return parsed;
}

export function PackageAddons({ addonsText }: PackageAddonsProps) {
  if (!hasRichText(addonsText)) return null;

  const parsedItems = useMemo(() => parseAddons(addonsText), [addonsText]);

  return (
    <PackageSection
      icon={Sparkles}
      eyebrow="Make it yours"
      title="Add-ons & optional upgrades"
    >
      {parsedItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-1">
          {parsedItems.map((item, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col justify-between p-4 rounded-md border border-stone-200/90 bg-white hover:border-stone-400 hover:shadow-xs transition-all duration-200"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                      <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </div>
                    <h4 className="text-xs sm:text-sm font-semibold text-stone-900 leading-snug">
                      {item.title}
                    </h4>
                  </div>
                  {item.price && (
                    <span className="shrink-0 inline-flex items-center text-[11px] sm:text-xs font-bold text-amber-900 bg-amber-50/80 border border-amber-200/70 px-2 py-0.5 rounded-xs">
                      {item.price}
                    </span>
                  )}
                </div>

                {item.description && (
                  <p className="text-xs sm:text-[13px] text-stone-600 font-normal leading-relaxed pl-7">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="prose-editorial max-w-none"
          dangerouslySetInnerHTML={{ __html: addonsText! }}
        />
      )}
    </PackageSection>
  );
}

