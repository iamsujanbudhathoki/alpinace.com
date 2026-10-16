"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UpdateExpeditionRedirectProps {
  params: Promise<{ id: string }>;
}

export default function UpdateExpeditionRedirect({ params }: UpdateExpeditionRedirectProps) {
  const resolvedParams = use(params);
  const router = useRouter();

  useEffect(() => {
    if (resolvedParams?.id) {
      router.replace(`/admin/expeditions/${resolvedParams.id}/edit`);
    }
  }, [resolvedParams, router]);

  return null;
}
