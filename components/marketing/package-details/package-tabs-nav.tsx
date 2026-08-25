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
    <div className={`border-b border-stone-200 pb-1 ${className}`}>
      <div
        ref={containerRef}
        className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1 -mb-px touch-pan-x"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              ref={isActive ? activeBtnRef : null}
              type="button"
              onClick={() => handleTabClick(tab.key)}
              className={`px-3 py-1.5 rounded-md font-medium text-xs whitespace-nowrap transition-all relative cursor-pointer shrink-0 ${
                isActive
                  ? "text-stone-900 bg-stone-100 font-bold"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/60"
              }`}
            >
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 inset-x-1.5 h-0.5 bg-stone-900 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

