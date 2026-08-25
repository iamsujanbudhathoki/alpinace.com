"use client";

interface PackageAddonsProps {
  addonsText?: string;
}

export function PackageAddons({ addonsText }: PackageAddonsProps) {
  if (!addonsText || !addonsText.trim()) return null;

  return (
    <div className="space-y-4">
      <div className="pb-3 border-b border-stone-200">
        <h2 className="type-heading-xl">
          Add-ons &amp; Optional Upgrades
        </h2>
      </div>

      <div
        className="prose-editorial max-w-none"
        dangerouslySetInnerHTML={{ __html: addonsText }}
      />
    </div>
  );
}
