import React from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
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
    <Card className="p-4 bg-white border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="relative w-full md:w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-700" />
        <Input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9 text-xs font-semibold text-slate-900 placeholder:text-slate-500 bg-slate-50 border-slate-200 focus:bg-white"
        />
      </div>

      {children && (
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {children}
        </div>
      )}
    </Card>
  );
}
