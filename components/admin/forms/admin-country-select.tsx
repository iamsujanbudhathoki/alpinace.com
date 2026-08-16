"use client";

import React, { useMemo } from "react";
import { COUNTRY_LIST } from "@/lib/country-list";
import { AdminSearchableSelect, SearchableSelectOption } from "./admin-searchable-select";
import { Globe } from "lucide-react";

export interface AdminCountrySelectProps {
  label?: string;
  value?: string;
  onChange: (countryName: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export function AdminCountrySelect({
  label = "Country",
  value = "",
  onChange,
  error,
  required = false,
  placeholder = "Select or search country...",
  className = "",
}: AdminCountrySelectProps) {
  // Map country list to SearchableSelectOption format
  const countryOptions: SearchableSelectOption[] = useMemo(() => {
    return COUNTRY_LIST.map((c) => ({
      value: c.name,
      label: c.name,
      badge: c.code,
      badgeColor: "bg-amber-100 text-amber-900 border-amber-200",
      icon: <Globe className="w-3.5 h-3.5 text-slate-400" />,
    }));
  }, []);

  return (
    <AdminSearchableSelect
      label={label}
      value={value}
      options={countryOptions}
      onChange={(selectedVal) => onChange(selectedVal)}
      error={error}
      required={required}
      placeholder={placeholder}
      searchPlaceholder="Search 240+ countries by name or code..."
      className={className}
      emptyText="No country found"
      renderTriggerValue={(selectedOpt, val) => (
        <div className="flex items-center gap-2 truncate">
          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {selectedOpt ? (
            <>
              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-200 shrink-0">
                {selectedOpt.badge}
              </span>
              <span className="text-slate-900 font-semibold truncate">{selectedOpt.label}</span>
            </>
          ) : val ? (
            <span className="text-slate-900 font-semibold truncate">{val}</span>
          ) : (
            <span className="text-slate-400 font-normal truncate">{placeholder}</span>
          )}
        </div>
      )}
    />
  );
}
