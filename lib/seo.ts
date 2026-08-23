import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { TrekItem } from "@/lib/trek-data";
import { TourItem } from "@/lib/tour-data";
import { ExpeditionItem } from "@/lib/expedition-data";
import { BlogPost } from "@/lib/home-data";

type AnyPackageItem = TrekItem | TourItem | ExpeditionItem | any;

interface PackageMetadataParams {
  item: AnyPackageItem | null;
  categoryType: "trekking" | "tours" | "expeditions";
  slug: string;
}

interface StaticMetadataParams {
  title: string;
  description?: string;
  path?: string;
  keywords?: string[];
  noindex?: boolean;
}

/**
 * Ensures any image URL (relative, uploaded, or absolute) is normalized
 * to an absolute URL safe for OpenGraph and Twitter crawlers.
 */
export function normalizeImageUrl(imgUrl?: string | null): string {
  const baseUrl = siteConfig.url;
  if (!imgUrl || !imgUrl.trim()) {
    return `${baseUrl}/logo.jpg`;
  }
  const cleanUrl = imgUrl.trim();
  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    return cleanUrl;
  }
  if (cleanUrl.startsWith("/")) {
    return `${baseUrl}${cleanUrl}`;
  }
  return `${baseUrl}/${cleanUrl}`;
}

/**
 * Generate centralized static page SEO metadata (e.g. /about, /contact, /privacy, /terms, catalog pages)
 */
export function generateStaticMetadata({
  title,
  description,
  path = "",
  keywords = [],
  noindex = false,
}: StaticMetadataParams): Metadata {
  const baseUrl = siteConfig.url;
  const canonicalUrl = path ? `${baseUrl}${path.startsWith("/") ? path : `/${path}`}` : baseUrl;
  const fullTitle = title.includes(siteConfig.name) ? title : `${title} | ${siteConfig.name}`;
  const metaDescription = description || siteConfig.description;
  const defaultKeywords = Array.from(new Set([...keywords, ...siteConfig.keywords]));
  const ogImage = `${baseUrl}/logo.jpg`;

  return {
    title: fullTitle,
    description: metaDescription,
    keywords: defaultKeywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: !noindex,
      follow: true,
      googleBot: {
        index: !noindex,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonicalUrl,
      title: fullTitle,
      description: metaDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${siteConfig.fullName} - ${title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: metaDescription,
      images: [ogImage],
      creator: "@AlpineAceExpeditions",
    },
  };
}

/**
 * Generate rich OpenGraph, Twitter, and SEO metadata for Package Detail pages
 */
export function generatePackageMetadata({
  item,
  categoryType,
  slug,
}: PackageMetadataParams): Metadata {
  const baseUrl = siteConfig.url;
  const canonicalUrl = `${baseUrl}/${categoryType}/${slug}`;

  if (!item) {
    const fallbackTitle = `${categoryType.charAt(0).toUpperCase() + categoryType.slice(1)} Package | ${siteConfig.name}`;
    return {
      title: fallbackTitle,
      description: siteConfig.description,
      alternates: { canonical: canonicalUrl },
      robots: { index: false, follow: true },
    };
  }

  const titleString =
    item.metaTitle?.trim() ||
    `${item.title} - ${item.durationDays ? `${item.durationDays} Days ` : ""}Himalayan ${categoryType === "trekking" ? "Trek" : categoryType === "tours" ? "Tour" : "Expedition"} | ${siteConfig.name}`;

  const cleanShortDesc = item.shortDesc
    ? item.shortDesc.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim()
    : "";

  const description =
    item.metaDescription?.trim() ||
    cleanShortDesc ||
    `Experience ${item.title} (${item.durationDays || 0} Days). Guided by certified IFMGA/NNMGA Sherpa masters with luxury mountain lodge hospitality. Book with AlpineAce.`;

  const rawKeywords = item.keywords
    ? item.keywords.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

  const defaultKeywords = [
    item.title,
    ...(item.region ? [`${item.region} trekking`] : []),
    `${item.title} price`,
    `${item.title} itinerary`,
    "Guided expeditions",
    "Sherpa mountain guides",
    "AlpineAce",
  ];

  const keywords = Array.from(new Set([...rawKeywords, ...defaultKeywords]));
  const primaryImage = normalizeImageUrl(item.image || item.coverMediaId);

  const isIndexed = item.status !== "draft" && item.status !== "inactive";

  return {
    title: { absolute: titleString },
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: isIndexed,
      follow: true,
      googleBot: {
        index: isIndexed,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonicalUrl,
      title: titleString,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: primaryImage,
          width: 1200,
          height: 630,
          alt: `${item.title} in the Himalayas - AlpineAce`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titleString,
      description,
      images: [primaryImage],
      creator: "@AlpineAceExpeditions",
    },
  };
}

/**
 * Generate rich JSON-LD Structured Data for Packages (TouristTrip, Product, Breadcrumbs, FAQs)
 */
export function generatePackageJsonLd({
  item,
  categoryType,
  slug,
}: PackageMetadataParams) {
  if (!item) return null;

  const baseUrl = siteConfig.url;
  const canonicalUrl = `${baseUrl}/${categoryType}/${slug}`;
  const categoryLabel = categoryType.charAt(0).toUpperCase() + categoryType.slice(1);
  const primaryImage = normalizeImageUrl(item.image);

  // 1. BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryLabel,
        item: `${baseUrl}/${categoryType}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: item.title,
        item: canonicalUrl,
      },
    ],
  };

  const cleanShortDesc = item.shortDesc
    ? item.shortDesc.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim()
    : "";

  // 2. TouristTrip & Product Schema
  const tripSchema: any = {
    "@context": "https://schema.org",
    "@type": ["TouristTrip", "Product"],
    name: item.title,
    description: cleanShortDesc || item.metaDescription || `${item.title} expedition in Nepal.`,
    url: canonicalUrl,
    image: [primaryImage],
    touristType: ["Adventure Enthusiasts", "Trekkers", "Mountaineers"],
    offers: {
      "@type": "Offer",
      price: item.priceUSD || 0,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: canonicalUrl,
      validFrom: new Date().toISOString().split("T")[0],
      priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
    },
    provider: {
      "@type": "TravelAgency",
      name: "AlpineAce Expeditions",
      url: baseUrl,
      logo: `${baseUrl}/logo.jpg`,
      telephone: "+977-1-4700000",
      priceRange: "$$$",
    },
  };

  if (item.rating && item.rating > 0) {
    tripSchema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: (item.rating || 5.0).toString(),
      reviewCount: (item.reviewsCount || item.reviews?.length || 1).toString(),
      bestRating: "5",
      worstRating: "1",
    };
  }

  // Itinerary breakdown for rich snippets
  if (Array.isArray(item.itinerary) && item.itinerary.length > 0) {
    tripSchema.itinerary = {
      "@type": "ItemList",
      numberOfItems: item.itinerary.length,
      itemListElement: item.itinerary.map((day: any, index: number) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "TouristDestination",
          name: `Day ${day.day || index + 1}: ${day.title || "Trek Route"}`,
          description: day.description || "",
        },
      })),
    };
  }

  // Reviews if available
  if (Array.isArray(item.reviews) && item.reviews.length > 0) {
    tripSchema.review = item.reviews.slice(0, 5).map((rev: any) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: rev.author || "Verified Traveler",
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: (rev.rating || 5).toString(),
        bestRating: "5",
        worstRating: "1",
      },
      reviewBody: rev.content || "",
    }));
  }

  // 3. FAQPage Schema (Displays accordion dropdown directly inside Google Search)
  let faqSchema: any = null;
  if (Array.isArray(item.faqs) && item.faqs.length > 0) {
    faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: item.faqs.map((faq: any) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };
  }

  return {
    breadcrumb: breadcrumbSchema,
    trip: tripSchema,
    faq: faqSchema,
  };
}

/**
 * Generate rich OpenGraph, Twitter, and SEO metadata for Blog Article detail pages
 */
export function generateBlogMetadata(post: BlogPost | null, slug: string): Metadata {
  const baseUrl = siteConfig.url;
  const canonicalUrl = `${baseUrl}/blog/${slug}`;

  if (!post) {
    return {
      title: `Himalayan Journal Article | ${siteConfig.name}`,
      description: siteConfig.description,
      alternates: { canonical: canonicalUrl },
      robots: { index: false, follow: true },
    };
  }

  const titleString =
    post.metaTitle?.trim() ||
    `${post.title} | ${siteConfig.name} Journal`;

  const cleanExcerpt = post.excerpt
    ? post.excerpt.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim()
    : "";

  const description =
    post.metaDescription?.trim() ||
    cleanExcerpt ||
    `Read "${post.title}" on the AlpineAce journal. Expert tips, packing advice, and high-altitude insights.`;

  const keywords = post.keywords
    ? post.keywords.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [
        post.title,
        post.category || "Himalayan Insights",
        "Nepal trekking blog",
        "Everest climbing tips",
        "AlpineAce journal",
      ];

  const primaryImage = normalizeImageUrl(post.image);

  return {
    title: { absolute: titleString },
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "article",
      locale: "en_US",
      url: canonicalUrl,
      title: titleString,
      description,
      siteName: siteConfig.name,
      publishedTime: post.date,
      authors: [post.author || "AlpineAce Editorial Team"],
      images: [
        {
          url: primaryImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titleString,
      description,
      images: [primaryImage],
      creator: "@AlpineAceExpeditions",
    },
  };
}

/**
 * Generate rich JSON-LD Structured Data for Blog Posts (BlogPosting & Breadcrumbs)
 */
export function generateBlogJsonLd(post: BlogPost | null, slug: string) {
  if (!post) return null;

  const baseUrl = siteConfig.url;
  const canonicalUrl = `${baseUrl}/blog/${slug}`;
  const primaryImage = normalizeImageUrl(post.image);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Journal",
        item: `${baseUrl}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: canonicalUrl,
      },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.metaDescription || post.title,
    image: [primaryImage],
    datePublished: post.date || new Date().toISOString(),
    dateModified: post.date || new Date().toISOString(),
    author: {
      "@type": "Person",
      name: post.author || "AlpineAce Expedition Guide",
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.jpg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
  };

  return {
    breadcrumb: breadcrumbSchema,
    article: articleSchema,
  };
}
