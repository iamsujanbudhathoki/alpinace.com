"use client";

import React, { useState, useRef, useEffect, useMemo, ReactNode } from "react";
import { FormLabel } from "@/components/ui/form-label";
import { Search, ChevronDown, Check, X } from "lucide-react";

export interface SearchableMultiSelectOption {
  value: string;
  label: string;
  badge?: string;
  badgeColor?: string;
  description?: string;
  icon?: ReactNode;
}

export interface AdminSearchableMultiSelectProps {
  label?: string;
  values?: string[];
  options: SearchableMultiSelectOption[];
  onChange: (values: string[]) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  emptyText?: string;
}

export function AdminSearchableMultiSelect({
  label,
  values = [],
  options = [],
  onChange,
  error,
  required = false,
  placeholder = "Select options...",
  searchPlaceholder = "Search options...",
  disabled = false,
  className = "",
  emptyText = "No matching options found",
}: AdminSearchableMultiSelectProps) {
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
      return matchLabel || matchValue;
    });
  }, [options, searchQuery]);

  // Selected option objects
  const selectedOptions = useMemo(() => {
    const valSet = new Set(values);
    return options.filter((opt) => valSet.has(opt.value));
  }, [options, values]);

  const handleToggleOption = (optValue: string) => {
    if (disabled) return;
    if (values.includes(optValue)) {
      onChange(values.filter((v) => v !== optValue));
    } else {
      onChange([...values, optValue]);
    }
  };

  const handleRemoveValue = (e: React.MouseEvent, optValue: string) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(values.filter((v) => v !== optValue));
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange([]);
  };

  return (
    <div className={`space-y-1 relative ${className}`} ref={containerRef}>
      {label && <FormLabel required={required}>{label}</FormLabel>}

      {/* Main Trigger & Selected Chips Display */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={`w-full flex items-center justify-between min-h-[42px] bg-slate-50/50 border ${
          error
            ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
            : isOpen
            ? "border-stone-900 ring-2 ring-stone-900/10 bg-white"
            : "border-slate-200 hover:border-slate-300"
        } ${
          disabled ? "opacity-60 cursor-not-allowed bg-slate-100" : "cursor-pointer"
        } rounded-xl px-3 py-2 text-xs font-medium text-left transition-all outline-none gap-2`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          {selectedOptions.length > 0 ? (
            selectedOptions.map((opt) => (
              <span
                key={opt.value}
                className="inline-flex items-center gap-1 bg-stone-900 text-white text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors"
              >
                <span>{opt.label}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => handleRemoveValue(e, opt.value)}
                    className="hover:text-stone-300 p-0.5 rounded transition-colors cursor-pointer"
                    title={`Remove ${opt.label}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))
          ) : (
            <span className="text-slate-400 font-normal py-0.5">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {values.length > 0 && !disabled && (
            <button
              type="button"
              onClick={handleClearAll}
              className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Clear all selections"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
              isOpen ? "rotate-180 text-slate-700" : ""
            }`}
          />
        </div>
      </div>

      {error && <p className="text-xs font-semibold text-rose-600 mt-0.5">{error}</p>}

      {/* Dropdown Menu Overlay */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
          {/* Search Box inside dropdown */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto p-1 text-xs custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-slate-500 text-xs font-medium">
                {emptyText} {searchQuery ? `for "${searchQuery}"` : ""}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = values.includes(opt.value);

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleToggleOption(opt.value)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-stone-100 text-stone-900 font-bold"
                        : "hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate min-w-0 pr-2">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                          isSelected
                            ? "bg-stone-900 border-stone-900 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="truncate block font-medium">{opt.label}</span>
                    </div>

                    {isSelected && (
                      <span className="text-[10px] font-semibold text-stone-600 uppercase tracking-wider">
                        Selected
                      </span>
                    )}
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
