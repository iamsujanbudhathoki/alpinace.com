import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TrekService } from "@/lib/services/admin-service";
import { initialTreksData } from "@/lib/trek-data";
import { generatePackageMetadata, generatePackageJsonLd } from "@/lib/seo";
import { TrekDetailClient } from "./trek-detail-client";

interface TrekDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getTrek(slug: string) {
  try {
    const item = await TrekService.getBySlug(slug);
    if (item) return item;
  } catch (e) {
    console.warn(`Server fetch error for trek ${slug}:`, e);
  }
  return initialTreksData.find((t) => t.slug === slug) || null;
}

export async function generateMetadata({
  params,
}: TrekDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const trek = await getTrek(resolvedParams.slug);

  return generatePackageMetadata({
    item: trek,
    categoryType: "trekking",
    slug: resolvedParams.slug,
  });
}

export default async function TrekDetailPage({ params }: TrekDetailPageProps) {
  const resolvedParams = await params;
  const trek = await getTrek(resolvedParams.slug);

  if (!trek) {
    notFound();
  }
  const jsonLd = generatePackageJsonLd({
    item: trek,
    categoryType: "trekking",
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
      <TrekDetailClient initialTrek={trek} slug={resolvedParams.slug} />
    </>
  );
}
