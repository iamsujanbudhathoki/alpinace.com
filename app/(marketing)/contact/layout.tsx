import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact AlpineAce | Expedition Inquiries & Custom Itineraries",
  description:
    "Get in touch with AlpineAce's Himalayan expedition specialists in Kathmandu. Plan your custom trek, peak climb, or private tour with certified Sherpa guides.",
  alternates: {
    canonical: `${siteConfig.url}/contact`,
  },
  openGraph: {
    title: "Contact AlpineAce Expeditions",
    description:
      "Speak directly with our Sherpa expedition leaders and custom journey designers.",
    url: `${siteConfig.url}/contact`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
