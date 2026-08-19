"use client";

import { useEffect, useRef } from "react";

export interface TabItem {
  key: string;
  label: string;
}

export interface PackageTabsNavProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  className?: string;
  offset?: number;
}

export function PackageTabsNav({
  tabs,
  activeTab,
  onTabChange,
  className = "",
  offset = 80,
}: PackageTabsNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Auto-scroll the active tab into view in horizontal container
  useEffect(() => {
    if (activeBtnRef.current && containerRef.current) {
      const container = containerRef.current;
      const button = activeBtnRef.current;
      const buttonLeft = button.offsetLeft;
      const buttonWidth = button.offsetWidth;
      const containerWidth = container.offsetWidth;
      const scrollLeft = buttonLeft - containerWidth / 2 + buttonWidth / 2;

      container.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: "smooth",
      });
    }
  }, [activeTab]);

  if (!tabs || tabs.length === 0) return null;

  const handleTabClick = (key: string) => {
    onTabChange(key);

    const section = document.getElementById(key);
    if (section) {
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={`pb-3 border-b border-stone-200 ${className}`}>
      <div
        ref={containerRef}
        className="flex items-center gap-1 sm:gap-2 text-sm overflow-x-auto scrollbar-none pb-0.5"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              ref={isActive ? activeBtnRef : null}
              type="button"
              onClick={() => handleTabClick(tab.key)}
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs whitespace-nowrap transition-all relative cursor-pointer ${
                isActive
                  ? "text-amber-900 bg-amber-50/80 font-bold border border-amber-200/80"
                  : "text-stone-600 hover:text-amber-900 hover:bg-amber-50/40"
              }`}
            >
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-amber-700 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
