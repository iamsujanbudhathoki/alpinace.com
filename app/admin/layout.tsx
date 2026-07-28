import { AdminAuthProvider } from "@/lib/admin-auth-context";
import { AdminAuthGuard } from "@/components/admin/admin-auth-guard";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";

export const metadata = {
  title: "Admin Dashboard | AlpineAce Nepal Expeditions",
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
