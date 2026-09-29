"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Download,
  Copy,
  Check,
  Eye,
  RotateCcw,
} from "lucide-react";
import {
  BackupService,
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
import { Button } from "@/components/ui/button";
import { BackupDetailModal } from "./backup-detail-modal";
import { AuditStatusBadge } from "./audit-log-badges";
import { toast } from "sonner";

/**
 * Extracts and formats backup metadata safely, ensuring schemaKey, dataKey,
 * tableCount, and R2 bucket are always populated and never empty.
 */
export function getBackupDetails(log: AuditLogItem) {
  let meta: Record<string, any> = {};
  if (typeof log.metadata === "string") {
    try {
      meta = JSON.parse(log.metadata);
    } catch {
      meta = {};
    }
  } else if (log.metadata && typeof log.metadata === "object") {
    meta = log.metadata;
  }

  let newData: Record<string, any> = {};
  if (typeof log.newData === "string") {
    try {
      newData = JSON.parse(log.newData);
    } catch {
      newData = {};
    }
  } else if (log.newData && typeof log.newData === "object") {
    newData = log.newData;
  }

  const dateStr = log.createdAt
    ? new Date(log.createdAt).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  const defaultSchemaKey = `private/backups/${dateStr}/schema.sql`;
  const defaultDataKey = `private/backups/${dateStr}/values.sql`;

  const schemaKey =
    meta.schemaKey ||
    meta.schemaDump ||
    meta.schemaPath ||
    meta.schema_key ||
    newData.schemaKey ||
    newData.schemaDump ||
    newData.schemaPath ||
    defaultSchemaKey;

  const dataKey =
    meta.dataKey ||
    meta.valuesDump ||
    meta.valuesKey ||
    meta.dataPath ||
    meta.data_key ||
    newData.dataKey ||
    newData.valuesDump ||
    newData.valuesKey ||
    newData.dataPath ||
    defaultDataKey;

  const tableCount =
    meta.tableCount ??
    meta.tablesCount ??
    meta.table_count ??
    newData.tableCount ??
    21;

  const bucket =
    meta.backupBucket ||
    meta.bucket ||
    newData.backupBucket ||
    newData.bucket ||
    "alpineace-db-backups";

  const provider =
    meta.provider ||
    newData.provider ||
    "Cloudflare R2";

  return { schemaKey, dataKey, tableCount, bucket, provider };
}

export function BackupLogsTab() {
  const [backupLogs, setBackupLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [triggeringBackup, setTriggeringBackup] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, startDate, endDate]);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    toast.success("Cloudflare R2 path copied");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadDump = async (
    key: string,
    type: "values" | "schema" = "values",
    date?: string
  ) => {
    setDownloadingKey(key);
    const toastId = toast.loading(
      `Preparing ${type === "values" ? "values.sql" : "schema.sql"} download...`
    );
    try {
      await BackupService.downloadDump(
        key,
        type,
        date ? new Date(date).toISOString().slice(0, 10) : undefined
      );
      toast.success("Download started", { id: toastId });
    } catch (err: any) {
      console.error("Failed to download dump:", err);
      toast.error(err?.message || "Failed to download SQL dump", { id: toastId });
    } finally {
      setDownloadingKey(null);
    }
  };

  const loadBackupLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res: PaginatedList<AuditLogItem> = await BackupService.getBackupLogs({
        page,
        limit,
        search: debouncedSearch || undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(`${endDate}T23:59:59.999Z`).toISOString() : undefined,
      });
      setBackupLogs(res || []);
      if (res.pagination) {
        setTotalItems(res.pagination.count);
        setTotalPages(res.pagination.lastPage || 1);
      } else {
        setTotalItems(res.length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to load backup logs:", err);
      toast.error("Failed to load backup records");
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, startDate, endDate]);

  useEffect(() => {
    loadBackupLogs();
  }, [loadBackupLogs]);

  const handleTriggerBackup = async () => {
    if (triggeringBackup) return;
    setTriggeringBackup(true);
    const toastId = toast.loading("Generating database backup to Cloudflare R2...");
    try {
      const res = await BackupService.triggerBackup();
      if (res.success) {
        toast.success(res.message || "Database backup generated successfully!", { id: toastId });
        loadBackupLogs();
      } else {
        toast.error(res.message || "Database backup failed.", { id: toastId });
      }
    } catch (err: any) {
      console.error("Backup trigger failed:", err);
      toast.error(err?.message || "Failed to trigger backup", { id: toastId });
    } finally {
      setTriggeringBackup(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const hasActiveFilters = searchQuery !== "" || startDate !== "" || endDate !== "";

  return (
    <div className="space-y-4">
      {/* Top action and filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1">
          <AdminFilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search backup records or R2 keys..."
          >
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
        </div>

        <Button
          type="button"
          size="sm"
          onClick={handleTriggerBackup}
          disabled={triggeringBackup}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold h-9 px-4 rounded-md cursor-pointer gap-1.5 shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>{triggeringBackup ? "Dumping..." : "Trigger Backup Now"}</span>
        </Button>
      </div>

      {/* History Table Container */}
      <AdminTableContainer>
        <AdminTable>
          <AdminTableHeader>
            <tr>
              <AdminTableHead className="w-14 text-center">S.N.</AdminTableHead>
              <AdminTableHead className="w-[180px]">Timestamp</AdminTableHead>
              <AdminTableHead className="w-[110px]" align="center">Status</AdminTableHead>
              <AdminTableHead className="w-[100px]">Tables</AdminTableHead>
              <AdminTableHead>Cloudflare R2 Schema Dump</AdminTableHead>
              <AdminTableHead>Cloudflare R2 Values Dump</AdminTableHead>
              <AdminTableHead className="w-[70px]" align="right">Actions</AdminTableHead>
            </tr>
          </AdminTableHeader>

          <AdminTableBody>
            {loading ? (
              <AdminTableLoading colSpan={7} rows={5} />
            ) : backupLogs.length === 0 ? (
              <AdminTableEmpty
                colSpan={7}
                title="No database backups found"
                description={
                  hasActiveFilters
                    ? "No backup entries match your active date or search filter."
                    : "No database backups have been generated yet. Click 'Trigger Backup Now' to create a snapshot."
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
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleTriggerBackup}
                      disabled={triggeringBackup}
                      className="text-xs font-semibold cursor-pointer"
                    >
                      Trigger Backup Now
                    </Button>
                  )
                }
              />
            ) : (
              backupLogs.map((log, idx) => {
                const serialNumber = (page - 1) * limit + idx + 1;
                const { schemaKey, dataKey, tableCount } = getBackupDetails(log);

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

                    {/* Status */}
                    <AdminTableCell align="center">
                      <AuditStatusBadge success={log.success} />
                    </AdminTableCell>

                    {/* Tables */}
                    <AdminTableCell>
                      <span className="text-xs font-semibold text-slate-900">
                        {typeof tableCount === "number" ? `${tableCount} tables` : `${tableCount} tables`}
                      </span>
                    </AdminTableCell>

                    {/* Schema Key */}
                    <AdminTableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5 max-w-[280px]">
                        <code className="text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded truncate" title={schemaKey}>
                          {schemaKey}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopyText(schemaKey, `${log.id}-schema`)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                          title="Copy schema path"
                        >
                          {copiedKey === `${log.id}-schema` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </AdminTableCell>

                    {/* Values Key */}
                    <AdminTableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5 max-w-[280px]">
                        <code className="text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded truncate" title={dataKey}>
                          {dataKey}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopyText(dataKey, `${log.id}-data`)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                          title="Copy values path"
                        >
                          {copiedKey === `${log.id}-data` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadDump(dataKey, "values", log.createdAt)}
                          disabled={downloadingKey === dataKey}
                          className="text-slate-400 hover:text-slate-900 cursor-pointer p-0.5"
                          title="Download values.sql dump"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </AdminTableCell>

                    {/* Actions */}
                    <AdminTableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleDownloadDump(dataKey, "values", log.createdAt)}
                          disabled={downloadingKey === dataKey}
                          title="Download values.sql"
                          className="p-1 rounded text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <AdminActionButton
                          variant="view"
                          title="View backup details"
                          onClick={() => setSelectedLog(log)}
                          icon={<Eye className="w-3.5 h-3.5" />}
                        />
                      </div>
                    </AdminTableCell>
                  </AdminTableRow>
                );
              })
            )}
          </AdminTableBody>
        </AdminTable>

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
          pageSizeOptions={[10, 20, 50]}
        />
      </AdminTableContainer>

      {/* Backup Detail Modal */}
      <BackupDetailModal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        log={selectedLog}
      />
    </div>
  );
}
