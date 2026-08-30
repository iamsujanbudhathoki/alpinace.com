"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  RefreshCw,
  Inbox,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Calendar,
  MessageSquare,
  Info,
} from "lucide-react";
import { NotificationService, AppNotification } from "@/lib/services/admin-service";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const TYPE_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: React.ComponentType<{ className?: string }> }
> = {
  INQUIRY: { label: "Inquiry", bg: "bg-blue-50 border-blue-200", text: "text-blue-700", icon: MessageSquare },
  BOOKING: { label: "Booking", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", icon: Calendar },
  AUTH_ALERT: { label: "Security", bg: "bg-rose-50 border-rose-200", text: "text-rose-700", icon: ShieldAlert },
  SYSTEM_ALERT: { label: "System", bg: "bg-amber-50 border-amber-200", text: "text-amber-700", icon: ShieldAlert },
  GENERAL: { label: "Notice", bg: "bg-slate-50 border-slate-200", text: "text-slate-700", icon: Info },
};

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterRead, setFilterRead] = useState<"all" | "unread">("all");
  const limit = 10;

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const isReadFilter = filterRead === "unread" ? false : undefined;
      const res = await NotificationService.getAll({
        page,
        limit,
        isRead: isReadFilter,
      });

      setNotifications(res.items);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || 0);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, filterRead]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (notif: AppNotification) => {
    if (notif.isRead) return;
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      await NotificationService.markRead(notif.id);
      toast.success("Notification marked as read");
    } catch (err) {
      console.error("Failed to mark read:", err);
      toast.error("Could not update status");
      loadNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      await NotificationService.markAllRead();
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Failed to mark all read:", err);
      toast.error("Could not mark all as read");
      loadNotifications();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      await NotificationService.delete(id);
      toast.success("Notification deleted");
      loadNotifications();
    } catch (err) {
      console.error("Failed to delete notification:", err);
      toast.error("Could not delete notification");
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Bell className="w-5 h-5 text-slate-700" />
              <span>Admin System Notifications</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium pl-8">
            View security alerts, new customer inquiries, booking submissions, and system events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadNotifications}
            disabled={loading}
            className="text-xs h-9 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {unreadCount > 0 && (
            <Button
              type="button"
              size="sm"
              onClick={handleMarkAllRead}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold h-9 rounded-xl px-3 transition-colors shadow-xs"
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              Mark All Read ({unreadCount})
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded-2xl shadow-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setFilterRead("all");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterRead === "all"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            All Notifications ({totalCount})
          </button>
          <button
            onClick={() => {
              setFilterRead("unread");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterRead === "unread"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <span>Unread Only</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] bg-rose-500 text-white rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium hidden sm:block px-2">
          Page {page} of {totalPages} ({totalCount} items)
        </div>
      </div>

      {/* Notifications List Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden divide-y divide-slate-100">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-medium">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
            <Inbox className="w-8 h-8 text-slate-300" />
            <span className="font-bold text-sm text-slate-700">No notifications found</span>
            <p className="text-xs text-slate-500">
              {filterRead === "unread"
                ? "You have marked all notifications as read."
                : "No system notifications recorded yet."}
            </p>
          </div>
        ) : (
          notifications.map((notif) => {
            const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.GENERAL;
            const Icon = config.icon;

            return (
              <div
                key={notif.id}
                className={`p-4 transition-colors flex items-start gap-4 ${
                  !notif.isRead
                    ? "bg-slate-50/80 hover:bg-slate-100/70 border-l-4 border-l-slate-900"
                    : "bg-white hover:bg-slate-50/60 border-l-4 border-l-transparent"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${config.bg}`}
                >
                  <Icon className={`w-4 h-4 ${config.text}`} />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {notif.title}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${config.bg} ${config.text}`}
                      >
                        {config.label}
                      </span>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {formatDate(notif.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {notif.body}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkRead(notif)}
                      title="Mark as read"
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    title="Delete notification"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-2xl shadow-xs text-xs font-semibold">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="text-xs h-8 px-3 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <span className="text-slate-600 font-medium">
            Page <strong className="text-slate-900">{page}</strong> of{" "}
            <strong className="text-slate-900">{totalPages}</strong>
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="text-xs h-8 px-3 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
