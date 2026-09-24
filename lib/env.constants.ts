/**
 * Centralized Environment Constants
 * Reads values from Next.js process.env with fallback defaults
 */

export const ENV_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.alpineacetreks.com";

export const ENV_SITE_DOMAIN =
  process.env.NEXT_PUBLIC_SITE_DOMAIN || "www.alpineacetreks.com";

export const ENV_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.alpineacetreks.com";

export const ENV_SITE_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME || "Alpine Ace Treks & Expeditions";

export const ENV_SITE_SHORT_NAME =
  process.env.NEXT_PUBLIC_SITE_SHORT_NAME || "Alpine Ace";

export const ENV_SITE_EMAIL =
  process.env.NEXT_PUBLIC_SITE_EMAIL || "info@alpineacetreks.com";

export const ENV_SITE_TAGLINE =
  process.env.NEXT_PUBLIC_SITE_TAGLINE || "Guided Himalayan Treks & High Altitude Expeditions";

export const ENV_GTM_ID =
  process.env.NEXT_PUBLIC_GTM_ID || "GTM-PSN45B6H";

export const ENV_GA_ID =
  process.env.NEXT_PUBLIC_GA_ID || "G-35E6ELH493";

export const ENV_GOOGLE_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "";

export const ENV_BING_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || "";

/**
 * Standard website domain constant (e.g. https://www.alpineacetreks.com)
 */
export const websiteDomain = ENV_SITE_URL;
