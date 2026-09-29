"use client";

import React, { useState } from "react";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Check,
  AlertTriangle,
  Download,
} from "lucide-react";
import { AuditLogItem, BackupService } from "@/lib/services/admin-service";
import { formatDateTime } from "@/lib/utils";
import { AuditActionBadge, AuditStatusBadge } from "@/components/admin/logs/audit-log-badges";
import { getBackupDetails } from "@/components/admin/logs/backup-logs-tab";
import { toast } from "sonner";

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: AuditLogItem | null;
}

export function AuditLogModal({ isOpen, onClose, log }: AuditLogModalProps) {
  const [activeTab, setActiveTab] = useState<"backup" | "diff" | "new" | "old" | "meta" | "raw">("diff");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const isBackup = log?.action === "SYSTEM_BACKUP";

  const hasDiff = Boolean(
    log?.metadata?.diff ||
    (log?.metadata?.changedKeys && log.metadata.changedKeys.length > 0) ||
    (log?.oldData && log?.newData)
  );

  React.useEffect(() => {
    if (!log) return;
    if (log.action === "SYSTEM_BACKUP") {
      setActiveTab("backup");
    } else if (hasDiff) {
      setActiveTab("diff");
    } else if (log.newData) {
      setActiveTab("new");
    } else if (log.metadata) {
      setActiveTab("meta");
    } else {
      setActiveTab("raw");
    }
  }, [log, hasDiff]);

  if (!log) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard");
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleDownload = async (key: string, type: "values" | "schema" = "values") => {
    setDownloading(type);
    const toastId = toast.loading(
      `Preparing ${type === "values" ? "values.sql" : "schema.sql"} download...`
    );
    try {
      await BackupService.downloadDump(
        key,
        type,
        log?.createdAt ? new Date(log.createdAt).toISOString().slice(0, 10) : undefined
      );
      toast.success("Download started", { id: toastId });
    } catch (err: any) {
      console.error("Failed to download dump:", err);
      toast.error(err?.message || "Failed to download SQL dump", { id: toastId });
    } finally {
      setDownloading(null);
    }
  };

  // Extract structured diff fields if present
  const diffEntries: Array<{ field: string; oldVal: any; newVal: any }> = [];
  if (log.metadata?.diff && typeof log.metadata.diff === "object") {
    Object.entries(log.metadata.diff).forEach(([key, val]: [string, any]) => {
      diffEntries.push({
        field: key,
        oldVal: val?.old ?? val?.before ?? "—",
        newVal: val?.new ?? val?.after ?? "—",
      });
    });
  } else if (log.metadata?.changedKeys && Array.isArray(log.metadata.changedKeys)) {
    log.metadata.changedKeys.forEach((key: string) => {
      diffEntries.push({
        field: key,
        oldVal: log.oldData?.[key] ?? "—",
        newVal: log.newData?.[key] ?? "—",
      });
    });
  }

  const formatValue = (v: any): string => {
    if (v === null || v === undefined) return "null";
    if (typeof v === "object") return JSON.stringify(v, null, 2);
    if (typeof v === "boolean") return v ? "true" : "false";
    return String(v);
  };

  const footer = (
    <div className="flex items-center justify-between w-full">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => handleCopy(JSON.stringify(log, null, 2), "all-json")}
        className="text-xs font-semibold cursor-pointer gap-1.5 border-slate-300 text-slate-700"
      >
        {copiedKey === "all-json" ? (
          <Check className="w-3.5 h-3.5 text-emerald-600" />
        ) : (
          <Copy className="w-3.5 h-3.5 text-slate-400" />
        )}
        <span>Copy Full JSON</span>
      </Button>

      <Button
        type="button"
        variant="default"
        size="sm"
        onClick={onClose}
        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 cursor-pointer"
      >
        Close
      </Button>
    </div>
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Audit Log Event"
      description={`Record ID: ${log.id}`}
      footer={footer}
      maxWidth="2xl"
      fixedHeight={false}
    >
      <div className="space-y-4">
        {/* Event Header Card */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex flex-wrap items-center gap-2">
            <AuditActionBadge action={log.action} success={log.success} />

            <span className="px-2 py-0.5 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-md">
              {log.entityType}
            </span>

            {log.entityId && (
              <span
                onClick={() => handleCopy(log.entityId!, "entityId")}
                className="px-2 py-0.5 text-xs font-mono text-slate-600 bg-white border border-slate-200 rounded cursor-pointer hover:bg-slate-100"
                title="Click to copy entity ID"
              >
                ID: {log.entityId}
              </span>
            )}
          </div>

          <AuditStatusBadge success={log.success} />
        </div>

        {/* Failure Details Banner */}
        {!log.success && log.metadata?.failureReason && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold text-rose-900 block">Failure Reason:</span>
              <span className="text-rose-700">{log.metadata.failureReason}</span>
              {log.metadata.attemptedIdentifier && (
                <span className="block text-rose-800 mt-0.5 font-mono text-[11px]">
                  Target: {log.metadata.attemptedIdentifier}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Key-Value Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
            <span className="text-[11px] text-slate-500 font-medium block">Timestamp</span>
            <span className="font-semibold text-slate-900 block mt-0.5">
              {formatDateTime(log.createdAt)}
            </span>
          </div>

          <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
            <span className="text-[11px] text-slate-500 font-medium block">Actor / User</span>
            <span className="font-medium text-slate-800 truncate block mt-0.5" title={log.userId || "System / Guest"}>
              {log.userId || "System / Guest"}
            </span>
          </div>

          <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
            <span className="text-[11px] text-slate-500 font-medium block">IP Address</span>
            <span className="font-mono text-slate-700 block mt-0.5">
              {log.ipAddress || "—"}
            </span>
          </div>

          <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
            <span className="text-[11px] text-slate-500 font-medium block">Request ID</span>
            <span className="font-mono text-slate-700 truncate block mt-0.5" title={log.requestId || "—"}>
              {log.requestId || "—"}
            </span>
          </div>
        </div>

        {/* User Agent */}
        {log.userAgent && (
          <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs">
            <span className="text-[11px] text-slate-500 font-medium block">User Agent:</span>
            <span className="font-mono text-[11px] text-slate-600 break-all block mt-0.5 leading-normal">
              {log.userAgent}
            </span>
          </div>
        )}

        {/* Section Tabs */}
        <div>
          <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-semibold -mb-px">
            {isBackup && (
              <button
                type="button"
                onClick={() => setActiveTab("backup")}
                className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === "backup"
                    ? "border-slate-900 text-slate-900 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-900 font-medium"
                }`}
              >
                Database Backup Snapshot
              </button>
            )}

            {hasDiff && (
              <button
                type="button"
                onClick={() => setActiveTab("diff")}
                className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === "diff"
                    ? "border-slate-900 text-slate-900 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-900 font-medium"
                }`}
              >
                Change Diff ({diffEntries.length || "1"})
              </button>
            )}

            {log.newData && (
              <button
                type="button"
                onClick={() => setActiveTab("new")}
                className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === "new"
                    ? "border-slate-900 text-slate-900 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-900 font-medium"
                }`}
              >
                New State
              </button>
            )}

            {log.oldData && (
              <button
                type="button"
                onClick={() => setActiveTab("old")}
                className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === "old"
                    ? "border-slate-900 text-slate-900 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-900 font-medium"
                }`}
              >
                Previous State
              </button>
            )}

            {log.metadata && (
              <button
                type="button"
                onClick={() => setActiveTab("meta")}
                className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === "meta"
                    ? "border-slate-900 text-slate-900 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-900 font-medium"
                }`}
              >
                Metadata
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab("raw")}
              className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === "raw"
                  ? "border-slate-900 text-slate-900 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900 font-medium"
              }`}
            >
              Raw JSON
            </button>
          </div>

          <div className="pt-3">
            {activeTab === "backup" && isBackup && (() => {
              const { schemaKey, dataKey, tableCount, bucket } = getBackupDetails(log);
              const restoreCommand = `# Download SQL dumps from Cloudflare R2 and restore database:
mysql -h <host> -u <user> -p <database_name> < schema.sql
mysql -h <host> -u <user> -p <database_name> < values.sql`;
              return (
                <div className="space-y-4">
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                      <span className="text-[11px] text-slate-500 font-medium block">Timestamp</span>
                      <span className="font-semibold text-slate-900 block mt-0.5">
                        {formatDateTime(log.createdAt)}
                      </span>
                    </div>

                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                      <span className="text-[11px] text-slate-500 font-medium block">Tables Backed Up</span>
                      <span className="font-semibold text-slate-900 block mt-0.5">
                        {tableCount} tables
                      </span>
                    </div>

                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                      <span className="text-[11px] text-slate-500 font-medium block">Storage Destination</span>
                      <span className="font-semibold text-slate-900 block mt-0.5 truncate" title={bucket}>
                        Cloudflare R2 ({bucket})
                      </span>
                    </div>
                  </div>

                  {/* Cloudflare R2 Keys */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-900 block">Cloudflare R2 Storage Keys</span>

                    <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <span className="text-[11px] text-slate-500 font-medium block">Schema Dump:</span>
                        <code className="text-xs font-mono text-slate-700 truncate block mt-0.5" title={schemaKey}>
                          {schemaKey}
                        </code>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => handleCopy(schemaKey, "modal-schema")}
                          className="cursor-pointer gap-1 border-slate-300 text-slate-700"
                        >
                          {copiedKey === "modal-schema" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                          <span>Copy</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => handleDownload(schemaKey, "schema")}
                          disabled={downloading === "schema"}
                          className="cursor-pointer gap-1 border-slate-300 text-slate-700"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-500" />
                          <span>Download</span>
                        </Button>
                      </div>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <span className="text-[11px] text-slate-500 font-medium block">Values Dump:</span>
                        <code className="text-xs font-mono text-slate-700 truncate block mt-0.5" title={dataKey}>
                          {dataKey}
                        </code>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => handleCopy(dataKey, "modal-data")}
                          className="cursor-pointer gap-1 border-slate-300 text-slate-700"
                        >
                          {copiedKey === "modal-data" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                          <span>Copy</span>
                        </Button>
                        <Button
                          type="button"
                          variant="default"
                          size="xs"
                          onClick={() => handleDownload(dataKey, "values")}
                          disabled={downloading === "values"}
                          className="bg-slate-900 hover:bg-slate-800 text-white cursor-pointer gap-1 font-semibold"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-300" />
                          <span>Download Values (.sql)</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Restore Command */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 block">Restore Commands</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(restoreCommand, "modal-restore")}
                        className="text-[11px] font-medium text-slate-600 hover:text-slate-900 cursor-pointer flex items-center gap-1"
                      >
                        {copiedKey === "modal-restore" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                      {restoreCommand}
                    </pre>
                  </div>
                </div>
              );
            })()}
            {activeTab === "diff" && hasDiff && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <tr>
                      <th className="py-2 px-3 w-1/4">Field</th>
                      <th className="py-2 px-3 w-3/8 text-rose-800 bg-rose-50/40">Previous Value</th>
                      <th className="py-2 px-3 w-3/8 text-emerald-800 bg-emerald-50/40">New Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {diffEntries.map((entry, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-semibold text-slate-800 align-top">
                          {entry.field}
                        </td>
                        <td className="py-2 px-3 text-rose-700 bg-rose-50/20 align-top whitespace-pre-wrap break-all">
                          {formatValue(entry.oldVal)}
                        </td>
                        <td className="py-2 px-3 text-emerald-700 bg-emerald-50/20 align-top whitespace-pre-wrap break-all">
                          {formatValue(entry.newVal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "new" && (
              <pre className="p-3 bg-slate-900 text-slate-100 text-xs font-mono rounded-lg overflow-x-auto max-h-72 border border-slate-800">
                {JSON.stringify(log.newData, null, 2)}
              </pre>
            )}

            {activeTab === "old" && (
              <pre className="p-3 bg-slate-900 text-slate-100 text-xs font-mono rounded-lg overflow-x-auto max-h-72 border border-slate-800">
                {JSON.stringify(log.oldData, null, 2)}
              </pre>
            )}

            {activeTab === "meta" && (
              <pre className="p-3 bg-slate-900 text-slate-100 text-xs font-mono rounded-lg overflow-x-auto max-h-72 border border-slate-800">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            )}

            {activeTab === "raw" && (
              <pre className="p-3 bg-slate-900 text-slate-100 text-xs font-mono rounded-lg overflow-x-auto max-h-72 border border-slate-800">
                {JSON.stringify(log, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </AdminModal>
  );
}
