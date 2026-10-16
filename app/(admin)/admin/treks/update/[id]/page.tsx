"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UpdateTrekRedirectProps {
  params: Promise<{ id: string }>;
}

export default function UpdateTrekRedirect({ params }: UpdateTrekRedirectProps) {
  const resolvedParams = use(params);
  const router = useRouter();

  useEffect(() => {
    if (resolvedParams?.id) {
      router.replace(`/admin/treks/${resolvedParams.id}/edit`);
    }
  }, [resolvedParams, router]);

  return null;
}
