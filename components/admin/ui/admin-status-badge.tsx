import React from "react";
import { Badge } from "@/components/ui/badge";

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
    case "confirmed":
    case "active":
    case "paid":
    case "issued":
    case "available":
    case "booked":
    case "published":
    case "easy":
      styleClass = "bg-emerald-50 text-emerald-800 border-emerald-200/80 font-semibold";
      dotClass = "bg-emerald-500";
      break;
    case "deposit paid":
    case "active trek":
    case "featured":
    case "processing":
    case "on mountain":
    case "new":
    case "moderate":
      styleClass = "bg-amber-50 text-amber-800 border-amber-200/80 font-semibold";
      dotClass = "bg-amber-500";
      break;
    case "in review":
    case "quote sent":
    case "draft":
    case "pending":
    case "archived":
    case "challenging":
      styleClass = "bg-slate-100 text-slate-700 border-slate-200 font-medium";
      dotClass = "bg-slate-400";
      break;
    case "cancelled":
    case "closed":
    case "refunded":
    case "pending document":
    case "strenuous":
    case "extreme":
      styleClass = "bg-rose-50 text-rose-800 border-rose-200/80 font-semibold";
      dotClass = "bg-rose-500";
      break;
  }

  // Format label for display if it's snake_case or lowercase
  const displayLabel = raw.includes("_")
    ? raw
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : raw.charAt(0).toUpperCase() + raw.slice(1);

  return (
    <Badge variant="outline" className={`text-[11px] px-2 py-0.5 inline-flex items-center gap-1.5 capitalize rounded-md border shadow-2xs ${styleClass} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
      <span>{displayLabel}</span>
    </Badge>
  );
}
