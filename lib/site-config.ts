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

export type NavLink = {
  label: string;
  href: string;
  categoryType?: CategoryType;
};

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Trekking", href: "/trekking", categoryType: CategoryType.TREKKING },
  { label: "Tours", href: "/tours", categoryType: CategoryType.TOURS },
  { label: "Expeditions", href: "/expeditions", categoryType: CategoryType.EXPEDITIONS },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog", categoryType: CategoryType.BLOGS },
  { label: "Contact", href: "/contact" },
];

export const contact = {
  // TODO: replace with the real WhatsApp business number (E.164 digits, no leading "+").
  whatsappNumber: "9770000000000",
} as const;
