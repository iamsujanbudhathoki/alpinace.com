"use client";

import { useEffect, Suspense } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useSettings } from "@/lib/settings-context";

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
  const gscVerificationToken = extractVerificationToken(settings.googleSiteVerification);

  // Track pageviews on SPA route changes when GA4 ID is configured
  useEffect(() => {
    if (!gaId || typeof window === "undefined" || typeof window.gtag !== "function") return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    window.gtag("config", gaId, {
      page_path: url,
    });
  }, [gaId, pathname, searchParams]);

  return (
    <>
      {/* Google Search Console verification meta tag (React hoists <meta> directly to <head>) */}
      {gscVerificationToken && (
        <meta name="google-site-verification" content={gscVerificationToken} />
      )}

      {/* GA4 Google Tag script */}
      {gaId && (
        <>
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
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname + window.location.search,
                });
              `,
            }}
          />
        </>
      )}
    </>
  );
}

export function SiteAnalytics() {
  return (
    <Suspense fallback={null}>
      <SiteAnalyticsTracker />
    </Suspense>
  );
}
