"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";
import { FilterSidebarSkeleton } from "@/components/marketing/skeletons/filter-sidebar-skeleton";

export interface CategoryOption {
  label: string;
  value: string;
  id?: string;
  name?: string;
  slug?: string;
}

interface SearchableCategorySelectProps {
  label?: string;
  categories?: CategoryOption[];
  selectedCategory: string;
  onSelectCategory: (value: string) => void;
  totalCount?: number;
  loadingOptions?: boolean;
  placeholder?: string;
  className?: string;
}

export function SearchableCategorySelect({
  label = "Category",
  categories = [],
  selectedCategory,
  onSelectCategory,
  totalCount,
  loadingOptions = false,
  placeholder = "Search category...",
  className = "",
}: SearchableCategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loadingOptions) {
    return <FilterSidebarSkeleton />;
  }

  const hasAllOption = categories.some((c) => c.value === "All");
  const categoryList: CategoryOption[] = hasAllOption
    ? categories
    : [{ label: "All Categories", value: "All" }, ...categories];

  const currentCategoryObj = categoryList.find(
    (c) => c.value.toLowerCase() === selectedCategory.toLowerCase()
  );
  const selectedLabel = currentCategoryObj
    ? currentCategoryObj.label
    : "All Categories";

  const filteredCategories = categoryList.filter((cat) =>
    cat.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full text-left text-xs bg-slate-50 hover:bg-white border border-slate-200 focus:border-slate-400 focus:bg-white rounded-lg px-3 py-2.5 flex items-center justify-between text-slate-900 font-medium shadow-2xs transition-all cursor-pointer"
        >
          <span className="truncate pr-2 font-semibold text-slate-800">
            {selectedLabel}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {selectedCategory === "All" && typeof totalCount === "number" && (
              <span className="text-[10px] font-bold text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded-full">
                {totalCount}
              </span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-2 animate-in fade-in slide-in-from-top-1 duration-150 space-y-1.5">
            {/* Search Input inside Dropdown */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={placeholder}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md pl-7 pr-2.5 py-1.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-600 transition-all"
                autoFocus
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filtered Category Items List */}
            <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar pr-0.5">
              {filteredCategories.length === 0 ? (
                <p className="text-[11px] text-slate-400 text-center py-3">
                  No matching categories found
                </p>
              ) : (
                filteredCategories.map((cat) => {
                  const isSelected =
                    selectedCategory.toLowerCase() === cat.value.toLowerCase();
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => {
                        onSelectCategory(cat.value);
                        setSearchTerm("");
                        setIsOpen(false);
                      }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-amber-50 text-amber-900 font-bold"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <span className="truncate pr-1">{cat.label}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
