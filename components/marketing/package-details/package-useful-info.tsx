"use client";

import { Info } from "lucide-react";

interface PackageUsefulInfoProps {
  usefulInfoText?: string;
}

export function PackageUsefulInfo({ usefulInfoText }: PackageUsefulInfoProps) {
  if (!usefulInfoText || !usefulInfoText.trim()) return null;

  return (
    <div className="bg-white border border-[#EAE5DC] rounded-2xl p-6 sm:p-8 space-y-4 shadow-2xs">
      <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#1E2420] flex items-center gap-2.5">
        <Info className="w-5 h-5 text-amber-700" />
        <span>Useful Information &amp; Guidelines</span>
      </h2>

      <div
        className="prose prose-stone max-w-none text-[#3A423C] text-sm sm:text-base leading-relaxed font-normal [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_h3]:font-bold [&_h3]:text-base [&_h3]:text-[#1E2420] [&_h3]:mt-4 [&_h3]:mb-1 [&_strong]:font-bold [&_strong]:text-[#1E2420] [&_a]:text-amber-800 [&_a]:underline"
        dangerouslySetInnerHTML={{ __html: usefulInfoText }}
      />
    </div>
  );
}
