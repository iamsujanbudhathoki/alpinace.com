import { AdminAuthProvider } from "@/lib/admin-auth-context";
import { AdminAuthGuard } from "@/components/admin/admin-auth-guard";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | AlpineAce Nepal Expeditions",
  robots: {
    index: false,
    follow: false,
    noimageindex: true,
    nocache: true,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminAuthGuard>
        <AdminLayoutShell>{children}</AdminLayoutShell>
      </AdminAuthGuard>
    </AdminAuthProvider>
  );
}
