/**
 * Centralized Environment Constants
 * Reads values from Next.js process.env with fallback defaults
 */

export const ENV_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://alpineacetreks.com";

export const ENV_SITE_DOMAIN =
  process.env.NEXT_PUBLIC_SITE_DOMAIN || "alpineacetreks.com";

export const ENV_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.alpineacetreks.com";

export const ENV_SITE_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME || "AlpineAce Treks & Expeditions";

export const ENV_SITE_SHORT_NAME =
  process.env.NEXT_PUBLIC_SITE_SHORT_NAME || "AlpineAce";

export const ENV_SITE_EMAIL =
  process.env.NEXT_PUBLIC_SITE_EMAIL || "info@alpineacetreks.com";

export const ENV_SITE_TAGLINE =
  process.env.NEXT_PUBLIC_SITE_TAGLINE || "Guided Himalayan Treks & High Altitude Expeditions";

export const ENV_GTM_ID =
  process.env.NEXT_PUBLIC_GTM_ID || "GTM-PSN45B6H";

export const ENV_GA_ID =
  process.env.NEXT_PUBLIC_GA_ID || "G-35E6ELH493";

/**
 * Standard website domain constant (e.g. https://alpineacetreks.com)
 */
export const websiteDomain = ENV_SITE_URL;
