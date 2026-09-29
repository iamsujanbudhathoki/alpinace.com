"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  RotateCcw,
  Eye,
} from "lucide-react";
import {
  AuditLogService,
  AuditLogItem,
  PaginatedList,
} from "@/lib/services/admin-service";
import { formatDateTime } from "@/lib/utils";
import { AdminFilterBar } from "@/components/admin/ui/admin-filter-bar";
import {
  AdminTableContainer,
  AdminTable,
  AdminTableHeader,
  AdminTableHead,
  AdminTableBody,
  AdminTableRow,
  AdminTableCell,
  AdminTableEmpty,
  AdminTableLoading,
  AdminTablePagination,
  AdminActionButton,
} from "@/components/admin/ui/admin-table";
import { AdminFilterSelect } from "@/components/admin/forms/admin-form-fields";
import { Button } from "@/components/ui/button";
import { AuditLogModal } from "@/components/admin/modals/audit-log-modal";
import {
  AuditActionBadge,
  AuditStatusBadge,
} from "./audit-log-badges";
import { toast } from "sonner";

const ACTION_OPTIONS = [
  { label: "All Actions", value: "All" },
  { label: "Login Success", value: "LOGIN" },
  { label: "Login Failed", value: "LOGIN_FAILED" },
  { label: "Logout", value: "LOGOUT" },
  { label: "Create", value: "CREATE" },
  { label: "Update", value: "UPDATE" },
  { label: "Delete", value: "DELETE" },
  { label: "Status Changed", value: "STATUS_CHANGED" },
  { label: "Ordering Changed", value: "ORDERING_CHANGED" },
  { label: "Menu Visibility", value: "MENU_VISIBILITY_CHANGED" },
  { label: "Password Changed", value: "PASSWORD_CHANGED" },
  { label: "Role Changed", value: "ROLE_CHANGED" },
];

const ENTITY_OPTIONS = [
  { label: "All Entities", value: "All" },
  { label: "Auth", value: "AUTH" },
  { label: "Booking", value: "Booking" },
  { label: "Inquiry", value: "Inquiry" },
  { label: "Trek", value: "Trek" },
  { label: "Tour", value: "Tour" },
  { label: "Expedition", value: "Expedition" },
  { label: "Category", value: "Category" },
  { label: "Blog Article", value: "BlogArticle" },
  { label: "Settings", value: "Setting" },
  { label: "Media", value: "Media" },
  { label: "FAQ", value: "FAQ" },
  { label: "Team", value: "Team" },
  { label: "Testimonial", value: "Testimonial" },
  { label: "About Us", value: "AboutUs" },
];

export function ActivityLogsTab() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [entityFilter, setEntityFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Inspection
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, actionFilter, entityFilter, startDate, endDate]);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res: PaginatedList<AuditLogItem> = await AuditLogService.getAll({
        page,
        limit,
        search: debouncedSearch || undefined,
        action: actionFilter !== "All" ? actionFilter : undefined,
        entityType: entityFilter !== "All" ? entityFilter : undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(`${endDate}T23:59:59.999Z`).toISOString() : undefined,
      });

      setLogs(res || []);
      if (res.pagination) {
        setTotalItems(res.pagination.count);
        setTotalPages(res.pagination.lastPage || 1);
      } else {
        setTotalItems(res.length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, actionFilter, entityFilter, startDate, endDate]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setActionFilter("All");
    setEntityFilter("All");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    actionFilter !== "All" ||
    entityFilter !== "All" ||
    startDate !== "" ||
    endDate !== "";

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <AdminFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter action, entity, user, IP..."
      >
        <AdminFilterSelect
          label="Action:"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          options={ACTION_OPTIONS}
        />

        <AdminFilterSelect
          label="Entity:"
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          options={ENTITY_OPTIONS}
        />

        {/* Date Filter Inputs */}
        <div className="flex items-center gap-1.5 text-xs text-slate-700">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            title="Start Date"
            aria-label="Filter start date"
            className="h-9 text-xs bg-white border border-slate-300 text-slate-900 rounded-md px-2.5 py-1 focus:outline-none focus:border-slate-900 cursor-pointer"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            title="End Date"
            aria-label="Filter end date"
            className="h-9 text-xs bg-white border border-slate-300 text-slate-900 rounded-md px-2.5 py-1 focus:outline-none focus:border-slate-900 cursor-pointer"
          />
        </div>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 gap-1 h-9 px-2.5 cursor-pointer font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </Button>
        )}
      </AdminFilterBar>

      {/* Audit Log Data Table */}
      <AdminTableContainer>
        <AdminTable>
          <AdminTableHeader>
            <tr>
              <AdminTableHead className="w-14 text-center">S.N.</AdminTableHead>
              <AdminTableHead className="w-[170px]">Timestamp</AdminTableHead>
              <AdminTableHead className="w-[160px]">Action</AdminTableHead>
              <AdminTableHead>Entity</AdminTableHead>
              <AdminTableHead>Actor / User</AdminTableHead>
              <AdminTableHead>IP Address</AdminTableHead>
              <AdminTableHead className="w-[100px]" align="center">
                Status
              </AdminTableHead>
              <AdminTableHead className="w-[70px]" align="right">
                Actions
              </AdminTableHead>
            </tr>
          </AdminTableHeader>

          <AdminTableBody>
            {loading ? (
              <AdminTableLoading colSpan={8} rows={8} />
            ) : logs.length === 0 ? (
              <AdminTableEmpty
                colSpan={8}
                title="No audit logs found"
                description={
                  hasActiveFilters
                    ? "No log entries match your active search or filter parameters."
                    : "No system activities or events have been logged yet."
                }
                action={
                  hasActiveFilters ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResetFilters}
                      className="text-xs font-semibold cursor-pointer"
                    >
                      Clear Filters
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              logs.map((log, idx) => {
                const serialNumber = (page - 1) * limit + idx + 1;
                return (
                  <AdminTableRow
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="cursor-pointer"
                  >
                    {/* Serial Number */}
                    <AdminTableCell className="text-center font-medium text-slate-400">
                      {serialNumber}
                    </AdminTableCell>

                    {/* Timestamp */}
                    <AdminTableCell className="whitespace-nowrap text-slate-600 text-xs">
                      {formatDateTime(log.createdAt)}
                    </AdminTableCell>

                    {/* Action */}
                    <AdminTableCell>
                      <AuditActionBadge action={log.action} success={log.success} />
                    </AdminTableCell>

                    {/* Entity Type & Target ID */}
                    <AdminTableCell>
                      <div className="font-semibold text-slate-900 text-xs">
                        {log.entityType}
                      </div>
                      {log.entityId ? (
                        <div className="text-[11px] font-mono text-slate-500 truncate max-w-[160px]">
                          {log.entityId}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400">—</div>
                      )}
                    </AdminTableCell>

                    {/* Actor / User */}
                    <AdminTableCell>
                      <span
                        className="text-xs text-slate-700 font-medium truncate block max-w-[130px]"
                        title={log.userId || "System / Guest"}
                      >
                        {log.userId || "System / Guest"}
                      </span>
                    </AdminTableCell>

                    {/* IP Address */}
                    <AdminTableCell>
                      <span className="font-mono text-xs text-slate-600">
                        {log.ipAddress || "—"}
                      </span>
                    </AdminTableCell>

                    {/* Status */}
                    <AdminTableCell align="center">
                      <AuditStatusBadge success={log.success} />
                    </AdminTableCell>

                    {/* Inspect Button */}
                    <AdminTableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <AdminActionButton
                        variant="view"
                        title="View event details"
                        onClick={() => setSelectedLog(log)}
                        icon={<Eye className="w-3.5 h-3.5" />}
                      />
                    </AdminTableCell>
                  </AdminTableRow>
                );
              })
            )}
          </AdminTableBody>
        </AdminTable>

        {/* Pagination Bar */}
        <AdminTablePagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={limit}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setLimit(newSize);
            setPage(1);
          }}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </AdminTableContainer>

      {/* Detail Inspection Modal */}
      <AuditLogModal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        log={selectedLog}
      />
    </div>
  );
}
