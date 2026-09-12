"use client";

import { useState, useEffect, Suspense } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useSettings } from "@/lib/settings-context";
import { CookieConsentBanner } from "./cookie-consent-banner";

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Extract verification token whether user pastes raw key or full HTML meta tag
 */
export function extractVerificationToken(input?: string): string {
  if (!input) return "";
  const trimmed = input.trim();
  if (!trimmed) return "";

  // If user pasted full <meta ... content="TOKEN" /> string
  const match = trimmed.match(/content=["']([^"']+)["']/i);
  if (match && match[1]) {
    return match[1].trim();
  }

  // If user pasted raw key or string wrapped in quotes/brackets
  return trimmed.replace(/^<meta[^>]*>/i, "").replace(/["'\/>]/g, "").trim();
}

function SiteAnalyticsTracker() {
  const { settings } = useSettings();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const gaId = settings.googleAnalyticsId?.trim();

  const [hasConsent, setHasConsent] = useState<boolean>(false);

  useEffect(() => {
    const checkConsent = () => {
      if (typeof window !== "undefined") {
        const consent = localStorage.getItem("alpine_cookie_consent");
        setHasConsent(consent === "granted");
      }
    };

    checkConsent();

    window.addEventListener("alpine_cookie_consent_updated", checkConsent);
    return () => {
      window.removeEventListener("alpine_cookie_consent_updated", checkConsent);
    };
  }, []);

  // Track pageviews on SPA route changes ONLY if consent has been explicitly granted
  useEffect(() => {
    if (!gaId || !hasConsent || typeof window === "undefined" || typeof window.gtag !== "function") return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    window.gtag("config", gaId, {
      page_path: url,
    });
  }, [gaId, hasConsent, pathname, searchParams]);

  // Strictly block script loading if no GA ID or consent is NOT granted
  if (!gaId || !hasConsent) return null;

  return (
    <>
      {/* GA4 Google Tag script loaded strictly after explicit consent */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'analytics_storage': 'granted',
              'ad_storage': 'granted'
            });
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname + window.location.search,
            });
          `,
        }}
      />
    </>
  );
}

export function SiteAnalytics() {
  return (
    <Suspense fallback={null}>
      <SiteAnalyticsTracker />
      <CookieConsentBanner />
    </Suspense>
  );
}
