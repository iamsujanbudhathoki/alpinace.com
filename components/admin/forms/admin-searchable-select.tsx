"use client";

import React, { useState, useRef, useEffect, useMemo, ReactNode, useId } from "react";
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

export function normalizeSelectValue(val: any): string {
  if (val === undefined || val === null) return "";
  if (typeof val === "object") {
    if (val.target && typeof val.target.value !== "undefined") {
      return String(val.target.value);
    }
    if (typeof val.value !== "undefined") {
      return String(val.value);
    }
  }
  return String(val);
}

export interface AdminSearchableSelectProps {
  label?: string;
  value?: string;
  defaultValue?: string;
  options: SearchableSelectOption[];
  onChange?: (value: string, selectedOption?: SearchableSelectOption | null) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  searchable?: boolean;
  allowClear?: boolean;
  disabled?: boolean;
  className?: string;
  emptyText?: string;
  renderOption?: (option: SearchableSelectOption, isSelected: boolean) => ReactNode;
  renderTriggerValue?: (selectedOption: SearchableSelectOption | null, value: string) => ReactNode;
}

export function AdminSearchableSelect({
  label,
  value: valueProp,
  defaultValue,
  options = [],
  onChange,
  error,
  required = false,
  placeholder = "Select or search...",
  searchPlaceholder = "Search options...",
  searchable = true,
  allowClear = true,
  disabled = false,
  className = "",
  emptyText = "No matching options found",
  renderOption,
  renderTriggerValue,
}: AdminSearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [internalValue, setInternalValue] = useState<string>(defaultValue || "");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const labelId = useId();
  const errorId = useId();

  // Controlled if valueProp is defined, otherwise uncontrolled via internalValue
  const rawValue = valueProp !== undefined ? valueProp : internalValue;
  const normalizedValue = useMemo(() => normalizeSelectValue(rawValue), [rawValue]);

  useEffect(() => {
    if (valueProp === undefined && defaultValue !== undefined) {
      setInternalValue(defaultValue);
    }
  }, [valueProp, defaultValue]);

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

  // Focus search input when dropdown opens (if searchable)
  useEffect(() => {
    if (isOpen && searchable) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
    }
  }, [isOpen, searchable]);

  // Filter options by search query
  const filteredOptions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return options;
    return options.filter((opt) => {
      const matchLabel = opt.label.toLowerCase().includes(q);
      const matchValue = String(opt.value).toLowerCase().includes(q);
      const matchBadge = opt.badge ? opt.badge.toLowerCase().includes(q) : false;
      const matchDesc = opt.description ? opt.description.toLowerCase().includes(q) : false;
      return matchLabel || matchValue || matchBadge || matchDesc;
    });
  }, [options, searchQuery]);

  // Find currently selected option object
  const selectedOption = useMemo(() => {
    if (!normalizedValue) return null;
    const vLower = normalizedValue.trim().toLowerCase();
    if (!vLower) return null;

    // 1. Exact value match (string comparison)
    const exactValueMatch = options.find((opt) => String(opt.value) === normalizedValue);
    if (exactValueMatch) return exactValueMatch;

    // 2. Case-insensitive value match
    const caseValueMatch = options.find((opt) => String(opt.value).toLowerCase() === vLower);
    if (caseValueMatch) return caseValueMatch;

    // 3. Exact label match (string comparison)
    const exactLabelMatch = options.find((opt) => opt.label === normalizedValue);
    if (exactLabelMatch) return exactLabelMatch;

    // 4. Case-insensitive label match
    const caseLabelMatch = options.find((opt) => opt.label.toLowerCase() === vLower);
    if (caseLabelMatch) return caseLabelMatch;

    return null;
  }, [options, normalizedValue]);

  const handleSelect = (option: SearchableSelectOption) => {
    if (valueProp === undefined) {
      setInternalValue(option.value);
    }
    onChange?.(option.value, option);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (valueProp === undefined) {
      setInternalValue("");
    }
    onChange?.("", null);
    setSearchQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const isOptionSelected = (opt: SearchableSelectOption) => {
    if (!normalizedValue) return false;
    const optVal = String(opt.value);
    const optValLower = optVal.toLowerCase();
    const optLabelLower = opt.label.toLowerCase();
    const vLower = normalizedValue.trim().toLowerCase();

    return (
      optVal === normalizedValue ||
      optValLower === vLower ||
      opt.label === normalizedValue ||
      optLabelLower === vLower
    );
  };

  return (
    <div className={`space-y-1 relative ${className}`} ref={containerRef} onKeyDown={handleKeyDown}>
      {label && (
        <FormLabel
          id={labelId}
          required={required}
          onClick={() => { if (!disabled) { triggerRef.current?.focus(); setIsOpen(true); } }}
          className="cursor-pointer"
        >
          {label}
        </FormLabel>
      )}

      {/* Main Trigger */}
      <div
        ref={triggerRef}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={`w-full flex items-center justify-between bg-white border ${
          error
            ? "border-rose-500 focus-visible:ring-1 focus-visible:ring-rose-500/20"
            : isOpen
            ? "border-slate-900 ring-1 ring-slate-900/10"
            : "border-slate-300 hover:border-slate-400 focus-visible:border-slate-900 focus-visible:ring-1 focus-visible:ring-slate-900/10"
        } ${
          disabled ? "opacity-50 cursor-not-allowed bg-slate-50" : "cursor-pointer"
        } rounded-md px-3 py-2 text-xs font-medium text-left transition-colors outline-none`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? labelId : undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        aria-required={required}
      >
        <div className="flex items-center gap-2 truncate flex-1 min-w-0">
          {renderTriggerValue ? (
            renderTriggerValue(selectedOption, normalizedValue)
          ) : selectedOption ? (
            <>
              {selectedOption.icon && <span className="shrink-0">{selectedOption.icon}</span>}
              {selectedOption.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${
                    selectedOption.badgeColor || "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {selectedOption.badge}
                </span>
              )}
              <span className="text-slate-900 font-semibold truncate">{selectedOption.label}</span>
            </>
          ) : normalizedValue ? (
            <span className="text-slate-900 font-semibold truncate">{normalizedValue}</span>
          ) : (
            <span className="text-slate-400 font-normal truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {allowClear && Boolean(normalizedValue) && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Clear selection"
              aria-label="Clear selection"
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

      {error && (
        <p id={errorId} role="alert" className="text-xs font-semibold text-rose-600 mt-0.5">
          {error}
        </p>
      )}

      {/* Dropdown Menu Overlay */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
          {/* Search Box inside dropdown */}
          {searchable && (
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
          )}

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto p-1 text-xs">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-slate-500 text-xs font-medium">
                {emptyText} {searchQuery ? `for "${searchQuery}"` : ""}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const selected = isOptionSelected(opt);

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
                      {renderOption(opt, selected)}
                    </div>
                  );
                }

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                      selected
                        ? "bg-slate-100 text-slate-900 font-bold"
                        : "hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate min-w-0 pr-2">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      {opt.badge && (
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold border shrink-0 ${
                            selected
                              ? "bg-slate-200 text-slate-900 border-slate-300"
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

                    {selected && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 ml-2" />}
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
