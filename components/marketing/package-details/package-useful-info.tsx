"use client";

import { Info } from "lucide-react";
import { hasRichText } from "@/lib/utils";
import { PackageSection } from "./package-section";

interface PackageUsefulInfoProps {
  usefulInfoText?: string;
}

export function PackageUsefulInfo({ usefulInfoText }: PackageUsefulInfoProps) {
  if (!hasRichText(usefulInfoText)) return null;

  return (
    <PackageSection
      variant="panel"
      icon={Info}
      eyebrow="Before you go"
      title="Useful information & guidelines"
    >
      <div
        className="prose-editorial max-w-none"
        dangerouslySetInnerHTML={{ __html: usefulInfoText! }}
      />
    </PackageSection>
  );
}
