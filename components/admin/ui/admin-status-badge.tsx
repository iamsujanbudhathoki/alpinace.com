import React from "react";
import { Badge } from "@/components/ui/badge";

interface AdminStatusBadgeProps {
  status: string;
  className?: string;
}

export function AdminStatusBadge({ status, className = "" }: AdminStatusBadgeProps) {
  let styleClass = "bg-slate-100 text-slate-950 border-slate-300 font-extrabold";

  switch (status) {
    case "Confirmed":
    case "Active":
    case "Paid":
    case "Issued":
    case "Available":
    case "Booked":
      styleClass = "bg-emerald-50 text-emerald-950 border-emerald-300 font-extrabold";
      break;
    case "Deposit Paid":
    case "Active Trek":
    case "Featured":
    case "Processing":
    case "On Mountain":
    case "New":
      styleClass = "bg-amber-50 text-amber-950 border-amber-300 font-extrabold";
      break;
    case "In Review":
    case "Quote Sent":
    case "Draft":
    case "Pending":
      styleClass = "bg-purple-50 text-purple-950 border-purple-300 font-extrabold";
      break;
    case "Cancelled":
    case "Closed":
    case "Refunded":
      styleClass = "bg-rose-50 text-rose-950 border-rose-300 font-extrabold";
      break;
  }

  return (
    <Badge variant="outline" className={`text-xs px-2.5 py-0.5 ${styleClass} ${className}`}>
      {status}
    </Badge>
  );
}
