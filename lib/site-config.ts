import {
  ENV_SITE_URL,
  ENV_SITE_DOMAIN,
  ENV_SITE_NAME,
  ENV_SITE_SHORT_NAME,
  ENV_SITE_EMAIL,
  ENV_SITE_TAGLINE,
  websiteDomain,
} from "@/lib/env.constants";

export { websiteDomain };
export const SITE_URL = websiteDomain;
export const SITE_DOMAIN = ENV_SITE_DOMAIN;
export const SITE_NAME = ENV_SITE_NAME;
export const SITE_SHORT_NAME = ENV_SITE_SHORT_NAME;
export const SITE_TAGLINE = ENV_SITE_TAGLINE;
export const SITE_EMAIL = ENV_SITE_EMAIL;
export const SITE_SUPPORT_EMAIL = `support@${ENV_SITE_DOMAIN}` as const;

export const siteConfig = {
  name: SITE_SHORT_NAME,
  fullName: SITE_NAME,
  alternateNames: [
    "Alpine Ace",
    "AlpineAce",
    "Alpine Ace Treks",
    "AlpineAce Treks",
    "Alpine Ace Expeditions",
    "AlpineAce Expeditions",
    "Alpine Ace Treks & Expeditions",
    "AlpineAce Treks & Expeditions",
    "alpineacetreks.com",
    "alpineace.com",
  ],
  domain: SITE_DOMAIN,
  url: SITE_URL,
  email: SITE_EMAIL,
  supportEmail: SITE_SUPPORT_EMAIL,
  telephone: "",
  address: {
    streetAddress: "",
    addressLocality: "Kathmandu",
    addressRegion: "Bagmati",
    postalCode: "",
    addressCountry: "NP",
  },
  title: `${SITE_SHORT_NAME} | Nepal Trekking, Historical Tours & Peak Expeditions`,
  tagline: SITE_TAGLINE,
  description:
    "Expert-guided trekking, cultural tours, and mountaineering expeditions in Nepal. Planned directly from our Kathmandu office with certified guides, comfortable teahouses, and safety-first logistics.",
  keywords: [
    "Alpine Ace",
    "AlpineAce",
    "Alpine Ace Treks",
    "AlpineAce Treks",
    "Alpine Ace Expeditions",
    "AlpineAce Expeditions",
    "Alpine Ace Nepal",
    "AlpineAce Nepal",
    "alpineacetreks.com",
    "alpineace.com",
    "Nepal trekking",
    "peak expeditions",
    "mountain guides",
    "historical tours Nepal",
    "luxury mountain lodges",
    "Everest Base Camp trek",
    "Annapurna circuit",
  ],
  llmsTxtUrl: `${SITE_URL}/llms.txt`,
  llmsFullTxtUrl: `${SITE_URL}/llms-full.txt`,
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
  { label: "TREKKINGS", href: "/trekking", categoryType: CategoryType.TREKKING },
  { label: "TOURS", href: "/tours", categoryType: CategoryType.TOURS },
  {
    label: "EXPEDITIONS",
    href: "/expeditions",
    categoryType: CategoryType.EXPEDITIONS,
  },
  {
    label: "RESOURCES",
    href: "/blog",
    items: [
      {
        label: "Blogs & Articles",
        href: "/blog",
        description:
          "Expedition preparation guides, packing lists & mountain stories.",
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
