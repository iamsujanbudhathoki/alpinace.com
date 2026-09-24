import { sendGTMEvent } from "@next/third-parties/google";

/**
 * Type-safe Google Tag Manager event helper.
 * Re-exports official Next.js sendGTMEvent and provides utility functions.
 */
export { sendGTMEvent };

export function trackEvent(
  eventName: string,
  eventParams?: Record<string, unknown>
) {
  sendGTMEvent({
    event: eventName,
    ...eventParams,
  });
}

/**
 * Direct dataLayer push helper for client-side custom variables or ecommerce tracking
 */
export function pushToDataLayer(data: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    const win = window as unknown as { dataLayer?: unknown[] };
    win.dataLayer = win.dataLayer || [];
    win.dataLayer.push(data);
  }
}
