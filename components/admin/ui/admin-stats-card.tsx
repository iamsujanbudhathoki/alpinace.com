import React from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

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
    <div className="p-4 bg-white border border-slate-200/90 rounded-xl shadow-2xs space-y-2 relative overflow-hidden group hover:border-slate-300 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 tracking-tight">{label}</span>
        <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <div>
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{value}</div>
        {trendText && (
          <div
            className={`text-[11px] font-medium mt-1 ${
              trendType === "positive"
                ? "text-emerald-700"
                : trendType === "warning"
                ? "text-amber-700"
                : trendType === "negative"
                ? "text-rose-700"
                : "text-slate-600"
            }`}
          >
            {trendText}
          </div>
        )}
        {subtext && <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{subtext}</p>}
      </div>
    </div>
  );
}
