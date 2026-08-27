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
            error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" : "border-slate-200 focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
          } rounded-lg px-3 py-2 text-slate-900 font-medium text-xs focus:outline-none transition-all placeholder:text-slate-400 ${className}`}
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
            error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" : "border-slate-200 focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
          } rounded-lg px-3 py-2 text-slate-900 font-medium text-xs focus:outline-none cursor-pointer transition-all ${className}`}
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
            error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" : "border-slate-200 focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
          } rounded-lg px-3 py-2 text-slate-900 font-medium text-xs focus:outline-none transition-all placeholder:text-slate-400 resize-y ${className}`}
        />
        {error && <p className="text-xs font-semibold text-rose-600 mt-0.5">{error}</p>}
      </div>
    );
  }
);
AdminTextareaField.displayName = "AdminTextareaField";
