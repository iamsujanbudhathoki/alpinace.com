"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { ActivityLogsTab } from "@/components/admin/logs/activity-logs-tab";
import { BackupLogsTab } from "@/components/admin/logs/backup-logs-tab";

function AuditLogsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("tab") === "backups" ? "backups" : "activity";

  const handleTabChange = (tab: "activity" | "backups") => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "backups") {
      params.set("tab", "backups");
    } else {
      params.delete("tab");
    }
    const q = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/admin/audit-logs${q}`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <AdminPageHeader
        title="Audit Logs"
        description="Immutable system activity records, admin security events, and database backup logs."
      />

      {/* Standard AlpineAce Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-semibold -mb-2">
        <button
          type="button"
          onClick={() => handleTabChange("activity")}
          className={`pb-3 -mb-px border-b-2 transition-colors cursor-pointer ${
            currentTab === "activity"
              ? "border-slate-900 text-slate-900 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900 font-medium"
          }`}
        >
          Activity Logs
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("backups")}
          className={`pb-3 -mb-px border-b-2 transition-colors cursor-pointer ${
            currentTab === "backups"
              ? "border-slate-900 text-slate-900 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900 font-medium"
          }`}
        >
          Database Backups
        </button>
      </div>

      {/* Active Tab Panel */}
      {currentTab === "activity" ? <ActivityLogsTab /> : <BackupLogsTab />}
    </div>
  );
}

export default function AdminAuditLogsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-500">Loading audit logs...</div>}>
      <AuditLogsPageContent />
    </Suspense>
  );
}
