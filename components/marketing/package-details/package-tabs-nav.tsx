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
    <div className={`border-b border-stone-200 bg-white/80 backdrop-blur-xs ${className}`}>
      <div
        ref={containerRef}
        className="flex items-center overflow-x-auto scrollbar-none touch-pan-x -mb-px px-2 sm:px-0"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              ref={isActive ? activeBtnRef : null}
              type="button"
              onClick={() => handleTabClick(tab.key)}
              className={`
                relative px-3.5 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm whitespace-nowrap shrink-0 cursor-pointer min-h-[44px] flex items-center justify-center
                transition-colors duration-200 border-b-2 font-medium
                ${isActive
                  ? "border-amber-700 text-amber-900 font-bold"
                  : "border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300"
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

