"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin-auth-context";
import {
  Search,
  Bell,
  ExternalLink,
  X,
  Menu,
  LogOut,
  Settings,
  ChevronDown,
  AlertTriangle,
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
  const [showNotification, setShowNotification] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, logout } = useAdminAuth();
  const router = useRouter();

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    router.push("/admin/login");
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
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search guest, trip ID, guide..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
          />
        </div>
      </div>

      {/* Right Side Widgets */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotification(!showNotification)}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1.5 right-1.5 ring-2 ring-white" />
          </button>

          {showNotification && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-900">Operational Alerts</span>
                <button
                  onClick={() => setShowNotification(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-3 space-y-2.5">
                <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-200 text-xs">
                  <div className="font-semibold text-amber-900 flex items-center justify-between">
                    <span>New Booking Received</span>
                    <span className="text-[10px] text-amber-700 font-normal">10m ago</span>
                  </div>
                  <p className="text-slate-600 mt-1">
                    Marcus Vance booked Everest Luxury Helicopter Trek.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs">
                  <div className="font-semibold text-emerald-900 flex items-center justify-between">
                    <span>Permit Approved</span>
                    <span className="text-[10px] text-emerald-700 font-normal">1h ago</span>
                  </div>
                  <p className="text-slate-600 mt-1">
                    TIMS permit issued for Ama Dablam team.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown Menu */}
        <div className="pl-1 border-l border-slate-200">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0">
                {userInitials}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-900 truncate leading-none">
                  {user?.name || "Sujan Budhathoki"}
                </div>
                <div className="text-[10px] text-slate-500 truncate font-medium mt-0.5">
                  {user?.role || "Expedition Director"}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 bg-white border-slate-200 shadow-xl rounded-xl p-1 z-50">
              <DropdownMenuLabel className="font-semibold text-xs px-3 py-2">
                <div className="font-bold text-slate-900">{user?.name || "Sujan Budhathoki"}</div>
                <div className="text-[10px] text-slate-500 font-normal truncate">{user?.email || "admin@alpineace.com"}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100" />

              <DropdownMenuItem
                onClick={() => router.push("/admin/settings")}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium cursor-pointer text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 rounded-lg"
              >
                <Settings className="w-3.5 h-3.5 text-amber-600" />
                <span>Account Settings</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => window.open("/", "_blank")}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium cursor-pointer text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 rounded-lg"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
                <span>Visit Marketing Site</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-100" />

              <DropdownMenuItem
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold cursor-pointer text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
          <DialogContent className="sm:max-w-md bg-white border-slate-200 p-6 space-y-4">
            <DialogHeader className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Confirm Sign Out
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 font-medium">
                Are you sure you want to sign out of the AlpineAce Admin Portal? You will need to enter your staff credentials to log back in.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLogoutConfirm(false)}
                className="text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs"
              >
                Sign Out
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </header>
  );
}
