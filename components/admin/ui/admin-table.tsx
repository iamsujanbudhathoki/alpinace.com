"use client";

import React from "react";
import { Eye, Edit, Trash2, SearchX, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * AdminTableContainer
 * Card wrapper with responsive horizontal overflow scroll for admin data tables.
 */
interface AdminTableContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminTableContainer({ children, className = "" }: AdminTableContainerProps) {
  return (
    <Card className={cn("bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden", className)}>
      <div className="overflow-x-auto">
        {children}
      </div>
    </Card>
  );
}

/**
 * AdminTable
 * Main table element styled consistently across admin pages.
 */
interface AdminTableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
  className?: string;
}

export function AdminTable({ children, className = "", ...props }: AdminTableProps) {
  return (
    <table className={cn("w-full text-left border-collapse text-xs", className)} {...props}>
      {children}
    </table>
  );
}

/**
 * AdminTableHeader
 * Styled standard thead element.
 */
export function AdminTableHeader({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "bg-slate-50/90 border-b border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider select-none",
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
}

/**
 * AdminTableHead
 * Individual table column header item (th).
 */
interface AdminTableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

export function AdminTableHead({
  children,
  className = "",
  align = "left",
  ...props
}: AdminTableHeadProps) {
  const alignClass = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  return (
    <th
      className={cn(
        "py-3.5 px-4 font-bold text-slate-800 text-xs tracking-wider uppercase whitespace-nowrap",
        alignClass,
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

/**
 * AdminTableBody
 * Styled table body element (tbody).
 */
export function AdminTableBody({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn("divide-y divide-slate-100 text-xs", className)} {...props}>
      {children}
    </tbody>
  );
}

/**
 * AdminTableRow
 * Styled table row element (tr) with hover effects.
 */
interface AdminTableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  className?: string;
}

export function AdminTableRow({ children, className = "", ...props }: AdminTableRowProps) {
  return (
    <tr className={cn("hover:bg-slate-50/80 transition-colors group", className)} {...props}>
      {children}
    </tr>
  );
}

/**
 * AdminTableCell
 * Styled table cell item (td).
 */
interface AdminTableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

export function AdminTableCell({
  children,
  className = "",
  align = "left",
  ...props
}: AdminTableCellProps) {
  const alignClass = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  return (
    <td className={cn("py-3.5 px-4 align-middle font-medium text-slate-800", alignClass, className)} {...props}>
      {children}
    </td>
  );
}

/**
 * AdminTableEmpty
 * Styled full-width empty state when search filters return 0 results.
 */
interface AdminTableEmptyProps {
  colSpan: number;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function AdminTableEmpty({
  colSpan,
  icon,
  title = "No matching records found",
  description = "No items match your current search or filter criteria.",
  action,
}: AdminTableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-12 px-4 text-center">
        <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
          <div className="p-3 bg-slate-100 rounded-full text-slate-500">
            {icon || <SearchX className="w-6 h-6" />}
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">{title}</h4>
            <p className="text-xs text-slate-700 font-medium leading-normal">{description}</p>
          </div>
          {action && <div className="pt-2">{action}</div>}
        </div>
      </td>
    </tr>
  );
}

/**
 * AdminTableLoading
 * Skeleton loading rows during data fetch operations.
 */
interface AdminTableLoadingProps {
  colSpan: number;
  rows?: number;
  message?: string;
}

export function AdminTableLoading({
  colSpan,
  rows = 4,
  message = "Loading records...",
}: AdminTableLoadingProps) {
  return (
    <>
      <tr>
        <td colSpan={colSpan} className="py-8 text-center text-slate-700 font-semibold animate-pulse">
          {message}
        </td>
      </tr>
      {Array.from({ length: rows - 1 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td colSpan={colSpan} className="py-3 px-4">
            <div className="h-4 bg-slate-100 rounded w-full"></div>
          </td>
        </tr>
      ))}
    </>
  );
}

/**
 * AdminTableActions & AdminActionButton
 * Consistent row action container and action buttons (View, Edit, Delete).
 */
interface AdminActionButtonProps {
  icon?: React.ReactNode;
  label?: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  title?: string;
  variant?: "view" | "edit" | "delete" | "default";
  className?: string;
}

export function AdminActionButton({
  icon,
  label,
  onClick,
  title,
  variant = "default",
  className = "",
}: AdminActionButtonProps) {
  let styleClass = "text-slate-700 hover:text-slate-950 hover:bg-slate-100";
  let defaultIcon = icon;

  if (variant === "view") {
    styleClass = "text-slate-700 hover:text-slate-950 hover:bg-slate-100";
    if (!defaultIcon) defaultIcon = <Eye className="w-3.5 h-3.5" />;
  } else if (variant === "edit") {
    styleClass = "text-amber-600 hover:text-amber-700 hover:bg-amber-50";
    if (!defaultIcon) defaultIcon = <Edit className="w-3.5 h-3.5" />;
  } else if (variant === "delete") {
    styleClass = "text-rose-600 hover:text-rose-700 hover:bg-rose-50";
    if (!defaultIcon) defaultIcon = <Trash2 className="w-3.5 h-3.5" />;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      title={title || label}
      className={cn("h-7 w-7 p-0 cursor-pointer transition-colors", styleClass, className)}
    >
      {defaultIcon}
      {label && <span className="ml-1">{label}</span>}
    </Button>
  );
}

export function AdminTableActions({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-end gap-1.5", className)}>
      {children}
    </div>
  );
}

/**
 * AdminTablePagination
 * Footer bar for tables displaying current page, total items count, and Next/Prev controls.
 */
interface AdminTablePaginationProps {
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function AdminTablePagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  className = "",
}: AdminTablePaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div
      className={cn(
        "px-4 py-3 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-medium select-none",
        className
      )}
    >
      <div>
        Showing <span className="font-bold text-slate-900">{startItem}</span> to{" "}
        <span className="font-bold text-slate-900">{endItem}</span> of{" "}
        <span className="font-bold text-slate-900">{totalItems}</span> items
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange?.(currentPage - 1)}
          className="h-7 px-2.5 text-xs border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5 mr-1" />
          Previous
        </Button>
        <span className="px-2 font-semibold text-slate-800">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange?.(currentPage + 1)}
          className="h-7 px-2.5 text-xs border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
