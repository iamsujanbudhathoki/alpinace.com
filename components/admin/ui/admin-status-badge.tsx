import React from "react";
import { Badge } from "@/components/ui/badge";

interface AdminStatusBadgeProps {
  status: string;
  className?: string;
}

export function AdminStatusBadge({ status, className = "" }: AdminStatusBadgeProps) {
  let styleClass = "bg-slate-100 text-slate-700 border-slate-200";

  switch (status) {
    case "Confirmed":
    case "Active":
    case "Paid":
    case "Issued":
    case "Available":
    case "Booked":
      styleClass = "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold";
      break;
    case "Deposit Paid":
    case "Active Trek":
    case "Featured":
    case "Processing":
    case "On Mountain":
    case "New":
      styleClass = "bg-amber-50 text-amber-800 border-amber-200 font-semibold";
      break;
    case "In Review":
    case "Quote Sent":
    case "Draft":
    case "Pending":
      styleClass = "bg-purple-50 text-purple-700 border-purple-200 font-semibold";
      break;
    case "Cancelled":
    case "Closed":
    case "Refunded":
      styleClass = "bg-red-50 text-red-700 border-red-200 font-semibold";
      break;
  }

  return (
    <Badge variant="outline" className={`text-[10px] px-2.5 py-0.5 ${styleClass} ${className}`}>
      {status}
    </Badge>
  );
}
