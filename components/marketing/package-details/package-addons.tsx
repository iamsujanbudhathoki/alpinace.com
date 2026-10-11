"use client";

import { Sparkles } from "lucide-react";
import { hasRichText } from "@/lib/utils";
import { PackageSection } from "./package-section";

interface PackageAddonsProps {
  addonsText?: string;
}

export function PackageAddons({ addonsText }: PackageAddonsProps) {
  if (!hasRichText(addonsText)) return null;

  return (
    <PackageSection
      icon={Sparkles}
      eyebrow="Make it yours"
      title="Add-ons & optional upgrades"
    >
      <div
        className="prose-editorial max-w-none"
        dangerouslySetInnerHTML={{ __html: addonsText! }}
      />
    </PackageSection>
  );
}
