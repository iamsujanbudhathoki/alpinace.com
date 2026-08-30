import { Hero } from "@/components/marketing/sections/hero";
import { PartnersAffiliationsSection } from "@/components/marketing/sections/partners-affiliations";
import { FeaturedPackages } from "@/components/marketing/sections/featured-packages";
import { TestimonialsSection } from "@/components/marketing/sections/testimonials";
import { FeaturedBlogs } from "@/components/marketing/sections/featured-blogs";
import { FaqsSection } from "@/components/marketing/sections/faqs-section";
import { FinalCta } from "@/components/marketing/sections/final-cta";
import { siteConfig } from "@/lib/site-config";
import {
  TrekService,
  TourService,
  ExpeditionService,
  BlogService,
} from "@/lib/services/admin-service";
import { BlogStatus, PackageStatus } from "@/lib/admin-data";
import { TravelPackage, BlogPost } from "@/lib/home-data";

export const revalidate = 3600; // revalidate hourly

export default async function Home() {
  // Fetch initial featured data on the server for instant SSR HTML rendering
  let initialTreks: TravelPackage[] = [];
  let initialTours: TravelPackage[] = [];
  let initialExpeditions: TravelPackage[] = [];
  let initialBlogs: BlogPost[] = [];

  try {
    const [rawTreks, rawTours, rawExpeditions, rawBlogs] = await Promise.all([
      TrekService.getAll().catch(() => []),
      TourService.getAll().catch(() => []),
      ExpeditionService.getAll().catch(() => []),
      BlogService.getAll(BlogStatus.PUBLISHED).catch(() => []),
    ]);

    initialTreks = rawTreks
      .filter((p) => p.status === PackageStatus.FEATURED || p.status === PackageStatus.ACTIVE)
      .slice(0, 6)
      .map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: p.category,
        region: p.region,
        durationDays: p.durationDays ?? 0,
        maxAltitudeMeters: p.maxAltitudeMeters ?? 0,
        difficulty: p.difficulty,
        priceUSD: p.priceUSD ?? 0,
        rating: p.rating ?? 0,
        reviewsCount: p.reviewsCount ?? 0,
        image: p.image || "",
        shortDesc: p.shortDesc || "",
        status: p.status,
      }));

    initialTours = rawTours
      .filter((p) => p.status === PackageStatus.FEATURED || p.status === PackageStatus.ACTIVE)
      .slice(0, 6)
      .map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: p.category,
        region: p.region,
        durationDays: p.durationDays ?? 0,
        maxAltitudeMeters: p.maxAltitudeMeters ?? 0,
        difficulty: p.difficulty,
        priceUSD: p.priceUSD ?? 0,
        rating: p.rating ?? 0,
        reviewsCount: p.reviewsCount ?? 0,
        image: p.image || "",
        shortDesc: p.shortDesc || "",
        status: p.status,
      }));

    initialExpeditions = rawExpeditions
      .filter((p) => p.status === PackageStatus.FEATURED || p.status === PackageStatus.ACTIVE)
      .slice(0, 6)
      .map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: p.category,
        region: p.region,
        durationDays: p.durationDays ?? 0,
        maxAltitudeMeters: p.maxAltitudeMeters ?? 0,
        difficulty: p.difficulty,
        priceUSD: p.priceUSD ?? 0,
        rating: p.rating ?? 0,
        reviewsCount: p.reviewsCount ?? 0,
        image: p.image || "",
        shortDesc: p.shortDesc || "",
        status: p.status,
      }));

    initialBlogs = rawBlogs.slice(0, 3).map((b: any) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      category: b.category,
      date: b.publishedDate,
      readTime: b.readTime,
      excerpt: b?.excerpt || "",
      content: b?.content || "",
      image: b?.image || "",
    }));
  } catch (e) {
    console.warn("Server-side initial data fetch warning:", e);
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.fullName,
    alternateName: [...siteConfig.alternateNames],
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/trekking?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.fullName,
    alternateName: [...siteConfig.alternateNames],
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.jpg`,
    image: `${siteConfig.url}/logo.jpg`,
    description: siteConfig.description,
    telephone: siteConfig.telephone,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.streetAddress,
      addressLocality: siteConfig.address.addressLocality,
      addressRegion: siteConfig.address.addressRegion,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.addressCountry,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: siteConfig.telephone,
        email: siteConfig.email,
        contactType: "customer service",
        availableLanguage: ["English", "Nepali"],
        areaServed: "Worldwide",
      },
    ],
    sameAs: [
      "https://facebook.com/alpineacenepal",
      "https://instagram.com/alpineacenepal",
      "https://youtube.com/@alpineacenepal",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Himalayan Trekking & Expedition Packages",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Trip",
            name: "Everest Base Camp Trek",
            description: "14-day guided trek to Everest Base Camp and Kala Patthar under safe Sherpa guidance.",
            url: `${siteConfig.url}/trekking/everest-base-camp-trek`,
          },
          availability: "https://schema.org/InStock",
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Trip",
            name: "Annapurna Circuit Trek",
            description: "16-day iconic high-pass circuit crossing Thorong La Pass.",
            url: `${siteConfig.url}/trekking/annapurna-circuit-trek`,
          },
          availability: "https://schema.org/InStock",
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Trip",
            name: "Island Peak Expedition",
            description: "19-day technical peak climbing expedition in Khumbu.",
            url: `${siteConfig.url}/expeditions/island-peak-expedition`,
          },
          availability: "https://schema.org/InStock",
        },
      ],
    },
  };

  const agencySchema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${siteConfig.url}/#agency`,
    name: siteConfig.fullName,
    alternateName: [...siteConfig.alternateNames],
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.jpg`,
    image: `${siteConfig.url}/logo.jpg`,
    description: siteConfig.description,
    telephone: siteConfig.telephone,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.streetAddress,
      addressLocality: siteConfig.address.addressLocality,
      addressRegion: siteConfig.address.addressRegion,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.addressCountry,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: siteConfig.telephone,
        email: siteConfig.email,
        contactType: "customer service",
        availableLanguage: ["English", "Nepali"],
        areaServed: "Worldwide",
      },
    ],
    geo: {
      "@type": "GeoCoordinates",
      latitude: "27.714649",
      longitude: "85.310764",
    },
    priceRange: "$$$",
    sameAs: [
      "https://facebook.com/alpineacenepal",
      "https://instagram.com/alpineacenepal",
      "https://youtube.com/@alpineacenepal",
    ],
  };

  return (
    <div className="flex flex-col bg-stone-50 text-stone-900 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(agencySchema),
        }}
      />

      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Featured Trekking & Expedition Packages */}
      <FeaturedPackages
        initialTreks={initialTreks}
        initialTours={initialTours}
        initialExpeditions={initialExpeditions}
      />

      {/* 3. Official Partners & Affiliations Trust Board */}
      <PartnersAffiliationsSection />

      {/* 4. Trekker Reviews */}
      <TestimonialsSection />

      {/* 5. Expedition Journal */}
      <FeaturedBlogs initialPosts={initialBlogs} />

      {/* 6. FAQs Accordion */}
      <FaqsSection />

      {/* 7. Pre-Footer Trip Consultation Banner */}
      <FinalCta />
    </div>
  );
}


