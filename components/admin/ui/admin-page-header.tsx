import React from "react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  children,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
