import React from "react";
import { Badge } from "@/components/ui/badge";

interface AdminStatusBadgeProps {
  status: string;
  className?: string;
}

export function AdminStatusBadge({ status, className = "" }: AdminStatusBadgeProps) {
  let styleClass = "bg-slate-100 text-slate-950 border-slate-300 font-extrabold";

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
      styleClass = "bg-emerald-50 text-emerald-950 border-emerald-300 font-extrabold";
      break;
    case "deposit paid":
    case "active trek":
    case "featured":
    case "processing":
    case "on mountain":
    case "new":
    case "moderate":
      styleClass = "bg-amber-50 text-amber-950 border-amber-300 font-extrabold";
      break;
    case "in review":
    case "quote sent":
    case "draft":
    case "pending":
    case "archived":
    case "challenging":
      styleClass = "bg-purple-50 text-purple-950 border-purple-300 font-extrabold";
      break;
    case "cancelled":
    case "closed":
    case "refunded":
    case "pending document":
    case "strenuous":
    case "extreme":
      styleClass = "bg-rose-50 text-rose-950 border-rose-300 font-extrabold";
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
    <Badge variant="outline" className={`text-xs px-2.5 py-0.5 capitalize ${styleClass} ${className}`}>
      {displayLabel}
    </Badge>
  );
}
