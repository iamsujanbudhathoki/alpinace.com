"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PackageAdminForm } from "@/components/admin/forms/package-admin-form";
import { ExpeditionService } from "@/lib/services/admin-service";

export default function CreateExpeditionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (expData: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      const res = await ExpeditionService.create(expData as never);
      if (res.success) {
        toast.success(res.message || "Expedition package created successfully!");
        router.push("/admin/expeditions");
        return true;
      } else {
        toast.error(res.message || "Failed to create expedition package.");
        return false;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create expedition package.";
      toast.error(msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PackageAdminForm
      packageType="expedition"
      isEdit={false}
      onSubmit={handleCreate}
      isSubmitting={isSubmitting}
    />
  );
}
