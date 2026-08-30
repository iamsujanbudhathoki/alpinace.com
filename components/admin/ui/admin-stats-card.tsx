import React from "react";
import { LucideIcon } from "lucide-react";

interface AdminStatsCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  trendText?: string;
  trendType?: "positive" | "negative" | "warning" | "neutral";
  iconColorClass?: string;
}

export function AdminStatsCard({
  label,
  value,
  subtext,
  icon: Icon,
  trendText,
  trendType = "positive",
}: AdminStatsCardProps) {
  return (
    <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-2 relative overflow-hidden transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700">{label}</span>
        <div className="w-8 h-8 rounded-md bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold tracking-tight text-slate-900">{value}</div>
        {trendText && (
          <div
            className={`text-[11px] font-medium mt-1 ${
              trendType === "positive"
                ? "text-emerald-700"
                : trendType === "warning"
                ? "text-amber-700"
                : trendType === "negative"
                ? "text-rose-700"
                : "text-slate-700"
            }`}
          >
            {trendText}
          </div>
        )}
        {subtext && <p className="text-[11px] text-slate-600 mt-0.5 font-normal">{subtext}</p>}
      </div>
    </div>
  );
}
