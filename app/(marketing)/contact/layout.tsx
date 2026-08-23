import type { Metadata } from "next";
import { generateStaticMetadata } from "@/lib/seo";

export const metadata: Metadata = generateStaticMetadata({
  title: "Contact AlpineAce | Expedition Inquiries & Custom Itineraries",
  description:
    "Get in touch with AlpineAce's Himalayan expedition specialists in Thamel, Kathmandu. Plan your custom trek, peak climb, or private tour with certified Sherpa guides.",
  path: "/contact",
  keywords: [
    "Contact AlpineAce",
    "Kathmandu trek agency contact",
    "Custom Nepal trekking inquiry",
    "Sherpa guides phone number",
  ],
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
