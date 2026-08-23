import { Suspense } from "react";
import type { Metadata } from "next";
import { TourService, PackageFilterService } from "@/lib/services/admin-service";
import { PackageStatus } from "@/lib/admin-data";
import { generateStaticMetadata } from "@/lib/seo";
import { PackageGridSkeleton } from "@/components/marketing/skeletons/package-grid-skeleton";
import { ToursCatalogClient } from "@/components/marketing/tours-catalog-client";
import { TourItem, TourType } from "@/lib/tour-data";

export const revalidate = 3600; // Hourly ISR

export function generateMetadata(): Metadata {
  return generateStaticMetadata({
    title: "Nepal Tours & Heritage Journeys | Kathmandu, Pokhara & Safaris",
    description:
      "Book luxury cultural tours, Chitwan wildlife safaris, Pokhara scenic getaways, and helicopter sightseeing circuits across Nepal with expert local guides.",
    path: "/tours",
    keywords: [
      "Nepal cultural tours",
      "Kathmandu heritage tour",
      "Chitwan jungle safari",
      "Pokhara luxury tours",
      "Nepal helicopter tours",
    ],
  });
}

export default async function ToursPage() {
  const [rawTours, filterOptions] = await Promise.all([
    TourService.getAll({ status: PackageStatus.ACTIVE }).catch(() => []),
    PackageFilterService.getOptions("Tour").catch(() => null),
  ]);

  const initialTours: TourItem[] = rawTours.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category,
    rating: Number(p.rating),
    reviewsCount: Number(p.reviewsCount),
    image: p.image || "",
    shortDesc: p.shortDesc || "",
    durationDays: Number(p.durationDays),
    tourType: p.tourType || (p.category as unknown as TourType),
    bestSeason: p.bestSeason || "",
    priceUSD: Number(p.priceUSD),
    highlights: p.permitsRequired || [],
    status: p.status,
    region: p.region,
  }));

  return (
    <Suspense fallback={<PackageGridSkeleton count={6} />}>
      <ToursCatalogClient
        initialTours={initialTours}
        initialFilterOptions={filterOptions}
      />
    </Suspense>
  );
}
