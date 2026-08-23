"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

export interface TurnstileWidgetRef {
  reset: () => void;
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

export const TurnstileWidget = forwardRef<TurnstileWidgetRef, TurnstileWidgetProps>(
  function TurnstileWidget(
    { onVerify, onExpire, onError, className = "" }: TurnstileWidgetProps,
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    const onVerifyRef = useRef(onVerify);
    const onExpireRef = useRef(onExpire);
    const onErrorRef = useRef(onError);

    useEffect(() => {
      onVerifyRef.current = onVerify;
      onExpireRef.current = onExpire;
      onErrorRef.current = onError;
    });

    const siteKey =
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.reset(widgetIdRef.current);
          } catch (e) {
            console.warn("[Turnstile] Reset failed:", e);
          }
        }
      },
    }));

    useEffect(() => {
      let isMounted = true;

      const renderWidget = () => {
        if (!containerRef.current || !window.turnstile) return;
        if (widgetIdRef.current) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch (_) {}
        }

        try {
          const id = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            theme: "light",
            callback: (token: string) => {
              if (isMounted && onVerifyRef.current) {
                onVerifyRef.current(token);
              }
            },
            "expired-callback": () => {
              if (isMounted && onExpireRef.current) {
                onExpireRef.current();
              }
            },
            "error-callback": () => {
              if (isMounted && onErrorRef.current) {
                onErrorRef.current();
              }
            },
          });
          widgetIdRef.current = id;
        } catch (err) {
          console.warn("[Turnstile] Render warning:", err);
        }
      };

      if (window.turnstile) {
        renderWidget();
      } else {
        const existingScript = document.getElementById("cf-turnstile-script");
        if (!existingScript) {
          const script = document.createElement("script");
          script.id = "cf-turnstile-script";
          script.src =
            "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback";
          script.async = true;
          script.defer = true;

          const prevCallback = window.onloadTurnstileCallback;
          window.onloadTurnstileCallback = () => {
            if (prevCallback) prevCallback();
            if (isMounted) renderWidget();
          };

          document.head.appendChild(script);
        } else {
          const interval = setInterval(() => {
            if (window.turnstile) {
              clearInterval(interval);
              if (isMounted) renderWidget();
            }
          }, 100);
          return () => clearInterval(interval);
        }
      }

      return () => {
        isMounted = false;
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch (_) {}
        }
      };
    }, [siteKey]);

    return (
      <div className={`flex flex-col items-center my-3 ${className}`}>
        <div ref={containerRef} className="cf-turnstile" />
        <span className="text-[11px] font-semibold text-stone-700 mt-1">
          Protected by Cloudflare Turnstile CAPTCHA
        </span>
      </div>
    );
  }
);
