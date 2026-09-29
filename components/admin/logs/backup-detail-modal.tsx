"use client";

import React, { useState } from "react";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Check,
  Terminal,
  Download,
} from "lucide-react";
import { AuditLogItem, BackupService } from "@/lib/services/admin-service";
import { formatDateTime } from "@/lib/utils";
import { AuditStatusBadge } from "./audit-log-badges";
import { getBackupDetails } from "./backup-logs-tab";
import { toast } from "sonner";

interface BackupDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: AuditLogItem | null;
}

export function BackupDetailModal({ isOpen, onClose, log }: BackupDetailModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  if (!log) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = async (key: string, type: "values" | "schema" = "values") => {
    setDownloading(type);
    const toastId = toast.loading(`Preparing ${type === "values" ? "values.sql" : "schema.sql"} download...`);
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

  const { schemaKey, dataKey, tableCount, bucket } = getBackupDetails(log);

  const restoreCommand = `# Download SQL dumps from Cloudflare R2 and restore database:
mysql -h <host> -u <user> -p <database_name> < schema.sql
mysql -h <host> -u <user> -p <database_name> < values.sql`;

  const footer = (
    <div className="flex items-center justify-between w-full">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => handleCopy(JSON.stringify(log, null, 2), "backup-json")}
        className="text-xs font-semibold cursor-pointer gap-1.5 border-slate-300 text-slate-700"
      >
        {copiedKey === "backup-json" ? (
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
      title="Database Backup Snapshot"
      description={`Record ID: ${log.id}`}
      footer={footer}
      maxWidth="xl"
      fixedHeight={false}
    >
      <div className="space-y-4">
        {/* Status Row */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              MySQL Database Snapshot
            </span>
            <span className="text-xs text-slate-500 font-normal">
              {formatDateTime(log.createdAt)}
            </span>
          </div>

          <AuditStatusBadge success={log.success} />
        </div>

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
          <span className="text-xs font-bold text-slate-900 block">Cloudflare R2 Objects</span>

          <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-3 text-xs">
            <div className="min-w-0">
              <span className="text-[11px] text-slate-500 font-medium block">Schema Dump:</span>
              <code className="text-xs font-mono text-slate-700 truncate block mt-0.5">
                {schemaKey}
              </code>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => handleCopy(schemaKey, "schema")}
                className="cursor-pointer gap-1 border-slate-300 text-slate-700"
              >
                {copiedKey === "schema" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
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
              <code className="text-xs font-mono text-slate-700 truncate block mt-0.5">
                {dataKey}
              </code>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => handleCopy(dataKey, "data")}
                className="cursor-pointer gap-1 border-slate-300 text-slate-700"
              >
                {copiedKey === "data" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
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
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-slate-500" />
              <span>Restore Commands</span>
            </span>
            <button
              type="button"
              onClick={() => handleCopy(restoreCommand, "restore-cmd")}
              className="text-[11px] font-medium text-slate-600 hover:text-slate-900 cursor-pointer flex items-center gap-1"
            >
              {copiedKey === "restore-cmd" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>Copy</span>
            </button>
          </div>
          <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
            {restoreCommand}
          </pre>
        </div>
      </div>
    </AdminModal>
  );
}
