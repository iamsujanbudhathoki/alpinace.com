import { Suspense } from "react";
import type { Metadata } from "next";
import { TrekService, PackageFilterService } from "@/lib/services/admin-service";
import { PackageStatus } from "@/lib/admin-data";
import { generateStaticMetadata } from "@/lib/seo";
import { PackageGridSkeleton } from "@/components/marketing/skeletons/package-grid-skeleton";
import { TrekkingCatalogClient } from "@/components/marketing/trekking-catalog-client";

export const revalidate = 3600; // Hourly ISR for fresh sitemap/catalog rendering

export function generateMetadata(): Metadata {
  return generateStaticMetadata({
    title: "Nepal Trekking Packages | Guided Himalayan Routes & Circuits",
    description:
      "Explore iconic Everest Base Camp, Annapurna Circuit, Manaslu, and Langtang trekking packages guided by certified IFMGA Sherpas.",
    path: "/trekking",
    keywords: [
      "Nepal trekking packages",
      "Everest Base Camp trek",
      "Annapurna Circuit",
      "Manaslu trek",
      "Langtang valley trek",
      "Sherpa guided treks",
    ],
  });
}

export default async function TrekkingPage() {
  const [initialTreks, filterOptions] = await Promise.all([
    TrekService.getAll({ status: PackageStatus.ACTIVE }).catch(() => []),
    PackageFilterService.getOptions("Trekking").catch(() => null),
  ]);

  return (
    <Suspense fallback={<PackageGridSkeleton count={6} />}>
      <TrekkingCatalogClient
        initialTreks={initialTreks}
        initialFilterOptions={filterOptions}
      />
    </Suspense>
  );
}
