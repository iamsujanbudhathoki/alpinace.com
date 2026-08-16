import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Cultural, Wildlife & Scenic Tours in Nepal | Luxury Guided Journeys",
  description:
    "Discover Nepal's UNESCO heritage sites, ancient temples in Kathmandu, serene Pokhara lakes, and Chitwan wildlife safaris with AlpineAce's luxury guided tours.",
  keywords: [
    "Nepal luxury tours",
    "Kathmandu cultural tours",
    "Chitwan jungle safari",
    "Pokhara scenic tours",
    "Nepal private guided tours",
    "AlpineAce tours",
  ],
  alternates: {
    canonical: `${siteConfig.url}/tours`,
  },
  openGraph: {
    title: "Cultural & Scenic Tours in Nepal | AlpineAce",
    description:
      "Discover Nepal's UNESCO heritage sites, ancient kingdoms, and wildlife safaris with private luxury logistics.",
    url: `${siteConfig.url}/tours`,
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "Nepal Cultural & Wildlife Tours - AlpineAce",
      },
    ],
  },
};

export default function ToursLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
