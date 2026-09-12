"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, X } from "lucide-react";

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already responded to consent
    const consentChoice = localStorage.getItem("alpine_cookie_consent");
    if (!consentChoice) {
      // Delay showing banner slightly for smooth UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else if (consentChoice === "granted" && typeof window !== "undefined" && typeof window.gtag === "function") {
      // Re-apply granted consent on return visits
      window.gtag("consent", "update", {
        analytics_storage: "granted",
      });
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("alpine_cookie_consent", "granted");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("alpine_cookie_consent_updated"));
      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", {
          analytics_storage: "granted",
        });
      }
    }
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem("alpine_cookie_consent", "denied");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("alpine_cookie_consent_updated"));
      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", {
          analytics_storage: "denied",
        });
      }
    }
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent banner"
      className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-[100] p-4.5 sm:p-5 rounded-2xl bg-stone-900/95 backdrop-blur-md text-stone-100 border border-stone-800/80 shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-5 duration-300 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-amber-400">
          <Cookie className="w-5 h-5 shrink-0" />
          <h3 className="font-heading font-bold text-sm text-stone-100">Cookie &amp; Privacy Choice</h3>
        </div>
        <button
          onClick={handleDecline}
          className="text-stone-400 hover:text-stone-200 transition-colors p-1.5 rounded-lg hover:bg-stone-800/60"
          aria-label="Close cookie consent banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="mt-2 text-xs text-stone-300 leading-relaxed">
        We use cookies to analyze site traffic and enhance your trekking inquiry experience. Read our{" "}
        <Link href="/privacy" className="text-amber-400 hover:underline font-medium">
          Privacy Policy
        </Link>.
      </p>

      <div className="mt-4 flex items-center justify-end gap-2.5">
        <button
          onClick={handleDecline}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-300 bg-stone-800 hover:bg-stone-700 hover:text-stone-100 transition-colors"
        >
          Reject
        </button>
        <button
          onClick={handleAccept}
          className="px-4.5 py-2 rounded-xl text-xs font-semibold text-stone-950 bg-stone-100 hover:bg-white transition-all shadow-md flex items-center justify-center gap-1.5"
        >
          <ShieldCheck className="w-4 h-4 text-stone-950" />
          Accept All
        </button>
      </div>
    </div>
  );
}
