"use client";

import { FormLabel } from "@/components/ui/form-label";
import React from "react";

interface AdminInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const AdminInputField = React.forwardRef<HTMLInputElement, AdminInputFieldProps>(
  ({ label, error, required, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && <FormLabel required={required}>{label}</FormLabel>}
        <input
          ref={ref}
          {...props}
          className={`w-full bg-white border ${
            error
              ? "border-rose-500 focus:border-rose-600 focus:ring-1 focus:ring-rose-500/20"
              : "border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10"
          } rounded-md px-3 py-2 text-slate-900 font-medium text-xs focus:outline-none transition-colors placeholder:text-slate-500 ${className}`}
        />
        {error && <p className="text-xs font-semibold text-rose-600 mt-0.5">{error}</p>}
      </div>
    );
  }
);
AdminInputField.displayName = "AdminInputField";

interface AdminSelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const AdminSelectField = React.forwardRef<HTMLSelectElement, AdminSelectFieldProps>(
  ({ label, error, required, options, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && <FormLabel required={required}>{label}</FormLabel>}
        <select
          ref={ref}
          {...props}
          className={`w-full bg-white border ${
            error
              ? "border-rose-500 focus:border-rose-600 focus:ring-1 focus:ring-rose-500/20"
              : "border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10"
          } rounded-md px-3 py-2 text-slate-900 font-medium text-xs focus:outline-none cursor-pointer transition-colors ${className}`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs font-semibold text-rose-600 mt-0.5">{error}</p>}
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
  ({ label, error, required, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && <FormLabel required={required}>{label}</FormLabel>}
        <textarea
          ref={ref}
          {...props}
          className={`w-full bg-white border ${
            error
              ? "border-rose-500 focus:border-rose-600 focus:ring-1 focus:ring-rose-500/20"
              : "border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10"
          } rounded-md px-3 py-2 text-slate-900 font-medium text-xs focus:outline-none transition-colors placeholder:text-slate-500 resize-y ${className}`}
        />
        {error && <p className="text-xs font-semibold text-rose-600 mt-0.5">{error}</p>}
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
  ({ label, options, children, className = "", ...props }, ref) => {
    return (
      <div className="flex items-center gap-2">
        {label && (
          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            {label}
          </label>
        )}
        <select
          ref={ref}
          {...props}
          className={`h-9 text-xs bg-white border border-slate-300 text-slate-900 font-semibold rounded-md px-3 py-1.5 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 cursor-pointer disabled:opacity-50 disabled:bg-slate-50 transition-colors ${className}`}
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
