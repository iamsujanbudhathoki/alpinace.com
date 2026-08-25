"use client";

interface PackageUsefulInfoProps {
  usefulInfoText?: string;
}

export function PackageUsefulInfo({ usefulInfoText }: PackageUsefulInfoProps) {
  if (!usefulInfoText || !usefulInfoText.trim()) return null;

  return (
    <div className="space-y-4">
      <div className="pb-3 border-b border-stone-200">
        <h2 className="type-heading-xl">
          Useful Information &amp; Guidelines
        </h2>
      </div>

      <div
        className="prose-editorial max-w-none"
        dangerouslySetInnerHTML={{ __html: usefulInfoText }}
      />
    </div>
  );
}
