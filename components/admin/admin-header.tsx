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
  PanelLeftClose,
  PanelLeftOpen,
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
  isSidebarCollapsed?: boolean;
  onToggleDesktopSidebar?: () => void;
}

export function AdminHeader({
  onToggleMobileSidebar,
  isSidebarCollapsed = false,
  onToggleDesktopSidebar,
}: AdminHeaderProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOffset, setNotifOffset] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const PAGE_SIZE = 10;
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const { user, logout } = useAdminAuth();
  const router = useRouter();

  const hasMore = notifications.length < totalNotifications;

  const fetchNotifications = useCallback(async () => {
    const res = await NotificationService.getPaged(PAGE_SIZE, 0);
    setNotifications(res.items);
    setTotalNotifications(res.total);
    setNotifOffset(res.items.length);
    if (typeof res.unreadCount === "number") {
      setUnreadCount(res.unreadCount);
    } else {
      setUnreadCount(res.items.filter((n) => !n.isRead).length);
    }
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
    if (typeof res.unreadCount === "number") {
      setUnreadCount(res.unreadCount);
    }
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
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await NotificationService.markAllRead();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.isRead) {
      // Optimistically mark single clicked notification as read
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Sync read state with backend API
      try {
        await NotificationService.markRead(notif.id);
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }

    // Navigate to related admin modules if applicable
    if (notif.type === NotificationType.INQUIRY || notif.type === NotificationType.QUOTE) {
      router.push("/admin/inquiries");
    } else if (notif.type === NotificationType.BOOKING) {
      router.push("/admin/bookings");
    }
  };

  const typeColor: Record<NotificationType, string> = {
    [NotificationType.INQUIRY]: "bg-amber-500",
    [NotificationType.BOOKING]: "bg-emerald-500",
    [NotificationType.QUOTE]: "bg-blue-500",
    [NotificationType.SYSTEM]: "bg-slate-400",
  };

  const userInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("")
    : "AA";

  return (
    <header
      data-slot="admin-header"
      className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-header"
    >
      {/* Left Area: Mobile Toggle */}
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
            title="Toggle Menu"
            aria-label="Toggle mobile menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Center Area: Centered Search Command Trigger */}
      <div className="flex-1 max-w-md mx-auto flex items-center justify-center">
        <button
          type="button"
          onClick={() => setIsSearchModalOpen(true)}
          aria-label="Global search command palette (Command K)"
          className="w-full bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white text-xs rounded-md pl-3 pr-2.5 py-1.5 flex items-center justify-between transition-all cursor-pointer font-medium group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Search className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors shrink-0" />
            <span className="truncate text-slate-700 dark:text-slate-300 font-medium">Search packages, bookings, guides (⌘K)...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded-md shrink-0 select-none">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Side Widgets */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Popover */}
        <Popover>
          <PopoverTrigger
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
            className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors relative cursor-pointer focus:outline-none shrink-0"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 text-[10px] font-extrabold leading-none text-white bg-rose-600 rounded-full ring-2 ring-white shadow-xs pointer-events-none select-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </PopoverTrigger>

          <PopoverContent align="end" sideOffset={8} className="w-80 sm:w-96 p-0 border border-slate-200 shadow-xl rounded-xl bg-white overflow-hidden">
            {/* Popover Header */}
            <div className="p-3 px-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-900">Notifications</span>
                {unreadCount > 0 ? (
                  <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                    {unreadCount} unread
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-500">All caught up</span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="divide-y divide-slate-100 text-xs max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-400">
                  <Inbox className="w-6 h-6 text-slate-300" />
                  <span className="font-medium">No notifications yet</span>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 transition-colors flex gap-3 cursor-pointer relative border-l-2 ${
                      !notif.isRead
                        ? "bg-slate-50/80 hover:bg-slate-100/80 border-l-slate-900"
                        : "bg-white hover:bg-slate-50/80 border-l-transparent"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                        typeColor[notif.type] ?? "bg-slate-400"
                      }`}
                    />
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs truncate ${
                            !notif.isRead
                              ? "font-bold text-slate-900"
                              : "font-medium text-slate-700"
                          }`}
                        >
                          {notif.title}
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal shrink-0">
                          {formatDate(notif.createdAt)}
                        </span>
                      </div>
                      <p
                        className={`text-xs leading-relaxed line-clamp-2 ${
                          !notif.isRead
                            ? "text-slate-800 font-medium"
                            : "text-slate-500 font-normal"
                        }`}
                      >
                        {notif.body}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Popover Footer — Show More & View All */}
            <div className="bg-slate-50 border-t border-slate-200 p-2 flex items-center justify-between gap-2 text-xs font-semibold">
              {hasMore ? (
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="text-slate-700 hover:text-slate-900 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isLoadingMore ? "Loading..." : `Load more (+${totalNotifications - notifications.length})`}
                </button>
              ) : (
                <span className="text-[11px] font-medium text-slate-400">All loaded</span>
              )}
              <Link
                href="/admin/notifications"
                className="text-slate-900 hover:underline font-bold text-[11px] ml-auto"
              >
                View all page →
              </Link>
            </div>
          </PopoverContent>
        </Popover>

        {/* User Profile Dropdown Menu */}
        <div className="pl-1 border-l border-slate-200">
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="User profile menu"
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
            >
              <div className="w-7 h-7 rounded-md bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-2xs shrink-0">
                {userInitials}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-900 truncate leading-none">
                  {user?.name}
                </div>
                <div className="text-[10px] text-slate-500 truncate font-semibold mt-0.5">
                  {user?.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 bg-white border-slate-200 shadow-xl rounded-xl p-1 z-50">
              <DropdownMenuLabel className="font-semibold text-xs px-3 py-2">
                <div className="font-bold text-slate-900">{user?.name || "Alpine Ace Treks Admin"}</div>
                <div className="text-[11px] text-slate-500 font-normal truncate">{user?.email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100" />

              <DropdownMenuItem
                onClick={() => router.push("/admin/settings")}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold cursor-pointer text-slate-700 hover:text-slate-900 focus:text-slate-900 focus:bg-slate-100 hover:bg-slate-100 rounded-lg"
              >
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span>Account Settings</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => window.open("/", "_blank")}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold cursor-pointer text-slate-700 hover:text-slate-900 focus:text-slate-900 focus:bg-slate-100 hover:bg-slate-100 rounded-lg"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span>Visit Marketing Site</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-100" />

              <DropdownMenuItem
                variant="destructive"
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-bold cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-600 hover:bg-rose-50 hover:text-rose-600 rounded-lg"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
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
