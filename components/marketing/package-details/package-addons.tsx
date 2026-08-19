"use client";

interface PackageAddonsProps {
  addonsText?: string;
}

export function PackageAddons({ addonsText }: PackageAddonsProps) {
  if (!addonsText || !addonsText.trim()) return null;

  return (
    <div className="space-y-2.5 pt-4 border-t border-stone-200">
      <h3 className="type-heading-lg">
        Add-ons &amp; Optional Upgrades
      </h3>

      <div
        className="prose-editorial max-w-none"
        dangerouslySetInnerHTML={{ __html: addonsText }}
      />
    </div>
  );
}
