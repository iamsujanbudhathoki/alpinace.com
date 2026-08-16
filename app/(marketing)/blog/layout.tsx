import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "AlpineAce Journal | Nepal Trekking Guides, Packing Advice & Sherpa Stories",
  description:
    "Explore comprehensive high-altitude preparation guides, Nepal gear checklists, weather breakdowns, and inspiring Sherpa summit stories on the AlpineAce journal.",
  keywords: [
    "Nepal trekking blog",
    "Everest preparation guide",
    "Himalayan gear list",
    "altitude sickness prevention Nepal",
    "Sherpa stories",
    "AlpineAce journal",
  ],
  alternates: {
    canonical: `${siteConfig.url}/blog`,
  },
  openGraph: {
    title: "AlpineAce Journal | Expedition Guides & Himalayan Insights",
    description:
      "Expert preparation guides, packing checklists, and Sherpa stories for your Himalayan journey.",
    url: `${siteConfig.url}/blog`,
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "AlpineAce Journal",
      },
    ],
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
