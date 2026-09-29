"use client";

import React from "react";

interface AuditActionBadgeProps {
  action: string;
  success?: boolean;
  className?: string;
}

export function AuditActionBadge({
  action,
  success = true,
  className = "",
}: AuditActionBadgeProps) {
  if (!success) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200/80 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
        <span>{action}</span>
      </span>
    );
  }

  let styleClass = "bg-slate-100 text-slate-700 border-slate-200 font-medium";
  let dotClass = "bg-slate-400";

  const upper = action.toUpperCase();

  if (upper === "SYSTEM_BACKUP") {
    styleClass = "bg-amber-50 text-amber-800 border-amber-200/80 font-semibold";
    dotClass = "bg-amber-500";
  } else if (upper.includes("CREATE")) {
    styleClass = "bg-emerald-50 text-emerald-800 border-emerald-200/80 font-semibold";
    dotClass = "bg-emerald-500";
  } else if (upper.includes("DELETE")) {
    styleClass = "bg-rose-50 text-rose-800 border-rose-200/80 font-semibold";
    dotClass = "bg-rose-500";
  } else if (upper.includes("UPDATE") || upper.includes("STATUS")) {
    styleClass = "bg-blue-50 text-blue-800 border-blue-200/80 font-semibold";
    dotClass = "bg-blue-500";
  } else if (upper.includes("LOGIN") || upper.includes("AUTH") || upper.includes("PASSWORD")) {
    styleClass = "bg-purple-50 text-purple-800 border-purple-200/80 font-semibold";
    dotClass = "bg-purple-500";
  }

  // Friendly label
  const label = action.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] border ${styleClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
      <span>{label}</span>
    </span>
  );
}

interface AuditStatusBadgeProps {
  success: boolean;
  className?: string;
}

export function AuditStatusBadge({
  success,
  className = "",
}: AuditStatusBadgeProps) {
  if (success) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
        <span>Success</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200/80 ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
      <span>Failed</span>
    </span>
  );
}
