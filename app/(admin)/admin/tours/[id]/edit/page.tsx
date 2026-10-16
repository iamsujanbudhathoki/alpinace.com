"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PackageAdminForm } from "@/components/admin/forms/package-admin-form";
import { TourService } from "@/lib/services/admin-service";
import { PackageItem } from "@/lib/admin-data";

interface EditTourPageProps {
  params: Promise<{ id: string }>;
}

export default function EditTourPage({ params }: EditTourPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [tour, setTour] = useState<PackageItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadTour() {
      try {
        const data = await TourService.getById(resolvedParams.id);
        if (data) {
          setTour(data);
        } else {
          toast.error("Tour package not found.");
          router.push("/admin/tours");
        }
      } catch (err) {
        console.error("Failed to load tour package:", err);
        toast.error("Failed to load tour package details.");
      } finally {
        setLoading(false);
      }
    }

    if (resolvedParams.id) {
      loadTour();
    }
  }, [resolvedParams.id, router]);

  const handleUpdate = async (tourData: Record<string, unknown>) => {
    if (!resolvedParams.id) return;
    setIsSubmitting(true);
    try {
      const res = await TourService.update(resolvedParams.id, tourData as never);
      if (res.success) {
        toast.success(res.message || "Tour package updated successfully!");
        router.push("/admin/tours");
        return true;
      } else {
        toast.error(res.message || "Failed to update tour package.");
        return false;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update tour package.";
      toast.error(msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Loading tour package details...</p>
      </div>
    );
  }

  if (!tour) {
    return null;
  }

  return (
    <PackageAdminForm
      packageType="tour"
      isEdit={true}
      initialData={tour}
      onSubmit={handleUpdate}
      isSubmitting={isSubmitting}
    />
  );
}
