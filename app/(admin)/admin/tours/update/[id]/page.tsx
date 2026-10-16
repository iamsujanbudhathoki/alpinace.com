"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UpdateTourRedirectProps {
  params: Promise<{ id: string }>;
}

export default function UpdateTourRedirect({ params }: UpdateTourRedirectProps) {
  const resolvedParams = use(params);
  const router = useRouter();

  useEffect(() => {
    if (resolvedParams?.id) {
      router.replace(`/admin/tours/${resolvedParams.id}/edit`);
    }
  }, [resolvedParams, router]);

  return null;
}
