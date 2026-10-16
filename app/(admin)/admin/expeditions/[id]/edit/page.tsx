"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PackageAdminForm } from "@/components/admin/forms/package-admin-form";
import { ExpeditionService } from "@/lib/services/admin-service";
import { PackageItem } from "@/lib/admin-data";

interface EditExpeditionPageProps {
  params: Promise<{ id: string }>;
}

export default function EditExpeditionPage({ params }: EditExpeditionPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [expedition, setExpedition] = useState<PackageItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadExpedition() {
      try {
        const data = await ExpeditionService.getById(resolvedParams.id);
        if (data) {
          setExpedition(data);
        } else {
          toast.error("Expedition package not found.");
          router.push("/admin/expeditions");
        }
      } catch (err) {
        console.error("Failed to load expedition package:", err);
        toast.error("Failed to load expedition package details.");
      } finally {
        setLoading(false);
      }
    }

    if (resolvedParams.id) {
      loadExpedition();
    }
  }, [resolvedParams.id, router]);

  const handleUpdate = async (expData: Record<string, unknown>) => {
    if (!resolvedParams.id) return;
    setIsSubmitting(true);
    try {
      const res = await ExpeditionService.update(resolvedParams.id, expData as never);
      if (res.success) {
        toast.success(res.message || "Expedition package updated successfully!");
        router.push("/admin/expeditions");
        return true;
      } else {
        toast.error(res.message || "Failed to update expedition package.");
        return false;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update expedition package.";
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
        <p className="text-sm font-semibold text-slate-600">Loading expedition package details...</p>
      </div>
    );
  }

  if (!expedition) {
    return null;
  }

  return (
    <PackageAdminForm
      packageType="expedition"
      isEdit={true}
      initialData={expedition}
      onSubmit={handleUpdate}
      isSubmitting={isSubmitting}
    />
  );
}
