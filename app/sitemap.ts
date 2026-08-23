import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { TrekService, TourService, ExpeditionService, BlogService } from "@/lib/services/admin-service";
import { BlogStatus, PackageStatus } from "@/lib/admin-data";

export const revalidate = 3600; // Hourly ISR revalidation for sitemap

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  // 1. Static Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, priority: 1.0, changeFrequency: "daily", lastModified: new Date() },
    { url: `${baseUrl}/trekking`, priority: 0.9, changeFrequency: "daily", lastModified: new Date() },
    { url: `${baseUrl}/tours`, priority: 0.9, changeFrequency: "daily", lastModified: new Date() },
    { url: `${baseUrl}/expeditions`, priority: 0.9, changeFrequency: "daily", lastModified: new Date() },
    { url: `${baseUrl}/about`, priority: 0.8, changeFrequency: "monthly", lastModified: new Date() },
    { url: `${baseUrl}/contact`, priority: 0.8, changeFrequency: "monthly", lastModified: new Date() },
    { url: `${baseUrl}/blog`, priority: 0.8, changeFrequency: "weekly", lastModified: new Date() },
    { url: `${baseUrl}/privacy`, priority: 0.5, changeFrequency: "yearly", lastModified: new Date() },
    { url: `${baseUrl}/terms`, priority: 0.5, changeFrequency: "yearly", lastModified: new Date() },
  ];

  // 2. Dynamic Active Packages & Published Articles
  let dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    const [treks, tours, expeditions, blogs] = await Promise.all([
      TrekService.getAll({ status: PackageStatus.ACTIVE }).catch(() => []),
      TourService.getAll({ status: PackageStatus.ACTIVE }).catch(() => []),
      ExpeditionService.getAll({ status: PackageStatus.ACTIVE }).catch(() => []),
      BlogService.getAll(BlogStatus.PUBLISHED).catch(() => []),
    ]);

    const trekRoutes: MetadataRoute.Sitemap = treks
      .filter((t) => t.slug && (t.status === PackageStatus.ACTIVE || t.status === PackageStatus.FEATURED))
      .map((t) => ({
        url: `${baseUrl}/trekking/${t.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }));

    const tourRoutes: MetadataRoute.Sitemap = tours
      .filter((t) => t.slug && (t.status === PackageStatus.ACTIVE || t.status === PackageStatus.FEATURED))
      .map((t) => ({
        url: `${baseUrl}/tours/${t.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }));

    const expeditionRoutes: MetadataRoute.Sitemap = expeditions
      .filter((e) => e.slug && (e.status === PackageStatus.ACTIVE || e.status === PackageStatus.FEATURED))
      .map((e) => ({
        url: `${baseUrl}/expeditions/${e.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }));

    const blogRoutes: MetadataRoute.Sitemap = blogs
      .filter((b) => b.slug && b.status === BlogStatus.PUBLISHED)
      .map((b) => ({
        url: `${baseUrl}/blog/${b.slug}`,
        lastModified: b.publishedDate ? new Date(b.publishedDate) : new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      }));

    dynamicRoutes = [
      ...trekRoutes,
      ...tourRoutes,
      ...expeditionRoutes,
      ...blogRoutes,
    ];
  } catch (err) {
    console.warn("Failed to generate dynamic sitemap entries:", err);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
