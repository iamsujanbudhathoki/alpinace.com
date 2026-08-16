"use client";

import React, { useState, useRef, useEffect, useMemo, ReactNode } from "react";
import { FormLabel } from "@/components/ui/form-label";
import { Search, ChevronDown, Check, X } from "lucide-react";

export interface SearchableSelectOption {
  value: string;
  label: string;
  badge?: string;
  badgeColor?: string;
  description?: string;
  icon?: ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
}

export interface AdminSearchableSelectProps {
  label?: string;
  value?: string;
  options: SearchableSelectOption[];
  onChange: (value: string, selectedOption?: SearchableSelectOption | null) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
  className?: string;
  emptyText?: string;
  renderOption?: (option: SearchableSelectOption, isSelected: boolean) => ReactNode;
  renderTriggerValue?: (selectedOption: SearchableSelectOption | null, value: string) => ReactNode;
}

export function AdminSearchableSelect({
  label,
  value = "",
  options = [],
  onChange,
  error,
  required = false,
  placeholder = "Select or search...",
  searchPlaceholder = "Search options...",
  allowClear = true,
  disabled = false,
  className = "",
  emptyText = "No matching options found",
  renderOption,
  renderTriggerValue,
}: AdminSearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Filter options by search query
  const filteredOptions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return options;
    return options.filter((opt) => {
      const matchLabel = opt.label.toLowerCase().includes(q);
      const matchValue = opt.value.toLowerCase().includes(q);
      const matchBadge = opt.badge ? opt.badge.toLowerCase().includes(q) : false;
      const matchDesc = opt.description ? opt.description.toLowerCase().includes(q) : false;
      return matchLabel || matchValue || matchBadge || matchDesc;
    });
  }, [options, searchQuery]);

  // Find currently selected option object
  const selectedOption = useMemo(() => {
    if (!value) return null;
    return options.find((opt) => opt.value === value || opt.label.toLowerCase() === value.toLowerCase()) || null;
  }, [options, value]);

  const handleSelect = (option: SearchableSelectOption) => {
    onChange(option.value, option);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("", null);
    setSearchQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className={`space-y-1 relative ${className}`} ref={containerRef} onKeyDown={handleKeyDown}>
      {label && <FormLabel required={required}>{label}</FormLabel>}

      {/* Main Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-slate-50/50 border ${
          error
            ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
            : isOpen
            ? "border-amber-500 ring-2 ring-amber-500/20 bg-white"
            : "border-slate-200 hover:border-slate-300 focus:border-amber-500 focus:ring-amber-500/20"
        } ${
          disabled ? "opacity-60 cursor-not-allowed bg-slate-100" : "cursor-pointer"
        } rounded-xl px-3 py-2 text-xs font-medium text-left transition-all`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 truncate flex-1 min-w-0">
          {renderTriggerValue ? (
            renderTriggerValue(selectedOption, value)
          ) : selectedOption ? (
            <>
              {selectedOption.icon && <span className="shrink-0">{selectedOption.icon}</span>}
              {selectedOption.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${
                    selectedOption.badgeColor || "bg-amber-100 text-amber-900 border-amber-200"
                  }`}
                >
                  {selectedOption.badge}
                </span>
              )}
              <span className="text-slate-900 font-semibold truncate">{selectedOption.label}</span>
            </>
          ) : value ? (
            <span className="text-slate-900 font-semibold truncate">{value}</span>
          ) : (
            <span className="text-slate-400 font-normal truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {allowClear && value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-amber-600" : ""
            }`}
          />
        </div>
      </button>

      {error && <p className="text-xs font-semibold text-rose-600 mt-0.5">{error}</p>}

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-950/10 p-1.5 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto overscroll-contain space-y-0.5 pr-0.5 text-xs">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-slate-500 text-xs font-medium">
                {emptyText} {searchQuery ? `for "${searchQuery}"` : ""}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected =
                  value === opt.value || value.toLowerCase() === opt.label.toLowerCase();

                if (renderOption) {
                  return (
                    <div
                      key={opt.value}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelect(opt)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelect(opt);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      {renderOption(opt, isSelected)}
                    </div>
                  );
                }

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-amber-50 text-amber-900 font-bold"
                        : "hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate min-w-0 pr-2">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      {opt.badge && (
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold border shrink-0 ${
                            isSelected
                              ? "bg-amber-200 text-amber-900 border-amber-300"
                              : opt.badgeColor || "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {opt.badge}
                        </span>
                      )}
                      <div className="truncate min-w-0">
                        <span className="truncate block font-medium">{opt.label}</span>
                        {opt.description && (
                          <span className="text-[10px] text-slate-500 truncate block font-normal">
                            {opt.description}
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
