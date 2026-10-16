"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PackageAdminForm } from "@/components/admin/forms/package-admin-form";
import { TrekService } from "@/lib/services/admin-service";
import { TrekItem } from "@/lib/trek-data";

interface EditTrekPageProps {
  params: Promise<{ id: string }>;
}

export default function EditTrekPage({ params }: EditTrekPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [trek, setTrek] = useState<TrekItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadTrek() {
      try {
        const data = await TrekService.getById(resolvedParams.id);
        if (data) {
          setTrek(data);
        } else {
          toast.error("Trek package not found.");
          router.push("/admin/treks");
        }
      } catch (err) {
        console.error("Failed to load trek package:", err);
        toast.error("Failed to load trek package details.");
      } finally {
        setLoading(false);
      }
    }

    if (resolvedParams.id) {
      loadTrek();
    }
  }, [resolvedParams.id, router]);

  const handleUpdate = async (trekData: Record<string, unknown>) => {
    if (!resolvedParams.id) return;
    setIsSubmitting(true);
    try {
      const res = await TrekService.update(resolvedParams.id, trekData as never);
      if (res.success) {
        toast.success(res.message || "Trek package updated successfully!");
        router.push("/admin/treks");
        return true;
      } else {
        toast.error(res.message || "Failed to update trek package.");
        return false;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update trek package.";
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
        <p className="text-sm font-semibold text-slate-600">Loading trek package details...</p>
      </div>
    );
  }

  if (!trek) {
    return null;
  }

  return (
    <PackageAdminForm
      packageType="trek"
      isEdit={true}
      initialData={trek}
      onSubmit={handleUpdate}
      isSubmitting={isSubmitting}
    />
  );
}
