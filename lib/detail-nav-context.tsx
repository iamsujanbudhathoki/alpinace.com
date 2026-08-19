"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { TabItem } from "@/components/marketing/package-details/package-tabs-nav";

export interface DetailNavData {
  title: string;
  categoryLabel?: string;
  categoryHref?: string;
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  priceUSD?: number;
  onBookClick?: () => void;
  bookButtonLabel?: string;
}

interface DetailNavContextType {
  detailNav: DetailNavData | null;
  setDetailNav: (data: DetailNavData | null) => void;
}

const DetailNavContext = createContext<DetailNavContextType>({
  detailNav: null,
  setDetailNav: () => {},
});

export function DetailNavProvider({ children }: { children: ReactNode }) {
  const [detailNav, setDetailNav] = useState<DetailNavData | null>(null);

  return (
    <DetailNavContext.Provider value={{ detailNav, setDetailNav }}>
      {children}
    </DetailNavContext.Provider>
  );
}

export function useDetailNav() {
  return useContext(DetailNavContext);
}
