"use client";

import { FormLabel } from "@/components/ui/form-label";
import React, { useId } from "react";

interface AdminInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const AdminInputField = React.forwardRef<HTMLInputElement, AdminInputFieldProps>(
  ({ label, error, required, className = "", id: externalId, ...props }, ref) => {
    const generatedId = useId();
    const id = externalId || generatedId;
    const errorId = `${id}-error`;

    return (
      <div className="space-y-1">
        {label && (
          <FormLabel htmlFor={id} required={required}>
            {label}
          </FormLabel>
        )}
        <input
          id={id}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          aria-required={required}
          {...props}
          className={`w-full bg-white border ${
            error
              ? "border-rose-500 focus:border-rose-600 focus:ring-1 focus:ring-rose-500/20"
              : "border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10"
          } rounded-md px-3 py-2 text-slate-900 font-medium text-xs focus:outline-none transition-colors placeholder:text-slate-500 disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed ${className}`}
        />
        {error && (
          <p id={errorId} role="alert" className="text-xs font-semibold text-rose-600 mt-0.5">
            {error}
          </p>
        )}
      </div>
    );
  }
);
AdminInputField.displayName = "AdminInputField";

import { AdminSearchableSelect, SearchableSelectOption, normalizeSelectValue } from "./admin-searchable-select";

export interface AdminSelectOption {
  label: string;
  value: string;
  badge?: string;
  badgeColor?: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface AdminSelectFieldProps {
  label?: string;
  id?: string;
  error?: string;
  required?: boolean;
  options: AdminSelectOption[];
  value?: string;
  onChange?: (value: any, option?: any) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  searchable?: boolean;
  allowClear?: boolean;
  disabled?: boolean;
  className?: string;
  name?: string;
  onBlur?: (e: any) => void;
}

export const AdminSelectField = React.forwardRef<HTMLDivElement, AdminSelectFieldProps>(
  (
    {
      label,
      id,
      error,
      required,
      options = [],
      value: valueProp,
      onChange,
      placeholder = "Select...",
      searchPlaceholder = "Search options...",
      searchable = false,
      allowClear = false,
      disabled = false,
      className = "",
      name: nameProp,
      ...restProps
    },
    ref
  ) => {
    const fieldName = nameProp || (restProps as any).name;
    const rawVal = valueProp !== undefined ? valueProp : (restProps as any).value;
    const stringVal = normalizeSelectValue(rawVal);

    const handleSelectChange = (selectedVal: string, selectedOpt?: SearchableSelectOption | null) => {
      if (!onChange) return;

      const syntheticEvent = {
        target: { name: fieldName || "", value: selectedVal },
        currentTarget: { name: fieldName || "", value: selectedVal },
      };

      try {
        (onChange as any)(selectedVal, selectedOpt, syntheticEvent);
      } catch {
        try {
          (onChange as any)(syntheticEvent);
        } catch {
          // ignore
        }
      }
    };

    return (
      <div ref={ref}>
        <AdminSearchableSelect
          label={label}
          id={id}
          value={stringVal}
          options={options}
          onChange={handleSelectChange}
          error={error}
          required={required}
          placeholder={placeholder}
          searchPlaceholder={searchPlaceholder}
          searchable={searchable}
          allowClear={allowClear}
          disabled={disabled}
          className={className}
        />
      </div>
    );
  }
);
AdminSelectField.displayName = "AdminSelectField";

interface AdminTextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const AdminTextareaField = React.forwardRef<HTMLTextAreaElement, AdminTextareaFieldProps>(
  ({ label, error, required, className = "", id: externalId, ...props }, ref) => {
    const generatedId = useId();
    const id = externalId || generatedId;
    const errorId = `${id}-error`;

    return (
      <div className="space-y-1">
        {label && (
          <FormLabel htmlFor={id} required={required}>
            {label}
          </FormLabel>
        )}
        <textarea
          id={id}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          aria-required={required}
          {...props}
          className={`w-full bg-white border ${
            error
              ? "border-rose-500 focus:border-rose-600 focus:ring-1 focus:ring-rose-500/20"
              : "border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10"
          } rounded-md px-3 py-2 text-slate-900 font-medium text-xs focus:outline-none transition-colors placeholder:text-slate-500 resize-y disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed ${className}`}
        />
        {error && (
          <p id={errorId} role="alert" className="text-xs font-semibold text-rose-600 mt-0.5">
            {error}
          </p>
        )}
      </div>
    );
  }
);
AdminTextareaField.displayName = "AdminTextareaField";

interface AdminFilterSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: { label: string; value: string }[];
  children?: React.ReactNode;
}

export const AdminFilterSelect = React.forwardRef<HTMLSelectElement, AdminFilterSelectProps>(
  ({ label, options, children, className = "", id: externalId, ...props }, ref) => {
    const generatedId = useId();
    const id = externalId || generatedId;
    return (
      <div className="flex items-center gap-2">
        {label && (
          <label htmlFor={id} className="text-xs font-semibold text-slate-700 whitespace-nowrap cursor-pointer">
            {label}
          </label>
        )}
        <select
          id={id}
          ref={ref}
          aria-label={!label ? (props["aria-label"] || "Filter options") : undefined}
          {...props}
          className={`h-9 text-xs bg-white border border-slate-300 text-slate-900 font-semibold rounded-md px-3 py-1.5 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 cursor-pointer disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition-colors ${className}`}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
      </div>
    );
  }
);
AdminFilterSelect.displayName = "AdminFilterSelect";
