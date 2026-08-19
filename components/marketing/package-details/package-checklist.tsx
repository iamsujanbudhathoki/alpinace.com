"use client";

import { Check, ClipboardList } from "lucide-react";

export interface ChecklistSection {
  title: string;
  items: string[];
  provided?: boolean;
}

export interface PackageChecklistProps {
  title?: string;
  subtitle?: string;
  sections: ChecklistSection[];
}

export function PackageChecklist({
  title = "Trekking Gear & Equipment Checklist",
  subtitle = "Recommended essentials for your high-altitude journey in the Himalayas",
  sections,
}: PackageChecklistProps) {
  if (!sections || sections.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-stone-200">
        <h2 className="type-heading-xl flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-emerald-800" strokeWidth={1.75} />
          <span>{title}</span>
        </h2>
        {subtitle && (
          <p className="type-body-sm mt-0.5">{subtitle}</p>
        )}
      </div>

      <div
        className={`grid gap-4 text-sm ${
          sections.length === 1
            ? "grid-cols-1"
            : sections.length === 2
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-1 sm:grid-cols-3"
        }`}
      >
        {sections.map((sec, idx) => (
          <div
            key={idx}
            className="p-4 bg-white border border-stone-200 rounded-xl space-y-3 shadow-2xs"
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
              <h4 className="type-heading-md text-stone-900">{sec.title}</h4>
              {sec.provided && (
                <span className="type-caption text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Provided by us
                </span>
              )}
            </div>
            <ul className="space-y-2 text-stone-700">
              {sec.items.map((item, i) => (
                <li key={i} className="flex items-center gap-2 type-body text-stone-700">
                  <div
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                      sec.provided
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-amber-50/50 border border-amber-200/60 text-amber-800"
                    }`}
                  >
                    <Check className="w-2.5 h-2.5" strokeWidth={3} />
                  </div>
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
