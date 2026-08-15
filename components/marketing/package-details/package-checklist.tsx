"use client";

export interface ChecklistSection {
  title: string;
  items: string[];
  provided?: boolean;
}

export interface PackageChecklistProps {
  title?: string;
  subtitle?: string;
  sections: ChecklistSection[];
}

export function PackageChecklist({
  title = "Trekking Gear & Equipment Checklist",
  subtitle = "Recommended essentials for your high-altitude journey in the Himalayas",
  sections,
}: PackageChecklistProps) {
  if (!sections || sections.length === 0) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-[#1E2420]">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-[#6B726C] mt-0.5">{subtitle}</p>
        )}
      </div>

      <div
        className={`grid gap-6 text-sm ${
          sections.length === 1
            ? "grid-cols-1"
            : sections.length === 2
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-1 sm:grid-cols-3"
        }`}
      >
        {sections.map((sec, idx) => (
          <div
            key={idx}
            className="p-5 bg-white border border-[#EAE5DC] rounded-xl space-y-3 shadow-2xs"
          >
            <h4 className="font-bold text-[#1E2420]">{sec.title}</h4>
            <ul className="space-y-2 text-[#3A423C]">
              {sec.items.map((item, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      sec.provided ? "bg-[#2D4536]" : "bg-[#6B726C]"
                    }`}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
