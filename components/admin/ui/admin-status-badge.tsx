import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  BookingPaymentStatus,
  BookingPermitStatus,
  BookingStatus,
  BookingStepStatus,
  BlogStatus,
  PackageStatus,
} from "@/lib/admin-data";

interface AdminStatusBadgeProps {
  status: string;
  className?: string;
}

export function AdminStatusBadge({ status, className = "" }: AdminStatusBadgeProps) {
  let styleClass = "bg-slate-100 text-slate-700 border-slate-200 font-medium";
  let dotClass = "bg-slate-400";

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
      styleClass = "bg-emerald-50 text-emerald-800 border-emerald-200/80 font-semibold";
      dotClass = "bg-emerald-500";
      break;
    case BookingStepStatus.ACTIVE:
    case BookingStepStatus.IN_PROGRESS.replace(/_/g, " "):
    case "in progress":
    case "on mountain":
      styleClass = "bg-blue-50 text-blue-800 border-blue-200/80 font-semibold";
      dotClass = "bg-blue-500";
      break;
    case BookingPaymentStatus.DEPOSIT_PAID.replace(/_/g, " "):
    case BookingPermitStatus.PROCESSING:
    case "new":
    case "featured":
    case "moderate":
      styleClass = "bg-amber-50 text-amber-800 border-amber-200/80 font-semibold";
      dotClass = "bg-amber-500";
      break;
    case BookingStatus.IN_REVIEW.replace(/_/g, " "):
    case "quote sent":
    case PackageStatus.DRAFT:
    case BookingStepStatus.PENDING:
    case BlogStatus.ARCHIVED:
    case "challenging":
      styleClass = "bg-slate-100 text-slate-700 border-slate-200 font-medium";
      dotClass = "bg-slate-400";
      break;
    case BookingStepStatus.CANCELLED:
    case BookingPaymentStatus.REFUNDED:
    case BookingPermitStatus.PENDING_DOCUMENT.replace(/_/g, " "):
    case "closed":
    case "strenuous":
    case "extreme":
      styleClass = "bg-rose-50 text-rose-800 border-rose-200/80 font-semibold";
      dotClass = "bg-rose-500";
      break;
  }

  // Friendly human label overrides for clean presentation
  const STATUS_LABEL_MAP: Record<string, string> = {
    [BookingStepStatus.IN_PROGRESS]: "In Progress",
    [BookingStepStatus.IN_PROGRESS.replace(/_/g, " ")]: "In Progress",
    [BookingStatus.IN_REVIEW]: "In Review",
    [BookingStatus.IN_REVIEW.replace(/_/g, " ")]: "In Review",
    [BookingStepStatus.PENDING]: "Pending",
    [BookingStepStatus.ACTIVE]: "Active",
    [BookingPermitStatus.PENDING_DOCUMENT]: "Docs Pending",
    [BookingPermitStatus.PENDING_DOCUMENT.replace(/_/g, " ")]: "Docs Pending",
    [BookingPaymentStatus.DEPOSIT_PAID]: "Deposit Paid",
    [BookingPaymentStatus.DEPOSIT_PAID.replace(/_/g, " ")]: "Deposit Paid",
  };

  const displayLabel =
    STATUS_LABEL_MAP[normalized] ||
    STATUS_LABEL_MAP[raw.toLowerCase()] ||
    (raw.includes("_")
      ? raw
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : raw.charAt(0).toUpperCase() + raw.slice(1));

  return (
    <Badge variant="outline" className={`text-[11px] px-2 py-0.5 inline-flex items-center gap-1.5 rounded-md border shadow-2xs ${styleClass} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
      <span>{displayLabel}</span>
    </Badge>
  );
}
