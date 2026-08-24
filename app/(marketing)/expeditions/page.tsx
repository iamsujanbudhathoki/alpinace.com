import { Suspense } from "react";
import type { Metadata } from "next";
import { ExpeditionService, PackageFilterService } from "@/lib/services/admin-service";
import { PackageStatus } from "@/lib/admin-data";
import { generateStaticMetadata } from "@/lib/seo";
import { PackageGridSkeleton } from "@/components/marketing/skeletons/package-grid-skeleton";
import { ExpeditionsCatalogClient } from "@/components/marketing/expeditions-catalog-client";
import { ClimbingGrade, ExpeditionItem } from "@/lib/expedition-data";

export const revalidate = 3600; // Hourly ISR

export function generateMetadata(): Metadata {
  return generateStaticMetadata({
    title: "Himalayan Peak Expeditions | Island Peak, Mera Peak & Ama Dablam",
    description:
      "Guided mountaineering expeditions across Island Peak, Mera Peak, Lobuche East, and 8000m summits led by IFMGA Sherpa Masters with 1:1 ratio safety support.",
    path: "/expeditions",
    keywords: [
      "Himalayan peak expeditions",
      "Island Peak climbing",
      "Mera Peak expedition",
      "Ama Dablam climbing",
      "Nepal mountaineering",
    ],
  });
}

export default async function ExpeditionsPage() {
  const [rawExpeditions, filterOptions] = await Promise.all([
    ExpeditionService.getAll({ status: PackageStatus.ACTIVE }).catch(() => []),
    PackageFilterService.getOptions("Expedition").catch(() => null),
  ]);

  const initialExpeditions: ExpeditionItem[] = rawExpeditions.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category,
    categoryId: p.categoryId,
    categorySlug: p.categorySlug,
    rating: Number(p.rating),
    reviewsCount: Number(p.reviewsCount),
    image: p.image || "",
    shortDesc: p.shortDesc || "",
    durationDays: Number(p.durationDays),
    peakHeightM: Number(p.peakHeightM || p.maxAltitudeMeters || 0),
    climbingGrade: p.climbingGrade || (p.difficulty as unknown as ClimbingGrade),
    bestSeason: p.bestSeason || "",
    priceUSD: Number(p.priceUSD),
    permitsRequired: p.permitsRequired || [],
    status: p.status,
    region: p.region,
  }));

  return (
    <Suspense fallback={<PackageGridSkeleton count={6} />}>
      <ExpeditionsCatalogClient
        initialExpeditions={initialExpeditions}
        initialFilterOptions={filterOptions}
      />
    </Suspense>
  );
}
