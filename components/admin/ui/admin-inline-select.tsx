"use client";

import React, { useState, useId } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InlineSelectOption {
  value: string;
  label: string;
  badgeStyle?: string;
  icon?: React.ReactNode;
}

interface AdminInlineSelectProps {
  value?: string;
  options: InlineSelectOption[];
  onChange: (newValue: string) => Promise<boolean | void> | boolean | void;
  disabled?: boolean;
  variant?: "badge" | "category" | "subtle";
  placeholder?: string;
  className?: string;
  title?: string;
}

export function getStatusBadgeStyle(status?: string): string {
  const raw = status || "";
  const normalized = raw.toLowerCase().replace(/_/g, " ");

  switch (normalized) {
    case "confirmed":
    case "active":
    case "paid":
    case "issued":
    case "available":
    case "booked":
    case "published":
    case "easy":
      return "bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100/80 hover:border-emerald-400";
    case "deposit paid":
    case "deposit_paid":
    case "active trek":
    case "active_trek":
    case "featured":
    case "processing":
    case "on mountain":
    case "new":
    case "moderate":
      return "bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100/80 hover:border-amber-400";
    case "in review":
    case "in_review":
    case "quote sent":
    case "quote_sent":
    case "draft":
    case "pending":
    case "archived":
    case "challenging":
      return "bg-purple-50 text-purple-950 border-purple-300 hover:bg-purple-100/80 hover:border-purple-400";
    case "cancelled":
    case "closed":
    case "refunded":
    case "pending document":
    case "pending_document":
    case "strenuous":
    case "extreme":
      return "bg-rose-50 text-rose-950 border-rose-300 hover:bg-rose-100/80 hover:border-rose-400";
    default:
      return "bg-slate-50 text-slate-900 border-slate-200 hover:bg-slate-100 hover:border-slate-300";
  }
}

export function getCategoryBadgeStyle(category?: string): string {
  const raw = (category || "").toLowerCase();
  if (raw.includes("trek")) {
    return "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100/80 hover:border-amber-300";
  }
  if (raw.includes("expedition") || raw.includes("peak") || raw.includes("climb")) {
    return "bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100/80 hover:border-rose-300";
  }
  if (raw.includes("tour") || raw.includes("sightseeing") || raw.includes("cultural")) {
    return "bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100/80 hover:border-blue-300";
  }
  return "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100 hover:border-slate-300";
}

export function AdminInlineSelect({
  value,
  options,
  onChange,
  disabled = false,
  variant = "badge",
  placeholder = "Select...",
  className = "",
  title,
}: AdminInlineSelectProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const selectId = useId();

  const selectedOption = value ? options.find((opt) => opt.value === value) : undefined;
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    // Allow onChange to be called even if the selected value is the same as the current value.
    // This ensures that the change handler runs in cases where there is only a single selectable option.


    setIsUpdating(true);
    try {
      const success = await onChange(newValue);
      if (success === false) {
        // Revert back
        if (value !== undefined) e.target.value = value;
      }
    } catch (err) {
      console.error("Inline edit failed:", err);
      if (value !== undefined) e.target.value = value;
    } finally {
      setIsUpdating(false);
    }
  };

  let variantStyle = "";
  if (variant === "badge") {
    variantStyle = getStatusBadgeStyle(value);
  } else if (variant === "category") {
    variantStyle = getCategoryBadgeStyle(displayLabel);
  } else {
    variantStyle = "bg-white text-slate-800 border-slate-200 hover:border-slate-300";
  }

  return (
    <div
      className={cn(
        "relative inline-flex items-center group/select max-w-full",
        disabled && "opacity-60 cursor-not-allowed",
        className
      )}
      onClick={(e) => e.stopPropagation()}
      title={title || `Click to change (currently ${displayLabel})`}
    >
      {/* Display Badge Trigger */}
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all duration-150 shadow-2xs whitespace-nowrap cursor-pointer select-none",
          variantStyle,
          isUpdating && "opacity-75 pointer-events-none"
        )}
      >
        {isUpdating ? (
          <Loader2 className="w-3 h-3 animate-spin shrink-0 text-current opacity-80" />
        ) : (
          selectedOption?.icon
        )}
        <span className="truncate max-w-[140px] capitalize">{displayLabel}</span>
        <ChevronDown className="w-3 h-3 opacity-60 group-hover/select:opacity-100 group-hover/select:translate-y-0.5 transition-all shrink-0 ml-0.5" />
      </div>

      {/* Transparent native select overlay for seamless accessible interaction */}
      <select
        id={selectId}
        value={value || ""}
        disabled={disabled || isUpdating}
        onChange={handleChange}
        aria-label={title || "Select value"}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed text-xs"
      >
        {(!value && options.length > 0) && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="text-slate-900 bg-white py-1">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
