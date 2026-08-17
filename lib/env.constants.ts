/**
 * Centralized Environment Constants
 * Reads values from Next.js process.env with fallback defaults
 */

export const ENV_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://alpineacetreks.com";

export const ENV_SITE_DOMAIN =
  process.env.NEXT_PUBLIC_SITE_DOMAIN || "alpineacetreks.com";

export const ENV_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export const ENV_SITE_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME || "AlpineAce Treks & Expeditions";

export const ENV_SITE_SHORT_NAME =
  process.env.NEXT_PUBLIC_SITE_SHORT_NAME || "AlpineAce";

export const ENV_SITE_EMAIL =
  process.env.NEXT_PUBLIC_SITE_EMAIL || "info@alpineacetreks.com";

export const ENV_SITE_TAGLINE =
  process.env.NEXT_PUBLIC_SITE_TAGLINE || "Venture Beyond the Ordinary";

/**
 * Standard website domain constant (e.g. https://alpineacetreks.com)
 */
export const websiteDomain = ENV_SITE_URL;
