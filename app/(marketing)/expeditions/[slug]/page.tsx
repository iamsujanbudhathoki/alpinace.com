import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExpeditionService } from "@/lib/services/admin-service";
import { initialExpeditionsData } from "@/lib/expedition-data";
import { generatePackageMetadata, generatePackageJsonLd } from "@/lib/seo";
import { ExpeditionDetailClient } from "./expedition-detail-client";

interface ExpeditionDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getExpedition(slug: string) {
  try {
    const raw = await ExpeditionService.getBySlug(slug);
    if (raw) return raw;
  } catch (e) {
    console.warn(`Server fetch error for expedition ${slug}:`, e);
  }
  return initialExpeditionsData.find((e) => e.slug === slug) || null;
}

export async function generateMetadata({
  params,
}: ExpeditionDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const expedition = await getExpedition(resolvedParams.slug);

  return generatePackageMetadata({
    item: expedition,
    categoryType: "expeditions",
    slug: resolvedParams.slug,
  });
}

export default async function ExpeditionDetailPage({
  params,
}: ExpeditionDetailPageProps) {
  const resolvedParams = await params;
  const expedition = await getExpedition(resolvedParams.slug);

  if (!expedition) {
    notFound();
  }
  const jsonLd = generatePackageJsonLd({
    item: expedition,
    categoryType: "expeditions",
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
      <ExpeditionDetailClient
        initialExpedition={expedition}
        slug={resolvedParams.slug}
      />
    </>
  );
}
