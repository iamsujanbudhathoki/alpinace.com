"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PackageAdminForm } from "@/components/admin/forms/package-admin-form";
import { TourService } from "@/lib/services/admin-service";

export default function CreateTourPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (tourData: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      const res = await TourService.create(tourData as never);
      if (res.success) {
        toast.success(res.message || "Tour package created successfully!");
        router.push("/admin/tours");
        return true;
      } else {
        toast.error(res.message || "Failed to create tour package.");
        return false;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create tour package.";
      toast.error(msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PackageAdminForm
      packageType="tour"
      isEdit={false}
      onSubmit={handleCreate}
      isSubmitting={isSubmitting}
    />
  );
}
