import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Himalayan Trekking in Nepal | Everest, Annapurna & Remote Trails",
  description:
    "Explore iconic trekking routes in Nepal with AlpineAce. From Everest Base Camp and Annapurna Circuit to remote off-the-beaten-path trails with certified Sherpa guides and luxury lodges.",
  keywords: [
    "Nepal trekking packages",
    "Everest Base Camp trek",
    "Annapurna Circuit",
    "Manaslu Circuit trek",
    "Langtang Valley trek",
    "luxury trekking Nepal",
    "Sherpa guides Nepal",
  ],
  alternates: {
    canonical: `${siteConfig.url}/trekking`,
  },
  openGraph: {
    title: "Himalayan Trekking in Nepal | AlpineAce Expeditions",
    description:
      "Explore iconic trekking routes in Nepal with AlpineAce. Certified Sherpa leaders, small groups, and luxury mountain lodges.",
    url: `${siteConfig.url}/trekking`,
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "Himalayan Trekking - AlpineAce",
      },
    ],
  },
};

export default function TrekkingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
