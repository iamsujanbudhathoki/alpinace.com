export const siteConfig = {
  name: "AlpineAce",
  title: "AlpineAce | Nepal Trekking, Historical Tours & Peak Expeditions",
  tagline: "Venture Beyond the Ordinary",
  description:
    "Experience Nepal's spectacular trekking routes, historical tours, and elite peak expeditions under the safe guidance of multi-summit Sherpas, combined with luxury mountain lodges.",
  url: "https://alpineace.com",
  keywords: [
    "Nepal trekking",
    "peak expeditions",
    "Sherpa guides",
    "historical tours Nepal",
    "luxury mountain lodges",
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
  { label: "Expeditions", href: "/expeditions", categoryType: CategoryType.EXPEDITIONS },
  {
    label: "Resources",
    href: "/blog",
    items: [
      {
        label: "Blogs & Articles",
        href: "/blog",
        description: "Expedition preparation guides, packing lists & Sherpa stories.",
      },
      {
        label: "Contact & Inquiries",
        href: "/contact",
        description: "Speak with mountain specialists & get custom route quotes.",
      },
    ],
  },
];

// NOTE: All dynamic contact information (WhatsApp number, emails, office phone,
// emergency phone, addresses, social media links) is fetched in real-time from the backend
// `/settings` API and made accessible via `useSettings()` from `@/lib/settings-context`.


