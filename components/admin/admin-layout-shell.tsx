"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // Ignore localStorage errors if restricted
    }
  }, []);

  const toggleDesktopSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("admin_sidebar_collapsed", String(next));
      } catch {
        // Ignore localStorage errors
      }
      return next;
    });
  };

  // If on login page, render full screen without sidebar/header
  if (isLoginPage) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-slate-50/60 text-slate-900 font-sans relative">
      {/* Fixed Desktop Sidebar */}
      <div
        className={`hidden md:flex flex-col shrink-0 h-screen sticky top-0 bg-white border-r border-slate-200 z-20 transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <AdminSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleDesktopSidebar}
        />
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-64 bg-white h-screen shadow-2xl">
            <AdminSidebar
              isCollapsed={false}
              onCloseMobile={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Workspace Column (Scrollable body) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <AdminHeader
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          isSidebarCollapsed={isCollapsed}
          onToggleDesktopSidebar={toggleDesktopSidebar}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-50/60">
          {children}
        </main>
      </div>
    </div>
  );
}
