"use client";

import React from "react";

interface AdminInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const AdminInputField = React.forwardRef<HTMLInputElement, AdminInputFieldProps>(
  ({ label, error, required, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label className="font-bold text-slate-800 block text-xs">
          {label} {required && <span className="text-amber-600">*</span>}
        </label>
        <input
          ref={ref}
          {...props}
          className={`w-full bg-slate-50 border ${
            error ? "border-rose-500 focus:border-rose-500" : "border-slate-200 focus:border-amber-500"
          } rounded-lg px-3 py-2 text-slate-900 font-semibold text-xs focus:outline-none transition-colors ${className}`}
        />
        {error && <p className="text-xs font-bold text-rose-600 mt-0.5">{error}</p>}
      </div>
    );
  }
);
AdminInputField.displayName = "AdminInputField";

interface AdminSelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const AdminSelectField = React.forwardRef<HTMLSelectElement, AdminSelectFieldProps>(
  ({ label, error, required, options, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label className="font-bold text-slate-800 block text-xs">
          {label} {required && <span className="text-amber-600">*</span>}
        </label>
        <select
          ref={ref}
          {...props}
          className={`w-full bg-slate-50 border ${
            error ? "border-rose-500 focus:border-rose-500" : "border-slate-200 focus:border-amber-500"
          } rounded-lg px-3 py-2 text-slate-900 font-semibold text-xs focus:outline-none cursor-pointer transition-colors ${className}`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs font-bold text-rose-600 mt-0.5">{error}</p>}
      </div>
    );
  }
);
AdminSelectField.displayName = "AdminSelectField";

interface AdminTextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const AdminTextareaField = React.forwardRef<HTMLTextAreaElement, AdminTextareaFieldProps>(
  ({ label, error, required, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label className="font-bold text-slate-800 block text-xs">
          {label} {required && <span className="text-amber-600">*</span>}
        </label>
        <textarea
          ref={ref}
          {...props}
          className={`w-full bg-slate-50 border ${
            error ? "border-rose-500 focus:border-rose-500" : "border-slate-200 focus:border-amber-500"
          } rounded-lg px-3 py-2 text-slate-900 font-normal text-xs leading-relaxed focus:outline-none transition-colors ${className}`}
        />
        {error && <p className="text-xs font-bold text-rose-600 mt-0.5">{error}</p>}
      </div>
    );
  }
);
AdminTextareaField.displayName = "AdminTextareaField";
