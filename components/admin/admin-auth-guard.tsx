"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin-auth-context";
import { Loader2, Mountain } from "lucide-react";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isLoginPage) {
        router.replace("/admin/login");
      } else if (isAuthenticated && isLoginPage) {
        router.replace("/admin");
      }
    }
  }, [isAuthenticated, isLoading, isLoginPage, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-md animate-bounce">
          <Mountain className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
          <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
          <span>Verifying AlpineAce Credentials...</span>
        </div>
      </div>
    );
  }

  // If on login page and not authenticated, render login page children
  if (isLoginPage) {
    return <>{children}</>;
  }

  // If not authenticated on protected route, show nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
