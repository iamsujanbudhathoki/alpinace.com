import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;

  const routes = [
    { url: "", priority: 1.0, changeFrequency: "daily" },
    { url: "/trekking", priority: 0.9, changeFrequency: "daily" },
    { url: "/tours", priority: 0.9, changeFrequency: "daily" },
    { url: "/expeditions", priority: 0.9, changeFrequency: "daily" },
    { url: "/about", priority: 0.8, changeFrequency: "monthly" },
    { url: "/contact", priority: 0.8, changeFrequency: "monthly" },
    { url: "/blog", priority: 0.8, changeFrequency: "weekly" },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency as "daily" | "weekly" | "monthly",
    priority: route.priority,
  }));
}
