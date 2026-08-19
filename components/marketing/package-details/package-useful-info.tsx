"use client";

interface PackageUsefulInfoProps {
  usefulInfoText?: string;
}

export function PackageUsefulInfo({ usefulInfoText }: PackageUsefulInfoProps) {
  if (!usefulInfoText || !usefulInfoText.trim()) return null;

  return (
    <div className="space-y-2.5 pt-4 border-t border-stone-200">
      <h3 className="type-heading-lg">
        Useful Information &amp; Guidelines
      </h3>

      <div
        className="prose-editorial max-w-none"
        dangerouslySetInnerHTML={{ __html: usefulInfoText }}
      />
    </div>
  );
}
