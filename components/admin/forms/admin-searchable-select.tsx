"use client";

import React, { useState, useRef, useEffect, useMemo, ReactNode, useId, useCallback } from "react";
import { createPortal } from "react-dom";
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
    if (typeof val.id !== "undefined") {
      return String(val.id);
    }
  }
  return String(val);
}

export interface AdminSearchableSelectProps {
  label?: string;
  id?: string;
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
  id: externalId,
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
  const [mounted, setMounted] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [internalValue, setInternalValue] = useState<string>(() =>
    normalizeSelectValue(valueProp !== undefined ? valueProp : defaultValue)
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLElement | null)[]>([]);

  const generatedId = useId();
  const selectId = externalId || generatedId;
  const labelId = useId();
  const errorId = useId();
  const listboxId = useId();

  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keep internalValue synced when valueProp or defaultValue changes
  useEffect(() => {
    if (valueProp !== undefined) {
      setInternalValue(normalizeSelectValue(valueProp));
    } else if (defaultValue !== undefined) {
      setInternalValue(normalizeSelectValue(defaultValue));
    }
  }, [valueProp, defaultValue]);

  // Controlled if valueProp is defined, otherwise uncontrolled via internalValue
  const rawValue = valueProp !== undefined ? valueProp : internalValue;
  const normalizedValue = useMemo(() => normalizeSelectValue(rawValue), [rawValue]);

  // Calculate dropdown position in viewport (fixed positioning via portal)
  const updateCoords = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    const minSpaceNeeded = 200;
    const preferTop = spaceBelow < minSpaceNeeded && spaceAbove > spaceBelow;

    if (preferTop) {
      setCoords({
        bottom: viewportHeight - rect.top + 4,
        left: rect.left,
        width: rect.width,
        maxHeight: Math.min(260, Math.max(120, spaceAbove - 16)),
      });
    } else {
      setCoords({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        maxHeight: Math.min(260, Math.max(120, spaceBelow - 16)),
      });
    }
  }, []);

  // Sync coords on open, window resize, and container scroll
  useEffect(() => {
    if (!isOpen) return;
    updateCoords();

    function handleScrollOrResize() {
      updateCoords();
    }

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen, updateCoords]);

  // Close dropdown when clicking outside (checks container AND portal dropdown)
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const inContainer = containerRef.current && containerRef.current.contains(target);
      const inDropdown = dropdownRef.current && dropdownRef.current.contains(target);

      if (!inContainer && !inDropdown) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
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

  // Helper to check if an option is currently selected
  const isOptionSelected = useCallback((opt: SearchableSelectOption) => {
    if (!normalizedValue) return false;
    const optVal = String(opt.value).trim();
    const optValLower = optVal.toLowerCase();
    const optLabelLower = opt.label.trim().toLowerCase();
    const vLower = normalizedValue.trim().toLowerCase();

    return (
      optVal === normalizedValue.trim() ||
      optValLower === vLower ||
      opt.label.trim() === normalizedValue.trim() ||
      optLabelLower === vLower
    );
  }, [normalizedValue]);

  // Highlight initial option when dropdown opens or filtered options change
  useEffect(() => {
    if (isOpen) {
      const selectedIdx = filteredOptions.findIndex((opt) => isOptionSelected(opt));
      setHighlightedIndex(selectedIdx >= 0 ? selectedIdx : 0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen, filteredOptions, isOptionSelected]);

  // Auto-scroll highlighted option into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [highlightedIndex, isOpen]);

  // Find currently selected option object for trigger display
  const selectedOption = useMemo(() => {
    if (!normalizedValue) return null;
    const vLower = normalizedValue.trim().toLowerCase();
    if (!vLower) return null;

    // 1. Exact value match (string comparison)
    const exactValueMatch = options.find((opt) => String(opt.value).trim() === normalizedValue.trim());
    if (exactValueMatch) return exactValueMatch;

    // 2. Case-insensitive value match
    const caseValueMatch = options.find((opt) => String(opt.value).trim().toLowerCase() === vLower);
    if (caseValueMatch) return caseValueMatch;

    // 3. Exact label match (string comparison)
    const exactLabelMatch = options.find((opt) => opt.label.trim() === normalizedValue.trim());
    if (exactLabelMatch) return exactLabelMatch;

    // 4. Case-insensitive label match
    const caseLabelMatch = options.find((opt) => opt.label.trim().toLowerCase() === vLower);
    if (caseLabelMatch) return caseLabelMatch;

    return null;
  }, [options, normalizedValue]);

  const handleSelect = (option: SearchableSelectOption, e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setInternalValue(option.value);
    onChange?.(option.value, option);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalValue("");
    onChange?.("", null);
    setSearchQuery("");
  };

  // Keyboard navigation & accessibility handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          filteredOptions.length > 0 ? (prev < filteredOptions.length - 1 ? prev + 1 : 0) : -1
        );
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          filteredOptions.length > 0 ? (prev > 0 ? prev - 1 : filteredOptions.length - 1) : -1
        );
        break;
      }
      case "Enter": {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex], e);
        }
        break;
      }
      case "Escape": {
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      }
      case "Tab": {
        // Natural focus transition to next form element while closing dropdown
        setIsOpen(false);
        break;
      }
    }
  };

  return (
    <div className={`space-y-1 relative ${className}`} ref={containerRef} onKeyDown={handleKeyDown}>
      {label && (
        <FormLabel
          id={labelId}
          htmlFor={selectId}
          required={required}
          className="cursor-pointer"
        >
          {label}
        </FormLabel>
      )}

      {/* Main Trigger */}
      <div
        id={selectId}
        ref={triggerRef}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
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
        aria-controls={isOpen ? listboxId : undefined}
        aria-activedescendant={
          isOpen && highlightedIndex >= 0 ? `${listboxId}-opt-${highlightedIndex}` : undefined
        }
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

      {/* Portal-based Dropdown Menu Overlay */}
      {isOpen && mounted && coords && createPortal(
        <div
          ref={dropdownRef}
          id={listboxId}
          role="listbox"
          style={{
            position: "fixed",
            ...(coords.top !== undefined ? { top: `${coords.top}px` } : {}),
            ...(coords.bottom !== undefined ? { bottom: `${coords.bottom}px` } : {}),
            left: `${coords.left}px`,
            width: `${coords.width}px`,
            maxHeight: `${coords.maxHeight}px`,
            zIndex: 99999,
          }}
          className="bg-white border border-slate-200 rounded-md shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100 flex flex-col"
          onKeyDown={handleKeyDown}
        >
          {/* Search Box inside dropdown */}
          {searchable && (
            <div className="p-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
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
          <div className="overflow-y-auto p-1 text-xs flex-1">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-slate-500 text-xs font-medium">
                {emptyText} {searchQuery ? `for "${searchQuery}"` : ""}
              </div>
            ) : (
              filteredOptions.map((opt, index) => {
                const selected = isOptionSelected(opt);
                const isHighlighted = index === highlightedIndex;

                if (renderOption) {
                  return (
                    <div
                      key={opt.value}
                      id={`${listboxId}-opt-${index}`}
                      role="option"
                      aria-selected={selected}
                      ref={(el) => { optionRefs.current[index] = el; }}
                      onClick={(e) => handleSelect(opt, e)}
                      className={`cursor-pointer rounded-md transition-colors ${
                        isHighlighted ? "bg-slate-100 ring-1 ring-slate-900/10" : ""
                      }`}
                    >
                      {renderOption(opt, selected)}
                    </div>
                  );
                }

                return (
                  <button
                    key={opt.value}
                    id={`${listboxId}-opt-${index}`}
                    role="option"
                    aria-selected={selected}
                    ref={(el) => { optionRefs.current[index] = el; }}
                    type="button"
                    onClick={(e) => handleSelect(opt, e)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                      isHighlighted || selected
                        ? "bg-slate-100 text-slate-900 font-bold shadow-2xs"
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
        </div>,
        document.body
      )}
    </div>
  );
}
