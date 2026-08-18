import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogService } from "@/lib/services/admin-service";
import { generateBlogMetadata, generateBlogJsonLd } from "@/lib/seo";
import { BlogDetailClient } from "./blog-detail-client";

interface BlogDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getBlogPost(slug: string) {
  try {
    const fetched = await BlogService.getById(slug);
    if (fetched) {
      return {
        id: fetched.id,
        title: fetched.title,
        slug: fetched.slug,
        category: fetched.category,
        date: fetched.publishedDate,
        readTime: fetched.readTime,
        excerpt: fetched.excerpt || "",
        content: fetched.content || "",
        image: fetched.image || "",
        metaTitle: (fetched as any).metaTitle,
        metaDescription: (fetched as any).metaDescription,
        keywords: (fetched as any).keywords,
      };
    }
  } catch (e) {
    console.warn(`Server fetch error for blog ${slug}:`, e);
  }
  return null;
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getBlogPost(resolvedParams.slug);

  return generateBlogMetadata(post, resolvedParams.slug);
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const resolvedParams = await params;
  const post = await getBlogPost(resolvedParams.slug);

  if (!post) {
    notFound();
  }
  const jsonLd = generateBlogJsonLd(post, resolvedParams.slug);

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
              __html: JSON.stringify(jsonLd.article),
            }}
          />
        </>
      )}
      <BlogDetailClient initialPost={post} slug={resolvedParams.slug} />
    </>
  );
}
