"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PackageAdminForm } from "@/components/admin/forms/package-admin-form";
import { TrekService } from "@/lib/services/admin-service";

export default function CreateTrekPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (trekData: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      const res = await TrekService.create(trekData as never);
      if (res.success) {
        toast.success(res.message || "Trek package created successfully!");
        router.push("/admin/treks");
        return true;
      } else {
        toast.error(res.message || "Failed to create trek package.");
        return false;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create trek package.";
      toast.error(msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PackageAdminForm
      packageType="trek"
      isEdit={false}
      onSubmit={handleCreate}
      isSubmitting={isSubmitting}
    />
  );
}
