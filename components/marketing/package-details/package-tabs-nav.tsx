"use client";

export interface TabItem {
  key: string;
  label: string;
}

export interface PackageTabsNavProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  className?: string;
}

export function PackageTabsNav({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}: PackageTabsNavProps) {
  if (!tabs || tabs.length === 0) return null;

  return (
    <div
      className={`border-b border-[#E6E0D5] flex items-center gap-8 text-sm overflow-x-auto no-scrollbar ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`pb-3.5 font-medium whitespace-nowrap transition-all relative cursor-pointer ${
              isActive
                ? "text-[#1E2420] font-bold"
                : "text-[#6B726C] hover:text-[#1E2420]"
            }`}
          >
            <span>{tab.label}</span>
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2D4536] rounded-full shadow-xs" />
            )}
          </button>
        );
      })}
    </div>
  );
}
