"use client";

import { Suspense } from "react";
import { CookieConsentBanner } from "./cookie-consent-banner";

export function SiteAnalytics() {
  return (
    <Suspense fallback={null}>
      <CookieConsentBanner />
    </Suspense>
  );
}
