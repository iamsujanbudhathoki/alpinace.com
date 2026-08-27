import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AdminFilterBarProps {
  searchValue: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
}

export function AdminFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  children,
}: AdminFilterBarProps) {
  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3">
      <div className="relative w-full md:w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9 text-xs font-medium text-slate-900 placeholder:text-slate-400 bg-slate-50/80 border-slate-200 focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-400/10 rounded-lg h-9"
        />
      </div>

      {children && (
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {children}
        </div>
      )}
    </div>
  );
}
