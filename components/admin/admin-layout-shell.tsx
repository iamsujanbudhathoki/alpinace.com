"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If on login page, render full screen without sidebar/header
  if (isLoginPage) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50/60 text-slate-900 font-sans relative">
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-64 bg-white min-h-screen shadow-2xl">
            <AdminSidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto bg-slate-50/60">
          {children}
        </main>
      </div>
    </div>
  );
}
