"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { SettingService } from "@/lib/services/admin-service";

export interface SiteSettings {
  siteName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  emergencyPhone: string;
  whatsappNumber: string;
  companyAddress: string;
  googleMapsUrl: string;
  officeHours: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
  googleAnalyticsId: string;
  googleSiteVerification: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  tripadvisorUrl: string;
  linkedinUrl: string;
  currency: string;
  depositPercentage: string;
  enableBookings: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: "",
  tagline: "",
  contactEmail: "",
  contactPhone: "",
  emergencyPhone: "",
  whatsappNumber: "",
  companyAddress: "",
  googleMapsUrl: "",
  officeHours: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  canonicalUrl: "",
  googleAnalyticsId: "",
  googleSiteVerification: "",
  facebookUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
  tripadvisorUrl: "",
  linkedinUrl: "",
  currency: "USD",
  depositPercentage: "20",
  enableBookings: "true",
};

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SITE_SETTINGS,
  loading: false,
  refreshSettings: async () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const data = await SettingService.getAll();
      if (data && Object.keys(data).length > 0) {
        setSettings((prev) => ({
          ...prev,
          ...data,
        }));
      }
    } catch (e) {
      console.warn("Could not load dynamic settings from backend, using defaults:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
