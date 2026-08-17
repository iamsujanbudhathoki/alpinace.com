export const websiteDomain = "https://alpineacetreks.com" as const;
export const SITE_URL = websiteDomain;
export const SITE_DOMAIN = "alpineacetreks.com" as const;
export const SITE_NAME = "AlpineAce Treks & Expeditions" as const;
export const SITE_SHORT_NAME = "AlpineAce" as const;
export const SITE_TAGLINE = "Venture Beyond the Ordinary" as const;
export const SITE_EMAIL = "info@alpineacetreks.com" as const;
export const SITE_SUPPORT_EMAIL = "support@alpineacetreks.com" as const;

export const siteConfig = {
  name: SITE_SHORT_NAME,
  fullName: SITE_NAME,
  domain: SITE_DOMAIN,
  url: SITE_URL,
  email: SITE_EMAIL,
  supportEmail: SITE_SUPPORT_EMAIL,
  title: `${SITE_SHORT_NAME} | Nepal Trekking, Historical Tours & Peak Expeditions`,
  tagline: SITE_TAGLINE,
  description:
    "Experience Nepal's spectacular trekking routes, historical tours, and elite peak expeditions under the safe guidance of multi-summit Sherpas, combined with luxury mountain lodges.",
  keywords: [
    "Nepal trekking",
    "peak expeditions",
    "Sherpa guides",
    "historical tours Nepal",
    "luxury mountain lodges",
    "Everest Base Camp trek",
    "Annapurna circuit",
  ],
} as const;

import { CategoryType } from "@/lib/admin-data";

export type NavSubItem = {
  label: string;
  href: string;
  description?: string;
};

export type NavLink = {
  label: string;
  href: string;
  categoryType?: CategoryType;
  items?: NavSubItem[];
};

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Trekking", href: "/trekking", categoryType: CategoryType.TREKKING },
  { label: "Tours", href: "/tours", categoryType: CategoryType.TOURS },
  {
    label: "Expeditions",
    href: "/expeditions",
    categoryType: CategoryType.EXPEDITIONS,
  },
  {
    label: "Resources",
    href: "/blog",
    items: [
      {
        label: "Blogs & Articles",
        href: "/blog",
        description:
          "Expedition preparation guides, packing lists & Sherpa stories.",
      },
      {
        label: "Contact & Inquiries",
        href: "/contact",
        description:
          "Speak with mountain specialists & get custom route quotes.",
      },
    ],
  },
];

// NOTE: All dynamic contact information (WhatsApp number, emails, office phone,
// emergency phone, addresses, social media links) is fetched in real-time from the backend
// `/settings` API and made accessible via `useSettings()` from `@/lib/settings-context`.
