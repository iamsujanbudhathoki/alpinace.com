"use client";

import React, { useState, useId } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BookingPaymentStatus,
  BookingPermitStatus,
  BookingStatus,
  BookingStepStatus,
  BlogStatus,
  PackageStatus,
} from "@/lib/admin-data";

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
    case BookingStatus.CONFIRMED:
    case BookingStepStatus.COMPLETED:
    case BookingPaymentStatus.PAID:
    case BookingPermitStatus.ISSUED:
    case BlogStatus.PUBLISHED:
    case "booked":
    case "available":
    case "easy":
      return "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/80 hover:border-emerald-300 font-semibold";
    case BookingStepStatus.ACTIVE:
    case BookingStepStatus.IN_PROGRESS.replace(/_/g, " "):
    case "in progress":
    case "on mountain":
      return "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100/80 hover:border-blue-300 font-semibold";
    case BookingPaymentStatus.DEPOSIT_PAID.replace(/_/g, " "):
    case BookingPaymentStatus.DEPOSIT_PAID:
    case BookingPermitStatus.PROCESSING:
    case "new":
    case "featured":
    case "moderate":
      return "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200/60 hover:border-slate-300 font-semibold";
    case BookingStatus.IN_REVIEW.replace(/_/g, " "):
    case BookingStatus.IN_REVIEW:
    case "quote sent":
    case PackageStatus.DRAFT:
    case BookingStepStatus.PENDING:
    case BlogStatus.ARCHIVED:
    case "challenging":
      return "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/60 hover:border-slate-300 font-medium";
    case BookingStepStatus.CANCELLED:
    case "closed":
    case BookingPaymentStatus.REFUNDED:
    case BookingPermitStatus.PENDING_DOCUMENT.replace(/_/g, " "):
    case BookingPermitStatus.PENDING_DOCUMENT:
    case "strenuous":
    case "extreme":
      return "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100/80 hover:border-rose-300 font-semibold";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/60 hover:border-slate-300 font-medium";
  }
}

export function getCategoryBadgeStyle(category?: string): string {
  return "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/70 hover:border-slate-300 font-semibold";
}

import { normalizeSelectValue } from "@/components/admin/forms/admin-searchable-select";

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

  const normalizedVal = normalizeSelectValue(value);
  const selectedOption = normalizedVal
    ? options.find(
        (opt) =>
          opt.value === normalizedVal ||
          String(opt.value).toLowerCase() === normalizedVal.toLowerCase() ||
          opt.label.toLowerCase() === normalizedVal.toLowerCase()
      )
    : undefined;
  const displayLabel = selectedOption ? selectedOption.label : (normalizedVal || placeholder);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setIsUpdating(true);
    try {
      const success = await onChange(newValue);
      if (success === false) {
        if (value !== undefined) e.target.value = normalizedVal;
      }
    } catch (err) {
      console.error("Inline edit failed:", err);
      if (value !== undefined) e.target.value = normalizedVal;
    } finally {
      setIsUpdating(false);
    }
  };

  let variantStyle = "";
  if (variant === "badge") {
    variantStyle = getStatusBadgeStyle(normalizedVal);
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
