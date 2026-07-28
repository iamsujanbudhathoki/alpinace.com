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
  iconColorClass = "bg-emerald-50 border-emerald-200 text-emerald-600",
}: AdminStatsCardProps) {
  return (
    <Card className="p-5 bg-white border-slate-200 shadow-xs space-y-3 relative overflow-hidden group hover:border-slate-300 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700">{label}</span>
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${iconColorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-extrabold text-slate-900">{value}</div>
        {trendText && (
          <div
            className={`text-xs font-bold mt-1 ${
              trendType === "positive"
                ? "text-emerald-700"
                : trendType === "warning"
                ? "text-amber-700"
                : trendType === "negative"
                ? "text-red-700"
                : "text-slate-700"
            }`}
          >
            {trendText}
          </div>
        )}
        {subtext && <p className="text-xs text-slate-600 mt-1 font-medium">{subtext}</p>}
      </div>
    </Card>
  );
}
