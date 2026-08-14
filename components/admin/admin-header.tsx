"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin-auth-context";
import { AdminSearchModal } from "@/components/admin/modals/admin-search-modal";
import { NotificationService, AppNotification } from "@/lib/services/admin-service";
import { formatDate } from "@/lib/utils";
import {
  Search,
  Bell,
  ExternalLink,
  Menu,
  LogOut,
  Settings,
  ChevronDown,
  Check,
  Inbox,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NotificationType } from "@/lib/admin-data";

interface AdminHeaderProps {
  onToggleMobileSidebar?: () => void;
}

export function AdminHeader({ onToggleMobileSidebar }: AdminHeaderProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [notifOffset, setNotifOffset] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const PAGE_SIZE = 10;
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const { user, logout } = useAdminAuth();
  const router = useRouter();

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const hasMore = notifications.length < totalNotifications;

  const fetchNotifications = useCallback(async (reset = false) => {
    const offset = reset ? 0 : 0; // always load from 0 on initial fetch
    const res = await NotificationService.getPaged(PAGE_SIZE, offset);
    setNotifications(res.items);
    setTotalNotifications(res.total);
    setNotifOffset(res.items.length);
  }, []);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    const res = await NotificationService.getPaged(PAGE_SIZE, notifOffset);
    setNotifications((prev) => {
      const existingIds = new Set(prev.map((n) => n.id));
      const newItems = res.items.filter((n) => !existingIds.has(n.id));
      return [...prev, ...newItems];
    });
    setTotalNotifications(res.total);
    setNotifOffset((prev) => prev + res.items.length);
    setIsLoadingMore(false);
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh every 60 seconds
    const interval = setInterval(() => fetchNotifications(), 60_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Keyboard Shortcut: Cmd+K or Ctrl+K to open global search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    router.push("/admin/login");
  };

  const handleMarkAllRead = async () => {
    await NotificationService.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleMarkRead = async (id: string) => {
    await NotificationService.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const typeColor: Record<NotificationType, string> = {
    [NotificationType.INQUIRY]: "bg-amber-500",
    [NotificationType.BOOKING]: "bg-emerald-500",
    [NotificationType.QUOTE]: "bg-blue-500",
    [NotificationType.SYSTEM]: "bg-slate-400",
  };

  const userInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("")
    : "SB";

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
      {/* Left Area: Mobile Toggle */}
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Center Area: Centered Search Command Trigger */}
      <div className="flex-1 max-w-md mx-auto flex items-center justify-center">
        <button
          type="button"
          onClick={() => setIsSearchModalOpen(true)}
          className="w-full bg-slate-50 hover:bg-slate-100/90 border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-700 text-xs rounded-xl pl-3.5 pr-3 py-2 flex items-center justify-between transition-all cursor-pointer font-medium shadow-2xs group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors shrink-0" />
            <span className="truncate">Search guest, trip ID, guide...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-400 border border-slate-200 bg-white px-1.5 py-0.5 rounded-md shadow-2xs shrink-0 select-none">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Side Widgets */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Popover */}
        <Popover>
          <PopoverTrigger className="p-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 hover:text-slate-950 hover:border-slate-400 transition-colors relative cursor-pointer focus:outline-none">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1.5 right-1.5 ring-2 ring-white" />
            )}
          </PopoverTrigger>

          <PopoverContent align="end" sideOffset={8} className="w-80 sm:w-96 p-0 border border-slate-200 shadow-xl rounded-xl bg-white overflow-hidden">
            {/* Popover Header */}
            <div className="p-3 px-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-900">Notifications</span>
                {unreadCount > 0 ? (
                  <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                    {unreadCount} new
                  </span>
                ) : (
                  <span className="text-xs font-bold text-slate-700">All caught up</span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-bold text-slate-800 hover:text-slate-950 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  <span>Mark read</span>
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="divide-y divide-slate-100 text-xs max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-400">
                  <Inbox className="w-6 h-6" />
                  <span className="font-semibold">No notifications yet</span>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                    className={`p-3.5 hover:bg-slate-50/80 transition-colors flex gap-3 cursor-pointer ${
                      !notif.isRead ? "bg-amber-50/30" : ""
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${typeColor[notif.type] ?? "bg-slate-400"}`} />
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 truncate">{notif.title}</span>
                        <span className="text-xs text-slate-500 font-semibold shrink-0">{formatDate(notif.createdAt)}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed font-medium">{notif.body}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Popover Footer — Show More */}
            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="w-full p-2.5 text-center text-xs font-bold text-slate-800 hover:bg-slate-100/80 bg-slate-50 border-t border-slate-200 cursor-pointer transition-colors disabled:opacity-50"
              >
                {isLoadingMore ? "Loading..." : `Show more (${totalNotifications - notifications.length} remaining)`}
              </button>
            )}
          </PopoverContent>
        </Popover>

        {/* User Profile Dropdown Menu */}
        <div className="pl-1 border-l border-slate-200">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0">
                {userInitials}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-950 truncate leading-none">
                  {user?.name}
                </div>
                <div className="text-xs text-slate-800 truncate font-bold mt-0.5">
                  {user?.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-900 hidden md:block" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 bg-white border-slate-200 shadow-xl rounded-xl p-1 z-50">
              <DropdownMenuLabel className="font-semibold text-xs px-3 py-2">
                <div className="font-bold text-slate-900">{user?.name || "Sujan Budhathoki"}</div>
                <div className="text-xs text-slate-700 font-semibold truncate">{user?.email || "admin@alpineace.com"}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100" />

              <DropdownMenuItem
                onClick={() => router.push("/admin/settings")}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold cursor-pointer text-slate-800 hover:text-slate-950 hover:bg-slate-100 rounded-lg"
              >
                <Settings className="w-3.5 h-3.5 text-amber-600" />
                <span>Account Settings</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => window.open("/", "_blank")}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold cursor-pointer text-slate-800 hover:text-slate-950 hover:bg-slate-100 rounded-lg"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
                <span>Visit Marketing Site</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-100" />

              <DropdownMenuItem
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-bold cursor-pointer text-rose-600 hover:bg-rose-50 rounded-lg"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Sleek Sign Out Confirmation Dialog */}
      {showLogoutConfirm && (
        <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
          <DialogContent className="sm:max-w-xs bg-white border border-slate-200 rounded-xl p-5 shadow-lg space-y-4">
            <DialogHeader className="space-y-1 text-left">
              <DialogTitle className="text-sm font-bold text-slate-900">
                Sign out?
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-700 font-medium">
                Are you sure you want to log out of your session?
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLogoutConfirm(false)}
                className="text-xs font-semibold h-8 px-3 border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmLogout}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-8 px-3"
              >
                Sign out
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {/* Global Command Search Modal */}
      <AdminSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </header>
  );
}
