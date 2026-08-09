"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin-auth-context";
import {
  Search,
  Bell,
  ExternalLink,
  Menu,
  LogOut,
  Settings,
  ChevronDown,
  Check,
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

interface AdminHeaderProps {
  onToggleMobileSidebar?: () => void;
}

export function AdminHeader({ onToggleMobileSidebar }: AdminHeaderProps) {
  const [unreadCount, setUnreadCount] = useState(2);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, logout } = useAdminAuth();
  const router = useRouter();

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    router.push("/admin/login");
  };

  const handleMarkAllRead = () => {
    setUnreadCount(0);
  };

  const userInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("")
    : "SB";

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between gap-3 sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {/* Mobile Hamburger Toggle Button */}
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700" />
          <input
            type="text"
            placeholder="Search guest, trip ID, guide..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-500 text-xs rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all font-medium"
          />
        </div>
      </div>

      {/* Right Side Widgets */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Popover */}
        <Popover>
          <PopoverTrigger className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 transition-colors relative cursor-pointer focus:outline-none">
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

            {/* Notification List Items */}
            <div className="divide-y divide-slate-100 text-xs">
              <div className={`p-3.5 hover:bg-slate-50/80 transition-colors flex gap-3 ${unreadCount > 0 ? "bg-amber-50/20" : ""}`}>
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">New Booking Received</span>
                    <span className="text-xs text-slate-700 font-bold">10m ago</span>
                  </div>
                  <p className="text-slate-800 leading-relaxed font-semibold">
                    Marcus Vance submitted reservation for Everest Luxury Helicopter Trek.
                  </p>
                </div>
              </div>

              <div className="p-3.5 hover:bg-slate-50/80 transition-colors flex gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">TIMS Permit Issued</span>
                    <span className="text-xs text-slate-700 font-bold">1h ago</span>
                  </div>
                  <p className="text-slate-800 leading-relaxed font-semibold">
                    Sagarmatha permit clearance generated for Ama Dablam team.
                  </p>
                </div>
              </div>
            </div>

            {/* Popover Footer */}
            <Link
              href="/admin/bookings"
              className="p-2.5 text-center text-xs font-bold text-slate-900 hover:bg-slate-100/80 bg-slate-50 border-t border-slate-200 cursor-pointer block transition-colors"
            >
              View all activity →
            </Link>
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
                <div className="text-xs font-bold text-slate-900 truncate leading-none">
                  {user?.name}
                </div>
                <div className="text-xs text-slate-700 truncate font-bold mt-0.5">
                  {user?.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-700 hidden md:block" />
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
    </header>
  );
}
