import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Peak Climbing & Mountaineering Expeditions in Nepal | 6,000m to 8,000m",
  description:
    "Climb the highest peaks in the Himalayas with AlpineAce. Island Peak, Mera Peak, Ama Dablam, Manaslu & Everest expeditions with 1:1 Sherpa guide ratios and advanced safety oxygen infrastructure.",
  keywords: [
    "Nepal mountaineering expeditions",
    "Island Peak climbing",
    "Mera Peak climb",
    "Ama Dablam expedition",
    "Everest expedition Nepal",
    "8000m peaks climbing",
    "Sherpa guides mountaineering",
  ],
  alternates: {
    canonical: `${siteConfig.url}/expeditions`,
  },
  openGraph: {
    title: "Peak Climbing & Mountaineering Expeditions | AlpineAce",
    description:
      "Climb 6,000m to 8,000m peaks with multi-summit Sherpa master guides, fixed-rope safety, and high-altitude medical support.",
    url: `${siteConfig.url}/expeditions`,
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "Himalayan Peak Climbing & Expeditions - AlpineAce",
      },
    ],
  },
};

export default function ExpeditionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
