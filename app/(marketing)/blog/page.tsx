import { Suspense } from "react";
import type { Metadata } from "next";
import { BlogService, CategoryService } from "@/lib/services/admin-service";
import { BlogStatus, CategoryType } from "@/lib/admin-data";
import { generateStaticMetadata } from "@/lib/seo";
import { BlogGridSkeleton } from "@/components/marketing/skeletons/blog-grid-skeleton";
import { BlogCatalogClient } from "@/components/marketing/blog-catalog-client";
import { BlogPost } from "@/lib/home-data";

export const revalidate = 3600; // Hourly ISR

export function generateMetadata(): Metadata {
  return generateStaticMetadata({
    title: "Himalayan Journal & Trekking Guides | AlpineAce Editorial",
    description:
      "Read trail guides, high-altitude gear advice, packing lists, and climbing insights written directly by certified Sherpa leaders.",
    path: "/blog",
    keywords: [
      "Nepal trekking blog",
      "Everest climbing guides",
      "Himalayan travel journal",
      "Trekking gear list Nepal",
      "Sherpa guides blog",
    ],
  });
}

export default async function BlogPage() {
  const [rawBlogs, blogCats] = await Promise.all([
    BlogService.getAll(BlogStatus.PUBLISHED).catch(() => []),
    CategoryService.getByType(CategoryType.BLOGS).catch(() => []),
  ]);

  const initialPosts: BlogPost[] = rawBlogs.map((b) => ({
    id: b.id,
    title: b.title,
    slug: b.slug,
    category: b.category,
    date: b.publishedDate,
    readTime: b.readTime,
    excerpt: b.excerpt || "",
    content: b.content || "",
    image: b.image || "",
  }));

  const initialCategories = [
    { id: "All", name: "All Blogs" },
    ...blogCats.map((c) => ({ id: c.id, name: c.name })),
  ];

  return (
    <Suspense fallback={<BlogGridSkeleton count={6} />}>
      <BlogCatalogClient
        initialPosts={initialPosts}
        initialCategories={initialCategories}
      />
    </Suspense>
  );
}
