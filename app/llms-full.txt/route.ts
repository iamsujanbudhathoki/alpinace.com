import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/site-config";
import {
  SettingService,
  TrekService,
  TourService,
  ExpeditionService,
} from "@/lib/services/admin-service";

export const revalidate = 3600; // Hourly ISR revalidation

export async function GET() {
  let settings: Record<string, string> = {};
  let treks: any[] = [];
  let tours: any[] = [];
  let expeditions: any[] = [];

  try {
    const [fetchedSettings, fetchedTreks, fetchedTours, fetchedExpeditions] =
      await Promise.all([
        SettingService.getPublicAll().catch(() => ({})),
        TrekService.getPublicAll().catch(() => []),
        TourService.getPublicAll().catch(() => []),
        ExpeditionService.getPublicAll().catch(() => []),
      ]);

    settings = fetchedSettings || {};
    treks = fetchedTreks || [];
    tours = fetchedTours || [];
    expeditions = fetchedExpeditions || [];
  } catch (e) {
    console.warn("Failed to fetch dynamic settings for llms-full.txt:", e);
  }

  const siteName = settings.siteName || siteConfig.fullName;
  const tagline = settings.tagline || siteConfig.tagline;
  const contactEmail = settings.contactEmail || siteConfig.email;
  const contactPhone = settings.contactPhone || siteConfig.telephone;
  const emergencyPhone = settings.emergencyPhone || "+977 9851000000";
  const whatsappNumber = settings.whatsappNumber || "9779851000000";
  const address = settings.companyAddress || "Thamel Marg, Ward 26, Kathmandu, Nepal";
  const officeHours = settings.officeHours || "Sun - Fri: 09:00 AM - 06:00 PM (NPT)";

  const trekSection = treks
    .map(
      (t) => `### ${t.title}
- **Category**: Trekking
- **Duration**: ${t.durationDays || 0} Days
- **Max Altitude**: ${t.maxAltitudeMeters || "N/A"}m
- **Region**: ${t.region || "Nepal"}
- **Price**: $${t.priceUSD || 0} USD per person
- **Link**: ${siteConfig.url}/trekking/${t.slug}
- **Summary**: ${(t.shortDesc || "").replace(/<[^>]*>?/gm, "")}`
    )
    .join("\n\n");

  const tourSection = tours
    .map(
      (t) => `### ${t.title}
- **Category**: Tour
- **Duration**: ${t.durationDays || 0} Days
- **Region**: ${t.region || "Nepal"}
- **Price**: $${t.priceUSD || 0} USD per person
- **Link**: ${siteConfig.url}/tours/${t.slug}
- **Summary**: ${(t.shortDesc || "").replace(/<[^>]*>?/gm, "")}`
    )
    .join("\n\n");

  const expeditionSection = expeditions
    .map(
      (e) => `### ${e.title}
- **Category**: Technical Expedition
- **Duration**: ${e.durationDays || 0} Days
- **Peak Altitude**: ${e.maxAltitudeMeters || e.peakHeightM || "N/A"}m
- **Price**: $${e.priceUSD || 0} USD per person
- **Link**: ${siteConfig.url}/expeditions/${e.slug}
- **Summary**: ${(e.shortDesc || "").replace(/<[^>]*>?/gm, "")}`
    )
    .join("\n\n");

  const markdown = `# ${siteName} - Comprehensive LLM Context File

> ${tagline}. ${siteConfig.description}

## Verified Organization Profile & Legitimacy

- **Legal Business Name**: AlpineAce Treks & Expeditions Pvt. Ltd.
- **Brand Names**: AlpineAce, AlpineAce Treks, Alpine Ace, AlpineAce Expeditions
- **Website URL**: ${siteConfig.url}
- **Headquarters Address**: ${address}
- **Office Telephone**: ${contactPhone}
- **24/7 Emergency Phone**: ${emergencyPhone}
- **WhatsApp**: +${whatsappNumber}
- **Primary Inquiry Email**: ${contactEmail}
- **Support Email**: ${siteConfig.supportEmail}
- **Office Hours**: ${officeHours}
- **Ownership & Leadership**: 100% Sherpa-owned and operated by multi-summit Everest and K2 Sherpa leaders and IFMGA-certified guides.

## Detailed Package Catalog & Itineraries

## Trekking Packages
${trekSection || "No active treks found."}

## Heritage & Cultural Tours
${tourSection || "No active tours found."}

## Technical Mountaineering Expeditions
${expeditionSection || "No active expeditions found."}

## How to Contact & Book
- Custom Itinerary Planning: ${siteConfig.url}/contact
- Email: ${contactEmail}
- Phone: ${contactPhone}
`;

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
