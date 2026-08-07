import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/admin/login",
          "/admin/dashboard",
          "/admin/categories",
          "/admin/treks",
          "/admin/tours",
          "/admin/expeditions",
          "/admin/bookings",
          "/admin/inquiries",
          "/admin/blogs",
          "/admin/media",
          "/admin/settings",
          "/api/",
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
