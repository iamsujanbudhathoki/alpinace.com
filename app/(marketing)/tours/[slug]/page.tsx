import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TourService } from "@/lib/services/admin-service";
import { initialToursData } from "@/lib/tour-data";
import { generatePackageMetadata, generatePackageJsonLd } from "@/lib/seo";
import { TourDetailClient } from "./tour-detail-client";

interface TourDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getTour(slug: string) {
  try {
    const raw = await TourService.getBySlug(slug);
    if (raw) return raw;
  } catch (e) {
    console.warn(`Server fetch error for tour ${slug}:`, e);
  }
  return initialToursData.find((t) => t.slug === slug) || null;
}

export async function generateMetadata({
  params,
}: TourDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const tour = await getTour(resolvedParams.slug);

  return generatePackageMetadata({
    item: tour,
    categoryType: "tours",
    slug: resolvedParams.slug,
  });
}

export default async function TourDetailPage({ params }: TourDetailPageProps) {
  const resolvedParams = await params;
  const tour = await getTour(resolvedParams.slug);

  if (!tour) {
    notFound();
  }
  const jsonLd = generatePackageJsonLd({
    item: tour,
    categoryType: "tours",
    slug: resolvedParams.slug,
  });

  return (
    <>
      {jsonLd && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(jsonLd.breadcrumb),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(jsonLd.trip),
            }}
          />
          {jsonLd.faq && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(jsonLd.faq),
              }}
            />
          )}
        </>
      )}
      <TourDetailClient initialTour={tour} slug={resolvedParams.slug} />
    </>
  );
}
